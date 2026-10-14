# M.A.V.I.S. (Multi-Modal Animal Vitality Intelligence System)

M.A.V.I.S. is an end-to-end, on-premises Internet of Things (IoT) and clinical telemetry platform for continuous health monitoring of livestock and domestic animals. The system captures streaming biometric and inertial telemetry from ESP32-based smart collars, performs real-time multi-modal vital evaluations, maintains adaptive individual baselines, tracks spatial contagion risks, and generates clinical assessments with zero external cloud dependencies.

---

## System Architecture

The platform consists of three primary tiers:

```mermaid
graph TD
    subgraph Edge Hardware (ESP32)
        S1[MAX30102 PPG] -->|I2C 100Hz DSP| CORE1[Core 1: BioSensors Task]
        S2[DS18B20 1-Wire] -->|Async Non-Blocking| CORE1
        S3[MPU6050 6-Axis IMU] -->|I2C Motion & Gyro| CORE1
        S4[LiPo Battery ADC] -->|GPIO 34 Divider| CORE1
        CORE1 -->|Mailbox Queue| CORE0[Core 0: Telemetry Task]
    end

    subgraph Backend Gateway & Engine (Node.js)
        CORE0 -->|HTTP POST /api/sensor 3s Cycle| API[Express.js REST Gateway]
        API --> VAL[Joi Schema Validation]
        VAL --> INGEST[Sensor Ingestion Service]
        INGEST --> BASELINE[Welford Z-Score Baseline Engine]
        INGEST --> HEALTH[Multi-Modal Clinical Health Engine]
        HEALTH --> HERD[Spatial Herd Contagion Graph]
        HEALTH --> ALERTS[Alert Lifecycle Service]
        ALERTS --> SIO[Socket.IO Event Stream]
    end

    subgraph Local Inference & Storage
        INGEST --> DB[(MongoDB / In-Memory Fallback)]
        API <-->|HTTP 11434| OLLAMA[Ollama Local SLMs\nLlama 3.2 / Phi-3]
        API -.->|Fallback| DET_ENG[Deterministic Clinical Safety Engine]
    end

    subgraph Frontend Client (React 18 + TypeScript)
        SIO -->|Real-Time Vitals & Alerts| CLIENT[Interactive Client Dashboard]
        CLIENT -->|REST API| API
        CLIENT -->|Animal Profiles| ANIMALS[Animal Management & Vitals]
        CLIENT -->|Clinical Reports| PDF[Client-Side Veterinary PDF Export]
    end
```

---

## Core Capabilities

### 1. Edge Firmware & Embedded DSP (`hardware/esp32_collar/`)
- **FreeRTOS Dual-Core Affinity**:
  - **Core 1 (APP_CPU)**: Dedicated 100 Hz signal processing loop for MAX30102 optical photoplethysmography and MPU6050 inertial measurement.
  - **Core 0 (PRO_CPU)**: Dedicated network telemetry task with non-blocking Wi-Fi HTTP dispatch and 15s reconnection backoff.
- **Motion-Gated Peak Detection**: Rejects optical motion artifacts when acceleration magnitude exceeds $15\text{ m/s}^2$ or during vigorous head shaking.
- **Clinical HRV ($\text{RMSSD}$)**: Computes true Root Mean Square of Successive Differences across an 8-beat rolling window to measure autonomic nervous system stress.
- **Beer-Lambert Optical $\text{SpO}_2$**: Derives arterial oxygen saturation from red and infrared AC/DC ratios.
- **6-Axis Behavior Classification**:
  - *Rumination*: Detects rhythmic jaw chew oscillations on Gyro Z zero-crossings ($0.25 \le |\omega_z| \le 1.8\text{ rad/s}$) to measure chews per minute.
  - *Agitation / Head-Shaking*: Detects high angular velocity spikes indicative of fly or ear tick distress.
  - *Posture*: Classifies standing vs. lying down via static gravity acceleration vectors.
- **Non-Blocking 1-Wire Temperature**: DS18B20 sampling runs in asynchronous mode (`setWaitForConversion(false)`), eliminating the 750ms blocking freeze.
- **I2C Bus Auto-Recovery**: Bit-bangs 9 clock pulses on SCL if SDA is held low during startup brownouts.
- **Field Provisioning & Flash NVS**: SoftAP portal (`MAVIS-COLLAR-SETUP`) with dynamic 2.4 GHz Wi-Fi scanning for field configuration without code re-flashing.

### 2. Backend Gateway & Clinical Health Engine (`backend/`)
- **Enterprise Layered Architecture**: Strictly organized into vertical feature slices (`animals`, `sensors`, `alerts`, `health-engine`, `ai-insights`, `auth`).
- **Streaming Adaptive Baselines**: Uses Welford's algorithm ($O(1)$ memory) to calculate continuous mean and variance for personalized circadian Z-score evaluations.
- **Multi-Modal Risk Engine**: Evaluates physiological vitals, behavioral indicators, and multi-variable clinical synergies (e.g., febrile ruminal cessation indicating acute mastitis or acidosis).
- **Spatial Herd Epidemiology**: Graph-based contact tracing modeling contagion risk decay across shared barns and grazing zones.
- **100% Offline Local AI Inference**: Interacts with Ollama (`llama3.2`, `phi3`) over localhost, with automatic fallback to an in-memory Deterministic Clinical Safety Engine.

