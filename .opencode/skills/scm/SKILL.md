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
   - Nombre: `wt-<feature-id>` si hay un solo Implementer, `wt-<feature-id>-<área>` si hay varios en paralelo
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
   - No push directo a main/master bajo ningún caso, ni siquiera tras aprobación del Reviewer/security_auditor
   - El único camino de cierre de una feature es una Pull Request — ver sección "Cierre de feature (Pull Request)"
   - Squash al hacer merge
   - No mezclar cambios de múltiples features en un commit

5. **Paralelismo**
   - Una feature por sesión de agente
   - Múltiples features posibles via múltiples sesiones + worktrees
   - `feature_list.json` soporta múltiples features `in_progress`
   - Resolución de conflictos: responsabilidad de la sesión que hace merge

### Integración de Implementers paralelos (nuevo paso, previo al Reviewer)

Se ejecuta solo cuando hubo 2+ Implementers en paralelo para la misma feature.

1. Mergear cada worktree `wt-<feature-id>-<área>` a la rama de la feature (`feature/<feature-id>`), en el orden en que terminaron.
2. Si hay conflicto de merge entre áreas: NO resolverlo automáticamente — escalar al humano con el detalle del conflicto (esto indica que el `spec_author` agrupó mal las áreas, es señal para corregir la spec).
3. Una vez mergeados todos, correr la suite COMPLETA de tests sobre la rama de la feature integrada.
4. Si todo pasa, borrar los worktrees por área y continuar al Reviewer con el diff integrado.
5. Si algo falla, NO continuar al Reviewer — reportar al Leader qué área rompió qué test.

### Cierre de feature (Pull Request)

Se ejecuta cuando Reviewer y security_auditor ya aprobaron la feature (o la iteración correspondiente de CRs) y el agente `archive` emitió el acta de cierre con veredicto `ARCHIVED` o `PARTIAL-INTENCIONAL` (con `BLOCKED` no hay push/PR). Archive la ejecuta el agente `archive` invocado por el Leader — `scm` no ejecuta Archive, solo el push + PR posterior con rutas estables (`specs/<feature>/`, `reports/`).

1. Pushear la rama `feature/<feature-id>` al remoto (esto SÍ está permitido — lo prohibido es pushear a `main`)
2. Abrir la PR contra `main`:
   - **Vía MCP de GitHub** (si está conectado): usar el tool de creación de PR del MCP
   - **Vía `gh` CLI** (fallback, sin dependencias extra): `gh pr create --base main --head feature/<feature-id> --title "<título>" --body-file <archivo-temporal>`
3. NO mergear la PR automáticamente — el merge final a `main` lo hace el humano desde GitHub (squash merge, según convención)
4. Reportar al Leader la URL de la PR generada

**Título de la PR** — mismo formato que el commit squash final (Conventional Commits):
```
<tipo>(<scope>): <descripción corta>
```
Ejemplo: `feat(productos): CRUD de productos con validación de stock`

Si la feature usó implementers paralelos por área, el scope agrupa las áreas principales:
`feat(productos,pedidos): alta de pedidos con descuento de stock`

**Body de la PR** — template fijo:

```markdown
## Resumen
<1-2 líneas de qué hace la feature, tomado de requirements.md>

## Tasks completadas
- [x] Task 1: <título> (área: <área>)
- [x] Task 2: <título> (área: <área>)
...

## RFs cubiertos
- RF-01, RF-02, ...

## Áreas (si hubo implementers en paralelo)
- productos, pedidos

## Change Requests
- CR-productos-001: <resumen> (o "Ninguno")

## Checklist UX/UI (si la feature tiene interfaz)
- [x] Validación en formularios
- [x] Estados vacíos/carga
- [x] Accesibilidad básica

## Reportes
- Verify: `reports/<feature-id>-verify.md` (veredicto PASS | PASS WITH WARNINGS | FAIL; Reviewer P1 lo consume como evidencia autoritativa)
- Review: `reports/<feature-id>-review.md`
- Security audit: `reports/<feature-id>-security.md`
- Archive: `reports/<feature-id>-archive.md` (veredicto ARCHIVED | BLOCKED | PARTIAL-INTENCIONAL; rutas estables)
```

5. Si la PR ya existe (por una iteración de CRs sobre la misma feature), actualizar el body con los nuevos CRs en vez de abrir una PR nueva.

### Convenciones aplicables
Siempre leer en este orden de prioridad:
1. `project/conventions.md` (si existe) — convenciones del proyecto actual
2. `defaults/conventions.md` — convenciones por defecto

### Reglas
- Las convenciones de `project/conventions.md` SIEMPRE ganan sobre los defaults
- El humano SIEMPRE aprueba las convenciones antes de usarlas
- Para repos existentes, usar el modo semi-automático (Researcher genera draft)
