# Requirements — sdd-archive-phase

Baseline: v2
Feature: sdd-archive-phase

## Descripción general

La fase SDD Archive (solo opencode, modo full) es el cierre de ciclo del pipeline: valida que la feature terminó en estado verde real y emite un acta de cierre `reports/<feature>-archive.md` antes del Cierre por PR. No fusiona specs semánticos, no mueve `specs/<feature>/`, no commitea/pushea/mergea y no marca `done`. Su valor es conciliar la baseline vigente (v1→vN), los CRs y los ADRs pendientes en un único documento auditable con rutas estables para el body de la PR. Se adopta la **Opción A del research (acta sin movimiento)**: `specs/<feature>/` queda inmutable como audit trail; cualquier copia/movimiento excepcional es mecánico con `diff -r` verbatim y regla de colisión estricta. Respecto a la v1, solo cambia el ejecutor (pregunta abierta 5 resuelta): el acta la redacta el **agente dedicado `archive`** (**Opción C** del research), no el Leader ni `scm`.

## Requisitos Funcionales

- **RF-01**: Archive solo puede emitir acta PASS si se cumplen todas las precondiciones bloqueantes del modo full: Verify PASS (reporte verify correspondiente), Review APRUEBA en la última vuelta, cero hallazgos CRITICAL pendientes en verify/review/security, 100% de tasks marcadas `[x]` en el artefacto persistido `specs/<feature>/tasks.md`, y todos los CRs de tipo Adaptativo/Perfectivo/Preventivo en estado aprobado (los de tipo Corrección avanzan solos pero deben estar registrados).
- **RF-02**: Archive debe emitir el acta obligatoria `reports/<feature>-archive.md` con secciones fijas: Metadata (feature, baseline vigente, fechas, veredictos Verify/Review/Security), Specs Consolidados (tabla baseline v1→vN por documento), Contenidos del ciclo (specs, changes/CRs, reports, ADRs), Source of Truth (rutas estables que no se movieron), Reconciliaciones aplicadas (stale/partial si las hubo, con prueba), Verificación (checklist + salidas `diff -r` si hubo movimiento, o "sin movimiento"), y Veredicto (ARCHIVED / BLOCKED / PARTIAL-INTENCIONAL con motivos).
- **RF-03**: El acta debe conciliar la baseline v1→vN: versión vigente por cada documento (`requirements.md`, `design.md`, `tasks.md`), lista de CRs aplicados con su tipo y estado (Corrección documentada; Adaptativo/Perfectivo/Preventivo solo si aprobados), y ADRs pendientes o emitidos durante el ciclo con su referencia. Si hay contradicción entre fuentes, el acta registra ambas fuentes con fechas y elige números finales según jerarquía (tasks persistido > hechos finales explícitos del launch/prompt > snapshots verify/review), sin resolver en silencio ni fusionar defectos distintos en una historia causal sin evidencia.
- **RF-04**: Por defecto Archive NO mueve, renombra ni borra `specs/<feature>/` ni ningún artefacto del ciclo (Opción A). La fuente de verdad sigue siendo `specs/<feature>/` y la historia sigue en `changes/<feature>/` + `reports/` + PR. El acta debe declarar explícitamente "sin movimiento".
- **RF-05**: Todo movimiento excepcional de artefactos (solo si un humano lo autoriza de forma explícita para un caso documentado) debe ser copia/movimiento mecánico vía shell (`mv` / `git mv` / `cp -R`, nunca Read→Write del modelo) seguido de `diff -r` obligatorio cuya salida verbatim queda registrada en el acta. Salida vacía = único pass; salida faltante o con diff = FAIL y veredicto BLOCKED. Sin shell disponible → BLOCKED (sin fallback manual).
- **RF-06**: Ante colisión de destino en un movimiento excepcional, Archive NO auto-resuelve: prohíbe sufijos automáticos, sobrescrituras y renombres silenciosos. Debe detenerse (BLOCKED), reportar la colisión exacta y exigir resolución manual humana.
- **RF-07**: Orden y roles: Archive corre tras Verify/Reviewer/Security (según pipeline) y antes del push/PR de `scm`. Lo ejecuta el **agente dedicado `archive`** (solo opencode), invocado por el Leader; `scm` solo hace push + apertura de PR tras acta PASS o PARTIAL-INTENCIONAL registrado. Ni `archive` ni `scm` marcan `done`: el Leader actualiza `feature_list.json → done` y `progress/current.md` únicamente después del acta de cierre más el merge humano de la PR (squash, según convención `scm`).
- **RF-08**: En modo Quick (sin fase Verify) Archive aplica gates degradados explícitos: exige Review APRUEBA + cero CRITICAL en review + tasks 100% + CRs no-Corrección aprobados, y registra en el acta "Quick: sin verify-report, gates degradados". No inventa un PASS de Verify.
- **RF-09**: La reconciliación de checkboxes stale solo se permite con prueba en reporte final (verify-report o review-report) que demuestre el trabajo hecho, más registro del motivo en el acta; los CRITICAL nunca admiten override ni reconciliación. El partial archive intencional (artefactos faltantes a propósito) solo se permite si se declara como `PARTIAL-INTENCIONAL` con la lista exacta de faltantes, el motivo y la aprobación humana correspondiente.
- **RF-10**: El agente `archive` es un subagente dedicado solo-opencode definido en `.opencode/agents/archive.md` con su skill en `.opencode/skills/archive/`. Su único output escribible es `reports/<feature>-archive.md`. Permisos: lectura sobre todo el repo (`specs/<feature>/`, `changes/<feature>/`, `reports/`, `architecture/decisions/`, `feature_list.json`, `progress/`, reportes verify/review/security) + edición limitada a `reports/**` + uso de la tool bash exclusivamente para el `diff -r` (y el movimiento mecánico excepcional del RF-05). Prohibiciones: commitear, pushear, abrir PR, mergear, marcar `done` / actualizar `progress/current.md`, editar specs o cualquier archivo fuera de `reports/`, y auto-resolver colisiones.

