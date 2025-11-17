# Turborepo Auth Setup

A monorepo setup with Next.js UI and Hono API using better-auth for authentication.

## Architecture

- **example-auth-ui**: Next.js app with Tailwind CSS and shadcn/ui components
- **api**: Hono API server with PostgreSQL and better-auth
- **packages/db**: Shared database schema and migrations (used only by API)

The UI communicates with the API via HTTP requests. The API handles all database operations. Better-auth manages cookie-based session authentication between the UI and API.

## Prerequisites

- Node.js 18+
- pnpm 8.15.0+
- Docker and Docker Compose (for development)

## Setup

### Quick Start (using Makefile)

All services run in Docker containers:

```bash
make setup    # Install dependencies, start Docker (PostgreSQL, API, UI), run migrations, and seed database
make dev      # Start all services in Docker (or use 'make docker-up' if already set up)
```

All services will be available:
- API: http://localhost:3001
- UI: http://localhost:3000
- PostgreSQL: localhost:5432

### Manual Setup

1. Install dependencies:
```bash
pnpm install
# or
make install
```

2. Set up environment variables:

**Root `.env` file** (for database migrations):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db?sslmode=disable
```

**apps/api/.env**:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db?sslmode=disable
AUTH_BASE_URL=http://localhost:3001
AUTH_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3001
```

**apps/example-auth-ui/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start all services with Docker Compose (PostgreSQL, API, and UI):
```bash
docker-compose -f docker-compose.dev.yml up -d
# or
make docker-up
```

4. Run database migrations:
```bash
pnpm --filter @repo/db db:push
# or
make db-migrate
```

5. (Optional) Seed the database:
```bash
pnpm --filter @repo/db db:seed
# or
make db-seed
```

All services are now running in Docker:
- API: http://localhost:3001
- UI: http://localhost:3000
- PostgreSQL: localhost:5432

**Note:** To run services locally (not in Docker), use:
```bash
make dev-local  # Run all services locally
make dev-api    # Run only API locally
make dev-ui     # Run only UI locally
```

## Development

### Using Makefile (Recommended)

**Docker Commands (Default):**
- `make help` - Show all available commands
- `make setup` - Full setup (install, docker up, migrate, seed)
- `make dev` - Start all services in Docker (default)
- `make docker-up` - Start Docker services (PostgreSQL, API, UI)
- `make docker-down` - Stop Docker services
- `make docker-logs` - View Docker logs

**Database Commands:**
- `make db-migrate` - Run database migrations
- `make db-seed` - Seed the database
- `make db-studio` - Open Drizzle Studio
- `make db-reset` - Reset database (stop, start, migrate, seed)

**Local Development (not in Docker):**
- `make dev-local` - Start all development servers locally
- `make dev-api` - Start only the API server locally
- `make dev-ui` - Start only the UI server locally

**Other:**
- `make build` - Build all packages
- `make clean` - Clean build artifacts
- `make lint` - Run linting
- `make format` - Format code

### Using pnpm directly

- Run all apps locally: `pnpm dev`
- Build all apps: `pnpm build`
- Run linting: `pnpm lint`

## Database

The database package (`packages/db`) contains:
- Schema definitions for users, sessions, accounts, and verifications
- Drizzle configuration
- Migration scripts
- Seed script

To generate migrations:
```bash
pnpm --filter @repo/db db:generate
```

To push schema changes:
```bash
pnpm --filter @repo/db db:push
```

## Project Structure

```
turborepo-auth-setup/
├── apps/
│   ├── example-auth-ui/     # Next.js app
│   └── api/                 # Hono API
├── packages/
│   └── db/                  # Database schema and migrations
├── docker-compose.dev.yml   # Development services
└── package.json             # Root workspace config
```

