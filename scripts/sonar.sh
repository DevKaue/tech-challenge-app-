#!/bin/bash
set -o pipefail

echo "=== SonarQube Analysis (tests in container, scanner via sidecar) ==="

PROJECT_KEY="tech-challenge-oficina"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Detectar se está dentro do container
if [ -f /.dockerenv ] || getent hosts sonarqube >/dev/null 2>&1; then
  IN_CONTAINER=true
  SONAR_URL="http://sonarqube:9000"
  APP_DIR="$ROOT_DIR"
else
  IN_CONTAINER=false
  SONAR_URL="http://localhost:9000"
  APP_DIR="$ROOT_DIR"
fi

# 1. Verificar SonarQube
echo "[1/3] Waiting for SonarQube at $SONAR_URL..."
echo -n "  Checking connection"
CONNECTION_SUCCESS=false
for i in $(seq 1 60); do
  RESPONSE=$(curl -s "$SONAR_URL/api/system/status" 2>&1 || echo "")
  if echo "$RESPONSE" | grep -q '"status":"UP"'; then
    echo " UP"
    CONNECTION_SUCCESS=true
    break
  fi
  echo -n "."
  sleep 5
done

if [ "$CONNECTION_SUCCESS" = false ]; then
  echo ""
  echo "ERROR: SonarQube not available at $SONAR_URL"
  exit 1
fi
echo "  Connected!"

# 2. Gerar cobertura e mesclar
echo "[2/3] Running tests with coverage..."

cd "$APP_DIR"

# Limpar coverage anterior
rm -rf coverage coverage-integration coverage-e2e combined-coverage 2>/dev/null


# Executar a suíte de testes com cobertura unificada
echo "  Running npm run test:all:cov..."
npm run test:all:cov || echo "  [WARN] Some tests had failures, continuing..."

echo "  Coverage ready at combined-coverage/lcov.info"

# 3. Rodar scanner
echo "[3/3] Running SonarQube scanner..."

if [ "$IN_CONTAINER" = true ]; then
  echo "  Inside container — no JRE available."
  echo "  Coverage is at: $APP_DIR/combined-coverage/lcov.info"
  echo ""
  echo "  Run the scanner from the HOST:"
  echo "    sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=\$SONAR_TOKEN"
else
  echo "  On host — running scanner..."
  cd "$ROOT_DIR"
  if [ -z "${SONAR_TOKEN:-}" ]; then
    echo "  ERRO: defina SONAR_TOKEN (ex.: export SONAR_TOKEN=... ou coloque no .env)"
    exit 1
  fi
  sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token="$SONAR_TOKEN"
fi

echo ""
echo "=== Done ==="
echo "Dashboard: $SONAR_URL/dashboard?id=$PROJECT_KEY"
