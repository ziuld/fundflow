#!/usr/bin/env sh
set -eu

WORKFLOW_ID="254786445"
REF="${REF:-ci-cloudbuild-test}"

echo "[INFO] Triggering GitHub workflow..."

curl -sS --fail-with-body \
  -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/ziuld/fundflow/actions/workflows/${WORKFLOW_ID}/dispatches" \
  --data "{\"ref\":\"${REF}\",\"inputs\":{\"source\":\"cloudbuild\",\"commit\":\"${COMMIT_SHA:-none}\"}}"

echo "[OK] Workflow triggered successfully"