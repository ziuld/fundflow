#!/usr/bin/env sh
set -eu

APP_ID="3469466"
INSTALLATION_ID="126230316"

WORKFLOW_ID="254786445"
REF="${REF:-ci-cloudbuild-test}"

echo "[INFO] Generating GitHub App JWT..."

NOW=$(date +%s)
EXP=$((NOW + 540))

b64() {
  openssl base64 -A | tr '+/' '-_' | tr -d '='
}

HEADER=$(printf '{"alg":"RS256","typ":"JWT"}' | b64)
PAYLOAD=$(printf '{"iat":%s,"exp":%s,"iss":"%s"}' "$NOW" "$EXP" "$APP_ID" | b64)

SIGNATURE=$(printf "%s.%s" "$HEADER" "$PAYLOAD" | \
  openssl dgst -sha256 -sign /workspace/private-key.pem | b64)

JWT="$HEADER.$PAYLOAD.$SIGNATURE"

echo "[INFO] Requesting installation token..."

TOKEN=$(curl -sS \
  -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/app/installations/$INSTALLATION_ID/access_tokens \
  | jq -r .token)

echo "[INFO] Triggering workflow..."

curl -sS --fail-with-body \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/ziuld/fundflow/actions/workflows/$WORKFLOW_ID/dispatches \
  --data "{\"ref\":\"$REF\"}"

echo "[OK] Workflow triggered"