# Tasks — sdd-propose-phase

Baseline: v1
Feature: sdd-propose-phase

## Tareas

> Todas las tasks comparten una única área (`pipeline`) porque modifican archivos superpuestos (`.opencode/AGENTS.md`, `shared/AGENTS.md`, dotfolder `.opencode/`) y tienen dependencia secuencial directa (skill → agente → documentación → distribución → verificación). El pipeline se comporta como hoy: 1 implementer.

### Task 1: Crear la skill `propose` (norma de formato y contrato)

- [x] **TASK-01**: Crear `.opencode/skills/propose/SKILL.md` con front matter (`name: propose`), template fijo de 9 secciones + tablas Affected/Risks/Capabilities, regla `blocked` (no re-explorar ante findings ausente/ambiguo), guía de concisión ~450 palabras SHOULD con rollback y success criteria obligatorios, contrato Capabilities→spec files (`None` explícito), regla de actualizar proposal previa en lugar de duplicar, y envelope de retorno solo-rutas. Sin binarios ni MCP.
área: pipeline
RF relacionado: RF-01, RF-04, RF-05, RF-08

### Task 2: Crear el agente ejecutor `propose`

- [x] **TASK-02**: Crear `.opencode/agents/propose.md` con front matter (`mode: subagent`, `read:*`, `edit: research/**`), descripción de ejecutor dedicado SDD, prohibición de escribir fuera de `research/**` y de emitir ADRs, e instrucción de seguir `.opencode/skills/propose/SKILL.md` con output `research/<feature>/proposal.md` o `blocked`.
área: pipeline
RF relacionado: RF-01, RF-04, RF-07

### Task 3: Integrar la fase al pipeline documentado

- [x] **TASK-03**: Actualizar `.opencode/AGENTS.md` (tabla de subagentes + Full Mode `Researcher → [Propose + gate] → Spec Author → [Gate] → Implementer(s) …`) y `shared/AGENTS.md` (tabla de roles + Pipeline Completo pasos 1–2 con gate liviano intermedio + exención Quick + retorno a Researcher ante rechazo) declarando obligatoriedad Full, exención Quick, gate humano bloqueante pre-spec y orquestación del Leader (invocar propose tras Researcher, bifurcar aprobación/rechazo).
área: pipeline
RF relacionado: RF-02, RF-03, RF-06, RF-09

### Task 4: Verificar distribución portable solo-opencode

- [x] **TASK-04**: Verificar que `init-sdd.ps1` e `init-sdd.sh` distribuyen `.opencode/agents/propose.md` y `.opencode/skills/propose/SKILL.md` con la copia recursiva existente (modificar exclusiones solo si las omiten), confirmar que no se exige dependencia nueva ni MCP, y dejar constancia de que `.claude/` y `.gemini/` quedan intactos.
área: pipeline
RF relacionado: RF-07

### Task 5: Verificación integrada de la baseline

- [x] **TASK-05**: Simulación documental end-to-end sobre una feature de prueba en Full (findings→proposal→gate→spec) y en Quick (ausencia de proposal): comprobar AC-01–AC-10 (ubicación canónica, gate bloqueante con retorno a Researcher, exención Quick, `blocked`, contrato Capabilities, documentación, distribución, rollback/success/paths, schema y permisos), sin escribir código de producto.
área: pipeline
RF relacionado: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09
