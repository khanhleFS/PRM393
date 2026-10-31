$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -match '^[^#].*=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        $key = $parts[0].Trim()
        $val = $parts[1].Trim()
        [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
    }
}
$env:REDIS_HOST = "localhost"
$env:DB_HOST = "localhost"

Write-Host "[BACKEND] Environment loaded from .env. Starting Spring Boot..." -ForegroundColor Green
mvn spring-boot:run
