# Tasks — Flujo SDD Onboard guiado

Baseline: v1
Feature: sdd-onboard-flow

## Tareas

### Task 1: Skill `onboard` — guion 10 fases + criterios + summary

- [ ] TASK-01: Crear `.opencode/skills/onboard/SKILL.md` con guion de 10 fases (F1 Welcome+scan+deteción stack/testing, F2 Explore, F3 Propose P?, F4 Specs, F5 Design, F6 Tasks, F7 Apply TDD por task, F8 Verify P?, F9 Archive P?, F10 Summary), criterios small&safe medibles RF-01 con veredicto criterio-por-criterio, reglas STOP (RF-02), validación de propuesta de usuario (RF-03), pausas obligatorias (elección + post-proposal + pre-Apply), matriz de parametrización Propose/Verify/Archive, template `## Onboarding Complete!`, regla narración 1-3 oraciones, idioma español, y tabla Discovery-vs-Onboard + derivación greenfield.
área: onboarding
RF relacionado: RF-01, RF-02, RF-03, RF-04, RF-09, RF-10, RF-11, RF-12, RF-13, RF-14

### Task 2: Agente narrador `onboard` con permisos mínimos

- [ ] TASK-02: Crear `.opencode/agents/onboard.md` (`mode: subagent`, permisos SOLO `read *`, sin `edit`/`bash`/`subagent`) como coordinador-narrador: narra por rutas, presenta 2-3 opciones, pide aprobaciones, se niega a escribir artefactos/código y pide delegación al agente de fase; referencia a `SKILL.md` de onboard como fuente de verdad.
área: onboarding
RF relacionado: RF-17

### Task 3: Cableado Leader + AGENTS (sin cambios de permisos)

- [ ] TASK-03: Documentar en `.opencode/AGENTS.md` y `shared/AGENTS.md` el Onboard como recorrido guiado del modo Full (no modo nuevo): cuándo usar Discovery vs Onboard, invocación (Leader → narrador `onboard` + agentes reales por fase), rama `feature/onboard-*` obligatoria, prohibiciones (merge auto, marca done, registro demo en `feature_list.json`), y persistencia del summary en `reports/onboard-*.md`. No alterar permisos del Leader ni de agentes de fase.
área: onboarding
RF relacionado: RF-05, RF-06, RF-07, RF-08, RF-15, RF-17, RF-18

### Task 4: Distribución vía instaladores + verificación

- [ ] TASK-04: Actualizar `init-sdd.ps1` e `init-sdd.sh` para incluir `.opencode/agents/onboard.md` y `.opencode/skills/onboard/SKILL.md` en instalaciones frescas (misma mecánica de copia existente, sin binarios/MCP/red); verificar instalación fresca (dry-run o destino temporal) con checklist AC-12/AC-14: skill+agente presentes, sin toques a `.claude/`/`.gemini/`, carpetas `research/`/`specs/`/`reports/`/`changes/`/`progress/`/`scripts/` operativas.
área: plantilla
RF relacionado: RF-16, RF-18

### Task 5: Validación de la baseline (demo en seco, sin código producto)

- [ ] TASK-05: Validar la baseline en seco sin mutar producto: simular el guion sobre una candidata `onboard-demo-*` ya cerrada (p. ej. corpus `template-hardening`) verificando parametrización Propose/Verify/Archive en ambos estados, pausas, template de summary, idioma español, narración ≤3 oraciones, aislamiento (`feature/onboard-*`, sin registro en `feature_list.json`, sin merge, sin `done`) y reversibilidad; corregir skill/AGENTS si la simulación revela desincronización con el pipeline vigente.
área: plantilla
RF relacionado: RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-14, RF-15
