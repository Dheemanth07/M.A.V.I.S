# MAVIS (In Development)

**Multi-model Animal Vitality Intelligence System**

MAVIS is a backend system for tracking animal health from sensor readings. It stores animal profiles, records physiological and environmental sensor data, exposes REST APIs for latest/history lookups, and emits realtime updates with Socket.IO.

The project is still evolving, but the backend is organized by feature. Each feature keeps its routes, controller, service, repository, model, and validator together while still following a clean Controller -> Service -> Repository flow.

## Tech Stack

* Node.js and Express.js
* MongoDB Atlas with Mongoose
* Socket.IO for realtime updates
* Joi for request validation
* Docker and Docker Compose
* Python helper scripts for seed/sample data

## Architecture

The backend follows a feature-first layered structure:

* **Routes**: define endpoint paths and attach middleware
* **Controllers**: handle HTTP request/response flow
* **Services**: hold business rules and cross-domain checks
* **Repositories**: wrap database queries
* **Models**: define MongoDB document shape with Mongoose
* **Validators**: validate incoming request bodies with Joi

Controllers stay thin, routes do not hold business logic, services do not handle HTTP response details, and repositories only talk to the database.

Sensor records now use the real MongoDB animal ObjectId. That means sensor routes should be called with the same ID returned by `/api/animals`, not mock IDs like `dog_1`.

## Project Structure

```text
MAVIS/
|-- backend/
|   |-- config/
|   |-- features/
|   |   |-- animals/
|   |   |   |-- animal.controller.js
|   |   |   |-- animal.model.js
|   |   |   |-- animal.repository.js
|   |   |   |-- animal.routes.js
|   |   |   |-- animal.service.js
|   |   |   `-- animal.validator.js
|   |   `-- sensors/
|   |       |-- sensor.controller.js
|   |       |-- sensor.model.js
|   |       |-- sensor.repository.js
|   |       |-- sensor.routes.js
|   |       |-- sensor.service.js
|   |       `-- sensor.validator.js
|   |-- middlewares/
|   |-- utils/
|   |-- GenerateSample.py
|   |-- UploadDataset.py
|   |-- seed_animals.py
|   `-- server.js
|-- frontend/ (planned)
|-- docker-compose.yml
`-- README.md
```

## Features

* Create, list, view, update, and delete animal profiles
* Store sensor readings for a real animal ObjectId
* Fetch the latest sensor reading for an animal
* Query sensor history by time range
* Compute a simple health summary from the latest sensor reading
* Emit realtime sensor updates through Socket.IO
* Validate API payloads before they reach service logic

## API Endpoints

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Backend and database health check |

### Animals

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/animals` | Create an animal |
| `GET` | `/api/animals` | List all animals |
| `GET` | `/api/animals/:id` | Get one animal by ObjectId |
| `PUT` | `/api/animals/:id` | Update one animal by ObjectId |
| `DELETE` | `/api/animals/:id` | Delete one animal by ObjectId |
| `GET` | `/api/animals/:id/health` | Get latest computed health summary |

### Sensor Data

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/sensor` | Add a sensor reading for an animal |
| `GET` | `/api/sensor/latest/:animalId` | Get latest reading for an animal ObjectId |
| `GET` | `/api/sensor/history/:animalId?from=<iso>&to=<iso>` | Get readings in a time range |

Example latest sensor URL:

```text
http://localhost:5000/api/sensor/latest/69f47f8923ec0eba198f80d2
```

## Running the Project

### 1. Clone

```bash
git clone <repo-link>
cd MAVIS
```

### 2. Create `.env`

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/mavis
```

Do not commit `.env`.

### 3. Start with Docker

```bash
docker compose up --build
```

The API runs at:

```text
http://localhost:5000
```

### 4. Start without Docker

```bash
cd backend
npm install
npm run dev
```

The dev script ignores generated JSON data files so uploading sample data does not restart the server mid-upload.

## Sample Data Flow

Run these from the `backend` directory:

```bash
python seed_animals.py
python GenerateSample.py
python UploadDataset.py
```

The expected flow is:

1. `seed_animals.py` creates animal documents through the Animal API.
2. It writes the created ObjectIds to `animal_ids.json` and `animal_mapping.json`.
3. `GenerateSample.py` builds `sensor_data.json` using those real animal ObjectIds.
4. `UploadDataset.py` uploads readings to `/api/sensor`.

After upload, use an animal `_id` from `/api/animals` or `animal_mapping.json` when calling sensor routes.

## Notes

* MongoDB is hosted on Atlas, so no local MongoDB container is required.
* CORS is open for development and should be restricted before production.
* Sensor `animalId` must be a valid MongoDB ObjectId for an existing animal.
* Old sensor rows created with mock IDs like `dog_1` will not match the current sensor lookup format.
* Error handling is centralized in `backend/middlewares/error.middleware.js`.

## Future Work

* Add stronger anomaly detection
* Build the frontend dashboard
* Integrate real IoT device ingestion
* Improve alert persistence and notification delivery
* Add automated tests for route and service behavior

## Status

MAVIS is still under active development.
