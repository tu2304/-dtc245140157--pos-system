#!/usr/bin/env bash
cd "$(dirname "$0")"
URL=https://localhost
H='Content-Type: application/json'
for i in $(seq 1 10); do curl -sk $URL/api/products > /dev/null; done
curl -sk -X POST $URL/api/products -H "$H" -d '{"name":"Banh quy","price":12000,"stock":30}' > /dev/null
curl -sk -X POST $URL/api/invoices -H "$H" -d '{"product_id":1,"qty":2}' > /dev/null
curl -sk -X POST $URL/api/invoices -H "$H" -d '{"product_id":1,"qty":99999}' > /dev/null
for i in 1 2 3; do curl -sk $URL/khong-ton-tai > /dev/null; done
docker compose exec -T app sh -c 'echo "ERROR gia lap tu tao-log.sh" > /proc/1/fd/1' || true
echo "Xong. Doi khoang 15 giay roi vao Grafana -> Explore -> Loki."