### 3. Frontend Dashboard & Digital Twin (`frontend/`)
- **Real-Time Telemetry & Digital Twin**: Live Socket.IO connection monitoring core temperature, heart rate, respiration rate, $\text{SpO}_2$, rumination, and posture.
- **Historical 24h & 7d Trends**: Multi-series timeline charts with clinical reference bands and trend direction indicators.
- **Clinical Action & Treatment Log**: Interactive treatment tracker for recording veterinary medications, antibiotic regimens, and symptom notes.
- **Animal Profile Management**: Dedicated modals to register, edit, and organize animals by name, species, breed, and herd ID.
- **Veterinary Audit Reports**: Print-ready 2-page PDF export with comprehensive vitals summaries and diagnostic observations (`jspdf` / `html2canvas`).

---

## Hardware Pinout (ESP32)

| Sensor Module | Function | ESP32 Pin | Interface |
|---|---|---|---|
| **MAX30102** | Pulse Oximetry ($\text{SpO}_2$, HR, HRV) | SDA (GPIO 21), SCL (GPIO 22) | Hardware I2C (100 Hz) |
| **DS18B20** | Body Core Temperature | Data (GPIO 4) + 4.7kΩ Pull-up | OneWire (Async) |
| **MPU6050** | 6-Axis Motion, Rumination, Posture | SDA (GPIO 21), SCL (GPIO 22) | Hardware I2C |
| **Voltage Divider** | LiPo Battery Level Monitoring | ADC (GPIO 34) | Analog IN |

---

## API Reference

All REST endpoints operate under `/api` and consume/return JSON:

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **Animals** | `GET` | `/api/animals` | List registered animals |
| | `POST` | `/api/animals` | Register new animal |
| | `GET` | `/api/animals/:id` | Get animal profile by ID |
| | `PATCH` | `/api/animals/:id` | Update animal details (Name, Breed, Herd) |
| | `DELETE` | `/api/animals/:id` | Remove animal record |
| | `GET` | `/api/animals/:id/health` | Real-time health score calculation |
| **Sensors** | `POST` | `/api/sensor` | Ingest telemetry packet (Collar / Daemon) |
| | `GET` | `/api/sensor/latest/:animalId` | Fetch latest telemetry reading |
| | `GET` | `/api/sensor/history/:animalId`| Query historical readings (`from`, `to` optional) |
| **Alerts** | `GET` | `/api/alerts/active` | Fetch active unacknowledged alerts |
| | `PATCH` | `/api/alerts/:alertId/status` | Update alert state (`acknowledged`, `resolved`) |
| **AI Insights** | `GET` | `/api/ai/:animalId` | Trigger on-demand clinical diagnostic assessment |
| **Auth** | `POST` | `/api/auth/register` | Register user account |
| | `POST` | `/api/auth/login` | Authenticate and retrieve JWT |
| | `GET` | `/api/auth/me` | Fetch authenticated user session |

---

## WebSocket Events (Socket.IO)

The gateway broadcasts real-time telemetry and clinical events over WebSocket on port 5000:

| Event Name | Direction | Payload |
|---|---|---|
| `sensor:update` | Server &rarr; Client | Real-time physiological, behavioral, and device packet |
| `alert` | Server &rarr; Client | Newly triggered anomaly alert with severity and points |
| `alert:updated` | Server &rarr; Client | Alert lifecycle mutation (`acknowledged`, `resolved`) |
| `animal:created` | Server &rarr; Client | Newly registered subject broadcast |

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- *(Optional)* **Ollama**: For local SLM inference (`ollama run llama3.2`)
- *(Optional)* **Docker & Docker Compose**: For containerized deployment

---

### Local Installation & Execution

#### 1. Clone the repository
```bash
git clone https://github.com/Dheemanth07/M.A.V.I.S.git
cd M.A.V.I.S
```

#### 2. Start the Backend Gateway
```bash
cd backend
npm install
npm run dev
```

> **Zero-Config Database**: The backend connects to MongoDB if `MONGO_URI` is configured. If MongoDB is not running locally, it automatically starts an in-memory MongoDB instance with zero extra configuration.

#### 3. Start the Frontend Dashboard (in a separate terminal)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Docker Deployment
To run the full stack via Docker Compose:
```bash
docker compose up --build
```

---

### Testing & Verification

Run the automated backend test suite (17/17 tests covering risk evaluation, baseline calibration, circadian rhythm, and herd contagion):
```bash
cd backend
npm test
```

Run frontend type checking and linter:
```bash
cd frontend
npm run lint
npm run build
```

---

## License

This project is licensed under the **MIT License**.
