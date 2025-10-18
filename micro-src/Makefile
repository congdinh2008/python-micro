# ==============================================================================
# Makefile for Python Microservices E-Commerce Platform
# ==============================================================================

.PHONY: help
help: ## Show this help message
	@echo '╔══════════════════════════════════════════════════════════════════════════╗'
	@echo '║            Python Microservices E-Commerce Platform                      ║'
	@echo '║                    Quick Command Reference                               ║'
	@echo '╚══════════════════════════════════════════════════════════════════════════╝'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Initial setup - copy .env.example to .env
	@echo '📝 Creating .env file from template...'
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo '✅ .env file created successfully'; \
		echo '⚠️  Please review and update .env file with your configuration'; \
	else \
		echo '⚠️  .env file already exists. Use "make env-update" to update from template'; \
	fi

.PHONY: env-update
env-update: ## Update .env file from .env.example (preserves existing values)
	@echo '📝 Backing up current .env...'
	@cp .env .env.backup
	@echo '✅ Backup created: .env.backup'
	@echo '⚠️  Please manually merge changes from .env.example'

.PHONY: build
build: ## Build all Docker images
	@echo '🔨 Building Docker images...'
	docker compose build --no-cache

.PHONY: build-service
build-service: ## Build specific service (usage: make build-service SERVICE=user-service)
	@if [ -z "$(SERVICE)" ]; then \
		echo '❌ Error: SERVICE not specified'; \
		echo 'Usage: make build-service SERVICE=user-service'; \
		exit 1; \
	fi
	@echo '🔨 Building $(SERVICE)...'
	docker compose build --no-cache $(SERVICE)

.PHONY: up
up: ## Start all services
	@echo '🚀 Starting all services...'
	docker compose up -d
	@echo ''
	@echo '⏳ Waiting for services to be ready (60s)...'
	@sleep 60
	@echo ''
	@make status

.PHONY: down
down: ## Stop all services
	@echo '🛑 Stopping all services...'
	docker compose down

.PHONY: restart
restart: down up ## Restart all services

.PHONY: stop
stop: ## Stop all services (without removing containers)
	@echo '⏸️  Stopping all services...'
	docker compose stop

.PHONY: start
start: ## Start stopped services
	@echo '▶️  Starting services...'
	docker compose start

.PHONY: logs
logs: ## View logs from all services
	docker compose logs -f

.PHONY: logs-service
logs-service: ## View logs from specific service (usage: make logs-service SERVICE=user-service)
	@if [ -z "$(SERVICE)" ]; then \
		echo '❌ Error: SERVICE not specified'; \
		echo 'Usage: make logs-service SERVICE=user-service'; \
		exit 1; \
	fi
	docker compose logs -f $(SERVICE)

.PHONY: ps
ps: ## List all running containers
	docker compose ps

.PHONY: status
status: ## Show status of all services with health checks
	@echo '╔══════════════════════════════════════════════════════════════════════════╗'
	@echo '║                          Service Status                                  ║'
	@echo '╚══════════════════════════════════════════════════════════════════════════╝'
	@echo ''
	@docker compose ps
	@echo ''
	@echo '╔══════════════════════════════════════════════════════════════════════════╗'
	@echo '║                       Service Health Checks                              ║'
	@echo '╚══════════════════════════════════════════════════════════════════════════╝'
	@echo ''
	@echo '🔍 User Service:       http://localhost:8001/health'
	@curl -s http://localhost:8001/health 2>/dev/null && echo ' ✅' || echo ' ❌'
	@echo '🔍 Product Service:    http://localhost:8002/health'
	@curl -s http://localhost:8002/health 2>/dev/null && echo ' ✅' || echo ' ❌'
	@echo '🔍 Order Service:      http://localhost:8003/health'
	@curl -s http://localhost:8003/health 2>/dev/null && echo ' ✅' || echo ' ❌'
	@echo '🔍 Notification Service: http://localhost:8004/health'
	@curl -s http://localhost:8004/health 2>/dev/null && echo ' ✅' || echo ' ❌'
	@echo ''
	@echo '╔══════════════════════════════════════════════════════════════════════════╗'
	@echo '║                      Observability Endpoints                             ║'
	@echo '╚══════════════════════════════════════════════════════════════════════════╝'
	@echo ''
	@echo '📊 Grafana:            http://localhost:3000 (admin/admin)'
	@echo '📈 Prometheus:         http://localhost:9090'
	@echo '🔍 Jaeger:             http://localhost:16686'
	@echo '🐰 RabbitMQ:           http://localhost:15672 (guest/guest)'

.PHONY: health
health: ## Check health of all services
	@echo '🏥 Checking service health...'
	@echo ''
	@echo 'User Service:       ' && curl -s http://localhost:8001/health | jq || echo '❌ Not available'
	@echo ''
	@echo 'Product Service:    ' && curl -s http://localhost:8002/health | jq || echo '❌ Not available'
	@echo ''
	@echo 'Order Service:      ' && curl -s http://localhost:8003/health | jq || echo '❌ Not available'
	@echo ''
	@echo 'Notification Service: ' && curl -s http://localhost:8004/health | jq || echo '❌ Not available'

.PHONY: test-api
test-api: ## Run basic API tests
	@echo '🧪 Running API tests...'
	@bash deployment/scripts/test-api.sh

.PHONY: test-complete
test-complete: ## Run comprehensive integration tests
	@echo '🧪 Running complete integration tests...'
	@bash deployment/scripts/test-complete.sh

