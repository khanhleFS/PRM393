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
# Exercise lazy schema generation before checking APIs: static liveness/HTML alone
# missed Metaspace exhaustion while Springdoc was loading its additional classes.
curl --fail --silent --show-error --max-time 60 http://127.0.0.1:8080/v3/api-docs |
  python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["openapi"].startswith("3."); assert "/api/orders" in d["paths"]; print("OpenAPI schema OK:", len(d["paths"]), "paths")'
curl --fail --silent --show-error --max-time 15 http://127.0.0.1:8080/api/app/config |
  python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["code"]==200; assert "downloadUrl" in d["result"]; print("App configuration JSON OK")'
curl --fail --silent --show-error --max-time 15 'http://127.0.0.1:8080/api/novels?size=1' |
  python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["code"]==200; assert isinstance(d["result"]["content"],list); print("Library SQL read OK:",d["result"]["totalElements"],"novels")'
code=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 5 http://127.0.0.1:8080/api/coin-packages)
printf 'Protected coin packages endpoint without login: HTTP %s\n' "$code"
test "$code" = 401
sudo docker stats --no-stream --format '{{.Name}} {{.MemUsage}}'
