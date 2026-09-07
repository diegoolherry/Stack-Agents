# Reporte de integración — sdd-onboard-flow

Fecha: 2026-09-07 (UTC)
Rama de integración: `feature/sdd-onboard-flow`
Worktree de integración: `D:\ProyectosPersonales\wt-sdd-onboard-flow` (nuevo, creado para el merge)
Subagente: scm — paso de Integración (FIX-12 paso 6 + pipeline, previo al Reviewer)

## 1. Worktrees mergeados (2)

| # | Worktree | Rama de área | Commit de área | Contenido (TASKs) |
|---|----------|--------------|----------------|-------------------|
| 1 | `D:\ProyectosPersonales\wt-sdd-onboard-flow-onboarding` | `feature/sdd-onboard-flow-onboarding` | `1499471` `feat(sdd-onboard-flow): TASK-01..03 skill+agente onboard narrador y hunks AGENTS` | TASK-01 skill `onboard`, TASK-02 agente narrador, TASK-03 hunks `.opencode/AGENTS.md` + `shared/AGENTS.md`, test `onboard-flow.test.mjs` (10 tests) |
| 2 | `D:\ProyectosPersonales\wt-sdd-onboard-flow-plantilla` | `feature/sdd-onboard-flow-plantilla` | `5f8d7af` `feat(sdd-onboard-flow): TASK-04..05 verificacion onboard en instaladores y tests en seco` | TASK-04 verificación onboard en `init-sdd.ps1`/`.sh` + `package.json`, TASK-05 tests `onboard-installer.test.mjs` (5) + `onboard-dry-run.test.mjs` (12), `changes/.../CR-001.md` |

No se omitió ningún worktree: son exactamente los 2 worktrees del feature (`git worktree list` los muestra a ambos).
Las copias de trabajo `specs/sdd-onboard-flow/tasks.md` (checklists por área, con tildes divergentes) se dejaron
a propósito SIN commitear en ambos worktrees: no son contenido canónico (la baseline v1 vive sin commitear en el
principal) y commitearlas habría generado un conflicto espurio entre checklists. El tasks.md canónico queda
pendiente de actualización/commiteo (fuera del alcance scm).

## 2. Merges a `feature/sdd-onboard-flow` (orden de terminación/fundación)

1. `39738a1` `merge(sdd-onboard-flow): integra area onboarding (TASK-01..03)` — merge `--no-ff` de
   `feature/sdd-onboard-flow-onboarding`. Resultado: **limpio, sin conflictos** (5 archivos, +274).
2. `1ad6afa` `merge(sdd-onboard-flow): integra area plantilla (TASK-04..05 + CR-001)` — merge `--no-ff` de
   `feature/sdd-onboard-flow-plantilla`. Resultado: **limpio, sin conflictos** (6 archivos, +360/−1).
3. `457bec6` `docs(sdd-onboard-flow): CR-001 correccion compatible aplicada en integracion` — cambio de
   Estado de CR-001 (ver §4).

## 3. Conflictos resueltos

**Ningún conflicto textual se materializó, verificado explícitamente con git (estrategia `ort`, merges limpios,
sin marcadores).** El conflicto hipotético en `.opencode/AGENTS.md` / `shared/AGENTS.md` entre hunks de ambas
áreas NO ocurrió porque las áreas tocaron archivos disjuntos: onboarding modificó únicamente
`.opencode/AGENTS.md` + `shared/AGENTS.md`; plantilla modificó únicamente `init-sdd.ps1`, `init-sdd.sh` y
`package.json`. No hubo resolución silenciosa: no había nada que resolver. Los tests sí colisionan en
*semántica* (no en texto): ver §5, fallos 1–3.

## 4. Estado del CR-001 (Corrección en plantilla)

- Tipo declarado: **Corrección**, sin cambio de baseline (nota de coordinación entre áreas). **Verificado scm:**
  el archivo solo documenta el efecto de orden, no altera baseline, no toca tests de `template-hardening`
  (feature cerrada) y los tests propios auto-siembran su fixture. Clasificación confirmada como corrección
  compatible → **avanza sola, sin freno para aprobación**.
