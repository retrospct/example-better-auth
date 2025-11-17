.PHONY: help install dev dev-api dev-ui build clean db-create db-drop db-migrate db-seed db-studio db-generate setup lint format

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	pnpm install

dev: ## Start all development servers
	@echo "Starting all development servers..."
	@echo "Make sure you have a .env file set up (copy from sample.env)"
	pnpm dev

dev-api: ## Start only the API server
	@echo "Starting API server..."
	@echo "Make sure you have a .env file set up (copy from sample.env)"
	pnpm dev:api

dev-ui: ## Start only the UI server
	@echo "Starting UI server..."
	@echo "Make sure you have a .env file set up (copy from sample.env)"
	pnpm dev:ui

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

db-create: ## Create the database
	@echo "Creating database..."
	pnpm db:create

db-drop: ## Drop the database
	@echo "Dropping database..."
	pnpm db:drop

db-generate: ## Generate database migrations
	@echo "Generating database migrations..."
	pnpm db:generate

db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	pnpm db:migrate

db-push: ## Push database schema changes (dev only)
	@echo "Pushing database schema changes..."
	pnpm db:push

db-seed: ## Seed the database
	@echo "Seeding database..."
	pnpm db:seed

db-studio: ## Open Drizzle Studio
	@echo "Opening Drizzle Studio..."
	pnpm db:studio

setup: install ## Full setup: install dependencies, run migrations, and seed database
	@echo ""
	@if [ ! -f .env ]; then \
		echo "Creating .env file from sample.env..."; \
		cp sample.env .env; \
		echo "Please update .env with your database configuration before continuing."; \
		exit 1; \
	fi
	@echo "Running database migrations..."
	pnpm db:push
	@echo "Seeding database..."
	pnpm db:seed
	@echo ""
	@echo "Setup complete!"
	@echo "API: http://localhost:3001"
	@echo "UI: http://localhost:3000"
	@echo ""
	@echo "To start development servers: make dev"

lint: ## Run linting
	@echo "Running linter..."
	pnpm lint

format: ## Format code
	@echo "Formatting code..."
	pnpm format
