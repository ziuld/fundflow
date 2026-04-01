# FundFlow — Investment Funds Dashboard

A full-stack asset management dashboard with AI-powered fund advisor chat.
Built as a technical portfolio project demonstrating modern Java backend, React frontend, and AI integration.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Material UI |
| Backend | Java 21 + Spring Boot 4.0.5 + REST |
| AI | Gemini 2.5 Flash API |
| Database | MongoDB 7.0 |
| Data pipeline | Python 3.13 + pymongo |
| Infrastructure | Docker Compose |
| CI/CD | GitHub Actions |

---

## Features

- **Fund dashboard** — real-time table with 30 funds including ETFs, stocks and mutual funds
- **Risk indicators** — color-coded risk chips and trend icons per fund
- **Category filter** — filter funds by Equity, Bond, Mixed, Money Market
- **AI chat advisor** — slide-in drawer per fund powered by Gemini 2.5 Flash
- **Contextual AI** — Gemini receives fund data as context and answers in the user's language
- **Full containerization** — entire stack runs with a single `docker compose up --build`

---

## Architecture

```
Browser
  └── React App (port 3000, nginx)
        └── BFF REST API (port 8080, Spring Boot)
              ├── MongoDB (port 27017)
              └── Gemini API (cloud)

Python Seeder (runs once on startup)
  └── CSV → MongoDB
```

---

## Quick start

**Prerequisites:** Docker Desktop, Git

```bash
# Clone the repo
git clone https://github.com/ziuld/fundflow.git
cd fundflow

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Start everything
docker compose up --build

# Open the dashboard
open http://localhost:3000
```

That's it. Docker pulls all images, runs the Python seeder to load fund data, starts the BFF and serves the React app.

---

## Project structure

```
fundflow/
├── fundflow-bff/          # Java 21 + Spring Boot REST API
│   ├── src/main/java/
│   │   └── fundflow_bff/
│   │       ├── controller/    # REST endpoints
│   │       ├── service/       # Business logic + Gemini integration
│   │       ├── repository/    # Spring Data MongoDB
│   │       ├── model/         # Fund, ChatRequest, ChatResponse
│   │       └── config/        # MongoDB configuration
│   └── Dockerfile
├── fundflow-app/          # React 18 + Material UI dashboard
│   ├── src/
│   │   ├── components/    # FundsTable, ChatDrawer
│   │   └── services/      # fundApi.js, chatApi.js
│   ├── nginx.conf
│   └── Dockerfile
├── fundflow-core/         # Python data pipeline
│   ├── data/
│   │   ├── funds.csv
│   │   └── funds_supplemental.csv
│   ├── seeder.py
│   └── Dockerfile
├── docker-compose.yml
├── .github/workflows/
│   └── ci.yml             # Build + test all services on every push
└── .env                   # Local secrets — not committed
```

---

## API endpoints

```
GET    /api/v1/funds                    # All funds
GET    /api/v1/funds?category=Equity    # Filter by category
GET    /api/v1/funds?riskLevel=High     # Filter by risk
GET    /api/v1/funds/{id}              # Single fund
POST   /api/v1/funds                   # Create fund
PUT    /api/v1/funds/{id}              # Update fund
DELETE /api/v1/funds/{id}              # Delete fund
POST   /api/v1/chat                    # AI chat with fund context
GET    /actuator/health                # Health check
```

---

## CI/CD

GitHub Actions runs on every push to `main`:

- **BFF** — Maven build + tests
- **React** — npm install + production build
- **Python** — dependency install + CSV validation
- **Docker** — compose config validation

All jobs run in parallel. Docker validation runs after all three pass.