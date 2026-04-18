# MAVIS (In Development)

**Multi-model Animal Vitality Intelligence System**

---

## Overview

MAVIS is a backend system for monitoring animal health using sensor data. It collects, stores, and analyzes physiological and environmental metrics, and provides real-time updates along with basic health insights.

The focus of this project is to build a clean, scalable backend that can later support IoT devices and a frontend dashboard.

---

## Tech Stack

* Node.js, Express.js
* MongoDB Atlas with Mongoose
* Socket.IO (real-time updates)
* Joi (validation)
* Docker & Docker Compose

---

## Architecture

The backend follows a layered structure:

* **Controller** → handles requests/responses
* **Service** → business logic
* **Repository** → database operations

This separation keeps the code organized and easier to extend.

---

## Project Structure

```text
MAVIS/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── schemas/
│   └── server.js
├── frontend/ (planned)
├── docker-compose.yml
└── README.md
```

---

## Features

* Store sensor data (temperature, heart rate, etc.)
* Fetch latest data per animal
* Query historical data using time ranges
* Basic alert conditions (e.g., high temperature, low battery)
* Real-time updates using Socket.IO

---

## API Endpoints

* `GET /` → Health check
* `POST /api/sensor` → Add sensor data
* `GET /api/sensor/latest/:animalId` → Latest data
* `GET /api/sensor/history/:animalId` → Historical data

---

## Running the Project

### 1. Clone

```bash
git clone <repo-link>
cd MAVIS
```

### 2. Create `.env` (inside backend)

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/mavis
```

> Make sure `.env` is not committed

---

### 3. Start with Docker

```bash
docker compose up --build
```

---

### 4. Access

* API: http://localhost:5000
* Database: MongoDB Atlas

---

## Notes

* MongoDB is hosted on Atlas (no local DB required)
* CORS is currently open for development and will be restricted later
* Error handling and validation are implemented for API safety

---

## Future Work

* Add anomaly detection on sensor data
* Build frontend dashboard
* Integrate with actual IoT devices
* Improve alert system

---

## Status

Project is still under development and being actively improved.
