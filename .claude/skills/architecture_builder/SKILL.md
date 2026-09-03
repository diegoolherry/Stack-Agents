---
name: architecture-builder
description: Skill para el subagente architecture-builder del workflow SDD. Analiza el codebase completo y genera architecture/architecture.md + security-trigger.config.json. Usa esta skill cuando se inicia un proyecto nuevo, cuando el Reviewer detecta architecture_drift, o cuando se solicita regeneración manual de la documentación de arquitectura.
tools_required: read-write
---

### Rol
Analizar el codebase completo de un proyecto y generar documentación de arquitectura. Se ejecuta una sola vez al iniciar el proyecto, o bajo demanda para regenerar tras drift.

### Cuándo se ejecuta
- Primera vez al iniciar un proyecto nuevo
- Bajo demanda cuando el Reviewer detecta `architecture_drift: true` en un review report
- El Leader agenda la regeneración ANTES de la próxima feature (no bloquea la feature actual)

### Modos de operación

**Modo Existing (proyecto con código)**
1. Escanear toda la estructura del proyecto (carpetas, archivos, package.json/csproj/etc)
2. Identificar stack tecnológico (lenguaje, framework, ORM, testing, etc)
3. Mapear patrones arquitectónicos (MVC, hexagonal, microservicios, etc)
4. Identificar dependencias principales
5. Documentar flujos de datos principales
6. Identificar convenciones de naming
7. Detectar paths sensibles (auth, db, middleware, seguridad) para el security trigger
8. Generar los dos archivos de output

**Modo Greenfield (proyecto sin código)**
Cuando no existe código fuente en el repositorio:
1. Leer `research/project-brief.md` (generado por la skill `discovery`)
2. Generar `architecture/architecture.md` con la estructura PLANIFICADA basada en el brief
3. Marcar claramente qué es "planned" vs "existing" en cada sección
4. Generar `scripts/security-trigger.config.json` con los paths sensibles anticipados según el stack elegido
5. Esta arquitectura planificada se actualiza a "existing" conforme se implementan features
6. Si el proyecto usa Supabase como DB, leer `.claude/skills/supabase/SKILL.md` y documentar en architecture.md: setup requerido, y agregar `supabase/migrations/**` como path sensible en security-trigger.config.json (además de auth/db)
7. Leer `.claude/skills/deploy/SKILL.md` y generar `.github/workflows/ci.yml` (+ deploy si aplica) como parte del setup inicial del proyecto

### Outputs
1. `architecture/architecture.md`
   - Stack tecnológico
   - Estructura de carpetas con descripción de cada directorio principal
   - Patrones arquitectónicos identificados (o planificados en greenfield)
   - Dependencias principales (con versiones)
   - Flujo de datos (descripción o diagrama mermaid)
   - Convenciones de naming detectadas (o propuestas en greenfield)

2. `scripts/security-trigger.config.json`
   ```json
   {
     "trigger_patterns": ["src/auth/**", "src/db/**", ...],
     "trigger_imports": ["bcrypt", "jsonwebtoken", ...]
   }
   ```

3. .github/workflows/ci.yml (y deploy.yml si aplica)

### Reglas
- Regeneración siempre COMPLETA (no incremental) — reescribir todo el archivo
- NO modificar código fuente — solo generar documentación y config
- NO inventar lo que no encuentra — documentar solo lo que existe (o lo planificado en greenfield, marcado como tal)
- En greenfield, basarse EXCLUSIVAMENTE en `research/project-brief.md` — no inventar features
- Devolver al Leader SOLO las rutas de los archivos generados
