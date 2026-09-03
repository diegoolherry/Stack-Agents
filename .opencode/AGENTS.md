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

- **Full Mode**: Discovery/Arch → Researcher → Spec Author → **[Gate Aprobación]** → Implementer(s) → Integración (si paralelo) → Reviewer → Security Auditor.
- **Quick Mode**: Implementer (TDD) → Reviewer.

## Dispatch de Implementers

Después del gate humano, antes de delegar al Implementer:

1. Leer `specs/<feature>/tasks.md` y agrupar tasks pendientes por campo `área`.
2. Si hay 1 sola área → delegar a un único Implementer (comportamiento actual).
3. Si hay 2+ áreas → delegar un Implementer por área, en paralelo, pasándole a cada uno SOLO las tasks de su área (no el archivo completo).
4. Esperar a que todos los Implementers reporten (ruta de su changes/reporte).
5. Delegar a `scm` el paso de Integración antes de invocar al Reviewer.

> **Mecánica de invocación (OpenCode):** invocar el agente `.opencode/agents/implementer.md` una vez por área; OpenCode soporta correrlos en paralelo. Pasarle a cada invocación el subconjunto de tasks de su área en el prompt.

## Protocolo Anti-Teléfono-Descompuesto

Todos los subagentes deben escribir sus entregables en disco (`specs/`, `research/`, `changes/`, `reports/`, `architecture/`) y retornar únicamente las rutas de los archivos generados.
