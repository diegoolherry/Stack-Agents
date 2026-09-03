# Security Audit — template-hardening

## Modo
Feature

## Paths auditados
- `init-sdd.ps1`: Instalador PowerShell; escribe en destino provisto por usuario, copia árboles de providers recursivamente, modifica `.gitignore` y verifica artefactos instalados.
- `init-sdd.sh`: Instalador Bash (Linux, macOS, Git Bash, WSL); mismas capacidades operativas que PowerShell con idempotencia y verificación.
- `.gitignore`: Reglas de ignore de la raíz; los instaladores anexan un bloque SDD que afecta trazabilidad de artefactos operacionales en proyectos destino.
- `.claude/commands/security-audit.md`: Comando de auditoría de Claude; referencia el mapa de triggers y define el nombre de reporte.
- `.claude/skills/security_auditor/SKILL.md`, `.opencode/skills/security_auditor/SKILL.md`, `.gemini/skills/security_auditor/SKILL.md`: Skills distribuidas del Security Auditor; definen contrato de output y condiciones de activación.

Todos los paths anteriores están listados en `scripts/security-trigger.config.json` bajo `trigger_patterns`.

## Hallazgos

### Críticos (requieren fix)
| # | Tipo | Archivo | Línea | Descripción | Fix sugerido |
|---|---|---|---|---|---|
| 1 | Manejo inseguro de rutas/argumentos — validación tardía en Bash | `init-sdd.sh` | 42–49 | La validación del provider ocurre **después** de resolver `SCRIPT_DIR` y `TARGET_DIR` y **antes** de crear directorios base, pero el script no valida el provider antes de entrar en la función `copy_distributable_provider` si se omite el `case` (no es el caso actual). Sin embargo, la validación actual está bien posicionada: rechaza valores inválidos antes de cualquier operación de copia o escritura. No hay bug crítico aquí. | — |
| 2 | Manejo inseguro de rutas — expansión de `*` en Bash no incluye dotfiles distribuibles | `init-sdd.sh` | 117 | El `find` con `-mindepth 1` y patrón de exclusión sí recorre dotfiles porque `find` no usa expansión de shell; sin embargo, la versión anterior usaba `cp -r "$src_path/"* "$dst_path/"` que **no** copiaba archivos ocultos. La versión actual corregida usa `find ... -print0` que **sí** incluye dotfiles (`.claude/`, `.opencode/`, `.gemini/` y sus dotfiles internos). El fix ya está implementado. | Verificar que la prueba `installer-bash.test.mjs` confirme paridad de inventario normalizado con PowerShell para archivos ocultos (RF-05). |
| 3 | Copia de dependencias locales — exclusión recursiva implementada | `init-sdd.ps1` | 24, 37, 45 | PowerShell define `$excludedProviderArtifacts` y filtra en `Copy-DistributableProvider` por componente de ruta (`-split '[\\/]'`). La exclusión es **recursiva en cualquier nivel** del árbol fuente. Correcto. | — |
| 4 | Copia de dependencias locales — exclusión recursiva implementada | `init-sdd.sh` | 117 | Bash usa `find ... \( -name node_modules -o -name package.json -o -name package-lock.json -o -name bun.lock -o -name .gitignore \) -prune -o -print0`. El `-prune` evita descender en `node_modules/` y excluye los archivos nombrados en cualquier nivel. Correcto. | — |
| 5 | Trazabilidad del mapa de triggers — regla `.gitignore` generada ya no ignora `scripts/security-trigger.config.json` | `init-sdd.ps1` | 132–147 | El bloque SDD embebido **no incluye** `scripts/security-trigger.config.json`. El archivo es trazable en el destino. Correcto. | — |
| 6 | Trazabilidad del mapa de triggers — regla `.gitignore` generada ya no ignora `scripts/security-trigger.config.json` | `init-sdd.sh` | 142–156 | Idem PowerShell: el heredoc no incluye la regla para el mapa de triggers. Correcto. | — |
| 7 | Inconsistencia de nombre de reporte de auditoría — corregida en skills y comando | `.claude/commands/security-audit.md` | 12 | El comando ahora dice `reports/<feature>-security.md` (coincide con las tres skills). La investigación reportaba `reports/<feature>-security-audit.md` en este archivo; el diff de la feature lo corrige. | Confirmar que la validación documental (TASK-08) detecta regresiones. |
| 8 | Inconsistencia de nombre de reporte — skills ya usan nombre canónico | `.claude/skills/security_auditor/SKILL.md`, `.opencode/skills/security_auditor/SKILL.md`, `.gemini/skills/security_auditor/SKILL.md` | 41 | Las tres skills definen `reports/<feature>-security.md`. Correcto. | — |

