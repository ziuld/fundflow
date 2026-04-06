# FundFlow Infrastructure

Multi-cloud infrastructure definitions for the FundFlow project.

## Structure

| Folder | Cloud | Status |
|--------|-------|--------|
| aws/   | AWS ECS Fargate + ALB + WAF | Active |
| gcp/   | Google Cloud Run | Preserved, disabled |
| azure/ | Azure Container Apps | Planned |

## AWS Quick reference

Deploy all stacks in order:
1. `aws cloudformation create-stack --stack-name fundflow-vpc --template-body file://aws/vpc.yml`
2. `aws cloudformation create-stack --stack-name fundflow-security --template-body file://aws/security.yml --capabilities CAPABILITY_NAMED_IAM`
3. `aws cloudformation create-stack --stack-name fundflow-ecr --template-body file://aws/ecr.yml`
4. `aws cloudformation create-stack --stack-name fundflow-ecs --template-body file://aws/ecs.yml --capabilities CAPABILITY_NAMED_IAM`

Destroy everything (in reverse order):
1. `aws cloudformation delete-stack --stack-name fundflow-ecs`
2. `aws cloudformation delete-stack --stack-name fundflow-ecr`
3. `aws cloudformation delete-stack --stack-name fundflow-security`
4. `aws cloudformation delete-stack --stack-name fundflow-vpc`

## GCP Reference

Services deployed to Google Cloud Run (eu-west1):
- BFF: https://fundflow-bff-118201552061.europe-west1.run.app
- App: https://fundflow-app-118201552061.europe-west1.run.app

To redeploy GCP: re-enable deploy-gcp.yml and push to main.