- Estado actualizado en el archivo: `Pendiente` → `Aplicada en integración` (commit `457bec6`).
- Predicción empírica de CR-001 **confirmada**: los rojos transitorios de `template-hardening` en la rama
  plantilla (7 tests de instaladores — CR-001 estimaba "2 + equivalentes Bash"; el conteo real es 7, todos con
  la misma causa raíz: `[X] Faltante: .opencode/agents/onboard.md` en el fixture sin fuentes onboard) **volvieron
  a verde tras el merge**: `tests 17, pass 17, fail 0` sobre la rama integrada. Control: en el worktree onboarding
  (instaladores intactos) la misma suite daba 17/17 antes del merge, lo que aísla la causa en el cambio de
  plantilla + ausencia de fuentes, tal como describe CR-001.

## 5. Resultado de la suite completa (tras el merge, sobre `wt-sdd-onboard-flow`)

### 5.1 `test:template-hardening` — VERDE
`tests 17, pass 17, fail 0` (incluye los 7 rojos transitorios de CR-001, ya verdes).

### 5.2 `test:sdd-onboard-flow` — ROJA: `tests 27, pass 24, fail 3`
Desglose: `onboard-flow.test.mjs` 9/10, `onboard-installer.test.mjs` 3/5, `onboard-dry-run.test.mjs` 12/12.
Los 3 fallos, con causa raíz común (**aserciones de aislamiento válidas solo pre-merge**, no defectos de producto):

1. `TASK-03: instaladores intactos (área plantilla)` (test del área onboarding):
   `assert.doesNotMatch(init-sdd.ps1, /onboard/)` → falla con `init-sdd.ps1 es del área plantilla — no tocar`.
   Tras el merge los instaladores contienen legítimamente `onboard` (TASK-04 del área plantilla). El test codifica
   el mundo pre-merge.
2. `PowerShell: verificación falla si faltan agente/skill onboard en la plantilla (AC-14)` (test del área plantilla):
   copia `.opencode/` de la raíz al fixture SIN seed esperando que falten las fuentes
   ("la plantilla aún no trae los archivos onboard"). Tras el merge las fuentes están commiteadas en el árbol →
   el instalador verifica OK (status 0) → `assert.notEqual(status, 0)` falla
   (`la verificación debe fallar si falta el onboard en la plantilla`, expected 0 actual 0).
3. `Bash: verificación falla si faltan agente/skill onboard en la plantilla (AC-14)`: idéntica causa que (2).

Ninguno de los 3 indica regresión funcional: la verificación estricta (AC-14) funciona, la distribución fresca
funciona (tests seed-eados 5/5→3/5 solo por los 2 casos "sin seed"), y el dry-run pasa 12/12 incluido
`seco reversibilidad` y `seco aislamiento` sobre el árbol integrado. Requieren actualización de los tests por los
Implementers de cada área (p. ej. el caso "sin seed" debe borrar las fuentes del fixture en vez de asumir su
ausencia; el test de "instaladores intactos" debe acotarse a la rama de área o eliminarse tras el merge).
**Modificarlos es trabajo de Implementer con cambio de criterio de aceptación: fuera del alcance scm, no se tocó
ningún test en esta integración.**

## 6. Veredicto scm (FIX-12 paso 6 + pipeline)

- Merge: OK (2/2 worktrees integrados, 0 conflictos).
- Suite completa: **ROJA (24/27 en sdd-onboard-flow; 17/17 en template-hardening)**.
- **NO se avanza al Reviewer.** Se reporta el fallo al Leader: 3 tests de alcance de área quedaron obsoletos por
  el propio merge (§5.2, fallos 1–3). Acción propuesta: devolver a los Implementers la actualización de esos 3
  tests y re-correr la suite; con ella en verde, este reporte ya deja el árbol integrado listo para Reviewer.
- CR-001: aplicada (corrección compatible, ver §4).

## 7. Notas de trazabilidad

- Worktrees de área **conservados** (no borrados): ambos contienen su `specs/sdd-onboard-flow/tasks.md` sin
  commitear (checklist por área). El borrado corresponde al cierre del feature (merge a `main` vía PR humana),
  no a este paso.
- Grafo resultante: `65c44e5` (base) ← `1499471` (onboarding) + `5f8d7af` (plantilla) ← `39738a1` (merge 1) ←
  `1ad6afa` (merge 2) ← `457bec6` (CR-001).
- Este reporte se commitea en la rama del feature para mantener `git status` limpio (el test `seco
  reversibilidad` solo admite líneas del área plantilla; un reporte sin commitear lo rompería en re-ejecuciones).
