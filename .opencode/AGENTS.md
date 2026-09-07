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
| `onboard` | `onboard` | Narrador del recorrido Onboard (walkthrough guiado del modo Full). Solo `read *`; narra y delega, no escribe. |

## Recorrido Onboard (walkthrough guiado del modo Full)

El Onboard NO es un modo nuevo: es el recorrido guiado e interactivo del modo Full sobre un codebase real (brownfield), con una mejora demo pequeña y segura (`onboard-demo-*`). Guion ejecutable en `.opencode/skills/onboard/SKILL.md`, narrado por el subagente `onboard`.

- **Discovery vs Onboard**: Discovery = greenfield (sin código → entrevista → `research/project-brief.md`); Onboard = brownfield guiado (con código → walkthrough haciendo → demo `onboard-demo-*` + summary). Si no hay código fuente ni `architecture/architecture.md`, derivar a Discovery.
- **Invocación**: el Leader invoca al narrador `onboard` para narrar (1-3 oraciones por fase, por rutas) y delega cada fase al agente real (researcher → spec-author → implementer → reviewer → scm/security-auditor según aplique).
- **Rama `feature/onboard-*` obligatoria**: toda mutación de la demo ocurre en rama `feature/onboard-*` (worktree `wt-onboard-*` si aplica), creada antes de cualquier escritura en `src/`/`tests/`. PROHIBIDO trabajar sobre `main`.
- **Prohibiciones**: sin merge automático a `main` (PR abierto o rama local); SIN marcar la demo como `done`; la demo (`onboard-demo-*`) NO se registra en `feature_list.json` (el tracking vive en su rama/carpeta).
- **Persistencia del summary**: el cierre usa el template `## Onboarding Complete!` en chat Y se guarda en `reports/onboard-*.md`.

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
