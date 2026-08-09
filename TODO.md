# MAVIS Docker Deployment Steps

## [x] 1. Fix .ENV MONGO_URI for Docker networking
## [x] 2. Clean previous containers/volumes: docker compose down -v
## [x] 3. Build and start services: docker compose up --build
## [x] 4. Verify server running at http://localhost:5000
## [x] 5. Test health endpoint and DB connection

**Status:** Updated `Dockerfile` to include `npm ci` so `nodemon` devDependency is present during `docker compose up`. Frontend and Backend builds and tests verified.
