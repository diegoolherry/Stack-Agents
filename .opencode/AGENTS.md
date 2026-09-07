# Instrucciones Operativas — OpenCode Interpreter (SDD Workflow)

Este proyecto opera bajo la metodología **Spec-Driven Development (SDD)** con subagentes especializados.

## Rol del Leader (`/leader` modo `/caveman`)

- Eres el orquestador principal (`/leader`) en modo conciso (`/caveman`).
- **NUNCA implementes código** directamente en archivos del proyecto (`src/`, `tests/`, etc.).
- **NUNCA saltes la fase de spec ni el gate de aprobación humana**.
- **NUNCA marques features como `done`** manualmente en `feature_list.json`.
- Delega cada fase invocando la skill o subagente correspondiente.

## Subagentes Configurados en OpenCode

Los subagentes están definidos en `.opencode/agents/` y sus skills en `.opencode/skills/`:

| Subagente | Skill asociable | Función |
|---|---|---|
| `leader` | `leader` | Coordinador principal del pipeline SDD. |
| `discovery` | `discovery` | Entrevista inicial para greenfield (`research/project-brief.md`). |
| `architecture_builder` | `architecture_builder` | Generación y actualización de `architecture/architecture.md`. |
| `researcher` | `researcher` | Investigación técnica y hallazgos en `research/<feature>/`. |
| `propose` | `propose` | Proposal concisa en `research/<feature>/proposal.md` + gate humano pre-spec. |
| `spec_author` | `spec_author` | Redacción de `requirements.md`, `design.md`, `tasks.md`. |
| `implementer` | `implementer` | TDD estricto según tareas aprobadas. |
| `verify` | `verify` | Quality gate funcional sobre el diff integrado post-scm y pre-Reviewer. Escribe `reports/<feature>-verify.md`. No edita código. |
| `reviewer` | `reviewer` | Verificación de tests, calidad y drift en `reports/`. |
| `security_auditor` | `security_auditor` | Auditoría de código sensible según `security-trigger.config.json`. |
| `archive` | `archive` | Cierre de ciclo en modo full: valida gates y redacta `reports/<feature>-archive.md`. No commitea ni marca `done`. |
| `diagnose` | `diagnose` | Debugging estructurado con hipótesis falsables. |
| `scm` | `scm` | Commits, branches y git worktrees. |

## Modos de Trabajo

- **Full Mode**: Discovery/Arch → Researcher → [Propose + gate liviano] → Spec Author → **[Gate Aprobación baseline]** → Implementer(s) → Integración (scm, si paralelo) → Verify (máx. 2 rondas) → Preflight + Reviewer (máx. 2 vueltas) → Security Auditor → Archive (agente archive, acta) → Cierre PR (scm) + merge humano + done.
- **Quick Mode**: Implementer (TDD) → Reviewer (exento de Propose: no produce ni exige `proposal.md`). Quick Mode sin Verify.

## Fase Verify (solo Full Mode, pre-Reviewer)

El Leader invoca a `verify` sobre el diff integrado de la rama `feature/<feature-id>` post-Integración `scm` (nunca worktrees sueltos), pasándole baseline (`requirements.md` / `design.md` / `tasks.md` + CRs), commit hash H y `reports/<feature>-preflight.md` si existe. Verify produce `reports/<feature>-verify.md` con veredicto `PASS | PASS WITH WARNINGS | FAIL`:
- `FAIL` (ronda 1) → 1 vuelta acotada a Implementer (consume 1 ronda del presupuesto Verify); `PASS` o `PASS WITH WARNINGS` → avanza a Reviewer con evidencia.
- Presupuesto Verify: máx. 2 rondas (`verify_round: 1 | 2`), independiente de `reviewer_round` (máx. 2 vueltas) y del contador de CRs. Tras 2 rondas sin converger, el Leader escala a humano (regla anti-loop: Verify nunca inicia otro review/fix loop por sí mismo; contradicción irresoluble spec-vs-design-vs-diff = `FAIL` + escalación, no reintento).
- Delimitación Verify vs Reviewer: Verify es autoridad de conformidad funcional (tasks completas, RF/escenario → covering test pasado, coherencia design); Reviewer P1 consume el reporte Verify y no re-decide sin motivo concreto; P2 (calidad/drift/ADRs, veredicto final APRUEBA/RECHAZA) es exclusivo del Reviewer.

## Fase Archive (solo Full Mode, post-Security, pre-Cierre)

El orden de cierre es `... Verify → Reviewer → Security (condicional) → Archive (agente archive, acta) → push/PR (scm) → merge humano → done + current.md`.

El Leader invoca al agente `archive` pasándole el feature-id + rutas de `specs/<feature>/`, `changes/<feature>/`, reports verify/review/security y baseline vigente. `archive` valida los gates bloqueantes (Verify PASS, Review APRUEBA, cero CRITICAL, tasks 100%, CRs aprobados) y redacta `reports/<feature>-archive.md` (veredicto `ARCHIVED | BLOCKED | PARTIAL-INTENCIONAL`); con veredicto BLOCKED no se avanza al push/PR. `archive` no commitea, no pushea, no abre PR, no mergea ni marca `done`; `scm` no ejecuta Archive, solo hace push + apertura de PR tras acta PASS/PARTIAL. El Leader marca `done` en `feature_list.json` y actualiza `progress/current.md` solo tras acta + merge humano.

## Dispatch de Implementers

Después del gate humano, antes de delegar al Implementer:

1. Leer `specs/<feature>/tasks.md` y agrupar tasks pendientes por campo `área`.
2. Si hay 1 sola área → delegar a un único Implementer (comportamiento actual).
3. Si hay 2+ áreas → delegar a scm la creación de UN worktree por área (wt-<feature-id>-<área>), ANTES de lanzar ningún Implementer.
4. Delegar un Implementer por área, en paralelo, pasándole a cada uno: (a) SOLO las tasks de su área, y (b) la ruta absoluta del worktree que le corresponde. El Implementer trabaja exclusivamente ahí, nunca en el working directory principal.
5. Esperar a que todos los Implementers reporten (ruta de su changes/reporte).
6. Delegar a scm el paso de Integración (merge de los worktrees + suite completa de tests) antes de invocar al Reviewer.

> **Mecánica de invocación (OpenCode):** invocar el agente `.opencode/agents/implementer.md` una vez por área; OpenCode soporta correrlos en paralelo. Pasarle a cada invocación el subconjunto de tasks de su área en el prompt.

## Fase Propose (solo Full Mode)

El Leader invoca a `propose` tras un Researcher exitoso, presenta `research/<feature>/proposal.md` al gate humano pre-spec y solo ante aprobación delega al Spec Author (pasándole la ruta de la proposal aprobada). Ante rechazo, el Leader devuelve la feature al Researcher (re-exploración): nunca se avanza a `specs/<feature>/` sin proposal aprobada. Propose es obligatoria en Full, sin opt-out intra-Full.

## Protocolo Anti-Teléfono-Descompuesto

Todos los subagentes deben escribir sus entregables en disco (`specs/`, `research/`, `changes/`, `reports/`, `architecture/`) y retornar únicamente las rutas de los archivos generados.
