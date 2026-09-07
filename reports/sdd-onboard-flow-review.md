# Review — sdd-onboard-flow

## Metadata
reviewer_round: 1
architecture_drift: false

Árbol revisado: `D:\ProyectosPersonales\wt-sdd-onboard-flow` (rama `feature/sdd-onboard-flow`, integrado, `git status` limpio).
Integración: `reports/sdd-onboard-flow-integration-2.md` (VERDE 27/27 + 17/17, 0 conflictos, CR-001 aplicada).
Baseline: `specs/sdd-onboard-flow/requirements.md`, `design.md`, `tasks.md` (canónicos en principal, baseline v1) + `research/sdd-onboard-flow/sdd-onboard-flow-findings.md`.
Diff propio del feature (vs base `65c44e5`): `.opencode/skills/onboard/SKILL.md` (nuevo), `.opencode/agents/onboard.md` (nuevo), `.opencode/AGENTS.md` + `shared/AGENTS.md` (hunks), `init-sdd.ps1`/`.sh` (verificación), `package.json` (script), `tests/sdd-onboard-flow/*` (3 archivos), `changes/sdd-onboard-flow/plantilla/CR-001.md`, reportes de integración. Sin toques a `.claude/`/`.gemini/`/`scripts/` en este diff (el cambio en `.claude/commands/security-audit.md` visible en `main...HEAD` pertenece a la base template-hardening, no a este feature).

## Pasada 1: Negocio + Tests

### Requisitos cubiertos
- RF-01 (scan small&safe medible): ✅ SKILL.md § Criterios small&safe — 6 criterios (30-60 min, sin breaking, sin migraciones, valor real, spec-worthy ≥1 req + 2 escenarios, fuera de `security-trigger.config.json`), veredicto criterio-por-criterio, ejemplos válidos.
- RF-02 (STOP sin candidata): ✅ § STOP y validación — STOP con descarte escrito, prohibido forzar. Test AC-02 análogo en dry-run (parametrización/aislamiento).
- RF-03 (propuesta usuario validada): ✅ misma sección — rechazo criterio-por-criterio + alternativa.
- RF-04 (aprobación post-proposal): ✅ § Pausas obligatorias punto 2 + F3 (no avanzar a specs sin aprobación). Test `reglas STOP, validación y pausas` lo exige.
- RF-05 (artefactos reales, prohibido toy): ✅ § Reglas (artefactos reales en disco) + F2/F4/F7 con agentes reales y formatos vigentes; dry-run valida sincronía con corpus cerrado.
- RF-06 (rama aislada): ✅ § Rama aislada + F7 (rama `feature/onboard-*` antes de escribir en `src/`/`tests/`), AGENTS en ambos dotfolders.
- RF-07 (sin merge auto ni done): ✅ misma sección + F9 (rama abierta sin merge, nunca `done`); test `seco aislamiento` lo verifica.
- RF-08 (demo fuera de feature_list.json): ✅ misma sección + AGENTS; test `seco aislamiento` (ningún `onboard-demo-*` registrado/marcado done).
- RF-09 (Propose/Verify/Archive parametrizados): ✅ § Matriz + F3/F8/F9 con línea explícita "paso aún no adoptado — se omite"; tests `parametrización` y `seco F3/F8/F9` en ambos estados.
- RF-10 (guion 10 fases narradas): ✅ § Guion F1-F10 + test `guion de 10 fases` (F1..F10, Welcome, Summary).
- RF-11 (pausas definidas): ✅ exactamente 3 (elección candidata, post-proposal, pre-Apply); test `seco pausas` (exactamente 3).
- RF-12 (derivación Discovery greenfield): ✅ § Discovery-vs-Onboard + F1 (sin código ni `architecture.md` → Discovery, no forzar); test `tabla Discovery + derivación`.
- RF-13 (detección stack/testing, degradación sin suite): ✅ F1 (stack/lenguaje, runner, suite, skills architecture_builder/supabase/ux-ui/deploy) + F8 degradado a checklist; test `detección stack`.
- RF-14 (summary template fijo): ✅ § Template `## Onboarding Complete!` con todos los campos (change, WHY/WHAT/HOW/STEPS, archivos, one-liner, SDD-vs-directo, next steps); test lo exige literal.
- RF-15 (persistencia summary): ✅ template en chat Y `reports/onboard-<fecha>-<demo>.md`; AGENTS + tests lo exigen.
- RF-16 (solo-opencode, sin binarios/MCP/red): ✅ § Rama y prohibiciones (solo Markdown + wiring `.opencode/`, prohibido binarios/MCP/red/replicar `.claude/`/`.gemini/`); test `instaladores sin binarios/MCP/red` + instalación fresca sin `.claude/`/`.gemini/` con provider opencode.
- RF-17 (permisos mínimos, delegación por fase): ✅ `onboard.md` front matter `mode: subagent` con SOLO `read *` (sin `edit`/`bash`/`subagent` en bloque permissions — verificado por test); Leader y fases sin cambios de permisos; test `onboard.md es subagent con SOLO read *` + `narrador que delega`.
- RF-18 (instaladores + AGENTS): ✅ `init-sdd.ps1` (+14) e `init-sdd.sh` (+2) verifican ambas fuentes onboard bajo provider `opencode`/`all` (paridad); AGENTS en `.opencode/` y `shared/` documentan Onboard como recorrido Full con Discovery-vs-Onboard, rama, prohibiciones y persistencia; tests AC-14 (distribuye en fresco + falla si faltan) en ambos instaladores.

