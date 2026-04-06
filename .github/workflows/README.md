# .github/workflows — CI/CD Pipelines

Three separate workflow files following the single-responsibility principle — CI is decoupled from deployment, and each cloud has its own deployment workflow.

---

## Workflow overview

| File | Trigger | Purpose |
|------|---------|---------|
| `ci.yml` | Every push to main/develop, PRs | Build + test all services |
| `deploy-aws.yml` | Push to main | Deploy to AWS ECS Fargate |
| `deploy-gcp.yml` | Disabled (`if: false`) | Deploy to GCP Cloud Run |

---

## ci.yml — Continuous Integration

Runs on every push and pull request. All 4 jobs run in parallel — total time equals the slowest job.

```
bff-ci      ──┐
app-ci      ──┼──→ compose-ci (gate)
core-ci     ──┘
```

| Job | What it does | Time |
|-----|-------------|------|
| `bff-ci` | `mvn clean package` — compiles Java and runs tests | ~2 min |
| `app-ci` | `npm ci && npm run build` — installs and builds React | ~1 min |
| `core-ci` | Validates CSV files exist and have correct columns | ~30s |
| `compose-ci` | `docker compose config` — validates YAML syntax | ~10s |

**Why a separate CI job?** CI runs on PRs and develop branches where we never want to deploy. Separating it means the deploy workflow is only triggered when CI has already passed on main.

---

## deploy-aws.yml — AWS ECS Fargate

Triggers only on push to `main`. Requires all CI jobs to have passed (enforced by branch protection rules).

### Authentication — OIDC (no static keys)

```
GitHub Actions → requests JWT from GitHub OIDC provider
               → exchanges JWT for AWS temporary credentials (15min)
               → assumes fundflow-github-actions-role
               → pushes to ECR + updates ECS services
```

No AWS access keys are stored anywhere. The IAM role has a condition that only allows `ziuld/fundflow` repository to assume it.

### Deployment steps

```
1. Authenticate via OIDC
2. Login to ECR
3. Build BFF image (tagged with commit SHA + latest)
4. Push BFF to ECR
5. Force ECS BFF service update
6. Build React image (VITE_API_BASE_URL baked in at compile time)
7. Push React to ECR
8. Force ECS React service update
9. Wait for both services to stabilize (health checks must pass)
10. Print deployment summary
```

### Required GitHub secrets

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_ARN` | IAM role ARN for OIDC authentication |
| `AWS_ALB_URL` | ALB DNS — baked into React bundle at build time |
| `AWS_BFF_ECR_REPO` | ECR repository URI for BFF |
| `AWS_APP_ECR_REPO` | ECR repository URI for React app |

### Key difference from GCP

In GCP the BFF URL is dynamic (fetched after deploy). In AWS the ALB URL is stable and known in advance — stored as a secret. This simplifies the pipeline significantly.

---

## deploy-gcp.yml — GCP Cloud Run (disabled)

Preserved for reference. Disabled with `if: false` — remove that line to re-enable.

### Authentication — Service Account key

Uses a JSON key stored as `GCP_SA_KEY` secret. Less secure than OIDC but functional. When re-enabling, consider migrating to Workload Identity Federation (GCP's equivalent of OIDC).

### Key difference from AWS

The BFF URL is dynamic — it must be fetched after the BFF is deployed and injected into the React build. This requires the correct step ordering:

```
Build BFF → Push BFF → Deploy BFF → Get BFF URL → Build React → Push React → Deploy React
```

### Required GitHub secrets

| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | Service account JSON key |
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Gemini API key |

---

## Branch protection rules (main)

- Require pull request before merging
- Require status checks: `bff-ci`, `app-ci`, `core-ci`, `compose-ci`
- Block force pushes
- Restrict deletions

This ensures broken code can never reach main and trigger a production deployment.

---

## Adding Azure deployment (planned)

Create `.github/workflows/deploy-azure.yml` following the same pattern:

```yaml
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

Azure uses Workload Identity Federation — same OIDC concept as AWS, no static credentials.