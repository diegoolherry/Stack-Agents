# Formato del reporte Verify

Reporte obligatorio `reports/<feature>-verify.md` (Markdown con secciones fijas en este orden, verificable por convencion). Sin fence YAML inicial. Un solo formato Markdown (variante JSON minimo rechazada).

```markdown
# Verification Report — <feature-name>

## Metadata
feature: <feature-id> | commit: <hash H> | baseline: v<n> | resultado_scm: <pass/no-aplica> | preflight: <presente/ausente>
verify_round: 1 | 2

## Completeness (tasks + CRs)
| Task | Área | Estado | Evidencia |
|---|---|---|---|
CRs considerados: <lista o "ninguno"> — estado global: <complete | blocked>

## Evidencia de runtime
| Comando | Exit code | Hash salida | Alcance |
|---|---|---|---|
<npm test / dotnet test / build / type-check / covering tests puntuales; "reusado de scm/preflight @<hash>" cuando aplique>

## Matriz spec (requisito/escenario → evidencia + test)
| RF/AC | Escenario | Covering test | Resultado runtime | Estado |
|---|---|---|---|---|
Estado por fila: COVERED | UNTESTED | FAILING

## Coherencia con design
| Elemento design | Diff | Estado |
Estado por fila: ALIGNED | DEVIATION (warning) | BREAKING (critical)

## Issues
### CRITICAL
### WARNING
### SUGGESTION
(cada issue: archivo:línea, requisito roto o diseño desviado, fix sugerido sin aplicarlo, test faltante)

## Veredicto
PASS | PASS WITH WARNINGS | FAIL (+ `blocked` cuando aplique por tasks pendientes)

## Trazabilidad de decisiones
<respuestas Q1–Q8 con RF que las implementa>
```

Campos obligatorios por ejecucion de comando: comando exacto, exit code, hash de salida (texto documentado), alcance (suite completa vs covering puntual vs reusado).

Veredictos cerrados: `PASS | PASS WITH WARNINGS | FAIL`. Regla determinista: `FAIL` si ≥1 CRITICAL o `blocked`; `PASS WITH WARNINGS` si 0 CRITICAL y ≥1 WARNING; `PASS` si solo SUGGESTIONs o sin hallazgos.
