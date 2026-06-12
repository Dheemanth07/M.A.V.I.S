# MAVIS: MultiModel Animal Vitality Intelligence System

**MAVIS** is an event-driven IoT backend platform designed for real-time tracking of animal health metrics. The system ingests streaming multi-modal biometric and environmental telemetry data from smart hardware collars, executes real-time evaluation using an decoupled health engine, and manages automated high-priority alert lifecycles.

---

## System Architecture & Modularity

MAVIS rejects monolithic formatting in favor of a strictly decoupled **Feature-First Layered Architecture**. Each capability is an isolated, self-contained domain located within the `backend/features/` directory.

### Structural Directory Tree

```text
MAVIS/
├── backend/
│   ├── config/               # Database and global event configurations
│   ├── features/
│   │   ├── animals/         # Profiles, CRUD, and current health status computation
│   │   ├── sensors/         # High-throughput data ingestion & historical lookups
│   │   ├── health-engine/   # Isolated algorithmic business logic & matrix matching
│   │   └── alerts/          # Event-driven notification persistence & state updates
│   ├── middlewares/          # Joi validation, error boundary handlers, and CORS
│   ├── utils/                # Standardized AppError classes and response helpers
│   ├── scripts/              # Python automation suite for database simulation
│   ├── data/                 # Dynamic mappings and data storage buffers
│   └── server.js             # Express application initialization & server orchestration
├── frontend/                 # [Planned] Dashboard workspace
├── docker-compose.yml        # Multi-container multi-environment configuration
└── README.md

```

### Layer Interaction Flow

Every independent feature enforces a strict, unidirectional data pipeline that ensures low code coupling and predictable test boundaries:


$$\text{Route} \longrightarrow \text{Validator (Joi)} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Model (Mongoose)}$$

* **Controllers**: Lean orchestration layers responsible exclusively for parsing HTTP parameters, invoking underlying core services, and outputting standardized JSON signatures.
* **Services**: The programmatic boundary containing your core domain rules, mutations, and internal event flows.
* **Repositories**: Complete data-access abstraction separating Mongoose-specific query structures from standard business operations.

---

## Asynchronous Event-Driven Pipeline

To maximize battery optimization for edge IoT hardware units, MAVIS completely decouples data storage from evaluation computation using a local, non-blocking Node.js `EventEmitter` pattern.

1. **Ingestion Loop**: Hardware targets dispatch data to `POST /api/sensor`. The sensor layer logs the raw row buffer instantly to MongoDB and drops an asynchronous `SENSOR_DATA_RECEIVED` packet on the local system event bus.
2. **Immediate Release**: The controller dispatches a `200 OK` network confirmation code back to the collar within milliseconds, permitting the edge device to drop its high-power transmitter interfaces into low-power sleep loops immediately.
3. **Background Processing**: The `alerts` engine intercepts the queued packet on the event bus, transparently invokes the `health-engine` matrix evaluators to establish risk, checks boundaries, and commits active validation issues to the database safely in the background.

---

## Core Modules & Capabilities

### 1. Health Engine & Analytics

Executes comparative matrix-analysis across mixed inputs:

* **Vitals Evaluator**: Analyzes Heart Rate (BPM), SpO2 saturation percentages, and core temperatures.
* **Environmental Aggregator**: Generates live Thermal Humidity Indexes (THI) using ambient environmental sensors.
* **Risk Score Clamping**: Computes aggregate status scales transforming numerical telemetry streams into explicitly tracked categorical health indices (`Healthy`, `Warning`, `Critical`).

### 2. Alerts Management

Provides actionable tracking of anomaly metrics with an adjustable operational state machine:

* **Lifecycle State Tracking**: Alerts travel sequentially through `active` $\rightarrow$ `acknowledged` $\rightarrow$ `resolved`.
* **Index Performance**: Automated query isolation using Mongoose composite indexing on tracking statuses and `animalId` keys.

---

## Detailed API Documentation

All request parameters, headers, and payloads undergo automatic Joi validation. Malformed properties generate standardized `400 Bad Request` exceptions immediately.

### Animals Interface

| Method | Endpoint | Description | Payload Constraints |
| --- | --- | --- | --- |
| `POST` | `/api/animals` | Register a new tracking entity | Body: name, species, tagNumber |
| `GET` | `/api/animals` | Retrieve full registry matrix | Query options supported |
| `GET` | `/api/animals/:id` | Fetch specific profile properties | URL parameter must be valid Hex ObjectId |
| `PUT` | `/api/animals/:id` | Modify an existing registration | Body: fields to update |
| `DELETE` | `/api/animals/:id` | Complete deletion of entity profile | Cascade warnings retained |
| `GET` | `/api/animals/:id/health` | Compute real-time analytics aggregation | Generates structural runtime profile status |

