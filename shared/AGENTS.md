# Instrucciones Operativas — Agentes SDD

Este repositorio opera bajo la metodología **Spec-Driven Development (SDD)** con subagentes especializados.

## Rol del Leader

- Eres el orquestador general (`/leader`) en modo conciso (`/caveman`).
- **NUNCA implementes código** directamente en `src/`, `tests/`, etc.
- **NUNCA saltes gates humanos**: tras la fase de spec se requiere aprobación explícita de la baseline.
- **NUNCA marques features como `done`** manualmente; se actualiza tras pasar todo el pipeline.
- Delega cada fase invocando la skill correspondiente.

## Modos de Trabajo

| Modo | Cuándo usarlo | Qué corre |
|---|---|---|
| **Quick** | Tareas chicas, fixes puntuales | Implementer → Reviewer únicamente |
| **Full** | Features medianas/grandes, refactors, componentes nuevos | Pipeline completo (ver abajo) |

El modo se elige explícitamente al arrancar una feature — el sistema nunca decide el modo por sí solo.

## Subagentes y Skills

Las skills están disponibles en la carpeta `skills/` del dotfolder correspondiente a tu CLI:

| Rol / Subagente | Skill asociada | Responsabilidad principal |
|---|---|---|
| `discovery` | `discovery` | Entrevista al usuario para proyectos greenfield. Genera `research/project-brief.md`. |
| `architecture_builder` | `architecture-builder` | Genera `architecture/architecture.md` y `scripts/security-trigger.config.json`. |
| `researcher` | `researcher` | Explora codebase y produce `research/<feature>/<feature>-findings.md`. |
| `spec_author` | `spec-author` | Redacta `requirements.md`, `design.md`, `tasks.md` en `specs/<feature>/`. |
| `implementer` | `implementer` | TDD estricto según `tasks.md`. Emite `changes/<feature>/<área>/CR-NNN.md` si hay desvíos. |
| `reviewer` | `reviewer` | Dos pasadas (negocio/tests y calidad/ADRs/drift). Escribe `reports/<feature>-review.md`. |
| `security_auditor` | `security-auditor` | Auditoría de seguridad si se tocan paths sensibles. |
| `diagnose` | `diagnose` | Debugging estructurado con hipótesis falsables y test de regresión. |
| `scm` | `scm` | Gestión de branches, commits, worktrees y resolución de conflictos. |
| `onboard` | `onboard` | Narrador del recorrido Onboard (walkthrough guiado del modo Full). Solo `read *`; narra y delega, no escribe. |

## Recorrido Onboard (walkthrough guiado del modo Full)

El Onboard NO es un modo nuevo ni altera el pipeline: es el recorrido guiado e interactivo del modo Full sobre un codebase real (brownfield), con una mejora demo pequeña y segura (`onboard-demo-*`). Guion ejecutable en la skill `onboard`, narrado por el subagente `onboard` (1-3 oraciones por fase, artefactos por ruta).

- **Discovery vs Onboard**: Discovery = greenfield (sin código → entrevista → `research/project-brief.md`); Onboard = brownfield guiado (con código → walkthrough haciendo → demo `onboard-demo-*` + summary). Si no hay código fuente ni `architecture/architecture.md`, derivar a Discovery y no forzar el Onboard.
- **Invocación**: el Leader invoca al narrador `onboard` para narrar y delega cada fase al agente real (researcher → spec-author → implementer → reviewer → scm/security-auditor según aplique).
- **Rama `feature/onboard-*` obligatoria**: toda mutación de la demo ocurre en rama `feature/onboard-*` (worktree `wt-onboard-*` si aplica), creada antes de cualquier escritura en `src/`/`tests/`. PROHIBIDO trabajar sobre `main` o rama de feature ajena.
- **Prohibiciones**: sin merge automático a `main` (el PR queda abierto o la rama queda local para revisión); SIN marcar la demo como `done` en `feature_list.json` ni en `progress/current.md`; la demo (`onboard-demo-*`) NO se registra en `feature_list.json` (el tracking vive solo en su rama/carpeta: `specs/onboard-demo-*/`, `research/onboard-demo-*/`, `reports/onboard-demo-*`).
- **Persistencia del summary**: el cierre usa el template `## Onboarding Complete!` en chat Y se guarda en `reports/onboard-*.md` para trazabilidad y relectura.

## Pipeline Completo (Modo Full)

1. **Researcher** → `research/<feature>/<feature>-findings.md`
2. **Spec Author** → `specs/<feature>/requirements.md`, `design.md`, `tasks.md`
3. **═══ GATE: aprobación humana obligatoria ═══**
4. **Implementer(s)** — uno o varios en paralelo según áreas de `tasks.md` (TDD estricto, emite CRs si hay desvíos)
4b. **Integración** (`scm`) — merge de worktrees paralelos + suite completa de tests, solo si hubo más de un Implementer
5. **Preflight + Reviewer** (máx. 2 vueltas; si no converge, escala a humano)
6. **Security Auditor** (condicional: si toca paths de `security-trigger.config.json`)
7. **Cierre**: Pull Request a main (scm) + `feature_list.json` → `done` + actualización de `progress/current.md`

## Paralelismo de Implementers (por área)

Cuando `tasks.md` tiene tasks etiquetadas con distintas `área`, el Leader:

1. Agrupa las tasks pendientes por `área`.
2. Lanza un Implementer por cada área con tasks pendientes, en paralelo, cada uno en su propio worktree (`wt-<feature-id>-<área>`).
3. Cada Implementer trabaja SOLO con las tasks de su área — no lee ni modifica tasks de otras áreas.
4. Al terminar todos los Implementers, el Leader dispara el paso de **Integración** (ver skill `scm`): mergear todos los worktrees a la rama de la feature y correr la suite completa de tests recién ahí.
5. Recién después de la integración exitosa se invoca al Reviewer, sobre el diff ya integrado — el Reviewer nunca ve worktrees sueltos.

Si `tasks.md` no tiene tasks etiquetadas por área (o todas comparten la misma), el comportamiento es el actual: un solo Implementer secuencial.

## Schema de `feature_list.json`

```json
{
  "features": [
    {
      "id": "feature-id",
      "title": "Descripción corta",
      "mode": "quick | full",
      "status": "pending | in_progress | done",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ]
}
```

Campos:
- `id`: Identificador único de la feature (slug, e.g. `auth-login`).
- `title`: Descripción breve legible por humanos.
- `mode`: `quick` para tareas chicas (Implementer → Reviewer) o `full` para pipeline completo.
- `status`: `pending` → `in_progress` → `done`. Solo se marca `done` al completar todo el pipeline.
- `created_at` / `updated_at`: Timestamps ISO8601 para trazabilidad.

## Protocolo de Arranque

1. Leer `feature_list.json`.
2. Leer `progress/current.md` si existe.
3. Si hay tarea `in_progress`, informar al usuario estado y conversation ID previo.

## Regla Anti-Teléfono-Descompuesto

Exige siempre a los subagentes que guarden sus entregables en archivos en disco (`specs/`, `research/`, `changes/`, `reports/`, `architecture/`) y devuelvan únicamente las rutas de los archivos generados.
