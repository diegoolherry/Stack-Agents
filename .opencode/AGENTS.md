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
| `spec_author` | `spec_author` | Redacción de `requirements.md`, `design.md`, `tasks.md`. |
| `implementer` | `implementer` | TDD estricto según tareas aprobadas. |
| `reviewer` | `reviewer` | Verificación de tests, calidad y drift en `reports/`. |
| `security_auditor` | `security_auditor` | Auditoría de código sensible según `security-trigger.config.json`. |
| `diagnose` | `diagnose` | Debugging estructurado con hipótesis falsables. |
| `scm` | `scm` | Commits, branches y git worktrees. |

## Modos de Trabajo

- **Full Mode**: Discovery/Arch → Researcher → Spec Author → **[Gate Aprobación]** → Implementer → Reviewer → Security Auditor.
- **Quick Mode**: Implementer (TDD) → Reviewer.

## Protocolo Anti-Teléfono-Descompuesto

Todos los subagentes deben escribir sus entregables en disco (`specs/`, `research/`, `changes/`, `reports/`, `architecture/`) y retornar únicamente las rutas de los archivos generados.
