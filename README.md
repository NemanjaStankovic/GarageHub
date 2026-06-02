# GarageHub 🚗

GarageHub is a backend API built with ASP.NET Core and Entity Framework Core for managing vehicles, services, and workshop operations.  
It includes authentication, role-based authorization, and a workflow for tracking vehicle service requests from customers to mechanics.

---

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control:
  - Customer
  - Mechanic
  - Admin
- Secure endpoints using `[Authorize]` and role policies

---

### 👤 User Management
- Register new users (customers)
- Login with JWT token generation
- Admin can create mechanics
- Admin bootstrap endpoint (for initial setup)
- Get current user info (`/users/me`)

---

### 🚗 Vehicle Management
- Create vehicles (linked to user)
- Get vehicle by ID (ownership or admin access)
- Get all vehicles for logged-in user

---

### 🔧 Vehicle Service System
Core workflow of the system:

- Customers create service requests for their vehicles
- Optional selection of predefined service type
- Customer can update request before work begins
- Mechanic/Admin can:
  - Take over service
  - Add notes with timestamps
  - Update status (Available → InService → Completed)
  - Set final price
- Completion automatically sets timestamp

---

### 🧾 Service Catalog
- Admin can create service types
- Each service has:
  - Name
  - Base price
  - Active status

---

## 🏗️ Tech Stack
- ASP.NET Core Web API
- Entity Framework Core
- SQLite (development database)
- JWT Authentication
- BCrypt for password hashing

---

## 📡 Main API Endpoints

### Auth
```
POST /api/users/register
POST /api/users/login
GET  /api/users/me
```

### Vehicles
```
POST /api/vehicles
GET  /api/vehicles/my
GET  /api/vehicles/{id}
```

### Vehicle Services
```
POST /api/vehicle-services
GET  /api/vehicle-services/my
GET  /api/vehicle-services/{id}
PUT  /api/vehicle-services/{id}
PUT  /api/vehicle-services/{id}/work
```

### Admin
```
POST /api/users/addAdmin
POST /api/users/mechanics
POST /api/services
```

---

## 🔄 Service Workflow

1. Customer registers & logs in
2. Customer adds a vehicle
3. Customer creates a service request
4. Mechanic/Admin picks up the job
5. Mechanic updates status & adds notes
6. System marks completion timestamp automatically
7. Final price is set

---

## 🧠 Key Design Decisions

- DTOs are used to prevent overposting
- Role-based authorization controls access
- Mechanic notes are stored as a timeline log
- Completion time is controlled by backend
- Vehicle ownership is strictly enforced
- Service workflow is status-driven

---

## 🚧 Future Improvements

- Pagination for service lists
- Full audit log table for mechanic notes
- Frontend dashboard
- Mechanic job assignment system
- Email notifications for status changes
- Swagger API documentation improvements

---

## ⚙️ Setup

```bash
dotnet restore
dotnet ef database update
dotnet run
```

---

## 📌 Notes

This project is currently focused on backend architecture and business logic rather than UI. It is designed as a foundation for a full garage management system.

---

## 👨‍💻 Author

Built as a learning project for mastering:
- ASP.NET Core Web API
- Authentication & Authorization
- Clean backend architecture
- Real-world CRUD workflows