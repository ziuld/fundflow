# Azure Deployment Proposal — Container Apps

## Target architecture

```
Internet
  └── Azure Front Door (CDN + WAF + SSL)
        └── Azure Container Apps Environment (eu-west)
              ├── fundflow-bff  (Java container, private ingress)
              └── fundflow-app  (nginx container, public ingress)
                        ↓
                  Azure Key Vault (secrets)
                  MongoDB Atlas (external, unchanged)
                  Gemini API (external, unchanged)
```

---

## Why Azure Container Apps over AKS

AKS (Kubernetes) would take a week to configure properly. Azure Container Apps is the Azure equivalent of AWS ECS Fargate or GCP Cloud Run — serverless containers, no cluster management, scales to zero. Perfect for a 2-day trial.

---

## Resources to create

| Resource | Purpose | Cost/day |
|----------|---------|----------|
| Resource Group | Logical container for all resources | Free |
| Azure Container Registry (ACR) | Private Docker image registry | ~$0.10 |
| Container Apps Environment | Shared networking for containers | ~$0.50 |
| Container App — fundflow-bff | Java Spring Boot service | ~$1.50 |
| Container App — fundflow-app | React nginx service | ~$0.50 |
| Azure Key Vault | Secrets storage (MongoDB URI, Gemini key) | ~$0.01 |
| Log Analytics Workspace | Container logs | ~$0.50 |
| **Total** | | **~$3/day → ~$6 for 2 days** |

No load balancer needed — Azure Container Apps includes built-in ingress. No VPC/NAT Gateway costs.

---

## GitHub Actions pipeline — deploy-azure.yml

```yaml
name: Deploy — Azure Container Apps

on:
  push:
    branches: [ main ]

env:
  AZURE_RESOURCE_GROUP: fundflow-rg
  AZURE_LOCATION: westeurope
  ACR_NAME: fundflowacr
  CONTAINER_APP_ENV: fundflow-env

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      # OIDC authentication — same concept as AWS, no static credentials
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Login to ACR
        run: az acr login --name ${{ env.ACR_NAME }}

      - name: Build and push BFF
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/fundflow-bff:${{ github.sha }} ./fundflow-bff
          docker push ${{ env.ACR_NAME }}.azurecr.io/fundflow-bff:${{ github.sha }}

      - name: Deploy BFF to Container Apps
        run: |
          az containerapp update \
            --name fundflow-bff \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/fundflow-bff:${{ github.sha }}

      - name: Get BFF URL
        id: bff-url
        run: |
          BFF_URL=$(az containerapp show \
            --name fundflow-bff \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --query properties.configuration.ingress.fqdn -o tsv)
          echo "url=https://$BFF_URL" >> $GITHUB_OUTPUT

      - name: Build and push React app
        run: |
          docker build \
            --build-arg VITE_API_BASE_URL=${{ steps.bff-url.outputs.url }} \
            -t ${{ env.ACR_NAME }}.azurecr.io/fundflow-app:${{ github.sha }} \
            ./fundflow-app
          docker push ${{ env.ACR_NAME }}.azurecr.io/fundflow-app:${{ github.sha }}

      - name: Deploy React app to Container Apps
        run: |
          az containerapp update \
            --name fundflow-app \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/fundflow-app:${{ github.sha }}
```

---

## Infrastructure setup (one time, ~30 minutes)

```bash
# Login
az login

# Create resource group
az group create --name fundflow-rg --location westeurope

# Create container registry
az acr create --name fundflowacr --resource-group fundflow-rg --sku Basic

# Create Key Vault
az keyvault create --name fundflow-kv --resource-group fundflow-rg --location westeurope

# Store secrets
az keyvault secret set --vault-name fundflow-kv --name mongodb-uri --value "YOUR_MONGODB_URI"
az keyvault secret set --vault-name fundflow-kv --name gemini-api-key --value "YOUR_GEMINI_KEY"

# Create Container Apps environment
az containerapp env create \
  --name fundflow-env \
  --resource-group fundflow-rg \
  --location westeurope

# Deploy BFF
az containerapp create \
  --name fundflow-bff \
  --resource-group fundflow-rg \
  --environment fundflow-env \
  --image fundflowacr.azurecr.io/fundflow-bff:latest \
  --target-port 8080 \
  --ingress internal \
  --min-replicas 0 \
  --max-replicas 2 \
  --secrets \
    mongodb-uri=keyvaultref:https://fundflow-kv.vault.azure.net/secrets/mongodb-uri \
    gemini-key=keyvaultref:https://fundflow-kv.vault.azure.net/secrets/gemini-api-key \
  --env-vars \
    SPRING_DATA_MONGODB_URI=secretref:mongodb-uri \
    GEMINI_API_KEY=secretref:gemini-key

# Deploy React app
az containerapp create \
  --name fundflow-app \
  --resource-group fundflow-rg \
  --environment fundflow-env \
  --image fundflowacr.azurecr.io/fundflow-app:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 2
```

---

## GitHub secrets required

| Secret | How to get it |
|--------|--------------|
| `AZURE_CLIENT_ID` | App registration client ID (Workload Identity) |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

---

## Destroy everything after 2 days

```bash
# One command deletes everything
az group delete --name fundflow-rg --yes --no-wait
```

---

## Comparison — AWS vs GCP vs Azure

| Feature | AWS ECS | GCP Cloud Run | Azure Container Apps |
|---------|---------|--------------|---------------------|
| Auth | OIDC role | Service account | Workload Identity |
| Registry | ECR | Artifact Registry | ACR |
| Secrets | Secrets Manager | — (env vars) | Key Vault |
| Networking | VPC + ALB (~$48/mo) | Included | Included |
| Scale to zero | Yes | Yes | Yes |
| Cost/month (minimal) | ~$60 | ~€0 | ~$15 |
| Best for | Banking/enterprise | Quick deploys | Microsoft ecosystem |

Azure Container Apps is the most cost-effective option after GCP Cloud Run. The Key Vault integration is the most mature secrets management of the three.