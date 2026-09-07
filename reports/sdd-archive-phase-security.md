# Security Audit — sdd-archive-phase

## Modo
Feature

## Paths auditados
- `.opencode/agents/archive.md`: match trigger `.opencode/agents/**` — nuevo agente con `read:*` + `edit reports/**` + `bash:*`. ¿Permisos mínimos? ¿Bash acotado?
- `shared/AGENTS.md`: match trigger directo — ¿el orden impide marcar `done` sin acta + merge humano? ¿`scm` no ejecuta Archive?
- `init-sdd.ps1` / `init-sdd.sh`: match trigger directo — ¿solo verificación de presencia en flujo opencode/all, sin remote exec ni toques a `.claude/`/`.gemini/`?
- `.opencode/skills/archive/SKILL.md` + `references/report-format.md`: contexto (fuera de triggers) — ¿escrituras fuera de `reports/**`? ¿Read→Write prohibido respetado? ¿Colisión = STOP?
- `.opencode/AGENTS.md`: contexto (fuera de triggers) — ¿mismo orden/roles que `shared/AGENTS.md`?
- `.opencode/skills/scm/SKILL.md`: contexto (fuera de triggers) — ¿hunk del acta en el body de la PR inocuo? ¿`scm` no ejecuta Archive y exige acta antes del push/PR?
- `tests/template-hardening/archive-phase.test.mjs`: contexto (fuera de triggers) — ¿solo convención, sin exec/write/network?
- Baseline: `specs/sdd-archive-phase/requirements.md` (v2, RF-01..RF-10) + `design.md` (pregunta 5 = Opción C) + `architecture/decisions/ADR-001.md` (+ enmienda v2) + `reports/sdd-archive-phase-review.md` (APRUEBA, ronda 1).

Búsqueda estándar aplicada: inyección (N/A, sin queries), XSS (N/A, acta Markdown sin render activo), auth/autorización (gates y roles), secretos hardcodeados (ninguno), concurrencia (N/A), exfiltración/remote-exec en instaladores, writes fuera de scope, dependencias (N/A, sin nuevas).

## Hallazgos

### Críticos (requieren fix)
| # | Tipo | Archivo | Línea | Descripción | Fix sugerido |
|---|---|---|---|---|---|
| — | — | — | — | Ninguno. | — |

Detalle por punto auditado (todo PASS):

1. **`.opencode/agents/archive.md` — permisos mínimos + bash acotado en skill.** `read: "*"` necesario y declarado (RF-10/design: conciliar specs, changes, reports, ADRs, `feature_list.json`, `progress/`); es solo lectura, riesgo bajo. `edit: "reports/**"` mínimo y exacto: coincide con el único output (`reports/<feature>-archive.md`) y con las prohibiciones explícitas (línea 17: no editar `specs/` ni nada fuera de `reports/`). `bash: "*"` es amplio en el frontmatter, pero la restricción "bash exclusivamente para `diff -r`/movimiento mecánico excepcional" vive en la skill (RF-05/RF-10, § movimiento excepcional) y el test TASK-04 fija este shape (mismo patrón que el resto de agentes; límite expresivo del formato, ya observado como no bloqueante en el review). No hay `src/**` ni `tests/**` en edit. Veredicto: sin fix.
2. **`.opencode/skills/archive/SKILL.md` + `references/report-format.md` — sin writes fuera de `reports/**`, sin Read→Write, colisión = STOP.** Triple prohibición de escribir fuera de `reports/` (líneas 50, 59; agente línea 17). Movimiento excepcional solo mecánico vía shell (`mv`/`git mv`/`cp -R`, "nunca reescritura manual del modelo") + `diff -r` verbatim obligatorio ejecutado por `archive` (vacío = único pass; faltante/con diff = FAIL/BLOCKED; sin shell → BLOCKED). Colisión: STOP sin sufijos/overwrites/renombres silenciosos → BLOCKED + resolución humana. CRITICAL sin override ni reconciliación. Veredicto: sin fix.
3. **`.opencode/AGENTS.md` + `shared/AGENTS.md` — orden cerrado, sin bypass a `done`.** Ambos fijan `... Verify → Reviewer → Security (condicional) → Archive (agente archive, acta) → push/PR (scm) → merge humano → done + current.md`; `archive` no commitea/pushea/mergea ni marca `done`; `scm` no ejecuta Archive; `done` + `current.md` solo tras acta + merge humano (Leader). Sin camino documentado para marcar `done` sin acta ni sin merge humano. Veredicto: sin fix.
4. **`.opencode/skills/scm/SKILL.md` — hunk del acta inocuo.** El body de la PR solo *cita* la ruta `reports/<feature>-archive.md` (línea 117) junto a verify/review/security; no ejecuta ni interpola contenido del acta, se envía vía `--body-file` con `gh` (o MCP GitHub), sin exfiltración ni ejecución remota. Además exige acta `ARCHIVED`/`PARTIAL-INTENCIONAL` antes del push/PR (`BLOCKED` = sin PR) y declara "`scm` no ejecuta Archive" (línea 70). Veredicto: sin fix.
5. **`init-sdd.ps1` (líneas 234–247) / `init-sdd.sh` (líneas 219–220) — solo verificación local, sin remote exec.** Solo `Test-Path`/`check_file` de `agents/archive.md` + `skills/archive/SKILL.md` bajo `Provider all|opencode`; copia local (`Copy-Item`/`cp -p`, `find` con exclusiones `node_modules/package*.json/bun.lock/.gitignore`), `mkdir`, `grep -q`. Sin `Invoke-WebRequest`/`curl`/`wget`/`irm`/`iex`, sin URLs, sin toques a `.claude/`/`.gemini` (asserts negativos del test). `TargetDir` es input del operador, no superficie remota. Veredicto: sin fix.
6. **`tests/template-hardening/archive-phase.test.mjs` — solo convención.** Solo `existsSync`/`readFileSync` + `assert.match/doesNotMatch/equal`; 13 tests de presencia/contenido/ausencia (sin binario, sin Engram/MCP, sin Read→Write, sin `.claude/`/`.gemini`). Sin `child_process`, sin writes, sin network. Veredicto: sin fix.

Sin secretos, sin SQL/NoSQL/XSS, sin RLS (sin Supabase/tablas en el diff), sin dependencias nuevas, sin concurrencia.

### Riesgos estructurales (documentar, no bloquean)
| # | Tipo | Descripción | ADR emitido |
|---|---|---|---|
| 1 | Least-privilege (menor) | `bash: "*"` en `.opencode/agents/archive.md` es más amplio que el uso real (`diff -r` + `mv`/`git mv`/`cp -R` excepcional). Mitigado a nivel prompt (skill + prohibiciones + test TASK-04 que congela el shape). Endurecimiento futuro si opencode soporta allowlist de comandos en frontmatter; reevaluar si el agente llega a leer inputs no confiables más allá de specs/reports del propio repo. | Ninguno (cubierto por ADR-001 + enmienda v2; no bloquea) |

### Sin hallazgos relevantes
Se revisó el diff completo de la feature contra los 6 puntos pedidos más la búsqueda estándar. Cero hallazgos críticos. El único riesgo es estructural-menor (bash amplio mitigado) y no bloquea el cierre.

## Resultado
Sin hallazgos críticos — Archive puede avanzar (ACTA habilitada, sin vuelta a Implementer).
