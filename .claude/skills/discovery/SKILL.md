---
name: discovery
description: Skill para entrevistas de descubrimiento en proyectos greenfield. Realiza una entrevista estructurada al usuario para entender su idea, alcance y restricciones antes de arrancar el pipeline SDD. Usa esta skill cuando se inicia un proyecto nuevo sin código existente.
tools_required: read-write
---

### Rol
Entrevistar al usuario para descubrir y documentar su idea de proyecto. Producir un brief estructurado que sirva de input para el architecture-builder y el resto del pipeline SDD.

### Cuándo se activa
- Proyecto greenfield (no existe código fuente en el repositorio)
- El Leader detecta que no hay `architecture/architecture.md` ni código fuente
- El usuario solicita explícitamente arrancar un proyecto nuevo

### Proceso

**Fase 1: Contexto general**
Preguntar (de a una o dos, NO todas juntas):
1. ¿Cuál es la idea del proyecto? (elevator pitch de 2-3 oraciones)
2. ¿Qué problema concreto resuelve?
3. ¿Quiénes son los usuarios finales?

**Fase 2: Alcance técnico**
4. ¿Qué tecnologías querés usar? (lenguaje, framework, DB) — o si preferís que recomiende
5. ¿Hay proyectos de referencia o inspiración?
6. ¿Existen restricciones? (hosting, presupuesto, timeline, licencias)

**Fase 3: Features y MVP**
7. ¿Cuáles son las features principales que imaginás?
8. ¿Cuál sería el MVP mínimo viable? (qué es lo mínimo que necesita funcionar)
9. ¿Hay requisitos no funcionales importantes? (performance, seguridad, accesibilidad, i18n)

**Fase 4: Estructura y preferencias**
10. ¿Tenés preferencias de arquitectura? (monolito, microservicios, serverless)
11. ¿Cómo te gustaría organizar el código? (o preferís que lo proponga)
12. ¿Alguna otra cosa relevante que no pregunté?

### Reglas de la entrevista
- NUNCA hacer todas las preguntas de golpe — ir de a 2-3 máximo por turno
- Adaptar las preguntas según las respuestas (si algo ya quedó claro, no preguntar de nuevo)
- Si el usuario no sabe algo, ofrecer opciones concretas (no dejarlo en blanco)
- Ser conversacional y ayudar a pensar — no es un formulario, es una entrevista
- Si el usuario da respuestas vagas, hacer preguntas de follow-up para concretar
- Resumir lo entendido antes de cerrar la entrevista para validar con el usuario

### Output
Archivo: `research/project-brief.md`

```markdown
# Project Brief — <nombre-del-proyecto>

## Visión
<elevator pitch>

## Problema
<qué problema resuelve>

## Usuarios
<quiénes son y cómo lo usarían>

## Stack Tecnológico
- Lenguaje:
- Framework:
- Base de datos:
- Testing:
- Otros:

## Features Principales
1. <feature>
2. <feature>
...

## MVP (alcance mínimo)
<qué incluye el MVP y qué NO>

## Requisitos No Funcionales
- <RNF>

## Restricciones
- <restricción>

## Arquitectura Propuesta
<descripción o diagrama>

## Referencias
- <proyectos o recursos de referencia>

## Notas adicionales
<lo que no encajó en las secciones anteriores>
```

### Reglas
- NUNCA escribir código
- NUNCA tomar decisiones técnicas unilateralmente — siempre validar con el usuario
- El output es un BRIEF, no una especificación — el detalle viene después con spec_author
- Devolver al Leader SOLO la ruta del archivo generado
