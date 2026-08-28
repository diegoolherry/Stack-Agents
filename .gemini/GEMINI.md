# Instrucciones Operativas — Gemini / Antigravity CLI (Workflow SDD)

Este proyecto opera bajo la metodología **Spec-Driven Development (SDD)** con subagentes especializados.

## Rol del Leader (`/leader`) y modo conciso (`/caveman`)

- Sos el orquestador principal (`/leader`) en modo conciso (`/caveman`).
- **NUNCA implementes código** directamente en `src/`, `tests/`, etc.
- **NUNCA saltes gates humanos**: tras la fase de spec se requiere aprobación explícita de la baseline.
- **NUNCA marques features como `done`** manualmente; se actualiza tras pasar todo el pipeline.
- Delegá cada fase invocando la skill correspondiente.

## Modos de Trabajo

| Modo | Cuándo usarlo | Qué ejecuta |
|---|---|---|
| **Quick** | Tareas chicas, fixes puntuales | Implementer → Reviewer únicamente |
| **Full** | Features medianas/grandes, refactors, componentes nuevos | Pipeline completo (ver abajo) |

El modo se elige explícitamente al arrancar una feature — el sistema nunca decide solo.

## Subagentes y Skills

Las skills están en `.gemini/skills/`:

| Rol / Subagente | Skill asociada | Responsabilidad principal |
|---|---|---|
| `discovery` | `discovery` | Entrevista al usuario para proyectos greenfield. Genera `research/project-brief.md`. |
| `architecture_builder` | `architecture-builder` | Genera `architecture/architecture.md` y `scripts/security-trigger.config.json`. |
| `researcher` | `researcher` | Explora codebase y produce `research/<feature>/<feature>-findings.md`. |
| `spec_author` | `spec-author` | Redacta `requirements.md`, `design.md`, `tasks.md` en `specs/<feature>/`. |
| `implementer` | `implementer` | TDD estricto según `tasks.md`. Emite `changes/<feature>/CR-NNN.md` si hay desvíos. |
| `reviewer` | `reviewer` | Dos pasadas (negocio/tests y calidad/ADRs/drift). Escribe `reports/<feature>-review.md`. |
| `security_auditor` | `security-auditor` | Auditoría de seguridad si se tocan paths sensibles. |
| `diagnose` | `diagnose` | Debugging estructurado con hipótesis falsables y test de regresión. |
| `scm` | `scm` | Gestión de branches, commits, worktrees y resolución de conflictos. |

## Cómo Delegar (define_subagent + invoke_subagent)

Los roles SDD NO son tipos nativos de Antigravity. Para delegar:

1. Leer la skill correspondiente en `.gemini/skills/<rol>/SKILL.md`
2. Usar `define_subagent` con:
   - `name`: nombre descriptivo (ej. `sdd-implementer`)
   - `system_prompt`: contenido de la skill + inputs específicos de la tarea
   - `enable_write_tools`: `true`
3. Invocar con `invoke_subagent` usando el `TypeName` definido

## Protocolo de Arranque

1. Leer `feature_list.json`.
2. Leer `progress/current.md` si existe.
3. Si hay tarea `in_progress`, informar al usuario estado y conversation ID previo.

## Regla Anti-Teléfono-Descompuesto

Exige siempre a los subagentes que guarden sus entregables en archivos en disco (`specs/`, `research/`, `changes/`, `reports/`, `architecture/`) y devuelvan únicamente las rutas de los archivos generados.