### Cobertura de criterios de aceptación
- AC-01 (scan 2-3 + veredicto): ✅ vía RF-01 (skill + test criterios).
- AC-02 (STOP sin rama ni código): ✅ vía RF-02.
- AC-03 (rechazo propuesta inválida + alternativa): ✅ vía RF-03.
- AC-04 (sin aprobación no avanza): ✅ vía RF-04/RF-11 (tests pausas).
- AC-05 (artefactos reales en `feature/onboard-*`): ✅ vía RF-05/RF-06 (skill + dry-run sincronía/corpus).
- AC-06 (sin merge, sin `onboard-demo-*` en feature_list, sin done): ✅ test `seco aislamiento` en verde.
- AC-07 (parametrización ambos estados): ✅ tests parametrización + seco F3/F8/F9 (ausente con línea explícita; presente con formato real vía `resolverPaso`).
- AC-08 (10 fases, ≤3 oraciones): ✅ tests guion + `seco narración` (10/10 válidas 1-3).
- AC-09 (greenfield → Discovery): ✅ skill + test derivación; seco F1 exige `architecture.md` o deriva.
- AC-10 (sin suite → checklist degradada): ✅ F1/F8 skill; harness cubre la regla (sin suiterepo dedicado por diseño en seco).
- AC-11 (template + persistencia): ✅ test template + seco F10.
- AC-12 (sin binarios/MCP/`.claude/`/`.gemini`, carpetas init-sdd): ✅ tests binarios + provider opencode sin `.claude/`/`.gemini/` + 6 carpetas operativas.
- AC-13 (sin `edit` amplio, delegación por fase): ✅ tests TASK-02 + seco sincronía (6 agentes de fase existen).
- AC-14 (instaladores + AGENTS recorrido Full): ✅ 4 tests instalador (ps1+bash, éxito en fresco y fallo sin seed vía `removeOnboardSources`) + 2 tests AGENTS.
- AC-15 (español + reversibilidad): ✅ skill fija español neutro (tests `idioma español`, seco F10 `debe`); reversibilidad vía borrado de rama (skill + seco reversibilidad: candidata sin migraciones).

### Tareas completadas
- TASK-01 (skill, área onboarding): ✅ implementada y testeada (5 tests TASK-01 en verde).
- TASK-02 (narrador, área onboarding): ✅ implementada y testeada (2 tests TASK-02 en verde).
- TASK-03 (AGENTS, área onboarding): ✅ ambos AGENTS + guard pre-merge de aislamiento (3 tests en verde; el guard retorna temprano post-merge por diseño documentado).
- TASK-04 (instaladores, área plantilla): ✅ verificación paritaria + 5 tests instalador en verde.
- TASK-05 (seco, área plantilla): ✅ 12 tests dry-run en verde (harness 4 + simulación 8).
- Nota de proceso (no bloqueante): `tasks.md` canónico conserva checkboxes `[ ]` sin marcar; los reportes de área/integración documentan el completado. El marcado corresponde al cierre del feature, no al Reviewer.

## Pasada 2: Calidad

### Métricas (del preflight)
- Preflight no configurado — revisión manual. No existe `reports/sdd-onboard-flow-preflight.md` (sin CRAP/Stryker/reglas estructurales en este proyecto de plantilla).
- Tests (corrida propia del Reviewer sobre el árbol integrado): `test:sdd-onboard-flow` **27/27 ✅** (`onboard-flow` 10/10, `onboard-installer` 5/5, `onboard-dry-run` 12/12); `test:template-hardening` **17/17 ✅** (CR-001 sigue verde, sin regresión). Total: **44/44, 0 fail**.
- Calidad manual del diff: naming coherente (`onboard`, `onboard-demo-*`, `feature/onboard-*`), guion portable en Markdown, instaladores con la misma mecánica de copia existente, tests auto-sembrados sin red ni binarios. Sin duplicación relevante (hunks AGENTS mínimos y simétricos).

### ADRs respetados
- Sin ADRs en `architecture/decisions/` (confirmado en findings §5 y design § ADRs: N/A, decisión A-sobre-B registrada en la baseline sin ADR). Nada que respetar ni emitir.

### Architecture drift
- Ninguno. El diff no contradice `architecture/architecture.md` (plantilla distribuible, instaladores de 7 etapas, providers): solo añade verificación de 2 archivos bajo el provider existente y documenta el recorrido sin alterar el pipeline. `architecture_drift: false`, sin ADR.

### Observaciones de calidad
- Fortalezas: permisos narrador mínimos reales (solo `read *`); parametrizaciónhonesta (línea explícita en vez de enseñar lo inexistente); paridad ps1/sh verificada por tests en ambos shells; aislamiento demo por diseño + tests; español neutro con términos propios conservados en inglés.
- Menores (no bloqueantes): (1) el guard `instaladores intactos` es pre-merge por diseño y hoy retorna temprano — documentado en el propio test, correcto; (2) `feature_list.json` del árbol integrado solo registra `template-hardening: done` (la entrada `sdd-onboard-flow in_progress` vive en el flujo del Leader, no en este diff) — coherente con RF-08; (3) el diff `main...HEAD` arrastra la base template-hardening (incluido el renombre `security-audit.md` → `security.md`); el diff propio `65c44e5...HEAD` está limpio y acotado.
- Seguridad: no toca paths de `scripts/security-trigger.config.json`; no se requiere auditoría. Instaladores sin red/MCP/binarios; `.claude/`/`.gemini/` intactos en este diff.

## Veredicto
APRUEBA
