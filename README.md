# MAVIS ( IN DEVELOPMENT )
**Multi-model Animal Vitality Intelligence System**

## 1. Overview
MAVIS is a professional-grade, AI-driven IoT health monitoring system designed to track and analyze animal vitality metrics in real-time. By leveraging a layered backend architecture, it provides robust data integrity and instant physiological insights to ensure animal well-being.

## 2. Tech Stack
* **Backend:** Node.js (ES6 Modules), Express.js
* **Real-time:** Socket.IO for live physiological alerts
* **Validation:** Joi (Schema-based data integrity)
* **Database:** MongoDB via Mongoose ODM
* **DevOps:** Docker & Docker Compose (Containerized Environment)
* **Monitoring:** Nodemon for hot-reloading during development

## 3. Architecture & Design Patterns
This project implements a **Clean Layered Architecture** to ensure scalability and maintainability.



* **Controller-Service-Repository Pattern:** Decouples HTTP handling, business logic, and data access.
* **Dependency Injection:** Promotes loose coupling by passing dependencies (like repositories into services) via constructors.
* **Singleton Pattern:** Ensures resource efficiency by utilizing a single instance of the repository across the app.
* **Middleware Validation:** A dedicated gatekeeper layer using Joi schemas to validate sensor data before it reaches the core logic.

## 4. Project Structure
The project is organized into a root orchestrator and modular backend components:

```text
MAVIS/
├── backend/                # Express API & Core Logic
│   ├── config/             # Database & App configurations
│   ├── controllers/        # Request handling & Response formatting
│   ├── middlewares/        # Joi validation & CORS logic
│   ├── models/             # Mongoose Data Schemas
│   ├── repositories/       # Data Access Layer (Singleton)
│   ├── routes/             # API Endpoint definitions
│   ├── services/           # Business Logic & Socket.IO Alerts
│   ├── schemas/            # Joi Validation Rules
│   ├── Dockerfile          # Backend container definition
│   └── server.js           # Entry point
├── frontend/               # (Planned) React/Vite UI
├── .dockerignore           # Excludes node_modules from Docker builds
├── docker-compose.yml      # Root Orchestrator for Backend & MongoDB
└── README.md               # Project Documentation

```

## 5. Intelligent Features

*  **Fever Detection:** Instant alerts triggered if animal temperature exceeds 45°C.
*  **Battery Monitoring:** Automated warnings when wearable device battery drops below 20%.
*  **Historical Analysis:** Efficient range-based querying for health trend visualization.
*  **Real-time Updates:** Live data broadcasting via Socket.IO "sensorUpdate" events.

## 6. Development Setup

### Prerequisites

* Docker & Docker Desktop installed.
* Node.js (Optional, as the environment is containerized).

### Steps to Run

1. **Clone the repository:**
```bash
git clone <your-repo-link>
cd MAVIS

```


2. **Environment Configuration:**
Create a `.env` file inside the `/backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://db:27017/mavis

```


3. **Launch the System:**
Run the following command from the **Project Root**:
```bash
docker compose up --build

```


4. **Accessing the App:**
* **Backend API:** http://localhost:5000
* **MongoDB:** `mongodb://localhost:27017` (Connect via MongoDB Compass)



## 7. Docker Orchestration Details

* **Hot Reloading:** The `/backend` folder is volume-mounted so changes in VS Code trigger Nodemon inside the container.
* **Data Persistence:** Uses a named Docker volume (`mongo-data`) to ensure sensor records persist between restarts.
* **Optimized Builds:** A root-level `.dockerignore` prevents local `node_modules` from causing architecture conflicts inside the Linux container.
