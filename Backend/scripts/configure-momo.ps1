[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [string]$BackendPublicUrl,
    [string]$RedirectUrl,
    [string]$EnvPath = (Join-Path $PSScriptRoot '../.env')
)

$ErrorActionPreference = 'Stop'

function Get-PublicHttpsUrl([string]$Value) {
    $uri = $null
    if (-not [Uri]::TryCreate($Value, [UriKind]::Absolute, [ref]$uri) -or
        $uri.Scheme -ne 'https' -or -not $uri.Host -or $uri.IsLoopback -or
        $uri.UserInfo -or $uri.Query -or $uri.Fragment) {
        throw 'Use a real public HTTPS URL without credentials, a query, or a fragment.'
    }
    return $uri.AbsoluteUri.TrimEnd('/')
}

$backend = Get-PublicHttpsUrl $BackendPublicUrl
if (-not $RedirectUrl) { $RedirectUrl = "$backend/payment-result.html" }
$redirect = Get-PublicHttpsUrl $RedirectUrl
$resolvedEnv = (Resolve-Path -LiteralPath $EnvPath).Path
$content = [IO.File]::ReadAllText($resolvedEnv)
$settings = [ordered]@{
    DEV_MOMO_REDIRECT_URL = $redirect
    DEV_MOMO_IPN_URL = "$backend/api/orders/momo/callback"
    DEV_MOMO_MOBILE_REDIRECT_URL = ''
}
foreach ($key in $settings.Keys) {
    $pattern = '(?m)^' + [regex]::Escape($key) + '=[^\r\n]*'
    $replacement = "$key=$($settings[$key])"
    if ([regex]::IsMatch($content, $pattern)) {
        $content = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $replacement })
    } else {
        $content = $content.TrimEnd() + "`n$replacement`n"
    }
}
if ($PSCmdlet.ShouldProcess($resolvedEnv, 'Update only MoMo redirect/IPN settings')) {
    [IO.File]::WriteAllText($resolvedEnv, $content, [Text.UTF8Encoding]::new($false))
    Write-Output "Redirect: $redirect"
    Write-Output "IPN: $backend/api/orders/momo/callback"
    Write-Output 'Reload environment variables and restart the backend. No payment request has been sent.'
}
