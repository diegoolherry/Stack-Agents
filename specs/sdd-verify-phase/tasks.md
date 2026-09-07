# Tasks — sdd-verify-phase

Baseline: v1
Feature: sdd-verify-phase

## Tareas

> Todas las tasks comparten `área: pipeline` porque modifican los mismos archivos de pipeline (`.opencode/AGENTS.md`, `shared/AGENTS.md`, instaladores) y tienen dependencia secuencial (el agente/skill debe existir antes de cablearlo al pipeline). Área única ⇒ un solo Implementer secuencial.

### Task 1: Crear agente y skill Verify solo-opencode

- [x] TASK-01: Crear `.opencode/agents/verify.md` (subagente dedicado, permisos read + edit `reports/**` + bash, no edita código, output `reports/<feature>-verify.md`).
área: pipeline
RF relacionado: RF-14

- [x] TASK-02: Crear `.opencode/skills/verify/SKILL.md` + `references/report-format.md` con orden specs→design→tasks, matriz compliance, severidades CRITICAL/WARNING/SUGGESTION, veredictos PASS/PASS WITH WARNINGS/FAIL, definición de covering test, política de ejecución única y matriz de degradación; sin binario, sin MCP, sin fence YAML obligatorio.
área: pipeline
RF relacionado: RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-13, RF-14

### Task 2: Cablear Verify al pipeline Full y a instaladores

- [x] TASK-03: Actualizar `.opencode/AGENTS.md` y `shared/AGENTS.md`: orden Full `... Integración (scm) → Verify (máx. 2 rondas) → Preflight + Reviewer (máx. 2 vueltas) → Security Auditor (condicional) → PR + done`; Quick Mode sin Verify; tabla de delimitación Verify vs Reviewer P1/P2; contadores independientes (verify_round vs reviewer_round vs CRs) y regla anti-loop.
área: pipeline
RF relacionado: RF-01, RF-09, RF-10, RF-11, RF-12, RF-15

- [x] TASK-04: Actualizar `init-sdd.ps1` e `init-sdd.sh` para distribuir `.opencode/agents/verify.md` y `.opencode/skills/verify/` en providers `opencode`/`all` y verificar su presencia; sin tocar `.claude/`/`.gemini/` ni el schema de `feature_list.json`.
área: pipeline
RF relacionado: RF-14, RF-15

### Task 3: Cierre de trazabilidad Verify → Reviewer → PR

- [x] TASK-05: Documentar consumo del reporte por Reviewer (P1 lee `reports/<feature>-verify.md`, no re-decide sin motivo concreto; P2 exclusivo) y cita del reporte Verify en el body de la PR junto a review/security; verificar AC-01–AC-13 contra un diff integrado de prueba (incluye caso tasks pendientes → FAIL blocked y caso sin runner → SKIPPED+WARNING).
área: pipeline
RF relacionado: RF-08, RF-09, RF-11, RF-12
