# GarageHub 🚗

GarageHub is a full-stack garage management web application for managing vehicles, service requests, mechanics, and workshop operations.

The application is built with **React, ASP.NET Core, PostgreSQL, Docker, and Nginx**, with authentication, role-based authorization, persistent database storage, containerized deployment, health monitoring, and a CI pipeline using GitHub Actions.

---

## ✨ Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Secure password hashing with BCrypt
* Role-based access control:

  * Customer
  * Mechanic
  * Admin
* Protected API endpoints using authorization policies
* Automatic initial admin creation during application startup

---

### 👤 User Management

* Customer registration
* Login with JWT token generation
* Retrieve current authenticated user
* Admin can create mechanic accounts
* Role-based access to application functionality

---

### 🚗 Vehicle Management

* Add and manage vehicles
* Vehicles are linked to their owners
* Retrieve all vehicles belonging to the logged-in user
* Retrieve individual vehicles with ownership and role-based access validation

---

### 🔧 Vehicle Service Management

GarageHub implements a status-driven workflow for managing vehicle service requests.

Customers can:

* Create service requests for their vehicles
* Select predefined service types
* Update requests before work begins
* Track service progress

Mechanics and administrators can:

* Take over available service requests
* Add timestamped mechanic notes
* Update service status
* Set the final service price
* Complete service requests

Service lifecycle:

```text
Available
    ↓
InService
    ↓
Completed
```

The backend automatically records the completion timestamp when a service is completed.

---

### 🧾 Service Catalog

Administrators can manage predefined workshop services.

Each service contains:

* Name
* Base price
* Active status

These services can be selected when customers create vehicle service requests.

---

## 🏗️ Architecture

GarageHub uses a containerized three-service architecture:

```text
Client / Browser
       │
       ▼
┌─────────────────────┐
│   Nginx + React     │
│      Frontend       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    ASP.NET Core     │
│      REST API       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    PostgreSQL 17    │
│      Database       │
└─────────────────────┘
```

All application components run as separate Docker containers managed through **Docker Compose**.

---

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript / TypeScript ecosystem
* Nginx for serving the production frontend and routing requests

### Backend

* ASP.NET Core Web API
* .NET 10
* Entity Framework Core
* REST API architecture
* JWT Authentication
* BCrypt password hashing

### Database

* PostgreSQL 17
* Entity Framework Core migrations
* Persistent Docker volume storage

### DevOps & Deployment

* Linux deployment environment
* Docker
* Docker Compose
* Nginx
* Docker health checks
* GitHub Actions CI
* Automated application builds and Docker image validation

---

## 🐳 Docker Architecture

The application runs using Docker Compose with three main services:

```text
docker compose
│
├── frontend
│   ├── React production build
│   └── Nginx
│
├── backend
│   ├── ASP.NET Core API
│   └── Entity Framework Core
│
└── postgres
    ├── PostgreSQL 17
    └── Persistent volume
```

Service startup dependencies and health checks ensure that containers start in the correct order.

```text
PostgreSQL
    │
    │ healthy
    ▼
Backend API
    │
    │ healthy
    ▼
Frontend / Nginx
```

PostgreSQL uses `pg_isready` for its health check.

The backend exposes a `/health` endpoint used by Docker to verify that the API is running correctly.

---

## 💾 Database & Persistence

GarageHub originally used SQLite during early development and was migrated to **PostgreSQL** for the containerized deployment environment.

Database features include:

* PostgreSQL 17
* Entity Framework Core with Npgsql
* Automatic EF Core migrations during application startup
* Persistent Docker named volume
* Database persistence across container restarts and recreation

Database migrations are automatically applied when the backend starts:

```csharp
db.Database.Migrate();
```

The PostgreSQL data directory is stored in a Docker volume, ensuring application data survives:

```bash
docker compose down
docker compose up -d
```

---

## 👑 Initial Admin Bootstrap

GarageHub automatically ensures that an initial administrator account exists after database migrations are applied.

During backend startup:

```text
Application starts
       ↓
Database becomes available
       ↓
EF Core migrations run
       ↓
Check for initial admin
       ↓
Create admin if it does not exist
       ↓
API starts
```

This removes the need for manually calling an admin-creation API endpoint when deploying a fresh environment.

---

## 🔄 Service Workflow