### Sensor Ingestion Interface

| Method | Endpoint | Description | Payload Constraints |
| --- | --- | --- | --- |
| `POST` | `/api/sensor` | Ingest edge hardware metrics | Body: `animalId` (Valid ObjectId), vitals map |
| `GET` | `/api/sensor/latest/:animalId` | Fetch latest cached vital points | Real-time tracking pipeline hook |
| `GET` | `/api/sensor/history/:animalId` | Fetch time-series historical array | Query: `from` (ISO8601), `to` (ISO8601) |

### Alerts Interface

| Method | Endpoint | Description | Payload Constraints |
| --- | --- | --- | --- |
| `GET` | `/api/alerts/active` | Global active dashboard alert pull | Sorted chronologically (`createdAt: -1`) |
| `GET` | `/api/alerts/animal/:animalId` | Full audit history trail per entity | Targeted medical validation support |
| `PATCH` | `/api/alerts/:alertId/status` | Mutate alert state assignment | Body: `status` (`"active" | "acknowledged" | "resolved"`) |

---

## Step-by-Step Installation & Local Execution

### Prerequisites

* **Node.js**: Environment runtime version `v18.0.0` or higher.
* **Docker Engine**: Core platform configuration engine with `docker-compose` utilities installed.
* **Database**: Access link to a managed MongoDB instance (Atlas or clean external cluster setup).

### 1. Environment Deployment

Clone your repository code and create a production-ignored environment profile configuration:

```bash
git clone https://github.com/your-username/MAVIS.git
cd MAVIS/backend
touch .env

```

Populate `.env` with the following configuration keys:

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_user>:<db_password>@<your_cluster_address>.mongodb.net/mavis

```

### 2. Launch Sequence

#### Option A: Containerized Runtime (Recommended)

Boot the complete, encapsulated platform configuration from the project root directory:

```bash
docker compose up --build

```

#### Option B: Standalone Native Process Development

If debugging components natively without Docker orchestration infrastructure:

```bash
cd backend
npm install
npm run dev

```

*Note: The local development scripts are configured to ignore mutations occurring on internal system data files, ensuring runtime processes don't loop-restart during continuous automation seeding processes.*

---

## Database Simulation & Testing Pipeline

MAVIS features a dedicated, scriptable evaluation workbench written in Python to mock incoming active hardware telemetry fields accurately without real-world deployable collar hardware components attached to the endpoints.

To seed and stress-test the environment, navigate inside the `backend/` space and invoke the sequence sequentially:

```bash
# Step 1: Instantiates tracking records and profiles directly via the local API instance
python scripts/seed_animals.py

# Step 2: Formulates valid structured time-series metrics linked directly to valid generated ObjectIds
python scripts/GenerateSample.py

# Step 3: Continuously stream-injects the generated data matrices straight into /api/sensor
python scripts/UploadDataset.py

```

### Automation Log Execution Flow

1. `seed_animals.py` writes live-generated MongoDB ObjectIds to local context buffers (`data/animal_ids.json` & `data/animal_mapping.json`).
2. `GenerateSample.py` monitors these active map arrays to build real, relational target links into `data/sensor_data.json`.
3. `UploadDataset.py` hits the Express execution loops, validating structural performance and triggering immediate background calculation checks across every entry.

---

## Global Exception and Security Architecture

* **Central Error Filter**: Outfitted with a standardized runtime exception mechanism (`backend/middlewares/error.middleware.js`). All program failures are intercepted and safely parsed using a custom `AppError` signature to prevent detailed application trace exposure.
* **CORS Scope Policy**: Configured broadly across baseline local execution frameworks for immediate cross-origin configuration with local dev engines; scoped configurations are required before pushing to live public web target arrays.
* **Strict Foreign Identity Matching**: Any ingested row targeting missing or historical string keys (e.g. legacy test values like `dog_1`) is automatically rejected by the validator layers; all sensor inputs must map tightly to authentic, verified parent entity profiles.

---

## Engineering Status & Near-Term Roadmap

The core processing platform, architecture flow layers, and internal relational database automation engines are structurally complete and fully verified.

* [ ] **Frontend Dashboard Ecosystem**: Initializing client-facing React web interface mapping visual real-time telemetry tables using Canvas trackers.
* [ ] **Native Socket.IO Client Interactivity**: Attaching real-time frontend triggers to broadcast notifications instantly as internal state changes shift.
* [ ] **Industrial IoT Protocols**: Integrating secondary direct MQTT processing loops to manage network pipelines over ultra-low bandwidth radio spaces.

---

## License

This system architecture is distributed openly under the provisions of the **ISC License**.
