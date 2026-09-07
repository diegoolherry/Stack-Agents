---
name: propose
description: Skill para el subagente Propose del workflow SDD. Redacta research/<feature>/proposal.md (intent, scope, approach, riesgos, rollback, criterios de éxito y contrato Capabilities) a partir de los findings del Researcher, como gate previo al Spec Author. Usa esta skill siempre que el Leader necesite una propuesta concisa y aprobada antes de escribir specs en modo Full.
tools_required: read-write
---

### Rol
Redactar la proposal de una feature en modo Full a partir de findings existentes. NO re-explorar el codebase. NO re-entrevistar. NO escribir código. NO emitir ADRs. Solo proponer alcance y enfoque.

### Inputs que recibe del Leader
- Change-name (`<feature>` slug kebab-case)
- Hallazgos del Researcher: `research/<feature>/<feature>-findings.md` (obligatorio, no ambiguo)
- `research/project-brief.md` (si aplica)
- `architecture/architecture.md` (contexto)
- Ruta de una proposal previa aprobada, si existe (para actualizarla, no duplicarla)

### Proceso
1. Leer el findings. Si falta o es ambiguo (o el brief falta cuando es necesario) → NO escribir nada e ir a Regla `blocked`.
2. Si existe una proposal previa para la misma feature, leerla y actualizarla en lugar de crear un archivo rival.
3. Leer `architecture/architecture.md` solo como contexto (sin re-explorar el repo).
4. Escribir el output en la ubicación canónica `research/<feature>/proposal.md` siguiendo el template fijo (9 secciones en orden).
5. Verificar concisión (guía: ~450 palabras de cuerpo excluyendo tablas, SHOULD no bloqueante), paths concretos, Rollback Plan y Success Criteria no vacíos, y Capabilities con mapeo a spec files.

### Output
Archivo canónico único: `research/<feature>/proposal.md`

Template fijo (secciones en este orden, sin secciones extra ni layouts rivales):

```markdown
# Proposal — <feature-name>

## 1. Intent
<!-- 1–3 frases: qué y por qué, sin detallar RF -->

## 2. Scope — In
<!-- Bullets observables de lo incluido -->
- ...

## 3. Scope — Out
<!-- No-objetivos explícitos -->
- ...

## 4. Capabilities
<!-- Contrato vinculante hacia el Spec Author -->
| capability | spec file(s) | new/modified/none |
|---|---|---|
| ... | requirements.md / design.md / tasks.md | new |
<!-- Si refactor puro sin spec nuevo: una fila `None` explícita con justificación en Approach -->

## 5. Approach
<!-- Pasos de alto nivel, sin código -->

## 6. Affected Areas
| path | impacto |
|---|---|
| specs/<feature>/... | ... |
| research/<feature>/... | ... |

## 7. Risks
| riesgo | probabilidad | mitigación |
|---|---|---|
| ... | baja/media/alta | ... |

## 8. Rollback Plan
<!-- Obligatorio, no vacío: cómo revertir si el gate o la implementación fallan -->

## 9. Dependencies
<!-- Lista; `none` explícito si no hay -->
- none

## 10. Success Criteria
<!-- Checkboxes verificables, obligatorios -->
- [ ] ...
```

> Nota: `Capabilities` + `Scope In/Out` + `Intent` + `Approach` + `Affected Areas` + `Risks` + `Rollback Plan` + `Dependencies` + `Success Criteria` = las 9 secciones normativas (Scope cuenta como una con In/Out).

### Regla `blocked`
- Ante findings ausente, inexistente o marcado ambiguo (o preguntas pendientes sin resolver): NO crear ni sobrescribir `research/<feature>/proposal.md`. NUNCA sobrescribir una proposal ya aprobada con un `blocked`.
- Retornar al Leader el envelope `blocked` con la lista de `Preguntas pendientes` (qué falta del findings/brief para poder proponer).
- NO re-explorar el codebase, NO re-entrevistar al usuario, NO reparar decisiones: devolver el control al Leader para que re-invoque al Researcher.

### Contrato Capabilities → spec files
- Cada fila `new/modified` DEBE declarar qué archivo(s) de spec crea o actualiza (`requirements.md` / `design.md` / `tasks.md` / ADR opcional vía Spec Author).
- `none` solo se admite con justificación de refactor puro en `Approach` (sin baseline nueva).
- El Spec Author debe rechazar como malformada toda proposal con capabilities sin spec file declarado o con spec files creados sin capability que los respalde.

### Reglas
- Ubicación canónica única: `research/<feature>/proposal.md`. Prohibido `specs/<feature>/proposal.md` u otro layout rival.
- Concisión como guía SHOULD: ~400–450 palabras de cuerpo excluyendo tablas. Sin validador nativo; el control es el gate humano + el Spec Author, que debe rechazar proposals malformadas o no aprobadas.
- Rollback Plan y Success Criteria obligatorios y no vacíos. Paths concretos existentes o a crear (kebab-case, convenciones `specs/<feature>/`, `research/<feature>/`).
- Si hay proposal previa: leerla y actualizarla; no duplicar archivos.
- Sin binarios, sin MCP obligatorio, sin red en runtime. Sin modos de persistencia externos.
- Devolver al Leader SOLO la ruta del archivo generado (`research/<feature>/proposal.md`) o `blocked: <preguntas pendientes>`, sin resumen inline del contenido.
