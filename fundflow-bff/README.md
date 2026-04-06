# fundflow-bff — Java 21 + Spring Boot 4 Backend

The Backend-For-Frontend (BFF) service. Exposes REST endpoints consumed by the React app and integrates with MongoDB Atlas and the Gemini AI API.

---

## Stack

- Java 21
- Spring Boot 4.0.5
- Spring Data MongoDB
- Spring Boot Actuator
- Lombok
- Gemini 2.5 Flash API (via RestClient)

---

## Architecture — 4-layer pattern

```
Controller  →  Service  →  Repository  →  MongoDB Atlas
     ↓
GeminiService  →  Gemini API
```

| Layer | Class | Responsibility |
|-------|-------|----------------|
| Model | `Fund.java`, `ChatRequest`, `ChatResponse` | Document definitions |
| Repository | `FundRepository` | Spring Data derived queries |
| Service | `FundService`, `GeminiService` | Business logic, AI integration |
| Controller | `FundController`, `ChatController` | REST endpoints, CORS |
| Config | `MongoConfig` | Explicit MongoDB bean (bypasses Boot 4 autoconfiguration bug) |

---

## REST API

```
GET    /api/v1/funds                    All funds
GET    /api/v1/funds?category=Equity    Filter by category
GET    /api/v1/funds?riskLevel=High     Filter by risk level
GET    /api/v1/funds/{id}              Single fund by ID
POST   /api/v1/funds                   Create fund
PUT    /api/v1/funds/{id}              Update fund
DELETE /api/v1/funds/{id}              Delete fund
POST   /api/v1/chat                    AI chat with fund context
GET    /actuator/health/liveness       ALB health check
GET    /actuator/health                Full health (includes MongoDB)
```

---

## Configuration

All configuration is in `src/main/resources/application.yml`. Secrets are injected via environment variables — never hardcoded.

| Variable | Source | Description |
|----------|--------|-------------|
| `SPRING_DATA_MONGODB_URI` | Env / AWS Secrets Manager | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Env / AWS Secrets Manager | Gemini API key |

---

## Running locally

```bash
# With Docker Compose (recommended)
docker compose up --build mongodb fundflow-bff

# Directly with Maven
cd fundflow-bff
./mvnw spring-boot:run
```

---

## Building Docker image

```bash
docker build -t fundflow-bff ./fundflow-bff
```

Multi-stage build: JDK 21 alpine for compilation, JRE 21 alpine for runtime. Final image ~180MB. Non-root user for security.

---

## Key design decisions

**Why BFF pattern?** The React app never talks directly to MongoDB. The BFF is the single entry point — it handles authentication, data transformation, and AI integration. This mirrors how real banking frontends work.

**Why `MongoConfig.java`?** Spring Boot 4.0.5 has a bug where `SPRING_DATA_MONGODB_URI` environment variable is not picked up by autoconfiguration. Explicit `@Configuration` with `@Bean` definitions bypass this issue.

**Why Gemini context injection?** Each chat request includes the full fund data in the prompt — name, category, risk, returns, AUM. Gemini answers specifically about that fund rather than generically. This is prompt engineering for financial context.