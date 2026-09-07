# Formato del acta Archive

Acta obligatoria `reports/<feature>-archive.md` (Markdown con secciones fijas en este orden, verificable por convencion). Sin fence YAML inicial. Solo emite acta: nunca mueve `specs/<feature>/` salvo excepcion autorizada con `diff -r` verbatim.

```markdown
# Archive — <feature-name>

## Metadata
feature: <feature-id> | mode: <full/quick> | baseline: <vN por documento> | fechas: <cierre>
Verify: <PASS | PASS WITH WARNINGS | FAIL | no-aplica-Quick> | Review: <APRUEBA | RECHAZA> | Security: <veredicto o no-aplica>

## Specs Consolidados
| Documento | v1 | vN | CRs aplicados |
|---|---|---|---|
| requirements.md | <v1> | <vN> | <tipos + estados o "ninguno"> |
| design.md | <v1> | <vN> | <tipos + estados o "ninguno"> |
| tasks.md | <v1> | <vN> | <tipos + estados o "ninguno"> |

## Contenidos del ciclo
Specs: <rutas> | CRs: <lista tipo + estado> | Reports: <verify/review/security> | ADRs: <referencias>

## Source of Truth
specs/<feature>/ inmutable, sin movimiento. Rutas estables para la PR: <specs/<feature>/... + reports/...>

## Reconciliaciones
Stale: <prueba citada + motivo o "ninguna"> | Partial intencional: <faltantes + motivo + aprobacion o "no aplica">

## Verificación
| Gate | Resultado | Evidencia |
|---|---|---|
Verify PASS | ✅/❌ | <ruta reporte + cita> |
Review APRUEBA | ✅/❌ | <ruta reporte + cita> |
cero CRITICAL | ✅/❌ | <ruta reporte + cita> |
tasks 100% | ✅/❌ | <tasks.md persistido> |
CRs aprobados | ✅/❌ | <lista CRs> |
Movimiento: <"sin movimiento — diff no aplica" o comando shell + salida `diff -r` verbatim completa>

## Veredicto
ARCHIVED | BLOCKED | PARTIAL-INTENCIONAL (+ motivos numerados y accionables si BLOCKED)
```

Veredictos cerrados: `ARCHIVED | BLOCKED | PARTIAL-INTENCIONAL`. Regla determinista: `BLOCKED` si ≥1 gate incumplido, `diff -r` no vacío/faltante, colisión de destino, o faltantes sin declaración; `PARTIAL-INTENCIONAL` solo con faltantes + motivo + aprobación declarados; `ARCHIVED` en caso contrario. Contradicciones entre fuentes: registrar ambas con fechas según jerarquía Final-State Authority (tasks persistido > hechos finales del launch > snapshots verify/review).
