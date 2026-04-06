# fundflow-infra — Multi-Cloud Infrastructure

CloudFormation and configuration files for deploying FundFlow across multiple cloud providers.

---

## Structure

```
fundflow-infra/
├── aws/          # AWS ECS Fargate — Active
├── gcp/          # GCP Cloud Run — Preserved, disabled
└── azure/        # Azure Container Apps — Planned
```

---

## AWS — ECS Fargate + ALB + VPC

### Architecture

```
Internet
  └── WAF (planned)
        └── ALB — public subnet eu-west-1a + eu-west-1b
              ├── /api/* → ECS fundflow-bff (private subnet)
              └── /*     → ECS fundflow-app (private subnet)
                                    ↓
                             MongoDB Atlas (external)
                             Gemini API (external)
```

### CloudFormation stacks (deploy in order)

| Stack | File | What it creates |
|-------|------|----------------|
| `fundflow-vpc` | `aws/vpc.yml` | VPC, subnets, IGW, NAT Gateway, route tables |
| `fundflow-security` | `aws/security.yml` | Security groups, IAM roles, Secrets Manager, CloudWatch |
| `fundflow-ecr` | `aws/ecr.yml` | ECR repositories for BFF and React images |
| `fundflow-ecs` | `aws/ecs.yml` | ECS cluster, ALB, target groups, Fargate services |

### Deploy all stacks

```bash
export AWS_PROFILE=fundflow

aws cloudformation create-stack --stack-name fundflow-vpc \
  --template-body file://aws/vpc.yml --region eu-west-1

aws cloudformation create-stack --stack-name fundflow-security \
  --template-body file://aws/security.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=MongoDbUri,ParameterValue="YOUR_MONGODB_URI" \
    ParameterKey=GeminiApiKey,ParameterValue="YOUR_GEMINI_KEY" \
  --region eu-west-1

aws cloudformation create-stack --stack-name fundflow-ecr \
  --template-body file://aws/ecr.yml --region eu-west-1

aws cloudformation create-stack --stack-name fundflow-ecs \
  --template-body file://aws/ecs.yml --region eu-west-1
```

### Destroy all stacks (reverse order)

```bash
aws cloudformation delete-stack --stack-name fundflow-ecs --region eu-west-1
aws cloudformation delete-stack --stack-name fundflow-ecr --region eu-west-1
aws cloudformation delete-stack --stack-name fundflow-security --region eu-west-1
aws cloudformation delete-stack --stack-name fundflow-vpc --region eu-west-1
```

### One-time prerequisites

```bash
# Register GitHub OIDC provider (once per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Create ECS service-linked role (once per AWS account)
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
```

### GitHub secrets required

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | IAM role ARN from fundflow-security stack output |
| `AWS_ALB_URL` | ALB DNS name from fundflow-ecs stack output |
| `AWS_BFF_ECR_REPO` | ECR URI from fundflow-ecr stack output |
| `AWS_APP_ECR_REPO` | ECR URI from fundflow-ecr stack output |

### Estimated costs (eu-west-1)

| Resource | Cost |
|----------|------|
| NAT Gateway | ~$32/month |
| ALB | ~$16/month |
| ECS Fargate (2 services, minimal) | ~$10/month |
| ECR storage | ~$0.10/month |
| Secrets Manager | ~$0.40/month |
| CloudWatch Logs (7 day retention) | ~$1/month |
| **Total** | **~$60/month** |

---

## GCP — Cloud Run (preserved, disabled)

Status: deployed and working. CD pipeline disabled via `if: false` in `deploy-gcp.yml`.

### Live URLs

```
BFF: https://fundflow-bff-xxxx.europe-west1.run.app
App: https://fundflow-app-xxxx.europe-west1.run.app
```

### Re-enable deployment

Remove `if: false` from `.github/workflows/deploy-gcp.yml` and push to main.

### Resources created (Google Cloud project: fundflow-prod)

- Cloud Run services: `fundflow-bff`, `fundflow-app`
- Artifact Registry: `europe-west1-docker.pkg.dev/fundflow-prod/fundflow`
- Service account: `fundflow-deployer@fundflow-prod.iam.gserviceaccount.com`

### Cost

~€0/month with min-instances=0. Only charges on actual requests. Free tier covers 2M requests/month.

---

## Azure — Container Apps (planned)

Target architecture:

```
Internet
  └── Azure Front Door (CDN + WAF)
        └── Azure Container Apps Environment
              ├── fundflow-bff (Java container)
              └── fundflow-app (nginx container)
                        ↓
                  Azure Key Vault (secrets)
                  MongoDB Atlas (external)
```

### Planned resources

| Resource | Azure equivalent |
|----------|----------------|
| ECS Fargate | Azure Container Apps |
| ALB | Azure Application Gateway / Front Door |
| ECR | Azure Container Registry (ACR) |
| Secrets Manager | Azure Key Vault |
| IAM OIDC | Azure Workload Identity Federation |
| CloudWatch | Azure Monitor + Log Analytics |

### CD pipeline

Will use `azure/login` GitHub Action with Workload Identity Federation — same OIDC pattern as AWS, no static credentials.

### Estimated cost for 2-day trial

| Resource | Daily cost | 2-day total |
|----------|-----------|-------------|
| Container Apps (2 services) | ~$2 | ~$4 |
| Application Gateway | ~$3 | ~$6 |
| Container Registry | ~$0.10 | ~$0.20 |
| Key Vault | ~$0.01 | ~$0.02 |
| **Total** | **~$5/day** | **~$10** |

Infrastructure files will be added to `azure/` when implementation begins.