.PHONY: help install dev build clean docker-up docker-down up down logs docker-logs db-migrate db-seed db-studio setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	pnpm install

docker-up: ## Start Docker services (PostgreSQL, API, and UI)
	@echo "Starting Docker services..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Waiting for services to be ready..."
	@sleep 5

docker-down: ## Stop Docker services
	@echo "Stopping Docker services..."
	docker-compose -f docker-compose.dev.yml down

up: docker-up ## Alias for docker-up

down: docker-down ## Alias for docker-down

docker-logs: ## View Docker logs
	docker-compose -f docker-compose.dev.yml logs -f

logs: docker-logs ## Alias for docker-logs

db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	pnpm --filter @repo/db db:push

db-seed: ## Seed the database
	@echo "Seeding database..."
	pnpm --filter @repo/db db:seed

db-studio: ## Open Drizzle Studio
	@echo "Opening Drizzle Studio..."
	pnpm --filter @repo/db db:studio

db-reset: docker-down docker-up ## Reset database (stop, start, migrate, seed)
	@sleep 5
	@$(MAKE) db-migrate
	@$(MAKE) db-seed

dev: docker-up ## Start all development servers (via Docker)
	@echo "All services are running in Docker."
	@echo "API: http://localhost:3001"
	@echo "UI: http://localhost:3000"
	@echo ""
	@echo "To view logs: make logs"
	@echo "To stop: make down"

dev-local: ## Start development servers locally (not in Docker)
	@echo "Starting development servers locally..."
	pnpm dev

dev-api: ## Start only the API server locally
	@echo "Starting API server locally..."
	pnpm --filter @repo/api dev

dev-ui: ## Start only the UI server locally
	@echo "Starting UI server locally..."
	pnpm --filter @repo/example-auth-ui dev

build: ## Build all packages
	@echo "Building all packages..."
	pnpm build

clean: ## Clean build artifacts and node_modules
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf .turbo

setup: install docker-up ## Full setup: install dependencies and start services
	@sleep 5
	@$(MAKE) db-migrate
	@$(MAKE) db-seed
	@echo ""
	@echo "Setup complete! All services are running in Docker."
	@echo "API: http://localhost:3001"
	@echo "UI: http://localhost:3000"
	@echo ""
	@echo "To view logs: make logs"
	@echo "To stop services: make down"

lint: ## Run linting
	@echo "Running linter..."
	pnpm lint

format: ## Format code
	@echo "Formatting code..."
	pnpm format

