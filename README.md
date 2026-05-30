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
# GarageHub

> **Work in progress** — This project is under active development. The API surface, data model, and authentication are evolving; expect breaking changes.

GarageHub is a backend API for managing garage operations: customers, vehicles, service catalog, and work assignments to mechanics.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | [.NET 10](https://dotnet.microsoft.com/) |
| Web framework | ASP.NET Core Web API |
| Data access | Entity Framework Core 10 |
| Database | SQLite (`garage.db`) |
| API docs | (not configured by default) |
| Password hashing | [BCrypt.Net-Next](https://www.nuget.org/packages/BCrypt.Net-Next) |

## Architecture

The solution follows a **layered, monolithic API** layout typical of ASP.NET Core projects. Controllers use `GarageDbContext` and a small domain model.

```
HTTP clients (browser, mobile, GarageHub.http)
  └─> Controllers (e.g. UserController, VehicleController)
         └─> DTOs
                └─> GarageDbContext
                      └─> SQLite
```

### Domain model

Core entities and how they relate:

- **User** — Account with email, password hash, role (`Admin`, `Customer`, `Mechanic`), and active flag.
- **CustomerProfile** / **MechanicProfile** — Role-specific data keyed by `UserId`.
- **Vehicle** — Belongs to a customer (`User`). A customer can own many vehicles.
- **Service** — Catalog entry (name, base price, active flag).
- **VehicleService** — A service request or job on a vehicle: links vehicle, service type, optional assigned mechanic, status, timestamps, and price at booking.

Relationship rules are configured in `GarageDbContext.OnModelCreating` (e.g. restricted deletes to avoid accidental cascade deletes).

### Application entry

`Program.cs` registers controllers, the `GarageDbContext`, and JWT Bearer authentication. The application requires a `Jwt:Key` configuration value (see `appsettings.json` or environment variables). The `UserController` issues a JWT access token at login which must be presented as a `Bearer` token for protected endpoints.

### Current API (partial)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/users/register` | Create a new user (customer) |
| `POST` | `/api/users/login` | Validate credentials and return `{ "accessToken": "..." }` |
| `GET` | `/api/users/me` | (Authorized) Get current authenticated user info |
| `GET` | `/api/users/{id}` | (Authorized) Get user by id |
| `POST` | `/api/vehicles` | (Authorized) Create a vehicle for the authenticated user |
| `GET` | `/api/vehicles/my` | (Authorized) List vehicles for the authenticated user |
| `GET` | `/api/vehicles/{id}` | (Authorized) Get vehicle by id (Admin or owner) |

Planned areas (ongoing): service booking workflows, mechanic assignment, admin UI, stronger validation, and tests.

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

### Configuration

The app requires a JWT signing key at `Jwt:Key` in `appsettings.json` or an equivalent environment variable. Example `appsettings.json` snippet:

```json
{
  "Jwt": { "Key": "your-very-strong-secret-key-here" },
  "ConnectionStrings": { "DefaultConnection": "Data Source=garage.db" }
}
```

### Run locally

```bash
dotnet restore
dotnet ef database update   # apply migrations (creates garage.db)
dotnet run
```

By default the app uses the ports configured in `Properties/launchSettings.json` (e.g. `http://localhost:5124`).

### Testing with Postman

1. Register a new user:

    - `POST /api/users/register` — JSON body: `{ "email": "you@example.com", "password": "Password1!" }`

2. Login to receive a JWT:

    - `POST /api/users/login` — JSON body: `{ "email": "you@example.com", "password": "Password1!" }`
    - Response: `{ "accessToken": "..." }`

3. Call protected endpoints:

    - Set the `Authorization` header to `Bearer <accessToken>` (Postman: Authorization → Bearer Token).
    - Use `Content-Type: application/json` for request bodies.

4. Example protected requests:

    - `GET /api/users/me`
    - `POST /api/vehicles` with `{ "make": "Toyota", "model": "Camry" }`
    - `GET /api/vehicles/my`

If you run on `https://localhost:7172` Postman may warn about self-signed certificates; disable SSL verification in Postman settings if needed.

### Apply schema changes

```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

## Status and roadmap

This README reflects the current code: JWT auth is implemented and several vehicle endpoints exist. Next items include: role-based authorization checks, services and bookings, admin endpoints, and tests.

Contributions and feedback are welcome.