## Requisitos No Funcionales

- **RNF-01**: Alcance solo-opencode: la fase vive en `.opencode/` (`AGENTS.md`, `agents/archive.md`, `skills/archive/`) y `shared/AGENTS.md`; no toca `.claude/` ni `.gemini/` ni código de producto. La distribución del nuevo agente viaja por `init-sdd.ps1`/`init-sdd.sh` solo para opencode.
- **RNF-02**: Sin binario `sdd-archive-compose` ni composición semántica por secciones (ADDED/MODIFIED/REMOVED/RENAMED): no portable sin ese nativo y sin main-specs por dominio. Prohibido inventar un segundo sistema de specs rival de `specs/<feature>/`.
- **RNF-03**: Sin Engram/MCP ni observation IDs: el acta es un fichero Markdown en `reports/`, auditable con `git` y referenciable desde el body de la PR.
- **RNF-04**: Toda salida `diff -r` registrada en el acta debe ser verbatim y completa; el acta nunca resume un diff como "sin cambios" sin mostrar la salida.
- **RNF-05**: Las rutas referenciadas por el body de la PR (`specs/<feature>/...`, `reports/...`) deben permanecer estables tras Archive; Archive no puede romper links de PR ni la convención de instaladores.
- **RNF-06**: Archive es acta, no gate de merge: no autoriza delivery; la autorización sigue siendo la política del repo más el humano que mergea (criterio Judgment Day/RDD del research).

## Criterios de Aceptación

- [ ] **AC-01**: Con Verify/Review PASS, cero CRITICAL, tasks 100% y CRs aprobados, Archive emite `reports/<feature>-archive.md` con todas las secciones de RF-02 y veredicto ARCHIVED. (RF-01, RF-02)
- [ ] **AC-02**: El acta contiene la tabla de reconciliación baseline v1→vN por documento más la lista de CRs (tipo + estado) y ADRs, con jerarquía de fuentes aplicada y contradicciones registradas con ambas fuentes y fechas. (RF-03)
- [ ] **AC-03**: Tras Archive, `specs/<feature>/` no fue movido/renombrado/borrado y el acta declara "sin movimiento"; los links del body de PR a `specs/<feature>/` y `reports/` siguen válidos. (RF-04, RNF-05)
- [ ] **AC-04**: Si hay movimiento excepcional autorizado, el acta incluye el comando shell usado y la salida `diff -r` verbatim; con diff no vacío o faltante el veredicto es BLOCKED. (RF-05, RNF-04)
- [ ] **AC-05**: Ante destino existente en movimiento excepcional, Archive se detiene con BLOCKED por colisión sin crear sufijos ni sobrescribir. (RF-06)
- [ ] **AC-06**: El pipeline documentado ordena `... Verify → Reviewer → Security (si aplica) → Archive (agente archive, acta) → push/PR (scm) → merge humano → done + current.md`; el Leader orquesta, `scm` no ejecuta Archive, `archive` no pushea ni marca `done`, y `done`/`current.md` van solo tras acta + merge humano. (RF-07)
- [ ] **AC-07**: En modo Quick el acta registra gates degradados sin verify-report y exige Review APRUEBA + cero CRITICAL + tasks 100%. (RF-08)
- [ ] **AC-08**: Un checkbox stale solo se reconcilia con prueba citada del reporte final y motivo registrado; un CRITICAL pendiente o un CR Adaptativo sin aprobación produce BLOCKED, nunca PASS por override. (RF-01, RF-09)
- [ ] **AC-09**: Un partial intencional queda marcado `PARTIAL-INTENCIONAL` con faltantes, motivo y aprobación; sin esa declaración, artefactos faltantes producen BLOCKED. (RF-09)
- [ ] **AC-10**: La especificación no introduce binario `sdd-archive-compose`, Engram/MCP, main-specs por dominio ni cambios en `.claude/`/`.gemini/`. (RNF-01, RNF-02, RNF-03)
- [ ] **AC-11**: Existe el agente dedicado `.opencode/agents/archive.md` con su skill `.opencode/skills/archive/`; su único output escribible es `reports/<feature>-archive.md` (lectura amplia + `reports/**` + bash solo para `diff -r`/movimiento mecánico), y tiene prohibido commitear/pushear/mergear/abrir PR, marcar `done`, editar specs y auto-resolver colisiones. (RF-10)

## Fuera de Alcance

- Merge semántico de delta-specs en main-specs por dominio (no existen `openspec/specs/{domain}/` en este repo) y binario `sdd-archive-compose`.
- Integración Engram/MCP, observation IDs y modos `engram/hybrid`.
- Mover `specs/<feature>/` a `specs/archive/YYYY-MM-DD-<id>/` (u otra carpeta fechada) como comportamiento por defecto; solo se admite como excepción manual autorizada con copia mecánica + `diff -r` (RF-05/RF-06).
- Commitear, pushear, abrir PR, mergear o marcar `done` / actualizar `progress/current.md` dentro de Archive (responsabilidad de `scm` + Leader + humano según RF-07; prohibido además para `archive` según RF-10).
- Cambios en `.claude/`, `.gemini/` o código de producto; la distribución solo ajusta `init-sdd.ps1`/`init-sdd.sh` para el dotfolder opencode (RNF-01).
- Reabrir debate Strict-vs-OpenSpec más allá de lo fijado: incompletos bloquean salvo stale probado o partial intencional registrado; CRITICAL nunca con override.
