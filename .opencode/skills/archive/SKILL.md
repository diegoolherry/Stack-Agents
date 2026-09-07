---
name: archive
description: Skill para el subagente archive del workflow SDD. Cierre de ciclo en modo full: valida gates bloqueantes y redacta el acta reports/<feature>-archive.md sin mover specs. Usa esta skill siempre que el Leader necesite cerrar una feature con acta auditable antes del push/PR de scm.
tools_required: read-write
---

### Rol
Ejecutar la fase Archive como acta sin movimiento (Opción A del research, ADR-001): validar los gates bloqueantes de entrada y redactar el acta de cierre `reports/<feature>-archive.md`. El único ejecutor es el agente dedicado `archive` (Opción C), invocado por el Leader. Archive concilia la baseline vigente (v1→vN) + CRs + ADRs, nunca edita specs y nunca autoriza el delivery (el merge lo hace el humano).

### Inputs que recibe del Leader
- Feature-id + modo (`full` | `quick`).
- `specs/<feature>/requirements.md`, `design.md`, `tasks.md` persistido (baseline vigente vN, solo lectura).
- `changes/<feature>/**/CR-NNN.md` (tipo + estado de cada CR).
- `reports/<feature>-verify.md` (+ `-review.md`, `-security.md` si existen; en Quick no hay verify-report).
- ADRs de `architecture/decisions/`, `feature_list.json`, `progress/` (solo lectura para conciliar).
- Autorización humana explícita documentada, solo si aplica movimiento excepcional (RF-05).

### Gates de Archive (contrato de entrada, TASK-01)

| Gate | Condición PASS | Si falla |
|---|---|---|
| Verify PASS | `reports/<feature>-verify.md` con veredicto `PASS` o `PASS WITH WARNINGS` (modo full) | BLOCKED |
| Review APRUEBA | Review APRUEBA en la última vuelta | BLOCKED |
| cero CRITICAL | Cero hallazgos CRITICAL pendientes en verify/review/security | BLOCKED |
| tasks 100% | 100% de tasks marcadas `[x]` en `specs/<feature>/tasks.md` persistido | BLOCKED |
| CRs aprobados | Todos los CRs Adaptativos/Perfectivos/Preventivos aprobados (los de tipo Corrección avanzan solos pero deben estar registrados) | BLOCKED |

Reglas de veredicto:
- Matriz cerrada: gates cumplidos → acta `ARCHIVED` (o `PARTIAL-INTENCIONAL` declarado); cualquier gate incumplido → acta `BLOCKED` con motivos numerados y accionables, sin avance al push/PR.
- CRITICAL nunca admite override ni reconciliación: un CRITICAL pendiente produce BLOCKED siempre.
- Gates degradados en modo Quick (sin verify-report): se exige Review APRUEBA + cero CRITICAL en review + tasks 100% + CRs no-Corrección aprobados, y el acta registra "Quick: sin verify-report, gates degradados". Nunca se inventa un PASS de Verify.
- Reconciliación stale-solo-con-prueba: un checkbox stale solo se reconcilia con prueba citada del reporte final (verify-report o review-report) que demuestre el trabajo hecho, más motivo registrado en el acta.
- Partial-solo-declarado: artefactos faltantes a propósito solo se admiten con veredicto `PARTIAL-INTENCIONAL`, lista exacta de faltantes, motivo y aprobación humana; sin esa declaración, faltantes = BLOCKED.

### Acta `reports/<feature>-archive.md` (contrato, TASK-02)

El acta declara el estado AL CIERRE y tiene 7 secciones fijas, en este orden (plantilla en `references/report-format.md`):
1. `Metadata` — feature, mode (full/quick), baseline vigente por documento, fechas, veredictos Verify/Review/Security.
2. `Specs Consolidados` — tabla documento | v1 | vN | CRs aplicados.
3. `Contenidos del ciclo` — inventario de specs, CRs (tipo + estado), reports, ADRs.
4. `Source of Truth` — declaración "specs/<feature>/ inmutable, sin movimiento" + rutas estables para la PR.
5. `Reconciliaciones` — stale checkboxes (prueba + motivo) o "ninguna"; partial intencional (faltantes + motivo + aprobación) o "no aplica".
6. `Verificación` — checklist de gates (cada gate ✅/❌ con evidencia) + bloque `diff -r` verbatim si hubo movimiento excepcional, o "sin movimiento — diff no aplica".
7. `Veredicto` — `ARCHIVED` | `BLOCKED` (con motivos) | `PARTIAL-INTENCIONAL`.

Jerarquía Final-State Authority para los números finales: 1) `specs/<feature>/tasks.md` persistido, 2) hechos finales explícitos del launch prompt, 3) snapshots verify/review. Ante contradicción entre fuentes, el acta registra ambas fuentes con fechas y elige según jerarquía; nunca resuelve en silencio ni fusiona defectos distintos en una historia causal sin evidencia.

### Inmutabilidad y movimiento excepcional (Opción A, TASK-03)

- Por defecto Archive NO mueve, renombra ni borra `specs/<feature>/` ni ningún artefacto del ciclo: la fuente de verdad sigue siendo `specs/<feature>/` y la historia sigue en `changes/<feature>/` + `reports/` + PR. El acta declara explícitamente "sin movimiento".
- Las rutas referenciadas por el body de la PR (`specs/<feature>/...`, `reports/...`) permanecen estables tras Archive; Archive no rompe links de PR ni la convención de instaladores.
- Movimiento excepcional (solo con autorización humana explícita documentada): copia/movimiento mecánico vía shell (`mv` / `git mv` / `cp -R`, nunca reescritura manual del modelo), seguido de `diff -r` obligatorio ejecutado por el agente `archive` vía tool bash, con salida verbatim completa registrada en el acta. Salida vacía = único pass; salida faltante o con diff = FAIL y veredicto BLOCKED. Sin shell disponible → BLOCKED (sin fallback manual). Nunca composición semántica ni binarios nativos.
- Regla de colisión: ante destino existente, STOP sin sufijos automáticos, sin sobrescrituras y sin renombres silenciosos. Archive se detiene con BLOCKED por colisión y exige resolución manual humana.

### Output
Archivo: `reports/<feature>-archive.md` según `references/report-format.md`. Retornar al Leader únicamente la ruta del acta y el veredicto.

### Reglas
- NUNCA editar `specs/`, `changes/`, `architecture/` ni ningún archivo fuera de `reports/`.
- NUNCA commitear, pushear, abrir/actualizar PR, mergear, marcar `done` ni actualizar `progress/current.md` (eso es de `scm` + Leader + humano).
- NUNCA auto-resolver colisiones ni reconciliar CRITICAL.
- Sin memoria externa ni conectores: el acta es un fichero Markdown en `reports/`, auditable con `git`.
- Devolver al Leader SOLO la ruta del archivo generado.
