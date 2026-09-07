# Review — sdd-archive-phase

## Metadata
reviewer_round: 1
architecture_drift: false

## Pasada 1: Negocio + Tests
### Requisitos cubiertos
- RF-01: ✅ Gates bloqueantes (Verify PASS, Review APRUEBA última vuelta, cero CRITICAL, tasks 100% persistido, CRs no-Corrección aprobados) en tabla PASS/BLOCKED en `.opencode/skills/archive/SKILL.md` (§ Gates de Archive). Regla "CRITICAL nunca admite override" explícita.
- RF-02: ✅ Acta `reports/<feature>-archive.md` con las 7 secciones fijas en orden (Metadata, Specs Consolidados, Contenidos del ciclo, Source of Truth, Reconciliaciones, Verificación, Veredicto ARCHIVED/BLOCKED/PARTIAL-INTENCIONAL) en skill + plantilla `references/report-format.md`. Veredictos cerrados y deterministas.
- RF-03: ✅ Conciliación baseline v1→vN por documento + CRs (tipo + estado) + ADRs, jerarquía Final-State Authority (tasks persistido > hechos finales launch > snapshots verify/review), contradicciones con ambas fuentes y fechas, sin fusión causal sin evidencia.
- RF-04: ✅ Opción A por defecto: sin mover/renombrar/borrar `specs/<feature>/`; acta declara "sin movimiento"; rutas PR estables.
- RF-05: ✅ Movimiento excepcional solo con autorización humana explícita, mecánico vía shell (`mv`/`git mv`/`cp -R`), `diff -r` obligatorio verbatim ejecutado por `archive` vía bash; vacío = único pass, faltante/con diff = FAIL/BLOCKED; sin shell → BLOCKED. Sin `sdd-archive-compose`, sin Read→Write.
- RF-06: ✅ Colisión → STOP/BLOCKED, sin sufijos/overwrites/renombres silenciosos, resolución manual humana.
- RF-07: ✅ Orden `... Verify → Reviewer → Security (condicional) → Archive (agente archive, acta) → push/PR (scm) → merge humano → done + current.md` en `.opencode/AGENTS.md`, `shared/AGENTS.md` y skill `scm` (§ Cierre). Leader invoca `archive`; `scm` no ejecuta Archive; ni `archive` ni `scm` marcan `done`; `done`/`current.md` solo tras acta + merge humano.
- RF-08: ✅ Gates degradados Quick (Review APRUEBA + cero CRITICAL + tasks 100% + CRs no-Corrección, registro "Quick: sin verify-report", nunca inventar PASS de Verify).
- RF-09: ✅ Stale solo con prueba citada del reporte final + motivo; CRITICAL sin reconciliación; partial solo como `PARTIAL-INTENCIONAL` con faltantes + motivo + aprobación; faltantes sin declaración = BLOCKED.
- RF-10: ✅ Agente dedicado `.opencode/agents/archive.md` (`mode: subagent`, read `*`, edit `reports/**`, bash) + skill `.opencode/skills/archive/`; único output `reports/<feature>-archive.md`; prohibiciones (commitear/pushear/abrir PR/mergear, `done`/`current.md`, editar specs o fuera de `reports/`, auto-resolver colisiones).

### Cobertura de criterios de aceptación
- AC-01 (RF-01/RF-02): ✅ Gates + acta ARCHIVED con 7 secciones.
- AC-02 (RF-03): ✅ Tabla v1→vN + CRs tipo/estado + ADRs + jerarquía + contradicciones.
- AC-03 (RF-04/RNF-05): ✅ "sin movimiento", `specs/<feature>/` intacto, links PR estables.
- AC-04 (RF-05/RNF-04): ✅ Comando shell + `diff -r` verbatim; diff no vacío/faltante → BLOCKED.
- AC-05 (RF-06): ✅ Colisión → BLOCKED sin sufijos/sobrescritura.
- AC-06 (RF-07): ✅ Orden/roles/done-tras-merge; `scm` no ejecuta Archive.
- AC-07 (RF-08): ✅ Quick degradado declarado.
- AC-08 (RF-01/RF-09): ✅ Stale probado; CRITICAL/CR sin aprobación → BLOCKED, sin override.
- AC-09 (RF-09): ✅ PARTIAL-INTENCIONAL declarado; si no, BLOCKED.
- AC-10 (RNF-01/02/03): ✅ Sin `sdd-archive-compose`, sin Engram/MCP/observation IDs, sin main-specs por dominio, sin cambios en `.claude/`/`.gemini/`.
- AC-11 (RF-10): ✅ Agente + skill con permisos/prohibiciones; test TASK-04 lo verifica.
- Trazabilidad: cada RF-01..RF-10 tiene test covering en `tests/template-hardening/archive-phase.test.mjs` (13/13 PASS, ver Pasada 2).

