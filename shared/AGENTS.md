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
| `propose` | `propose` | Redacta `research/<feature>/proposal.md` (gate humano pre-spec). Exento en Quick. |
| `spec_author` | `spec-author` | Redacta `requirements.md`, `design.md`, `tasks.md` en `specs/<feature>/`. |
| `implementer` | `implementer` | TDD estricto según `tasks.md`. Emite `changes/<feature>/<área>/CR-NNN.md` si hay desvíos. |
| `verify` | `verify` | Quality gate funcional post-integración y pre-Reviewer (solo Full). Escribe `reports/<feature>-verify.md`. No edita código. |
| `reviewer` | `reviewer` | Dos pasadas (negocio/tests y calidad/ADRs/drift). Escribe `reports/<feature>-review.md`. Consume `reports/<feature>-verify.md` en P1. |
| `security_auditor` | `security-auditor` | Auditoría de seguridad si se tocan paths sensibles. |
| `archive` | `archive` | Cierre de ciclo (solo Full, solo opencode): valida gates y redacta `reports/<feature>-archive.md`. No commitea ni marca `done`. |
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
2. **[Propose + gate liviano]** → `research/<feature>/proposal.md` (obligatorio en Full, exento en Quick). El Leader invoca a `propose` tras Researcher, presenta la proposal al gate humano pre-spec y solo ante aprobación delega al Spec Author; ante rechazo o `blocked`, retorna a Researcher (re-exploración) sin tocar `specs/<feature>/`.
3. **Spec Author** → `specs/<feature>/requirements.md`, `design.md`, `tasks.md` (no inicia sin proposal aprobada; rechaza proposals malformadas)
3. **═══ GATE: aprobación humana obligatoria ═══**
4. **Implementer(s)** — uno o varios en paralelo según áreas de `tasks.md` (TDD estricto, emite CRs si hay desvíos)
4b. **Integración** (`scm`) — merge de worktrees paralelos + suite completa de tests, solo si hubo más de un Implementer
4c. **Verify** (máx. 2 rondas; `FAIL` ronda 1 → vuelta acotada a Implementer; `PASS`/`PASS WITH WARNINGS` → avanza a Reviewer; tras ronda 2 sin converger escala a humano). Solo Full Mode — Quick Mode sin Verify.
5. **Preflight + Reviewer** (máx. 2 vueltas; si no converge, escala a humano). Reviewer P1 consume `reports/<feature>-verify.md` como evidencia autoritativa y no re-decide sin motivo concreto; P2 (calidad/drift/ADRs, veredicto final) exclusivo del Reviewer.
6. **Security Auditor** (condicional: si toca paths de `security-trigger.config.json`)
7. **Archive** (agente `archive`, solo Full solo-opencode): valida gates y redacta `reports/<feature>-archive.md` (`ARCHIVED | BLOCKED | PARTIAL-INTENCIONAL`); con BLOCKED no hay PR
8. **Cierre**: Pull Request a main (scm, cita `reports/<feature>-verify.md` junto a review/security/archive) + `feature_list.json` → `done` + actualización de `progress/current.md`

Orden de cierre: `... Verify → Reviewer → Security (condicional) → Archive (agente archive, acta) → push/PR (scm) → merge humano → done + current.md`. El Leader invoca a `archive`; `archive`/`scm` no marcan `done` y `scm` no ejecuta Archive. `done` + `current.md` van solo tras acta + merge humano.

## Delimitación Verify vs Reviewer y contadores

| Dimensión | Verify (autoridad) | Reviewer (autoridad) |
|---|---|---|
| Tasks completadas | ✅ decide PASS/FAIL blocked | Lee el veredicto, no re-decide salvo contradicción concreta |
| RF/escenario → covering test pasado | ✅ matriz spec + veredicto | P1 verifica lectura, solo re-abre con motivo concreto |
| Coherencia design | ✅ WARNING salvo rotura spec | No duplica; solo P2 evalúa implicancias de calidad |
| CRAP/mutation/naming/duplicación | ❌ no evalúa | ✅ P2 exclusivo |
| ADRs/drift (`architecture_drift`) | ❌ no emite ADR ni flag | ✅ P2 exclusivo |
| Seguridad/RLS/secretos | ❌ excluido | ❌ (Security Auditor) |
| Veredicto final APRUEBA/RECHAZA | ❌ no lo emite | ✅ exclusivo del Reviewer |

Contadores independientes: `verify_round` (1–2, solo Verify) ≠ `reviewer_round` (1–2, solo Reviewer) ≠ contador de CRs. Regla anti-loop: Verify nunca edita código ni inicia otro review/fix loop por sí mismo; una contradicción irresoluble spec-vs-design-vs-diff = `FAIL` + escalación a humano, no reintento; una ronda Verify → Verify sin cambio de diff (mismo hash) está prohibida.

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
