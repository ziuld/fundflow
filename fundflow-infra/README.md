# fundflow-infra — Multi-Cloud Infrastructure

Infrastructure definitions and setup guides for deploying App across AWS, GCP, and Azure.

---

## Structure

```
fundflow-infra/
├── aws/                    # AWS CloudFormation templates
│   ├── vpc.yml             # VPC + subnets + NAT Gateway
│   ├── security.yml        # IAM + Security Groups + Secrets Manager
│   ├── ecr.yml             # ECR repositories
│   └── ecs.yml             # ECS cluster + ALB + Fargate services
├── gcp/                    # GCP (preserved, disabled)
│   └── README.md
├── azure/                  # Azure Container Apps
│   └── README.md
└── CLOUD-SETUP-GUIDE.md    # Full setup commands for all clouds
```

---

## AWS — ECS Fargate + ALB + VPC

**Status:** Active  
**Region:** eu-west-1 (Ireland)

### Architecture

```
Internet → ALB (public subnet) → ECS Fargate (private subnet)
                                        ↓
                                 MongoDB Atlas + Gemini API
```

### Stacks

| Stack | File | Resources |
|-------|------|-----------|
| `app-vpc` | `aws/vpc.yml` | VPC, 2 public + 2 private subnets, IGW, NAT |
| `app-security` | `aws/security.yml` | IAM roles, Security Groups, Secrets Manager, CloudWatch |
| `app-ecr` | `aws/ecr.yml` | ECR repos for BFF and React images |
| `app-ecs` | `aws/ecs.yml` | ECS cluster, ALB, target groups, Fargate services |

### Monthly cost estimate

| Resource | Cost |
|----------|------|
| NAT Gateway | ~$32 |
| ALB | ~$16 |
| ECS Fargate (2 services) | ~$10 |
| ECR + Secrets Manager + CloudWatch | ~$2 |
| **Total** | **~$60/month** |

### GitHub secrets required

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | OIDC IAM role ARN |
| `AWS_ALB_URL` | ALB DNS name |
| `AWS_BFF_ECR_REPO` | BFF ECR repository URI |
| `AWS_APP_ECR_REPO` | React app ECR repository URI |

---

## GCP — Cloud Run

**Status:** Preserved, disabled  
**Project:** fundflow-prod  
**Region:** europe-west1

Re-enable by removing `if: false` from `.github/workflows/deploy-gcp.yml`.

### Live URLs
```
BFF: https://xxxxxxxxxx.europe-west1.run.app
App: https://xxxxxxxxx.europe-west1.run.app
```

### Monthly cost
~€0 with min-instances=0. Free tier covers 2M requests/month.

### GitHub secrets required

| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | Service account JSON key |
| `GCP_PROJECT_ID` | fundflow-prod |
| `MONGODB_URI` | MongoDB Atlas URI |
| `GEMINI_API_KEY` | Gemini API key |

---

## Azure — Container Apps

**Status:** Active  
**Resource group:** app-rg  
**Region:** westeurope

### Architecture

```
Internet → Container Apps (external ingress)
              ├── fundflow-app (public)
              └── fundflow-bff (internal — only reachable within env)
                        ↓
                  ACR + Key Vault + MongoDB Atlas
```

### Resources

| Resource | Name | Purpose |
|----------|------|---------|
| Resource Group | `app-rg` | Logical container |
| Container Registry | `appacr` | Docker images |
| Log Analytics | `app-logs` | Container logs |
| Key Vault | `app-kv-dev-weu-001` | Secrets |
| Container Apps Env | `app-env` | Shared networking |
| Container App | `fundflow-bff` | Java API (internal) |
| Container App | `fundflow-app` | React app (external) |

### URLs
```
App: https://xxxxxxxxxxxxxxx.azurecontainerapps.io
BFF: https://xxxxxxxxxxxxxxx.azurecontainerapps.io
```

### Monthly cost estimate (2-day trial)

| Resource | Cost/day | 2 days |
|----------|---------|--------|
| Container Apps (2) | ~$2 | ~$4 |
| ACR Basic | ~$0.10 | ~$0.20 |
| Key Vault | ~$0.01 | ~$0.02 |
| Log Analytics | ~$0.50 | ~$1 |
| **Total** | **~$2.61/day** | **~$5.22** |

No NAT Gateway, no Load Balancer — included in Container Apps pricing.

### GitHub secrets required

| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | App registration client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

### Destroy all resources

```bash
az group delete --name app-rg --yes --no-wait
```

---

## Full setup instructions

See `CLOUD-SETUP-GUIDE.md` for complete step-by-step commands for both AWS and Azure including all one-time prerequisites.