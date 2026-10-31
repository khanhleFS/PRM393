param(
    [ValidatePattern('^[A-Za-z0-9.-]+$')]
    [string]$PublicHost = 'luminovels-prm393-demo.japaneast.cloudapp.azure.com',
    [string]$FlutterPath
)
$ErrorActionPreference = 'Stop'
if (-not $FlutterPath) {
    $taskSdk = Join-Path $env:TEMP 'prm393-flutter-3.47.9/bin/flutter.bat'
    $FlutterPath = if (Test-Path -LiteralPath $taskSdk) { $taskSdk } else { (Get-Command flutter -ErrorAction Stop).Source }
}
$frontendPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../Frontend'))
Push-Location -LiteralPath $frontendPath
try {
    # Windows cross-drive Kotlin cache failure: Pub cache is on C:, project is on E:.
    & $FlutterPath build apk --release --no-pub `
        --android-project-arg=kotlin.incremental=false `
        --android-project-arg=kotlin.compiler.execution.strategy=in-process `
        "--dart-define=API_BASE_URL=https://$PublicHost/api"
    if ($LASTEXITCODE -ne 0) { throw 'Android APK build failed.' }
    Write-Output (Join-Path $frontendPath 'build/app/outputs/flutter-apk/app-release.apk')
} finally {
    Pop-Location
}
