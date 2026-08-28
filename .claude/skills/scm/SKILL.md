---
name: scm
description: Skill de gestión de código fuente (git workflow, worktrees, commits, branches). Usa esta skill cuando se necesite crear branches, configurar worktrees, hacer commits, o resolver conflictos de merge. También para establecer las convenciones git de un proyecto nuevo o adaptarse a las de un proyecto existente.
tools_required: read-write
---

### Rol
Gestionar las operaciones de control de código fuente. Definir y aplicar convenciones de git para el proyecto.

### Dos modos de operación

**Modo Greenfield (proyecto nuevo)**
- Se usan las convenciones por defecto de `defaults/conventions.md`
- El architecture-builder las copia como punto de partida

**Modo Existing (repo existente)**
- El Researcher analiza el repo (CONTRIBUTING.md, .gitconfig, historial de commits, branch patterns)
- Genera un draft de `project/conventions.md`
- El humano lo aprueba antes de usarlo
- `project/conventions.md` SIEMPRE tiene prioridad sobre `defaults/conventions.md`

### Temas cubiertos

1. **Branch naming**
   - `feature/<feature-id>` para features nuevas
   - `fix/<issue-id>` para bugfixes
   - `hotfix/<descripción>` para fixes urgentes en producción

2. **Worktree naming y lifecycle**
   - Nombre: `wt-<feature-id>`
   - Crear al iniciar una feature en sesión paralela
   - Borrar al cerrar la feature (merge a main)
   - Sincronizar con main periódicamente

3. **Commit messages**
   - Conventional Commits por defecto:
     - `feat(<scope>): <descripción>` para features
     - `fix(<scope>): <descripción>` para fixes
     - `refactor(<scope>): <descripción>` para refactors
     - `test(<scope>): <descripción>` para tests
     - `docs(<scope>): <descripción>` para documentación
   - Override posible via `project/conventions.md`

4. **Restricciones**
   - No force push a main/master
   - No commits directos a main/master
   - Squash al hacer merge
   - No mezclar cambios de múltiples features en un commit

5. **Paralelismo**
   - Una feature por sesión de agente
   - Múltiples features posibles via múltiples sesiones + worktrees
   - `feature_list.json` soporta múltiples features `in_progress`
   - Resolución de conflictos: responsabilidad de la sesión que hace merge

### Convenciones aplicables
Siempre leer en este orden de prioridad:
1. `project/conventions.md` (si existe) — convenciones del proyecto actual
2. `defaults/conventions.md` — convenciones por defecto

### Reglas
- Las convenciones de `project/conventions.md` SIEMPRE ganan sobre los defaults
- El humano SIEMPRE aprueba las convenciones antes de usarlas
- Para repos existentes, usar el modo semi-automático (Researcher genera draft)
