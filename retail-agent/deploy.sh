#!/usr/bin/env bash
# deploy.sh — Build, push, and deploy the retail-agent to Microsoft Foundry
set -euo pipefail

# Change to the script's directory so relative paths work
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# Load env vars
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Validate required vars
: "${ACR_NAME:?Set ACR_NAME in .env}"
: "${FOUNDRY_PROJECT_ENDPOINT:?Set FOUNDRY_PROJECT_ENDPOINT in .env}"
: "${AZURE_RESOURCE_GROUP:?Set AZURE_RESOURCE_GROUP in .env}"
: "${AZURE_SUBSCRIPTION_ID:?Set AZURE_SUBSCRIPTION_ID in .env}"

AGENT_NAME="retail-agent"
IMAGE_REPO="retail-agent"
IMAGE_TAG=$(date +%Y%m%d%H%M)
FULL_IMAGE="${ACR_NAME}.azurecr.io/${IMAGE_REPO}:${IMAGE_TAG}"

echo "==> Checking / creating ACR: ${ACR_NAME}"
az acr show --name "${ACR_NAME}" --resource-group "${AZURE_RESOURCE_GROUP}" &>/dev/null || \
  az acr create \
    --name "${ACR_NAME}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --sku Basic \
    --subscription "${AZURE_SUBSCRIPTION_ID}"

echo "==> Building and pushing image: ${FULL_IMAGE}"
az acr build \
  --registry "${ACR_NAME}" \
  --image "${IMAGE_REPO}:${IMAGE_TAG}" \
  --platform linux/amd64 \
  --file Dockerfile .

echo "==> Image pushed: ${FULL_IMAGE}"
echo ""
echo "Next steps:"
echo "  1. Grant your Foundry project managed identity the 'Container Registry Repository Reader' role on the ACR."
echo "  2. In Microsoft Foundry portal, create a hosted agent with:"
echo "       Image:  ${FULL_IMAGE}"
echo "       Protocol: responses / a2a"
echo "       Env vars: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"
echo "  3. Start the container from the Foundry portal or run:"
echo "       az ai agent container start --project-endpoint \"\${FOUNDRY_PROJECT_ENDPOINT}\" --agent-name ${AGENT_NAME}"
