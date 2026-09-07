# Security Audit — sdd-propose-phase

## Modo
Feature

## Paths auditados
- `shared/AGENTS.md`: trigger directo (`shared/AGENTS.md` en `scripts/security-trigger.config.json`). Hunk verificado: fila `propose` + paso 2 `[Propose + gate liviano]` con obligatoriedad Full / exención Quick y retorno a Researcher ante rechazo/`blocked`.
- `.opencode/agents/propose.md` (nuevo, untracked): bajo trigger `.opencode/agents/**`. Front matter `read:*` + `edit: research/**` + `bash:*`.
- `.opencode/skills/propose/SKILL.md` (nuevo, untracked): skill normativa de la fase (template, regla `blocked`, contrato Capabilities). No está bajo un trigger literal de `security-trigger.config.json`, pero se audita por ser la superficie ejecutable real del agente.
- `.opencode/AGENTS.md`: cambios de orquestación (fila `propose`, Full con `[Propose + gate liviano]`, Quick exento, sección Fase Propose). No es trigger literal, auditado por debilitamiento potencial del gate humano.

## Hallazgos

### Críticos (requieren fix)
| # | Tipo | Archivo | Línea | Descripción | Fix sugerido |
|---|---|---|---|---|---|
| — | — | — | — | Sin hallazgos críticos | — |

### Riesgos estructurales (documentar, no bloquean)
| # | Tipo | Descripción | ADR emitido |
|---|---|---|---|
| — | — | Sin riesgos estructurales nuevos | — |

### Sin hallazgos relevantes
Se revisó el diff completo atribuible a la feature (hunks de `.opencode/AGENTS.md` y `shared/AGENTS.md` + archivos nuevos `propose.md` / `SKILL.md`) buscando:

1. **Mínimo privilegio (`propose.md`)**: `read:*` + `edit: research/**` + `bash:*` es idéntico byte-por-byte al patrón `researcher.md` (verificado en disco). No hay escalación: `edit` limitado a `research/**`; `specs/**` y `architecture/decisions/**` quedan reservados al Spec Author. `bash:*` es amplitud preexistente de la convención de agentes de lectura (researcher la tiene), no un permiso nuevo introducido por esta feature; el cuerpo del agente además prohíbe explícitamente escribir fuera de `research/**`, escribir código, emitir ADRs y re-explorar.
2. **Escritura fuera de `research/**` / ejecución arbitraria / exfiltración / bypass de gates (`SKILL.md`)**: sin instrucciones de escritura fuera de `research/<feature>/proposal.md` (ubicación canónica única, prohíbe `specs/<feature>/proposal.md` y layouts rivales, líneas 89); regla `blocked` (líneas 78-81) prohíbe escribir ante findings ausente/ambiguo y prohíbe sobrescribir una aprobada con `blocked`; SKILL declara explícitamente "Sin binarios, sin MCP obligatorio, sin red en runtime. Sin modos de persistencia externos" (línea 93) y "NO emitir ADRs". Grep de `secret|password|token|api_key|\.env|ssh|credential|exfil|fetch|curl|wget|http|mcp|bypass|auto-aprob|sin aprobaci` sobre agente + skill: cero coincidencias.
3. **Debilitamiento del gate humano (`AGENTS.md` / `shared/AGENTS.md`)**: lo contrario — la feature AÑADE un gate humano bloqueante pre-spec (G1) previo al gate de baseline existente (G2), sin opt-out intra-Full; rechazo/`blocked` retorna a Researcher sin tocar `specs/`. Quick queda explícitamente exento (no produce ni exige `proposal.md`). El Leader no auto-aprueba. Sin auto-avance a specs sin aprobación.
4. **Secrets / `.env` / `~/.ssh` / credenciales / red / MCP / binarios**: `git status` no muestra `.env`, secretos ni binarios; el diff toca solo Markdown de orquestación (más cambios ajenos preexistentes: hunk worktrees en `implementer/SKILL.md` y entradas `fix-12/sdd-verify-phase/sdd-archive-phase/sdd-onboard-flow` en `feature_list.json`, no atribuibles a propose). Sin imports de red, sin MCP, sin ejecutables, sin toques a `.claude/`/`.gemini/`.
5. **Categorías OWASP clásicas (SQLi/NoSQLi, XSS, auth débil, RLS Supabase, race conditions, dependencias)**: no aplicables — el diff es solo orquestación en Markdown, sin código ejecutable, sin queries, sin UI, sin auth, sin tablas ni dependencias runtime.

Nota: la amplitud `bash:*` heredada de la convención researcher/propose podría endurecerse a futuro (p. ej. `bash: research/**` o denylist), pero es convención preexistente de la plataforma, no riesgo introducido por esta feature; no se emite ADR.

## Resultado
Sin hallazgos
