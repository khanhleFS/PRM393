#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
sudo docker compose exec -T redis sh -c 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli ping'
sudo docker compose exec -T db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -d luminovels \
  -Q 'SET NOCOUNT ON; SELECT COUNT(*) AS TableCount FROM sys.tables; SELECT COUNT(*) AS PackageCount FROM coin_packages;'
ready=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --max-time 2 http://127.0.0.1:8080/api/app/health; then
    printf '\n'
    ready=true
    break
  fi
  sleep 1
done
test "$ready" = true
code=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 5 http://127.0.0.1:8080/api/coin-packages)
printf 'Protected coin packages endpoint without login: HTTP %s\n' "$code"
test "$code" = 401
sudo docker stats --no-stream --format '{{.Name}} {{.MemUsage}}'
