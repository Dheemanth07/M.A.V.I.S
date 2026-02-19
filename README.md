# MAVIS  
Multi-species Animal Vitality Intelligence System  

## 1. Overview
MAVIS is an AI-driven IoT-based animal health monitoring system.  
Phase 0 includes a containerized Express backend with MongoDB integration using Docker.

## 2. Tech Stack
- Node.js
- Express
- MongoDB
- Mongoose
- Docker
- Docker Compose
- Socket.IO

## 3. How to Run (Development Setup)

1. Clone the repository
2. Navigate to the backend folder
3. Create a `.env` file inside backend:
```

MONGO_URI=mongodb://mongo:27017/mavis
PORT=5000

```
4. Run:
```

docker compose up --build

```
5. Backend will run on:
```

http://localhost:5000

```
---

