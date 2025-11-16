#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.dev.yml}"

echo "[redeploy] Building images..."
docker compose -f "${COMPOSE_FILE}" build

echo "[redeploy] Starting services..."
docker compose -f "${COMPOSE_FILE}" up -d

echo "[redeploy] Current services:"
docker compose -f "${COMPOSE_FILE}" ps

echo "[redeploy] Checking health endpoint..."
curl -i http://localhost:3000/health || true
