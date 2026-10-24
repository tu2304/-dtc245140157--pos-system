#!/usr/bin/env bash
cd "$(dirname "$0")"
lq() { docker compose exec -T prometheus wget -qO- "http://loki:3100/$1" 2>/dev/null || true; }

echo "=== 1. Loki tra loi truy van ==="
lq 'loki/api/v1/labels' | grep -q '"status":"success"' \
  && echo "  (DUNG)" || echo "  (SAI - xem: docker compose logs loki)"

echo "=== 2. Cac dich vu da co log ==="
dv=$(lq 'loki/api/v1/label/service/values' | grep -o '"[a-z0-9-]\+"' | tr -d '"' | grep -vx 'status\|success\|data' | sort -u)
echo "$dv" | sed 's/^/  - /'
[ "$(echo "$dv" | grep -c .)" -ge 4 ] \
  && echo "  (DUNG)" || echo "  (SAI - xem: docker compose logs promtail)"

echo "=== 3. Prometheus: so target UP ==="
n=$(docker compose exec -T prometheus wget -qO- 'http://localhost:9090/api/v1/targets?state=active' 2>/dev/null | grep -o '"health":"up"' | wc -l)
echo "  UP: $n / 5"
[ "$n" -ge 5 ] && echo "  (DUNG)" || echo "  (SAI)"
