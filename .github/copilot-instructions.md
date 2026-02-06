<!-- GitHub Copilot / AI agent guidance for the IndiaBorn repo -->
# Copilot instructions — IndiaBorn

This file is a short, focused guide to help AI coding agents be immediately productive in this repository.

1) Big picture
- Backend: `Indiaborn.Api` is an ASP.NET Core Web API that serves REST endpoints, handles auth, payments, notifications and serves the built frontend from `wwwroot`.
- Frontend: `frontend` is a Vite + React app. During development it runs on `npm run dev` (http://localhost:3000) and API calls are proxied to the backend; production is built into `../Indiaborn.Api/wwwroot`.

2) Where to read first (quick tour)
- `Indiaborn.Api/Program.cs` — wiring for DI, singleton services, JWT, CORS policy `AllowFrontend`, SendGrid client, and seeding (admin + products).
- `Indiaborn.Api/Services/*` — business logic (ProductService, OrderService, UserService, PaymentService, NotificationService, JwtService, etc.).
- `Indiaborn.Api/Controllers/*` — API surface for frontend integration.
- `Indiaborn.Api/Data/MongoDbContext.cs` — Mongo access patterns and collection names used by services.
- `frontend/src/services/` — frontend API wrapper functions and where to look for request shapes.

3) Key workflows / commands
- Build solution: `dotnet build Indiaborn.sln`
- Run backend locally: `dotnet run --project Indiaborn.Api\\Indiaborn.Api.csproj` (there is also `start-backend.bat`).
- Run frontend dev server: from `frontend/`: `npm install` then `npm run dev` (the README documents this).
- Build frontend for production: `npm run build` (outputs to `../Indiaborn.Api/wwwroot`).
- Docker: repository contains `Dockerfile`s and `docker-compose.yml` — useful for containerized runs.

4) Project-specific conventions & patterns
- Services are registered as singletons in `Program.cs`. Expect stateful singleton behavior (seeding is performed at startup).
- No EF Core — the project uses a custom `MongoDbContext` abstraction; inspect collection names in `appsettings.json` and `MongoDbContext`.
- JWT config is in `appsettings.json` under `Jwt`. The repository ships a development signing key placeholder — replace in production.
- Notifications: SendGrid client is created with a dummy key when not configured; NotificationService will skip sends if keys are missing.
- Frontend-to-backend contract: frontend uses `src/services` to call the API; check DTOs in `Indiaborn.Api/DTOs` to match request/response shapes.

5) Environment & secrets to watch for
- `Indiaborn.Api/appsettings.json` contains local defaults (Mongo, Jwt, Stripe, Notifications, Admin). Override via `appsettings.Development.json` or environment variables for secrets.
- Mongo default: `mongodb://localhost:27017` — ensure local Mongo is running when developing the backend.

6) Common edits & typical PRs
- Add or update endpoints: modify `Controllers/*`, then adjust or add corresponding methods in `Services/*`.
- Frontend changes: update `frontend/src/components` or `pages`; use `frontend/package.json` scripts to run/build.
- Payment/Stripe work: keys live in `appsettings.json`/env vars; tests against Stripe use test keys.

7) Files to reference in PRs and reviews
- `Indiaborn.Api/Program.cs` (startup wiring)
- `Indiaborn.Api/Services/*` (business logic)
- `Indiaborn.Api/Controllers/*` (API surface)
- `Indiaborn.Api/Data/MongoDbContext.cs` (persistence)
- `frontend/src/services/*` and `frontend/package.json` (frontend API integration)

8) Quick gotchas for automated changes
- Don’t assume EF migrations; persistence uses Mongo collections and manual seeding (`SeedDefaultsAsync`).
- CORS policy `AllowFrontend` is conservative in production (reads `AllowedOrigins` from config). When changing origins, update both frontend dev proxy and backend allowed origins.
- OpenAPI/swagger endpoints were removed for .NET 8 compatibility — don’t rely on them being present.

If anything here is unclear or you'd like the guide to include extra examples (e.g., sample API request shape, common PR checklist), tell me which sections to expand.
