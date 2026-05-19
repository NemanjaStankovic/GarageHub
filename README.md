# GarageHub

> **Work in progress** — This project is under active development. The API surface, data model, and authentication are not final. Expect breaking changes.

GarageHub is a backend API for managing garage operations: customers, vehicles, service catalog, and work assignments to mechanics.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | [.NET 10](https://dotnet.microsoft.com/) |
| Web framework | ASP.NET Core Web API |
| Data access | Entity Framework Core 10 |
| Database | SQLite (`garage.db`) |
| API docs | Swagger / OpenAPI |
| Password hashing | [BCrypt.Net-Next](https://www.nuget.org/packages/BCrypt.Net-Next) |

## Architecture

The solution follows a **layered, monolithic API** layout typical of ASP.NET Core projects. There is no separate service or repository layer yet; controllers talk directly to `GarageDbContext`.

```
┌─────────────────────────────────────────────────────────┐
│  HTTP clients (browser, mobile, GarageHub.http)         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Controllers          REST endpoints, validation          │
│  (e.g. UserController)                                    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  DTOs                 Request/response shapes             │
│  (CreateUserDto, UserDto, LoginDto)                       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  GarageDbContext      EF Core, migrations, relationships  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  SQLite               Persistent store                  │
└─────────────────────────────────────────────────────────┘
```

### Domain model

Core entities and how they relate:

- **User** — Account with email, password hash, role (`Admin`, `Customer`, `Mechanic`), and active flag.
- **CustomerProfile** / **MechanicProfile** — Role-specific data keyed by `UserId` (phone for customers; salary and skills for mechanics).
- **Vehicle** — Belongs to a customer (`User`). A customer can own many vehicles.
- **Service** — Catalog entry (name, base price, active flag).
- **VehicleService** — A service request or job on a vehicle: links vehicle, service type, optional assigned mechanic, status (`Available`, `InService`, `Completed`), timestamps, and price at time of booking.

Relationship rules (configured in `GarageDbContext.OnModelCreating`):

- Deleting a user or vehicle is **restricted** if dependent records exist.
- Links from `VehicleService` to `Service` and mechanic `User` use **no cascade** to avoid SQL Server/SQLite cycle issues.

### Application entry

`Program.cs` registers controllers, Swagger, and the DbContext with a SQLite connection string. Authorization middleware is registered but **JWT or cookie auth is not wired up yet** — login returns user data without issuing tokens.

### Current API (partial)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/users/register` | Create customer account |
| `POST` | `/api/users/login` | Validate credentials |
| `GET` | `/api/users/{id}` | Get user by id |

Planned areas (not implemented or incomplete): vehicles, services, vehicle-service booking, mechanic assignment, admin endpoints, and authenticated routes.

## Project structure

```
GarageHub/
├── Controllers/       API controllers
├── Data/              GarageDbContext
├── DTOs/              Data transfer objects
├── Migrations/        EF Core migrations
├── Models/            Domain entities and enums
├── Profiles/          CustomerProfile, MechanicProfile
├── Program.cs         App startup and DI
└── GarageHub.sln
```

## Getting started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Run locally

```bash
dotnet restore
dotnet ef database update   # apply migrations (creates garage.db)
dotnet run
```

Swagger UI is available in Development at the root URL (see `Properties/launchSettings.json` for ports, e.g. `http://localhost:5124`).

### Apply schema changes

After model changes:

```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

## Status and roadmap

This README reflects the codebase as it exists today. Upcoming work may include:

- Authentication (e.g. JWT) and role-based authorization
- CRUD for vehicles, services, and vehicle-service workflows
- Mechanic and customer profile management
- Stronger validation and error handling
- Tests and deployment configuration

Contributions and design feedback are welcome while the project is still taking shape.
