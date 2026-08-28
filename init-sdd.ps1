<#
.SYNOPSIS
    Inicializa el workflow SDD (Spec-Driven Development) en un repositorio de destino.
.DESCRIPTION
    Crea las carpetas del pipeline SDD, copia las configuraciones de agentes (.claude, .opencode, .gemini),
    copia las plantillas base (AGENTS.md, feature_list.json, current.template.md) desde shared/ y actualiza .gitignore.
.PARAMETER TargetDir
    Directorio donde se instalará el workflow (por defecto, directorio actual).
.PARAMETER Provider
    IA / CLI a configurar: 'all' (defecto), 'claude', 'opencode', 'gemini'.
.EXAMPLE
    .\init-sdd.ps1 -TargetDir "D:\MiProyecto" -Provider all
#>

param(
    [string]$TargetDir = (Get-Location).Path,
    [ValidateSet("all", "claude", "opencode", "gemini")]
    [string]$Provider = "all"
)

$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) { $ScriptRoot = (Get-Location).Path }

Write-Host "`n-- Inicializando SDD Workflow en: $TargetDir" -ForegroundColor Cyan
Write-Host "   Provider(s): $Provider" -ForegroundColor Yellow

# 1. Directorios base del pipeline SDD
$dirs = @(
    "architecture\decisions",
    "specs",
    "research",
    "changes",
    "progress",
    "reports",
    "scripts"
)

foreach ($dir in $dirs) {
    $fullPath = Join-Path $TargetDir $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        New-Item -ItemType File -Path (Join-Path $fullPath ".gitkeep") -Force | Out-Null
        Write-Host "  [+] Carpeta creada: $dir" -ForegroundColor Green
    } else {
        Write-Host "  [.] Carpeta existente: $dir" -ForegroundColor DarkGray
    }
}

# 2. Template current.template.md desde shared/
$progressDir = Join-Path $TargetDir "progress"
$currentTemplateDst = Join-Path $progressDir "current.template.md"
if (-not (Test-Path $currentTemplateDst)) {
    $currentTemplateSrc = Join-Path $ScriptRoot "shared\progress\current.template.md"
    if (Test-Path $currentTemplateSrc) {
        Copy-Item -Path $currentTemplateSrc -Destination $currentTemplateDst -Force
        Write-Host "  [+] Copiado progress/current.template.md" -ForegroundColor Green
    }
}

# 3. Copiar dotfolders según provider
$providersToInstall = @()
if ($Provider -eq "all") {
    $providersToInstall = @(".claude", ".opencode", ".gemini")
} else {
    $providersToInstall = @(".$Provider")
}

foreach ($p in $providersToInstall) {
    $srcPath = Join-Path $ScriptRoot $p
    $dstPath = Join-Path $TargetDir $p

    if (Test-Path $srcPath) {
        if (-not (Test-Path $dstPath)) {
            New-Item -ItemType Directory -Path $dstPath -Force | Out-Null
        }
        Copy-Item -Path "$srcPath\*" -Destination $dstPath -Recurse -Force
        Write-Host "  [+] Copiada configuracion: $p" -ForegroundColor Green
    } else {
        Write-Host "  [!] Plantilla no encontrada para $p en $ScriptRoot" -ForegroundColor Yellow
    }
}

# 4. Crear feature_list.json desde shared/ si no existe
$featureListDst = Join-Path $TargetDir "feature_list.json"
if (-not (Test-Path $featureListDst)) {
    $featureListSrc = Join-Path $ScriptRoot "shared\feature_list.json"
    if (Test-Path $featureListSrc) {
        Copy-Item -Path $featureListSrc -Destination $featureListDst -Force
        Write-Host "  [+] Creado feature_list.json desde plantilla" -ForegroundColor Green
    }
}

# 5. Crear o actualizar .gitignore
$gitignorePath = Join-Path $TargetDir ".gitignore"
$gitignoreRules = @'

# ==============================================
# SDD Workflow — archivos de agentes (no se suben)
# ==============================================
AGENTS.md
feature_list.json
architecture.md
architecture/
specs/
research/
changes/
progress/
reports/
scripts/crap.config.*
scripts/stryker.conf.json
scripts/structure.config.*
scripts/security-trigger.config.json
'@