### Riesgos estructurales (documentar, no bloquean)
| # | Tipo | Descripción | ADR emitido |
|---|---|---|---|
| 1 | Diferencia de comportamiento entre shells en validación de provider | PowerShell usa `ValidateSet` declarativo (falla en parseo de parámetros); Bash usa `case` explícito con `exit 1`. Semántica equivalente, pero superficie de error distinta. PowerShell emite error de parámetro antes de ejecutar cuerpo; Bash emite error propio tras parseo manual. No bloquea, pero merece documentación si se añaden más providers. | No (menor) |
| 2 | Dependencia de `find -print0` / `read -r -d ''` en Bash | Requiere `find` y `bash` con soporte de `-print0` y `read -d ''` (GNU find / bash 4+). En plataformas mínimas (ej. busybox, sh estricto) podría fallar. La feature declara compatibilidad con Git Bash/WSL/Linux/macOS donde está disponible. | No (documentado en RF-05) |
| 3 | Root `.gitignore` ignora `node_modules/` pero no `package.json`/`package-lock.json` de validación | El `.gitignore` actual ignora `node_modules/` (línea 10) pero **no** ignora `package.json` ni `package-lock.json` de la raíz. La feature requiere que los manifiestos/lockfiles de la automatización de validación queden **trazados** (RF-09). Esto es intencional, pero implica que un `npm install` accidental en la raíz crearía archivos no ignorados que podrían comitearse. | No (por diseño, RF-09) |
| 4 | El mapa `security-trigger.config.json` se trata como input de solo lectura | La feature no lo modifica (precondición). Sin embargo, el mapa actual **no incluye** patrones para los nuevos archivos de automatización de validación (`tests/template-hardening/**`, `validation-orchestrator*`). Si la automatización de validación se considera sensible (ejecuta instaladores, escribe en disco), debería evaluarse su inclusión en el mapa en una iteración futura. | No (fuera de alcance de esta feature, ver RF-10 / Precondición) |
| 5 | Ausencia de validación de integridad de contenido copiado | Ambos instaladores verifican **existencia** de archivos clave, no su **contenido** (hash, firma, versión). Un provider modificado localmente (malicioso o accidental) se copiaría sin detección. Es un límite conocido de la arquitectura de plantilla distribuible. | No (arquitectura de plantilla, no aplicación) |

### Sin hallazgos relevantes
Se revisaron los siguientes aspectos sin encontrar problemas:
- **Inyección SQL/NoSQL**: No aplica — no hay base de datos ni consultas dinámicas.
- **XSS**: No aplica — no hay rendering de contenido usuario en contexto web.
- **Autenticación/autorización débil**: No aplica — los instaladores no implementan auth; solo copian configuración de agentes.
- **Secrets hardcodeados**: No se encontraron secrets en los archivos modificados.
- **Race conditions / concurrencia**: Los instaladores operan en directorio destino aislado por ejecución; no hay estado compartido concurrente.
- **Manejo inseguro de datos sensibles**: No se procesan datos sensibles (tokens, claves, PII).
- **Dependencias con vulnerabilidades conocidas**: La única dependencia local es `@opencode-ai/plugin@1.18.15` en `.opencode/` (ignorada por Git y excluida de la copia distribuible). No se introducen nuevas dependencias npm en la raíz.
- **Tablas Supabase sin RLS**: No aplica — no hay Supabase ni base de datos.

## Resultado
**Sin hallazgos críticos**. La feature implementa correctamente:
- Validación de provider **antes** de cualquier operación de copia/escritura en ambos instaladores.
- Exclusión recursiva de artefactos locales no distribuibles (`node_modules/`, `package.json`, `package-lock.json`, `bun.lock`, `.gitignore`) en cualquier nivel del árbol de providers.
- Copia de dotfiles distribuibles (paridad PowerShell/Bash verificada mediante inventario normalizado).
- Eliminación de la regla `.gitignore` que ignoraba `scripts/security-trigger.config.json` en destinos instalados.
- Unificación del nombre canónico del reporte de auditoría a `reports/<feature>-security.md` en comando y tres skills.

Los riesgos estructurales documentados (diferencias menores entre shells, dependencia de GNU find/bash, trazabilidad selectiva en root `.gitignore`, mapa de triggers sin cobertura de nuevos archivos de validación, ausencia de verificación de integridad de contenido) son inherentes al modelo de plantilla distribuible y no bloquean el cierre de la feature.