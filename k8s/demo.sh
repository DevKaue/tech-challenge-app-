#!/usr/bin/env bash
# Demonstração da aplicação rodando no Kubernetes.
#   ./k8s/demo.sh
# Abre o port-forward, faz login e exercita os endpoints. Ctrl+C encerra tudo.
set -uo pipefail

NS=techchallenge
PORT=${PORT:-8080}
URL="http://localhost:$PORT"

cleanup() { [[ -n "${PF:-}" ]] && kill "$PF" 2>/dev/null; }
trap cleanup EXIT

echo "==> Estado no cluster"
kubectl -n "$NS" get pods,svc,hpa 2>/dev/null || { echo "namespace $NS não existe. Rode: kubectl apply -k k8s/overlays/local"; exit 1; }

echo
echo "==> Abrindo port-forward em $URL"
kubectl -n "$NS" port-forward svc/techchallenge-api "$PORT:80" >/tmp/techchallenge-pf.log 2>&1 &
PF=$!
for _ in $(seq 1 15); do curl -sf --max-time 2 "$URL/api/health" >/dev/null 2>&1 && break; sleep 1; done

echo
echo "==> Health checks (públicos)"
echo -n "    liveness  /api/health       -> "; curl -s -o /dev/null -w "HTTP %{http_code}\n" "$URL/api/health"
echo -n "    readiness /api/health/ready -> "; curl -s -o /dev/null -w "HTTP %{http_code}\n" "$URL/api/health/ready"
echo -n "    swagger   /api/docs         -> "; curl -s -o /dev/null -w "HTTP %{http_code}\n" "$URL/api/docs"

echo
echo "==> Login (usuários do seed, senha Tech@123)"
login() {
  curl -s -X POST "$URL/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"Tech@123\"}"
}
RESP=$(login "ana.santos@oficina.com")
TOKEN=$(printf '%s' "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
ROLE=$(printf '%s' "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('user',{}).get('role','?'))" 2>/dev/null)

if [[ -z "$TOKEN" ]]; then
  echo "    FALHOU. Rodou o seed? kubectl -n $NS exec deploy/techchallenge-api -- node dist/prisma/seed.js"
  exit 1
fi
echo "    ana.santos@oficina.com ($ROLE) -> token de ${#TOKEN} chars"

echo
echo "==> Endpoints autenticados"
for ep in customers vehicles services materials service-orders; do
  printf "    GET /api/%-16s -> HTTP %s\n" "$ep" \
    "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$URL/api/$ep")"
done

echo
echo "==> Controle de acesso por papel (mesma senha, papel diferente)"
TOKEN_MEC=$(login "joao.silva@oficina.com" | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
printf "    MECHANIC em /api/customers    -> HTTP %s (403 esperado: não é o papel dele)\n" \
  "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN_MEC" "$URL/api/customers")"
printf "    sem token em /api/customers   -> HTTP %s (401 esperado)\n" \
  "$(curl -s -o /dev/null -w '%{http_code}' "$URL/api/customers")"

echo
echo "==> Swagger aberto em $URL/api/docs — use 'Authorize' e cole o token:"
echo "$TOKEN"
echo
echo "port-forward ativo. Ctrl+C para encerrar."
wait $PF
