# FundFlow — Investment Funds Dashboard

A full-stack asset management dashboard with AI-powered fund advisor chat.
Built as a technical portfolio project covering Java backend, React frontend, Python data pipelines, Docker, and multi-cloud CI/CD.

---

## Live environments

| Environment | App URL | Status |
|-------------|---------|--------|
| AWS ECS Fargate | http://fundflow-alb-xxxxx.eu-west-1.elb.amazonaws.com | Active |
| GCP Cloud Run | https://fundflow-app-xxxxx.europe-west1.run.app | Preserved |
| Azure Container Apps | — | Planned |

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
| CI/CD | GitHub Actions |

---

## Architecture

```
Browser
  └── React App (nginx)
        └── BFF REST API (Spring Boot)
              ├── MongoDB Atlas
              └── Gemini API (cloud)

Python Seeder (one-time)
  └── CSV → MongoDB
```

In production (AWS), the ALB sits in front routing `/api/*` to the BFF and `/*` to the React app. Both containers run in private subnets with no public IPs.

---

## Repository structure

```
fundflow/
├── fundflow-app/          # React 18 dashboard
├── fundflow-bff/          # Java 21 Spring Boot API
├── fundflow-core/         # Python ETL seeder
├── fundflow-infra/        # Multi-cloud infrastructure
│   ├── aws/               # CloudFormation templates
│   ├── gcp/               # GCP reference docs
│   └── azure/             # Azure (planned)
├── docker-compose.yml     # Local development
├── .github/workflows/     # CI/CD pipelines
└── .env                   # Local secrets (gitignored)
```

---

## Quick start — local

**Prerequisites:** Docker Desktop, Git

```bash
git clone https://github.com/ziuld/fundflow.git
cd fundflow
echo "GEMINI_API_KEY=your_key_here" > .env
docker compose up --build
open http://localhost:3000
```

---

## Quick start — AWS deployment

**Prerequisites:** AWS CLI, Docker, GitHub secrets configured

```bash
# Deploy infrastructure (one time)
cd fundflow-infra
aws cloudformation create-stack --stack-name fundflow-vpc --template-body file://aws/vpc.yml --region eu-west-1
aws cloudformation create-stack --stack-name fundflow-security --template-body file://aws/security.yml --capabilities CAPABILITY_NAMED_IAM --region eu-west-1
aws cloudformation create-stack --stack-name fundflow-ecr --template-body file://aws/ecr.yml --region eu-west-1
aws cloudformation create-stack --stack-name fundflow-ecs --template-body file://aws/ecs.yml --region eu-west-1

# After infrastructure is ready, push to main to trigger CD
git push origin main
```

---

## API endpoints

```
GET    /api/v1/funds                    All funds
GET    /api/v1/funds?category=Equity    Filter by category
GET    /api/v1/funds?riskLevel=High     Filter by risk
GET    /api/v1/funds/{id}              Single fund
POST   /api/v1/funds                   Create fund
PUT    /api/v1/funds/{id}              Update fund
DELETE /api/v1/funds/{id}              Delete fund
POST   /api/v1/chat                    AI chat with fund context
GET    /actuator/health/liveness       Health check
```

---

## CI/CD pipelines

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | Every push | Build + test all services |
| `deploy-aws.yml` | Push to main | Deploy to AWS ECS Fargate |
| `deploy-gcp.yml` | Disabled | Deploy to GCP Cloud Run |

---

## Destroy all AWS resources

```bash
aws cloudformation delete-stack --stack-name fundflow-ecs --region eu-west-1
aws cloudformation delete-stack --stack-name fundflow-ecr --region eu-west-1
aws cloudformation delete-stack --stack-name fundflow-security --region eu-west-1
aws cloudformation delete-stack --stack-name fundflow-vpc --region eu-west-1
```