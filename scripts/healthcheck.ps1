param(
  [string]$BaseUrl = "http://127.0.0.1:4173"
)

$ErrorActionPreference = "Stop"

$endpoints = @(
  "/",
  "/api/dashboard",
  "/api/catalog/products",
  "/api/catalog/categories",
  "/api/catalog/colors",
  "/api/catalog/materials",
  "/api/catalog/brands",
  "/api/backup"
)

$ok = $true

foreach ($endpoint in $endpoints) {
  $url = "$BaseUrl$endpoint"
  try {
    $response = Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 10
    Write-Output ("OK {0} {1} bytes={2}" -f $response.StatusCode, $endpoint, $response.Content.Length)
  } catch {
    $ok = $false
    Write-Output ("FAIL {0} {1}" -f $endpoint, $_.Exception.Message)
  }
}

if (-not $ok) {
  exit 1
}
