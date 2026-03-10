# 🛒 DevShop Microservices

DevShop is a high-performance, scalable e-commerce backend built with **NestJS**, designed using a **Microservices Architecture**. It features a robust observability stack, containerized deployments, and automated CI/CD pipelines.

## 🏗️ Architecture Overview

The project is structured as a **monorepo** managing multiple services and shared libraries:

### 🚀 Applications (`apps/`)
- **`api-gateway`**: The unified entry point. Handles request routing, rate limiting, and global metrics.
- **`auth-service`**: Identity management with JWT and Refresh Token rotation.
- **`order-service`**: Core business logic for handling customer orders.
- **`notification-service`**: Asynchronous notification handling using BullMQ.
- **`infra-service`**: System-wide infrastructure and configuration management.

### 📚 Shared Libraries (`libs/`)
- **`common`**: Shared logic for security (Guards/Strategies), observability (Metrics/Tracing), and utilities.
- **`database`**: Centralized TypeORM configuration with automated entity discovery.

## 🛠️ Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Caching & Queues**: Redis & BullMQ
- **Observability**: 
  - **Tracing**: OpenTelemetry & Jaeger
  - **Metrics**: Prometheus & Grafana
  - **Logging**: Winston & Grafana Loki
- **Infrastructure**: Terraform, Docker, and Kubernetes (Helm)

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Spin up infrastructure**:
   ```bash
   docker-compose up -d
   ```
3. **Start services**:
   ```bash
   # Start all services in watch mode
   npm run start:dev
   ```

## 📊 Observability & Monitoring

Once the infrastructure is running, you can access the following dashboards:
- **Grafana**: `http://localhost:3004` (Password: `admin`)
- **Jaeger (Tracing)**: `http://localhost:16686`
- **Prometheus**: `http://localhost:9090`
- **API Documentation**: Each service hosts Swagger docs at `[SERVICE_URL]/api/docs`

## 🏗️ Infrastructure & Deployment

The project is ready for production deployment using:
- **Terraform**: Located in `infrastructure/terraform/` for provisioning AWS resources (EKS, RDS, VPC).
- **Helm**: Kubernetes manifests for each service in the `helm/` directory.
- **GitHub Actions**: Automated CI/CD for testing and deployment.

## 📜 License
DevShop is [UNLICENSED](LICENSE).