```text
Customer registers and logs in
            ↓
Customer adds a vehicle
            ↓
Customer creates a service request
            ↓
Service becomes Available
            ↓
Mechanic/Admin takes the job
            ↓
Service becomes InService
            ↓
Mechanic adds notes and performs work
            ↓
Final price is set
            ↓
Service becomes Completed
            ↓
Completion timestamp is recorded
```

---

## 📡 Main API Endpoints

### Authentication & Users

```text
POST /api/users/register
POST /api/users/login
GET  /api/users/me
GET  /api/users/mechanics
POST /api/users/registerMechanic
```

### Vehicles

```text
POST /api/vehicles
GET  /api/vehicles/my
GET  /api/vehicles/{id}
```

### Vehicle Services

```text
POST /api/vehicle-services
GET  /api/vehicle-services/my
GET  /api/vehicle-services/{id}
PUT  /api/vehicle-services/{id}
PUT  /api/vehicle-services/{id}/work
```

### Service Catalog

```text
GET  /api/services
POST /api/services
```

### Infrastructure

```text
GET /health
```

---

## 🔄 CI Pipeline

GarageHub uses **GitHub Actions** for Continuous Integration.

The CI pipeline runs automatically on pushes and pull requests to the `main` branch.

```text
git push / pull request
          ↓
GitHub Actions
          ↓
Checkout repository
          ↓
Restore .NET dependencies
          ↓
Build ASP.NET Core backend
          ↓
Install frontend dependencies
          ↓
Build React frontend
          ↓
Build Docker images
          ↓
Validate Docker Compose configuration
          ↓
CI passed ✅
```

This verifies that both application layers compile successfully and that the containerized deployment configuration remains buildable.

---

## 🚀 Deployment

GarageHub has been deployed and tested on a **Linux virtual machine** using Docker Compose.

The deployment consists of:

```text
Linux VM
   │
   └── Docker Compose
          │
          ├── Frontend
          │     └── Nginx + React
          │
          ├── Backend
          │     └── ASP.NET Core
          │
          └── Database
                └── PostgreSQL
```

The deployment setup includes:

* Containerized frontend, backend, and database
* Service dependency management
* Health checks
* Automatic database migrations
* Automatic initial admin creation
* Persistent PostgreSQL storage
* Nginx reverse proxy / frontend serving
* Reproducible Docker-based deployment

---

## ⚙️ Running with Docker

Build and start the complete application:

```bash
docker compose up -d --build
```

Check container status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Stop the application:

```bash
docker compose down
```

Database data remains persistent through the configured PostgreSQL Docker volume.

---

## 🧠 Key Design & Infrastructure Decisions

* DTOs prevent overposting and control API contracts
* JWT authentication handles authenticated sessions
* Role-based authorization controls access to protected operations
* Vehicle ownership is enforced by the backend
* Service workflow is status-driven
* Mechanic notes maintain timestamped service history
* Completion timestamps are controlled by backend logic
* PostgreSQL provides persistent relational storage
* EF Core migrations automatically synchronize database schema
* Docker Compose provides reproducible multi-container environments
* Health checks control container startup dependencies
* Nginx serves the production frontend
* GitHub Actions automatically validates builds and Docker configuration

---

## 🚧 Future Improvements

* Email verification during user registration
* Email notifications when service status changes
* Pagination and filtering for service lists
* Extended audit logging
* Improved mechanic job assignment workflow
* Automated tests integrated into CI
* HTTPS and domain configuration
* Production-ready Continuous Deployment pipeline
* Improved monitoring and logging

---

## 📚 What This Project Demonstrates

GarageHub was built as a learning project covering the complete path from application development to deployment.

Key areas explored:

* Full-stack web application architecture
* React frontend development
* ASP.NET Core REST API development
* Authentication and role-based authorization
* Entity Framework Core
* PostgreSQL database management
* Database migrations and persistence
* Docker containerization
* Multi-container orchestration with Docker Compose
* Nginx configuration
* Linux server deployment
* Application health checks
* CI with GitHub Actions
* Deployment and DevOps fundamentals

---

## 👨‍💻 Author

Built as a practical full-stack and DevOps learning project focused on understanding how a modern web application moves from:

```text
Source Code
    ↓
Build
    ↓
Database
    ↓
Containers
    ↓
Linux Server
    ↓
CI Pipeline
    ↓
Deployment
```

The project is continuously improved as new backend, frontend, infrastructure, and DevOps concepts are implemented.
