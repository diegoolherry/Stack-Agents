# Reporte de re-integración — sdd-onboard-flow (fixes)

Fecha: 2026-09-07 (UTC)
Rama de integración: `feature/sdd-onboard-flow`
Worktree de integración: `D:\ProyectosPersonales\wt-sdd-onboard-flow`
Subagente: scm — re-integración tras fixes (previo al Reviewer)
Predecesor: `reports/sdd-onboard-flow-integration.md` (suite en rojo 24/27, no avanzó a Reviewer)

## 1. Worktrees mergeados (2, ramas actualizadas con fixes)

| # | Worktree | Rama de área | Commits nuevos de fix | Contenido del fix |
|---|----------|--------------|----------------------|-------------------|
| 1 | `D:\ProyectosPersonales\wt-sdd-onboard-flow-onboarding` | `feature/sdd-onboard-flow-onboarding` | `f3035d6` `fix(sdd-onboard-flow): TASK-03 instaladores intactos acotado a pre-merge (verde en rama y tras merge)` | Test `TASK-03: instaladores intactos` acotado a pre-merge (solo válido en rama de área; tras el merge los instaladores contienen legítimamente `onboard` por TASK-04) |
| 2 | `D:\ProyectosPersonales\wt-sdd-onboard-flow-plantilla` | `feature/sdd-onboard-flow-plantilla` | `d15b5b2` `fix(sdd-onboard-flow): AC-14 sin-seed borra fuentes onboard del fixture (verde pre y post merge)` | Helper `removeOnboardSources`: los casos AC-14 "sin seed" borran las fuentes onboard del fixture en vez de asumir su ausencia (tras el merge las fuentes están commiteadas en el árbol) |

Base común de ambas áreas: `65c44e5`. Integración previa documentada en `reports/sdd-onboard-flow-integration.md`
(`39738a1` merge onboarding, `1ad6afa` merge plantilla, `457bec6` CR-001 aplicada, `05def45` reporte en rojo).

## 2. Merges a `feature/sdd-onboard-flow` (orden de terminación original)

1. `f2b0c65` `merge(sdd-onboard-flow): re-integra fix onboarding f3035d6 test acotado pre-merge` — merge `--no-ff` de
   `feature/sdd-onboard-flow-onboarding`. Resultado: **limpio, sin conflictos** (1 archivo:
   `tests/sdd-onboard-flow/onboard-flow.test.mjs`, +5/−1).
2. `409fc1c` `merge(sdd-onboard-flow): re-integra fix plantilla d15b5b2 helper removeOnboardSources` — merge `--no-ff` de
   `feature/sdd-onboard-flow-plantilla`. Resultado: **limpio, sin conflictos** (1 archivo:
   `tests/sdd-onboard-flow/onboard-installer.test.mjs`, +10/−1).

## 3. Conflictos resueltos

**Ninguno.** Ambos merges aplicaron estrategia `ort` sin marcadores; tocan archivos de test disjuntos
(`onboard-flow.test.mjs` vs `onboard-installer.test.mjs`). Sin resolución manual ni silenciosa.

## 4. Resultado de la suite completa (tras la re-integración, sobre `wt-sdd-onboard-flow`)

### 4.1 `test:template-hardening` — VERDE
`tests 17, pass 17, fail 0` (sin cambios respecto a la integración previa; CR-001 sigue verde).

### 4.2 `test:sdd-onboard-flow` — VERDE
`tests 27, pass 27, fail 0` (`onboard-flow.test.mjs` 10/10, `onboard-installer.test.mjs` 5/5,
`onboard-dry-run.test.mjs` 12/12). Los 3 fallos documentados en el reporte predecesor (§5.2, fallos 1–3)
quedan cerrados por `f3035d6` (fallo 1) y `d15b5b2` (fallos 2–3).

## 5. Veredicto scm

- Merge: OK (2/2 worktrees re-integrados, 0 conflictos).
- Suite completa: **VERDE (27/27 en sdd-onboard-flow; 17/17 en template-hardening)**.
- **Se avanza al Reviewer.** El árbol queda listo con `git status` limpio (este reporte commiteado en la rama
  del feature, igual que el predecesor, para no romper el test `seco reversibilidad` en re-ejecuciones).
- Worktrees de área **conservados** (no borrados): el borrado corresponde al cierre del feature (merge a `main`
  vía PR humana), no a este paso.

## 6. Trazabilidad

- Grafo: `65c44e5` (base) ← `1499471`/`5f8d7af` (áreas) ← `39738a1`/`1ad6afa` (integración 1) ← `457bec6`/`05def45`
  (CR-001 + reporte rojo) ← `f3035d6`/`d15b5b2` (fixes en áreas) ← `f2b0c65`/`409fc1c` (re-integración).