### Tareas completadas
- TASK-01 (gates/veredictos): ✅ [x] en `specs/sdd-archive-phase/tasks.md`; implementado en skill § Gates.
- TASK-02 (plantilla acta): ✅ [x]; skill § Acta + `references/report-format.md` con 7 secciones y veredictos cerrados.
- TASK-03 (inmutabilidad/movimiento/colisiones): ✅ [x]; Opción A + `diff -r` + colisión en skill.
- TASK-04 (agente + skill Opción C): ✅ [x]; `.opencode/agents/archive.md` + `.opencode/skills/archive/SKILL.md` existen con contrato RF-10.
- TASK-05 (orden/roles/AGENTS/instaladores): ✅ [x]; tablas y pipeline en ambos AGENTS, § Cierre en skill `scm` (acta en body PR, `scm` no ejecuta Archive), `init-sdd.ps1`/`init-sdd.sh` verifican agente+skill solo en flujo opencode.
- TASK-06 (verificación baseline v2): ✅ [x]; RF-10/AC-11 presentes, design pregunta 5 = Opción C, ADR-001 con enmienda v2, sin binarios/Engram/carpetas archive.
- 100% tasks `[x]` (6/6). Sin stale ni partial que reconciliar en esta feature.

## Pasada 2: Calidad
### Métricas (del preflight)
- Preflight no configurado — revisión manual (no existe `reports/sdd-archive-phase-preflight.md`; no hay CRAP/mutation automatizados para el diff).
- Tests: 13/13 PASS (`node --test tests/template-hardening/archive-phase.test.mjs`, 2026-09-07).
- Alcance: la suite cubre los 6 tasks (gates, acta, inmutabilidad, agente, orden/instaladores, consistencia v2) con asserts positivos y negativos (ausencia de binario/Engram/Read→Write, `.claude/`/`.gemini` intactos).

### ADRs respetados
- ADR-001 (acta sin movimiento, Opción A) + enmienda v2 (ejecutor agente `archive`, Opción C): ✅ respetados. Skill/agente/AGENTS/scm no introducen `sdd-archive-compose`, Engram, main-specs por dominio ni carpeta archive por defecto; movimiento solo excepcional mecánico + `diff -r` + colisión estricta.
- Research `sdd-archive-phase-findings.md` preguntas 1–8: ✅ respondidas en `design.md`; pregunta 5 = Opción C como fija la baseline v2.
- `architecture/architecture.md`: sin contradicción (describe instalador + flujo genérico; la extensión Archive va por ADR-001, no reescribe requisitos no mencionados).

### Architecture drift
Sin drift (`architecture_drift: false`). No se emite ADR. Nota: `architecture.md` no menciona la fase Archive (documento previo a la feature), pero el diff no lo contradice: añade convención de pipeline solo-opencode con ADR-001 que lo ampara. A futuro, si el flujo Full se consolida, `architecture_builder` podrá sincronizar el diagrama.

### Observaciones de calidad
- Naming/patrones: ✅ consistentes (`archive` agente+skill, `reports/<feature>-archive.md`, veredictos `ARCHIVED|BLOCKED|PARTIAL-INTENCIONAL`, jerarquía Final-State Authority).
- Separación de responsabilidades: ✅ `archive` (acta) vs `scm` (push/PR) vs Leader (`done`/`current.md` tras merge humano) delimitada en los tres documentos (skill archive, skill scm, ambos AGENTS).
- Instaladores: ✅ `init-sdd.ps1` (líneas 234–245) e `init-sdd.sh` (líneas 219–220) solo verifican `.opencode/agents/archive.md` + `.opencode/skills/archive/SKILL.md` en flujo opencode/all; sin toques a `.claude`/`.gemini` (verificado por asserts negativos del test + `git diff --name-only` sin `.claude`/`.gemini`).
- Delimitación P2 verificada: sin binarios (`specs/archive` no existe, sin `sdd-archive-compose`), sin Engram/MCP/observation IDs, `.claude/`/`.gemini` intactos.
- Observación menor (no bloqueante): el frontmatter de `.opencode/agents/archive.md` otorga `bash: *`; la restricción "bash exclusivamente para `diff -r`/movimiento excepcional" vive en la skill, no en el frontmatter (límite expresivo del formato, mismo patrón que otros agentes). Aceptable: el test TASK-04 fija este shape.
- Ruido de workspace (no atribuible a esta feature): `git status` muestra cambios de features paralelas (`implementer/SKILL.md` de FIX-12, `propose`/`verify`, otros specs/reports). El cambio de `implementer/SKILL.md` es ajeno al área `pipeline` de esta spec y no interfiere con el veredicto; se deja constancia para que el Leader lo concilie por feature.

## Veredicto
APRUEBA
