# Security Audit — sdd-verify-phase

## Modo
Feature

## Paths auditados
- `.opencode/agents/verify.md` (nuevo, untracked): trigger `.opencode/agents/**` — permisos mínimo privilegio, sin edición de código.
- `shared/AGENTS.md` (modificado): trigger directo — ¿debilita gates? ¿auto-avance?
- `.opencode/AGENTS.md` (modificado, no listado en trigger pero revisado por acoplamiento): ¿debilita gates?
- `.opencode/skills/verify/SKILL.md` + `references/report-format.md` (nuevos, untracked): ¿escrituras fuera de `reports/**`? ¿ejecución arbitraria? ¿bypass de gates? ¿exfiltración?
- `init-sdd.ps1` / `init-sdd.sh` (modificados): triggers directos — ¿remote exec? ¿copias peligrosas? (alcance: solo hunks verify; la copia recursiva preexiste).
- `.opencode/skills/scm/SKILL.md` (+1 línea cita reporte): cambio mínimo, ¿inocuo?
- `tests/template-hardening/verify-phase.test.mjs` (nuevo, untracked): ¿solo asserts de convención, sin secretos?
- Contexto (no auditados como código, solo referencia): `reports/sdd-verify-phase-review.md` (APRUEBA), `specs/sdd-verify-phase/requirements.md` + `design.md` v1.

## Hallazgos

### Críticos (requieren fix)
| # | Tipo | Archivo | Línea | Descripción | Fix sugerido |
|---|---|---|---|---|---|
| — | — | — | — | Sin hallazgos críticos. | — |

### Riesgos estructurales (documentar, no bloquean)
| # | Tipo | Descripción | ADR emitido |
|---|---|---|---|
| 1 | Permiso `bash: "*"` amplio en agente verify | `.opencode/agents/verify.md:9-10` otorga `bash` sobre `"*"`. La skill lo acota a runners del proyecto destino (`npm test` / `dotnet test` / equivalente + build + type-check, sin dependencias nuevas, solo covering puntuales + reuso scm/preflight por hash H). Riesgo residual: un prompt malformado del Leader podría inducir comandos fuera de ese catálogo. No hay evidencia de explotación; el Review APRUEBA y los tests TASK-01 asertan el scope. Se documenta como riesgo aceptado de diseño, sin ADR (no contradice decisiones ni requiere cambio arquitectónico). | Ninguno |

### Sin hallazgos relevantes
Revisión efectuada punto por punto (solo lectura, sin edición de código):

1. **`.opencode/agents/verify.md` — mínimo privilegio ✅**
   - `read: "*"`, `edit: "reports/**"`, `bash: "*"`. Sin `edit` sobre `src/**` ni `tests/**` (verificado por lectura + test TASK-01 `doesNotMatch src/tests`). Output único `reports/<feature>-verify.md`, retorno solo-ruta. Frontmatter declara "No edita codigo".
2. **`.opencode/skills/verify/SKILL.md` + `references/report-format.md` ✅**
   - Escrituras: único artefacto `reports/<feature>-verify.md`; regla explícita "NUNCA editar código (`src/`, `tests/`), ni `changes/`, ni emitir CRs, ni ejecutar cierre `scm`" (§Reglas). `report-format.md` solo define 8 secciones Markdown, sin comandos, sin fence YAML, sin JSON.
   - Ejecución: solo runners del proyecto destino + política de ejecución única (reuso scm/preflight por hash H, covering puntuales faltantes). Sin dependencias nuevas, sin binario `sdd-verify-validate`, sin MCP/Engram/Context7 (verificado por lectura; test RNF lo aserta con `doesNotMatch`).
   - Gates: no hay bypass — tasks pendientes o sin `requirements.md` → `FAIL` + `blocked`; `FAIL` ronda 1 → vuelta acotada a Implementer; ronda 2 sin converger → escalación a humano; Verify→Verify mismo hash H prohibida; contradicción irresoluble = `FAIL` + escalación. Nunca abre PR, nunca inicia Judgment Day/RDD/refuter.
   - Exfiltración: sin red, sin secretos, sin lectura de `.env`/credenciales; evidencia = comando + exit code + hash de salida como texto documentado.
3. **`.opencode/AGENTS.md` y `shared/AGENTS.md` — no debilitan gates ✅**
   - Solo añaden fase Verify pre-Reviewer (Full) con presupuestos independientes (`verify_round` 1–2 ≠ `reviewer_round` ≠ CRs) y regla anti-loop; Quick Mode explícitamente sin Verify. Gates humanos preserved: proposal pre-spec + aprobación baseline + merge humano de PR (vía skill scm, que prohíbe push a `main` y auto-merge). Sin auto-avance a `done` (`feature_list.json` sigue manual, y el reporte Review confirma `in_progress` correcto). Tabla Verify vs Reviewer reserva P2/ADRs/drift y veredicto APRUEBA/RECHAZA al Reviewer; seguridad/RLS/secretos al Security Auditor. Nota: los hunks `propose`/`Dispatch` en el diff pertenecen a otras features in-progress (ya señaladas en el Review §P2) — fuera de scope de este veredicto.
4. **`init-sdd.ps1` / `init-sdd.sh` — solo verificación de presencia ✅**
   - Hunks verify: solo `Test-Path`/`check_file` de `.opencode/agents/verify.md` y `.opencode/skills/verify/SKILL.md` en providers `opencode`/`all`; asserts negativos `.claude.*verify` / `.gemini.*verify` en tests TASK-04. Sin `Invoke-WebRequest`/`curl`/`irm`/`iex`, sin remote exec, sin secretos, sin credenciales. Copia vía `Copy-DistributableProvider` con `LiteralPath`/`Join-Path` y exclusión de `node_modules/package.json/package-lock/bun.lock/.gitignore`; `TargetDir`/`Provider` validados (`ValidateSet` / `case`). `.gitignore` solo añade reglas SDD idempotentes (guard `SDD Workflow`). Sin cambios de copia peligrosos (path traversal no introducido por esta feature).
5. **`.opencode/skills/scm/SKILL.md` (+1 línea) — inocua ✅**
   - Solo añade cita `Verify: reports/<feature-id>-verify.md` al body de la PR. Sin cambios en merge/suite/PR, sin relajar restricciones (no force-push/direct-push a main, cierre solo por PR, merge humano).
6. **`tests/template-hardening/verify-phase.test.mjs` — solo convención ✅**
   - 11 asserts `node:test` + `node:assert/strict` sobre existencia/contenido de convenciones (permisos, secciones, orden pipeline, instaladores, RNF solo-opencode). Sin secretos, sin red, sin `eval`/`exec`, sin lectura fuera del repo.

Búsquedas negativas (lectura + tests): sin SQL/NoSQL/XSS/supabase-RLS aplicable (feature de orquestación Markdown, sin código ejecutable ni tablas); sin `resource: "src/**"`/`"tests/**"` en verify.md; sin `mcp|Engram|context7|sdd-verify-validate|fence yaml` en skill verify.

## Resultado
Sin hallazgos
