# Convenciones Git — Defaults

> Convenciones por defecto para proyectos nuevos. Si existe `project/conventions.md`, este archivo es ignorado.

## Branch Naming
- `main` — rama principal, siempre deployable
- `feature/<feature-id>` — desarrollo de features
- `fix/<issue-id>` — bugfixes
- `hotfix/<descripción>` — fixes urgentes en producción

## Worktrees
- Naming: `wt-<feature-id>`
- Crear: al iniciar feature en sesión paralela
- Borrar: después del merge exitoso
- Sync: rebase desde main antes de abrir PR / pedir review

## Commit Messages
Formato: Conventional Commits

<tipo>(<scope>): <descripción corta>

<cuerpo opcional — qué y por qué, no cómo>

<footer opcional — Breaking changes, refs a issues>

### Tipos válidos
- feat: nueva funcionalidad
- fix: corrección de bug
- refactor: reestructuración sin cambio de comportamiento
- test: agregar o modificar tests
- docs: documentación
- chore: tareas de mantenimiento (deps, configs)
- ci: cambios en CI/CD

### Scope
El módulo o componente afectado. Ej: auth, api, db, ui.

## Restricciones
- ❌ No force push a main
- ❌ No commits directos a main
- ✅ Squash merge al cerrar feature
- ✅ Un commit = un cambio lógico
- ✅ Tests deben pasar antes del merge

## Paralelismo
- Una feature por sesión de agente
- Usar worktrees para sesiones paralelas
- Resolver conflictos en la sesión que hace merge
