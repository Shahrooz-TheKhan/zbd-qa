#!/usr/bin/env bash
set -euo pipefail

APP_URL="${1:-http://localhost:18080}"

echo "1) Checking app is reachable at: $APP_URL"
curl -fsS "$APP_URL" | grep -q "ok=true"
echo "   ✅ app responded with ok=true"

echo "2) Checking Postgres is ready on localhost:5432"
docker exec -i postgres-dev pg_isready -U appuser -d payments >/dev/null
echo "   ✅ postgres is ready"

echo "✅ Smoke test passed"
