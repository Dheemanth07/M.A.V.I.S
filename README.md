# MAVIS

**Multi-model Animal Vitality Intelligence System** 
## 1. Overview
MAVIS is an AI-driven, IoT-based health monitoring system designed to track and analyze animal vitality metrics in real-time. By leveraging multi-modal data, it provides comprehensive insights into animal well-being.

## 2. Tech Stack

* **Backend:** Node.js, Express, Socket.IO
* **Database:** MongoDB (via Mongoose ODM)
* **DevOps:** Docker, Docker Compose
* **Monitoring:** Nodemon (for Hot Reloading)

## 3. Project Structure

```text
MAVIS/
├── backend/            # Express API & Logic
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── frontend/           # (Planned) React/Vite UI
├── docker-compose.yml  # Root Orchestrator
└── README.md

```

## 4. Development Setup

### Prerequisites

* Docker & Docker Desktop installed.
* Node.js (optional, as it runs inside Docker).

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


*The `--build` flag ensures your latest `package.json` and `Dockerfile` changes are applied.*
4. **Accessing the App:**
* **Backend API:** [http://localhost:5000](https://www.google.com/search?q=http://localhost:5000)
* **MongoDB:** `mongodb://localhost:27017` (Connect via MongoDB Compass)



## 5. Key Docker Features in this Setup

* **Hot Reloading:** The `/backend` folder is volume-mounted. Any change you save in VS Code will trigger **Nodemon** inside the container to restart the server automatically.
* **Data Persistence:** Database records are saved in a Docker volume (`mongo-data`), so your data stays safe even if you stop the containers.
* **Detached Mode:** To run the system in the background, use `docker compose up -d`.
