# FundFlow — Investment Funds Dashboard

A full-stack asset management dashboard with AI-powered fund advisor chat.
Built as a technical portfolio project covering Java backend, React frontend, Python data pipelines, Docker, and multi-cloud CI/CD.

---

## Live environments

| Cloud | App URL | Status |
|-------|---------|--------|
| AWS ECS Fargate | http://xxxxxxxxxxx.amazonaws.com | Active |
| GCP Cloud Run | https://xxxxxxxxxxxxxx.run.app | Preserved |
| Azure Container Apps | https://xxxxxxxxxxxxx.azurecontainerapps.io | Active |
| Local | http://localhost:3000 | Docker Compose |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Material UI |
| Backend | Java 21 + Spring Boot 4.0.5 + REST |
| AI | Gemini 2.5 Flash API |
| Database | MongoDB Atlas (cloud) / MongoDB 7.0 (local) |
| Data pipeline | Python 3.13 + pymongo |
| Local infra | Docker Compose |
| Cloud — AWS | ECS Fargate + ALB + VPC + Secrets Manager + ECR |
| Cloud — GCP | Cloud Run + Artifact Registry |
| Cloud — Azure | Container Apps + ACR + Key Vault |
| CI/CD | GitHub Actions |

---

## Repository structure

```
fundflow/
├── fundflow-app/           # React 18 dashboard
│   └── README.md
├── fundflow-bff/           # Java 21 Spring Boot API
│   └── README.md
├── fundflow-core/          # Python ETL seeder
│   └── README.md
├── fundflow-infra/         # Multi-cloud infrastructure
│   ├── aws/                # CloudFormation templates
│   ├── gcp/                # GCP reference
│   ├── azure/              # Azure Container Apps
│   ├── CLOUD-SETUP-GUIDE.md  # All manual setup commands
│   └── README.md
├── .github/
│   └── workflows/
│       ├── ci.yml              # Build + test (all pushes)
│       ├── deploy-aws.yml      # Deploy to AWS ECS
│       ├── deploy-gcp.yml      # Deploy to GCP Cloud Run (disabled)
│       ├── deploy-azure.yml    # Deploy to Azure Container Apps
│       └── README.md
├── docker-compose.yml      # Local development
└── .env                    # Local secrets (gitignored)
```

---

## Quick start — local

```bash
git clone https://github.com/ziuld/fundflow.git
cd fundflow
echo "GEMINI_API_KEY=your_key_here" > .env
docker compose up --build
# Open http://localhost:3000
```

---

## Quick start — cloud deployment

See `fundflow-infra/CLOUD-SETUP-GUIDE.md` for full one-time setup instructions for each cloud.

After setup, deployment is fully automated — just push to `main`.

---

## API endpoints

```
GET    /api/v1/funds                    All funds
GET    /api/v1/funds?category=Equity    Filter by category
GET    /api/v1/funds?riskLevel=High     Filter by risk level
GET    /api/v1/funds/{id}              Single fund by ID
POST   /api/v1/funds                   Create fund
PUT    /api/v1/funds/{id}              Update fund
DELETE /api/v1/funds/{id}              Delete fund
POST   /api/v1/chat                    AI chat with fund context
GET    /actuator/health/liveness       Health check
```

---

## CI/CD pipelines

| Workflow | Trigger | Cloud |
|----------|---------|-------|
| `ci.yml` | Every push | — (build + test) |
| `deploy-aws.yml` | Push to main | AWS ECS Fargate |
| `deploy-gcp.yml` | Disabled | GCP Cloud Run |
| `deploy-azure.yml` | Push to main | Azure Container Apps |