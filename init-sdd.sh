#!/usr/bin/env bash
# ==============================================================================
# SDD Workflow Installer (Spec-Driven Development)
# Works on Linux, macOS, and Git Bash / WSL on Windows
# ==============================================================================

set -e

TARGET_DIR="."
PROVIDER="all"

show_help() {
    echo "Uso: ./init-sdd.sh [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -t, --target <path>     Directorio de destino (defecto: .)"
    echo "  -p, --provider <name>   Provider/Entorno a instalar: all (defecto), claude, opencode, gemini"
    echo "  -h, --help              Mostrar ayuda"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            TARGET_DIR="$2"
            shift 2
            ;;
        -p|--provider)
            PROVIDER="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "Opción desconocida: $1"
            show_help
            ;;
    esac
done

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
TARGET_DIR="$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")"

echo ""
echo "🚀 Inicializando SDD Workflow en: $TARGET_DIR"
echo "   Provider(s): $PROVIDER"

# 1. Directorios base del pipeline SDD
DIRS=(
    "architecture/decisions"
    "specs"
    "research"
    "changes"
    "progress"
    "reports"
    "scripts"
)

for dir in "${DIRS[@]}"; do
    full_path="$TARGET_DIR/$dir"
    if [ ! -d "$full_path" ]; then
        mkdir -p "$full_path"
        touch "$full_path/.gitkeep"
        echo "  [+] Carpeta creada: $dir"
    else
        echo "  [.] Carpeta existente: $dir"
    fi
done

# 2. Template current.template.md desde shared/
current_template="$TARGET_DIR/progress/current.template.md"
if [ ! -f "$current_template" ]; then
    if [ -f "$SCRIPT_DIR/shared/progress/current.template.md" ]; then
        cp "$SCRIPT_DIR/shared/progress/current.template.md" "$current_template"
        echo "  [+] Copiado progress/current.template.md"
    fi
fi

# 3. Copiar dotfolders según provider
PROVIDERS=()
if [ "$PROVIDER" = "all" ]; then
    PROVIDERS=(".claude" ".opencode" ".gemini")
else
    PROVIDERS=(".$PROVIDER")
fi

for p in "${PROVIDERS[@]}"; do
    src_path="$SCRIPT_DIR/$p"
    dst_path="$TARGET_DIR/$p"
    if [ -d "$src_path" ]; then
        mkdir -p "$dst_path"
        cp -r "$src_path/"* "$dst_path/"
        echo "  [+] Copiada configuración: $p"
    else
        echo "  [!] Plantilla no encontrada para $p en $SCRIPT_DIR"
    fi
done

# 4. Crear feature_list.json desde shared/ si no existe
feature_list="$TARGET_DIR/feature_list.json"
if [ ! -f "$feature_list" ]; then
    if [ -f "$SCRIPT_DIR/shared/feature_list.json" ]; then
        cp "$SCRIPT_DIR/shared/feature_list.json" "$feature_list"
        echo "  [+] Creado feature_list.json desde plantilla"
    fi
fi

# 5. Crear o actualizar .gitignore
gitignore="$TARGET_DIR/.gitignore"
if [ ! -f "$gitignore" ]; then
    cat << 'EOF' > "$gitignore"
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
EOF
    echo "  [+] Creado .gitignore con reglas SDD"
else
    if ! grep -q "SDD Workflow" "$gitignore"; then
        cat << 'EOF' >> "$gitignore"

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
EOF
        echo "  [+] Añadidas reglas SDD a .gitignore existente"
    else
        echo "  [.] Reglas SDD ya presentes en .gitignore"
    fi
fi

# 6. Crear AGENTS.md en la raíz desde shared/ si no existe
agents_file="$TARGET_DIR/AGENTS.md"
if [ ! -f "$agents_file" ]; then
    if [ -f "$SCRIPT_DIR/shared/AGENTS.md" ]; then
        cp "$SCRIPT_DIR/shared/AGENTS.md" "$agents_file"
        echo "  [+] Creado AGENTS.md desde plantilla"
    fi
fi

# 7. Verificación de archivos instalados
echo ""
echo "🔍 Verificando archivos de configuración instalados:"

all_ok=true

check_file() {
    local name="$1"
    local path="$2"
    if [ -f "$path" ]; then
        echo "  [✓] $name"
    else
        echo "  [❌] Faltante: $name"
        all_ok=false
    fi
}

check_file "AGENTS.md (Raíz)" "$TARGET_DIR/AGENTS.md"
check_file "feature_list.json" "$TARGET_DIR/feature_list.json"
check_file "progress/current.template.md" "$TARGET_DIR/progress/current.template.md"

if [ "$PROVIDER" = "all" ] || [ "$PROVIDER" = "claude" ]; then
    check_file ".claude/CLAUDE.md" "$TARGET_DIR/.claude/CLAUDE.md"
fi
if [ "$PROVIDER" = "all" ] || [ "$PROVIDER" = "opencode" ]; then
    check_file ".opencode/AGENTS.md" "$TARGET_DIR/.opencode/AGENTS.md"
fi
if [ "$PROVIDER" = "all" ] || [ "$PROVIDER" = "gemini" ]; then
    check_file ".gemini/GEMINI.md" "$TARGET_DIR/.gemini/GEMINI.md"
fi

echo ""
if [ "$all_ok" = true ]; then
    echo "✅ SDD Workflow instalado e inspeccionado correctamente."
else
    echo "⚠️ Instalación completada con advertencias. Revisa los archivos faltantes."
fi
echo ""
