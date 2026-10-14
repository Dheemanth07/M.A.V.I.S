# M.A.V.I.S. — API & WebSocket Event Reference

All REST endpoints operate under the `/api` prefix and communicate in JSON format. Standard successful responses return `{ "status": "success", "data": { ... } }`, while errors return `{ "status": "fail" | "error", "message": "<description>" }`.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT bearer token | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile and settings | Yes |
| `PATCH`| `/api/auth/settings` | Update alert thresholds and collar sync intervals | Yes |

### Register Payload Example
```json
{
  "name": "Farm Caregiver",
  "email": "caregiver@farm.local",
  "password": "SecurePassword123"
}
```

---

## 2. Animal Management (`/api/animals`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/animals` | List all animals belonging to user (or all if admin) | Yes |
| `POST` | `/api/animals` | Register a new animal subject | Yes |
| `GET` | `/api/animals/:id` | Fetch animal profile by MongoDB ObjectId | Yes |
| `PATCH` | `/api/animals/:id` | Update animal details (name, species, breed, herd) | Yes |
| `DELETE`| `/api/animals/:id` | Delete an animal record | Yes |
| `GET` | `/api/animals/:id/health` | Calculate real-time health aggregation & baselines | Yes |

### Animal Registration Payload Example
```json
{
  "name": "Bessie-01",
  "species": "bovine",
  "breed": "Holstein Friesian",
  "herdId": "Main Herd",
  "deviceId": "COLLAR-NODE-01",
  "enclosure": "Barn A"
}
```

---

## 3. Sensor Telemetry (`/api/sensor` & `/api/sensors`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/sensor` | Ingest real-time telemetry packet | No (Edge Collar) |
| `GET` | `/api/sensor/latest/:animalId` | Fetch latest telemetry reading | Yes |
| `GET` | `/api/sensor/history/:animalId` | Query historical time series (`from`, `to` optional) | Yes |

### Telemetry Ingestion Payload Example
```json
{
  "animalId": "6a7ad37a373c5495c40c8d5b",
  "physiology": {
    "temperature": 38.6,
    "heartRate": 76,
    "respiratoryRate": 24,
    "bloodOxygen": 98,
    "hrv": 52.4
  },
  "behavior": {
    "motion": false,
    "lyingDown": true,
    "rumination": true,
    "ruminationRate": 58,
    "headShaking": false,
    "posture": "lying_down"
  },
  "device": {
    "batteryLevel": 94,
    "signalStrength": -65,
    "sensorStatus": "optimal",
    "contactDetected": true
  }
}
```

---

## 4. Alert Management (`/api/alerts`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/alerts/active` | Fetch all active, unresolved alerts | Yes |
| `GET` | `/api/alerts/animal/:animalId` | Fetch historical alerts for a specific animal | Yes |
| `PATCH` | `/api/alerts/:alertId/status` | Mutate alert status (`acknowledged`, `resolved`) | Yes |

---

## 5. Clinical AI Insights (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/ai/:animalId` | Generate on-demand clinical diagnostic assessment | Yes |

---

## 6. Real-Time WebSocket Events (Socket.IO)

The backend broadcasts events over Socket.IO on port 5000:

| Event Name | Direction | Payload Description |
|---|---|---|
| `sensorUpdate` / `sensor:update` | Server &rarr; Client | Emitted every 3 seconds with fresh physiological and behavioral telemetry packet. |
| `alert` | Server &rarr; Client | Emitted immediately when a vital or contagion anomaly triggers an alert. |
| `alert:updated` | Server &rarr; Client | Emitted when a caregiver acknowledges or resolves an active alert. |
| `animal:created` | Server &rarr; Client | Emitted when a new animal profile is registered on the gateway. |
