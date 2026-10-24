# Đề 21: Hệ thống Quản lý Cửa hàng / POS

Triển khai bằng Docker Compose gồm: ứng dụng POS (Node.js), MySQL, phpMyAdmin,
Nginx reverse proxy (HTTPS tự ký), Prometheus, Grafana, cAdvisor, mysqld-exporter,
nginx-exporter, Loki và Promtail.

## Cách chạy
1. `cp .env.example .env` rồi điền mật khẩu mạnh cho từng biến.
2. Tạo chứng chỉ HTTPS tự ký:
   `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/certs/server.key -out nginx/certs/server.crt -subj "/C=VN/O=POS/CN=localhost"`
3. `docker compose up -d --build`
4. Tạo user cho exporter (một lần):
   `docker compose exec db mysql -uroot -p -e "CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY '<EXPORTER_PASSWORD>' WITH MAX_USER_CONNECTIONS 3; GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';"`

## Truy cập
| Dịch vụ | Địa chỉ |
|---|---|
| Website POS | https://localhost |
| phpMyAdmin | https://localhost/pma/ |
| Grafana | http://localhost:3001 |

## Kiểm tra log tập trung
`./tao-log.sh` rồi `./kiem-tra-log.sh`. Truy vấn LogQL mẫu nằm trong báo cáo.

## Hardening
Container non-root, cap_drop ALL, mạng backend internal, giới hạn RAM/PID,
filesystem chỉ đọc cho app, security headers Nginx, HTTPS, mật khẩu trong .env.