.PHONY: test-assignment4
test-assignment4: ## Test Assignment 4 (Redis Cache, Orders, RabbitMQ)
	@echo '🧪 Running Assignment 4 integration tests...'
	@bash deployment/scripts/test_assignment4.sh

.PHONY: clean
clean: ## Remove all containers, volumes, and images
	@echo '🧹 Cleaning up all resources...'
	@echo '⚠️  This will remove all data. Press Ctrl+C to cancel...'
	@sleep 5
	docker compose down -v --remove-orphans
	docker system prune -f

.PHONY: clean-volumes
clean-volumes: ## Remove all volumes (data will be lost)
	@echo '🧹 Removing all volumes...'
	@echo '⚠️  This will delete all data. Press Ctrl+C to cancel...'
	@sleep 5
	docker compose down -v

.PHONY: exec-db
exec-db: ## Connect to database (usage: make exec-db DB=user-db)
	@if [ -z "$(DB)" ]; then \
		echo '❌ Error: DB not specified'; \
		echo 'Usage: make exec-db DB=user-db'; \
		echo 'Available: user-db, product-db, order-db'; \
		exit 1; \
	fi
	docker compose exec $(DB) psql -U user

.PHONY: backup-db
backup-db: ## Backup all databases
	@echo '💾 Backing up databases...'
	@mkdir -p backups
	@echo 'Backing up user-db...'
	@docker compose exec -T user-db pg_dump -U user user_service_db > backups/user-db-$$(date +%Y%m%d_%H%M%S).sql
	@echo 'Backing up product-db...'
	@docker compose exec -T product-db pg_dump -U user product_service_db > backups/product-db-$$(date +%Y%m%d_%H%M%S).sql
	@echo 'Backing up order-db...'
	@docker compose exec -T order-db pg_dump -U user order_service_db > backups/order-db-$$(date +%Y%m%d_%H%M%S).sql
	@echo '✅ Backups completed in ./backups directory'

.PHONY: restore-db
restore-db: ## Restore database from backup (usage: make restore-db DB=user-db FILE=backups/user-db-xxx.sql)
	@if [ -z "$(DB)" ] || [ -z "$(FILE)" ]; then \
		echo '❌ Error: DB or FILE not specified'; \
		echo 'Usage: make restore-db DB=user-db FILE=backups/user-db-xxx.sql'; \
		exit 1; \
	fi
	@echo '💾 Restoring $(DB) from $(FILE)...'
	@docker compose exec -T $(DB) psql -U user < $(FILE)
	@echo '✅ Restore completed'

.PHONY: shell-service
shell-service: ## Open shell in service container (usage: make shell-service SERVICE=user-service)
	@if [ -z "$(SERVICE)" ]; then \
		echo '❌ Error: SERVICE not specified'; \
		echo 'Usage: make shell-service SERVICE=user-service'; \
		exit 1; \
	fi
	docker compose exec $(SERVICE) /bin/sh

.PHONY: redis-cli
redis-cli: ## Connect to Redis CLI
	docker compose exec redis redis-cli

.PHONY: docs
docs: ## Open API documentation in browser
	@echo '📚 Opening API documentation...'
	@echo ''
	@echo 'User Service:       http://localhost:8001/docs'
	@echo 'Product Service:    http://localhost:8002/docs'
	@echo 'Order Service:      http://localhost:8003/docs'
	@echo 'Notification Service: http://localhost:8004/docs'
	@open http://localhost:8001/docs || xdg-open http://localhost:8001/docs || echo 'Please open http://localhost:8001/docs manually'

.PHONY: monitoring
monitoring: ## Open monitoring dashboards
	@echo '📊 Opening monitoring dashboards...'
	@open http://localhost:3000 || xdg-open http://localhost:3000 || echo 'Grafana: http://localhost:3000'
	@open http://localhost:16686 || xdg-open http://localhost:16686 || echo 'Jaeger: http://localhost:16686'
	@open http://localhost:9090 || xdg-open http://localhost:9090 || echo 'Prometheus: http://localhost:9090'

.PHONY: dev-setup
dev-setup: setup build up ## Complete development setup (setup + build + up)
	@echo ''
	@echo '✅ Development environment is ready!'
	@echo ''
	@make docs

.PHONY: prod-check
prod-check: ## Check production readiness
	@echo '🔍 Checking production readiness...'
	@echo ''
	@echo 'Checking .env file...'
	@grep -q "ENVIRONMENT=production" .env && echo '✅ Environment set to production' || echo '❌ Environment not set to production'
	@grep -q "ALLOWED_ORIGINS=\*" .env && echo '❌ CORS is set to wildcard (*) - SECURITY RISK!' || echo '✅ CORS configured with specific origins'
	@grep -q "SECRET_KEY=your-secret-key" .env && echo '❌ Using default SECRET_KEY - SECURITY RISK!' || echo '✅ SECRET_KEY customized'
	@grep -q "GRAFANA_ADMIN_PASSWORD=admin" .env && echo '❌ Using default Grafana password - SECURITY RISK!' || echo '✅ Grafana password changed'
	@echo ''
	@echo 'For production deployment checklist, see README.md'

.PHONY: install-tools
install-tools: ## Install required development tools
	@echo '🔧 Installing development tools...'
	@command -v jq >/dev/null 2>&1 || (echo 'Installing jq...' && brew install jq || sudo apt-get install -y jq)
	@command -v curl >/dev/null 2>&1 || (echo 'Installing curl...' && brew install curl || sudo apt-get install -y curl)
	@echo '✅ All tools installed'

.DEFAULT_GOAL := help
