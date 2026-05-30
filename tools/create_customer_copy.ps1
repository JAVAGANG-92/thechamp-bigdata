param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [Parameter(Mandatory = $true)]
  [string]$TargetPath,

  [Parameter(Mandatory = $true)]
  [string]$BrandName,

  [string]$ProductName = "",
  [string]$DefaultBrand = "",
  [string]$LogoUrl = "/assets/THE_CHAMP_logo_200x200.svg",
  [string]$StoragePrefix = "",
  [string]$Port = "4173",
  [Parameter(Mandatory = $true)]
  [string]$DataRoot,
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$AdminEmail,
  [Parameter(Mandatory = $true)]
  [string]$AdminPassword
)

$ErrorActionPreference = "Stop"

function Convert-ToSafePrefix([string]$Value) {
  $safe = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', ''
  if ([string]::IsNullOrWhiteSpace($safe)) { return "customer" }
  return $safe
}

$source = (Resolve-Path -LiteralPath $SourcePath).Path
$targetParent = Split-Path -Parent $TargetPath

if (-not (Test-Path -LiteralPath $targetParent)) {
  New-Item -ItemType Directory -Path $targetParent | Out-Null
}

if (Test-Path -LiteralPath $TargetPath) {
  throw "Target path already exists: $TargetPath"
}

if ([string]::IsNullOrWhiteSpace($ProductName)) {
  $ProductName = "$BrandName BigData"
}

if ([string]::IsNullOrWhiteSpace($DefaultBrand)) {
  $DefaultBrand = $BrandName
}

if ([string]::IsNullOrWhiteSpace($StoragePrefix)) {
  $StoragePrefix = Convert-ToSafePrefix $BrandName
}

$excludeDirs = @('.git', 'node_modules', '.test-runtime')
$excludeFiles = @('.env')

New-Item -ItemType Directory -Path $TargetPath | Out-Null

Get-ChildItem -LiteralPath $source -Force | ForEach-Object {
  if ($excludeDirs -contains $_.Name -or $excludeFiles -contains $_.Name) { return }
  Copy-Item -LiteralPath $_.FullName -Destination $TargetPath -Recurse -Force
}

New-Item -ItemType Directory -Path $DataRoot -Force | Out-Null

$envContent = @"
APP_BRAND_NAME=$BrandName
APP_PRODUCT_NAME=$ProductName
APP_DEFAULT_BRAND=$DefaultBrand
APP_LOGO_URL=$LogoUrl
APP_STORAGE_PREFIX=$StoragePrefix
APP_PORT=$Port
APP_DATA_ROOT=$DataRoot
DATABASE_URL=$DatabaseUrl
PUBLIC_BASE_URL=http://localhost:$Port
APP_ADMIN_EMAIL=$AdminEmail
APP_ADMIN_PASSWORD=$AdminPassword
"@

Set-Content -LiteralPath (Join-Path $TargetPath ".env") -Value $envContent -Encoding UTF8

Write-Host "Customer copy created:"
Write-Host "  Code: $TargetPath"
Write-Host "  Data: $DataRoot"
Write-Host "  Brand: $BrandName"
Write-Host "  URL: http://localhost:$Port"
