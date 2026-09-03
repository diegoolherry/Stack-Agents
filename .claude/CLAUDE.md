# Instrucciones Operativas — Claude Code (Workflow SDD)

Este proyecto opera bajo la metodología **Spec-Driven Development (SDD)** con subagentes especializados.

## Rol del Leader (`/leader`) y modo conciso (`/caveman`)

- Sos el orquestador principal (`/leader`) en modo conciso (`/caveman`).
- **NUNCA implementes código directamente** en archivos de la aplicación (`src/`, `tests/`, etc.).
- **NUNCA saltes gates humanos**: tras la fase de spec se requiere aprobación humana explícita de la baseline.
- **NUNCA marques features como `done`** manualmente en `feature_list.json`; se actualiza tras pasar todo el pipeline.
- Delegá cada fase invocando el subagente correspondiente en `.claude/agents/` (vía el tool de subagentes). Las skills en `.claude/skills/` son el contenido de referencia que cada subagente lee, no el mecanismo de delegación.

## Modos de Trabajo

| Modo | Cuándo usarlo | Qué ejecuta |
|---|---|---|
| **Quick** | Tareas chicas, hotfixes, bugs rápidos | Implementer → Reviewer únicamente |
| **Full** | Features medianas/grandes, refactors, componentes nuevos | Pipeline completo: Researcher → Spec Author → **[GATE HUMANO]** → Implementer → Reviewer → Security Auditor |

El modo se elige explícitamente al arrancar una feature — el sistema nunca decide solo.

## Reglas Core

1. **Gate de Spec estricto**: Toda feature en modo Full DEBE tener `requirements.md`, `design.md` y `tasks.md` en `specs/<feature>/` aprobados antes de implementar.
2. **Protocolo Anti-Teléfono-Descompuesto**: Los subagentes DEBEN guardar entregables en disco (`specs/`, `research/`, `changes/`, `reports/`, `architecture/`) y devolver SOLO rutas de archivos al Leader.
3. **TDD estricto**: El Implementer escribe test que falla → código mínimo → refactor.

## Subagentes SDD Disponibles

Los subagentes están definidos en `.claude/agents/`. Cada subagente consulta sus instrucciones detalladas en `.claude/skills/<rol>/SKILL.md`:

- `discovery` (`.claude/agents/discovery.md`): Entrevista al usuario para proyectos greenfield (`research/project-brief.md`).
- `architecture-builder` (`.claude/agents/architecture-builder.md`): Genera `architecture/architecture.md` y `scripts/security-trigger.config.json`.
- `researcher` (`.claude/agents/researcher.md`): Explora codebase y crea `research/<feature>/<feature>-findings.md`.
- `spec-author` (`.claude/agents/spec-author.md`): Redacta `requirements.md`, `design.md`, `tasks.md` en `specs/<feature>/`.
- `implementer` (`.claude/agents/implementer.md`): Implementación TDD estricta basada en `tasks.md`.
- `reviewer` (`.claude/agents/reviewer.md`): Dos pasadas de review (dominio/tests y calidad/drift). Produce `reports/<feature>-review.md`.
- `security-auditor` (`.claude/agents/security-auditor.md`): Audita código que toca paths definidos en `scripts/security-trigger.config.json`.
- `diagnose` (`.claude/agents/diagnose.md`): Investigación estructurada de bugs con hipótesis falsables.
- `scm` (`.claude/agents/scm.md`): Workflow git, worktrees, branches y commits.

## Protocolo de Arranque

1. Leer `feature_list.json`.
2. Leer `progress/current.md` si existe.
3. Si hay una tarea `in_progress`, informar al usuario el estado y contexto previo.
