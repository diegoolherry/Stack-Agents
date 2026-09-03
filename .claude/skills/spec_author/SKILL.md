---
name: spec-author
description: Skill para el subagente Spec Author del workflow SDD. Redacta requirements.md, design.md y tasks.md para una feature. Usa esta skill siempre que el Leader necesite especificaciones técnicas formales a partir de los hallazgos del Researcher.
tools_required: read-write
---

### Rol
Redactar especificaciones técnicas formales para una feature. Produce tres documentos que se convierten en la baseline aprobada del proyecto.

### Inputs que recibe del Leader
- Hallazgos del Researcher: `research/<feature>/<feature>-findings.md`
- ADRs relevantes filtrados por el Leader (de `architecture/decisions/`)
- `architecture/architecture.md`
- Descripción de la feature

### Proceso
1. Leer `architecture/architecture.md` para entender el contexto del proyecto
2. Leer los ADRs proporcionados — respetar las decisiones ya tomadas
3. Leer el findings del Researcher — usarlo como base factual
4. Redactar `requirements.md` siguiendo el template (ver abajo)
5. Redactar `design.md` siguiendo el template (ver abajo)
6. Redactar `tasks.md` siguiendo el template (ver abajo)
7. Si durante la redacción toma una decisión arquitectónica significativa, emitir un ADR en `architecture/decisions/ADR-NNN.md`

### Outputs
- `specs/<feature>/requirements.md`
- `specs/<feature>/design.md`
- `specs/<feature>/tasks.md`
- (Opcional) `architecture/decisions/ADR-NNN.md`

### Templates

**requirements.md:**
```markdown
# Requirements — <feature-name>

Baseline: v1
Feature: <feature-id>

## Descripción general
<qué hace esta feature y por qué es necesaria>

## Requisitos Funcionales

- **RF-01**: <descripción del requisito>
- **RF-02**: <descripción del requisito>
...

## Requisitos No Funcionales

- **RNF-01**: <descripción> (ej. performance, seguridad, accesibilidad)
...

## Criterios de Aceptación

- [ ] AC-01: <criterio verificable que mapea a RF-XX>
- [ ] AC-02: <criterio verificable>
...

## Fuera de Alcance
<!-- Listar explícitamente lo que esta feature NO cubre -->
- <cosa que no se incluye y por qué>
```

**design.md:**
```markdown
# Design — <feature-name>

Baseline: v1
Feature: <feature-id>

## Componentes afectados
<!-- Módulos/archivos que se crean o modifican -->
- <componente>: <qué se hace y por qué>

## Interfaces y contratos
<!-- APIs, funciones públicas, eventos, mensajes -->

### <nombre de la interfaz>
- Input: <tipo y descripción>
- Output: <tipo y descripción>
- Errores: <casos de error>

## Modelo de datos
<!-- Si aplica: entidades, schemas, migraciones -->

## Flujo principal
<!-- Diagrama de secuencia o flujo — usar mermaid si aporta claridad -->

## Dependencias
<!-- Módulos internos y paquetes externos afectados -->
- <dependencia>: <motivo>

## ADRs referenciados
<!-- Decisiones arquitectónicas que aplican a este diseño -->
- ADR-NNN: <título> — <cómo impacta este diseño>
```

**tasks.md:**
```markdown
# Tasks — <feature-name>

Baseline: v1
Feature: <feature-id>

## Tareas

### Task 1: <título>
- [ ] TASK-01: <descripción>
área: <auth | productos | pedidos | reportes | ...>
RF relacionado: RF-XX

### Task 2: <título>
- [ ] TASK-02: <descripción>
área: <auth | productos | pedidos | reportes | ...>
RF relacionado: RF-XX, RF-YY
```

**ADR (si aplica):**
```markdown
# ADR-NNN: <título>

## Estado
Aceptado

## Contexto
<por qué se necesita esta decisión>

## Decisión
<qué se decidió>

## Alternativas consideradas
<qué otras opciones había>

## Consecuencias
<impacto de la decisión>

## Feature relacionada
<feature-id>
```

### Reglas
- NO escribir código
- NO tocar archivos fuera de `specs/` y `architecture/decisions/`
- Respetar decisiones de ADRs existentes — no contradecirlas sin emitir un nuevo ADR
- Los specs se congelan como BASELINE v1 tras aprobación humana — solo se modifican via Change Request
- Cada task DEBE tener un campo `área`. Tasks que modifican los mismos archivos o que tienen una dependencia directa entre sí (una task necesita que otra esté terminada) DEBEN compartir la misma área — el área es la unidad de paralelismo, no una categoría cosmética.
- Si una feature es chica y no tiene sentido dividirla, usar una sola área para todas las tasks (el pipeline se comporta como hoy: 1 implementer).
- Si la feature incluye interfaz de usuario, leer .claude/skills/ux-ui/SKILL.md y agregar los ítems del checklist que apliquen como criterios de aceptación en requirements.md
- Devolver al Leader SOLO las rutas de los archivos generados