if (-not (Test-Path $gitignorePath)) {
    Set-Content -Path $gitignorePath -Value $gitignoreRules.TrimStart() -Encoding utf8
    Write-Host "  [+] Creado .gitignore con reglas SDD" -ForegroundColor Green
} else {
    $existing = Get-Content -Path $gitignorePath -Raw
    if ($existing -notmatch "SDD Workflow") {
        Add-Content -Path $gitignorePath -Value $gitignoreRules -Encoding utf8
        Write-Host "  [+] Anadidas reglas SDD a .gitignore existente" -ForegroundColor Green
    } else {
        Write-Host "  [.] Reglas SDD ya presentes en .gitignore" -ForegroundColor DarkGray
    }
}

# 6. Crear AGENTS.md en la raíz desde shared/ si no existe
$agentsDst = Join-Path $TargetDir "AGENTS.md"
if (-not (Test-Path $agentsDst)) {
    $agentsSrc = Join-Path $ScriptRoot "shared\AGENTS.md"
    if (Test-Path $agentsSrc) {
        Copy-Item -Path $agentsSrc -Destination $agentsDst -Force
        Write-Host "  [+] Creado AGENTS.md desde plantilla" -ForegroundColor Green
    }
}

# 7. Verificación de archivos clave instalados
Write-Host "`n-- Verificando archivos de configuracion instalados:" -ForegroundColor Cyan

$allOk = $true

$checkAGENTS = Join-Path $TargetDir "AGENTS.md"
$checkFeatures = Join-Path $TargetDir "feature_list.json"
$checkProgress = Join-Path $TargetDir "progress\current.template.md"

if (Test-Path $checkAGENTS) {
    Write-Host "  [OK] AGENTS.md (Raiz)" -ForegroundColor Green
} else {
    Write-Host "  [X] Faltante: AGENTS.md (Raiz)" -ForegroundColor Red
    $allOk = $false
}

if (Test-Path $checkFeatures) {
    Write-Host "  [OK] feature_list.json" -ForegroundColor Green
} else {
    Write-Host "  [X] Faltante: feature_list.json" -ForegroundColor Red
    $allOk = $false
}

if (Test-Path $checkProgress) {
    Write-Host "  [OK] progress/current.template.md" -ForegroundColor Green
} else {
    Write-Host "  [X] Faltante: progress/current.template.md" -ForegroundColor Red
    $allOk = $false
}

if ($Provider -eq "all" -or $Provider -eq "claude") {
    $checkClaude = Join-Path $TargetDir ".claude\CLAUDE.md"
    if (Test-Path $checkClaude) {
        Write-Host "  [OK] .claude/CLAUDE.md" -ForegroundColor Green
    } else {
        Write-Host "  [X] Faltante: .claude/CLAUDE.md" -ForegroundColor Red
        $allOk = $false
    }
}

if ($Provider -eq "all" -or $Provider -eq "opencode") {
    $checkOpenCode = Join-Path $TargetDir ".opencode\AGENTS.md"
    if (Test-Path $checkOpenCode) {
        Write-Host "  [OK] .opencode/AGENTS.md" -ForegroundColor Green
    } else {
        Write-Host "  [X] Faltante: .opencode/AGENTS.md" -ForegroundColor Red
        $allOk = $false
    }
}

if ($Provider -eq "all" -or $Provider -eq "gemini") {
    $checkGemini = Join-Path $TargetDir ".gemini\GEMINI.md"
    if (Test-Path $checkGemini) {
        Write-Host "  [OK] .gemini/GEMINI.md" -ForegroundColor Green
    } else {
        Write-Host "  [X] Faltante: .gemini/GEMINI.md" -ForegroundColor Red
        $allOk = $false
    }
}

if ($allOk) {
    Write-Host "`n[SUCCESS] SDD Workflow instalado e inspeccionado correctamente.`n" -ForegroundColor Cyan
} else {
    Write-Host "`n[WARNING] Instalacion completada con advertencias. Revisa los archivos faltantes.`n" -ForegroundColor Yellow
}
