# Tasks — sdd-archive-phase

Baseline: v2
Feature: sdd-archive-phase

## Tareas

> Todas las tasks comparten área `pipeline`: modifican los mismos archivos de convención (`.opencode/AGENTS.md`, `shared/AGENTS.md`, `.opencode/agents/archive.md`, `.opencode/skills/archive/`, instaladores, plantilla del acta) y tienen dependencia directa de orden (agente+skill → gates/acta → orden/roles). Feature chica sin paralelismo: un solo Implementer. Se mantienen las áreas de v1 sin cambios; solo se agregan/ajustan tasks para el ejecutor `archive` (Opción C). El modelo Opción A (inmutable, sin movimiento por defecto) no cambia.

### Task 1: Gates bloqueantes y veredictos

- [x] **TASK-01**: Documentar los gates bloqueantes de Archive (Verify PASS, Review APRUEBA última vuelta, cero CRITICAL, tasks 100% en persistido, CRs no-Corrección aprobados) con la matriz PASS/BLOCKED y la regla "CRITICAL nunca con override". Incluir gates degradados Quick (sin verify-report, con declaración explícita) y la regla stale-solo-con-prueba y partial-solo-declarado. (Sin cambios v1→v2.)
área: pipeline
RF relacionado: RF-01, RF-08, RF-09

### Task 2: Plantilla del acta de cierre

- [x] **TASK-02**: Crear la plantilla y el contrato del acta `reports/<feature>-archive.md` con sus 7 secciones fijas (Metadata, Specs Consolidados, Contenidos, Source of Truth, Reconciliaciones, Verificación, Veredicto ARCHIVED/BLOCKED/PARTIAL-INTENCIONAL) y la jerarquía Final-State Authority con registro de contradicciones con ambas fuentes y fechas. (Sin cambios v1→v2 salvo que el redactor es el agente `archive`.)
área: pipeline
RF relacionado: RF-02, RF-03

### Task 3: Inmutabilidad, movimiento excepcional y colisiones

- [x] **TASK-03**: Fijar la regla Opción A (specs/<feature>/ inmutable, "sin movimiento" por defecto, rutas estables para la PR) y el contrato condicional de movimiento excepcional: solo con autorización humana, solo shell mecánico (nunca Read→Write, nunca sdd-archive-compose), `diff -r` verbatim obligatorio en el acta ejecutado por el agente `archive` vía bash, y regla de colisión (STOP sin sufijos/overwrites, resolución manual). (Cambio v1→v2: solo el ejecutor del `diff -r`/movimiento.)
área: pipeline
RF relacionado: RF-04, RF-05, RF-06

### Task 4: Agente dedicado `archive` + skill (Opción C)

- [x] **TASK-04**: Crear `.opencode/agents/archive.md` y `.opencode/skills/archive/SKILL.md` (solo opencode) con el contrato del RF-10: único output escribible `reports/<feature>-archive.md`; permisos de lectura amplia + edición limitada a `reports/**` + bash solo para `diff -r`/movimiento mecánico excepcional; prohibiciones de commitear/pushear/abrir PR/mergear, marcar `done` o tocar `progress/current.md`, editar specs o archivos fuera de `reports/`, y auto-resolver colisiones. El agente valida gates, redacta el acta y retorna ruta + veredicto.
área: pipeline
RF relacionado: RF-10

### Task 5: Orden del pipeline, roles, AGENTS e instaladores

- [x] **TASK-05**: Registrar el agente `archive` en la tabla de subagentes de `.opencode/AGENTS.md` y `shared/AGENTS.md` e insertar el paso Archive con el orden `... Verify → Reviewer → Security (condicional) → Archive (agente archive, acta) → push/PR (scm) → merge humano → done + current.md`; aclarar que el Leader invoca a `archive`, que `archive`/`scm` no marcan `done`, que `scm` no ejecuta Archive, y que done/current.md van solo tras acta + merge humano. Extender `init-sdd.ps1`/`init-sdd.sh` para distribuir `.opencode/agents/archive.md` + `.opencode/skills/archive/` solo en el flujo opencode (sin tocar `.claude/`/`.gemini/` ni código de producto). Registrar alcance solo-opencode (sin binario, sin Engram).
área: pipeline
RF relacionado: RF-07, RF-10

### Task 6: Verificación integrada de la baseline v2

- [x] **TASK-06**: Verificar de extremo a extremo que la baseline v2 es consistente: cada RF (incluido el nuevo RF-10) tiene AC que lo cubre, la pregunta 5 queda respondida como Opción C en design.md, las rutas del acta y de la PR son estables, no se introducen binarios/Engram/carpetas archive, el modelo Opción A sigue intacto (solo cambió el ejecutor), y el ADR-001 con su enmienda v2 acompaña la decisión. Registrar comandos y resultados en el reporte de cambio de la feature.
área: pipeline
RF relacionado: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10
