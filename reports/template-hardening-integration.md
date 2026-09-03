# Integración: template-hardening

- Fecha: 2026-09-03
- Estado: integrada; lista para Reviewer.
- Rama/worktree: `main` / worktree principal. No se encontraron worktrees de área ni conflictos Git sin resolver.

## Áreas integradas

- `installer-powershell`: copia recursiva de artefactos distribuibles, exclusiones locales y salida no-cero ante fallas.
- `installer-bash`: validación de provider, copia con exclusiones y salida no-cero ante fallas.
- `validation-orchestrator`: comando versionado y utilidades de validación.
- `traceability-policy`: `node_modules/` ignorado; manifests, lockfiles y trigger map permanecen trazables.
- `security-report-contract`: ruta canónica `reports/<feature>-security.md`.

## Conflictos detectados y resolución

- Sin marcadores ni entradas de conflicto Git.
- Conflicto funcional entre el comando de validación y la suite: el script solo descubría `*.test.js`, dejando fuera los tests `*.test.mjs` de instaladores, trazabilidad y seguridad. Se amplió `test:template-hardening` para ejecutar ambas extensiones y se actualizó su contrato.
- En Windows, las pruebas de idempotencia buscaban ejecutables con `--version`; esto omitía PowerShell y Git Bash disponibles. Se usaron probes y candidatos de ejecutable compatibles, por lo que ambas pruebas se ejecutan.

## Validación

```text
npm run test:template-hardening
17 passed, 0 failed, 0 skipped
```

`git diff --check` finalizó sin errores. No se realizaron commit, push ni PR.

## TASK-09 — verificación desde worktree limpio

- Fecha: 2026-09-03.
- Estado: bloqueada; la integración no está disponible en ningún commit para poder validarla desde un clon/worktree limpio.

### Comandos y resultados

```text
# Worktree principal
git status --short
 M .claude/commands/security-audit.md
 M .gitignore
 M init-sdd.ps1
 M init-sdd.sh
?? architecture/
?? feature_list.json
?? package-lock.json
?? package.json
?? reports/
?? research/
?? scripts/
?? specs/
?? tests/

git rev-parse HEAD
0c9079b1230cf7d21db81b0fb40addc17ff998d9

# Worktree temporal creado desde HEAD
git worktree add --detach C:\Users\User\AppData\Local\Temp\opencode\template-hardening-task09-clean HEAD
Preparing worktree (detached HEAD 0c9079b)

# Dentro del worktree limpio
git status --short
# sin salida

git ls-files architecture/architecture.md scripts/security-trigger.config.json package.json package-lock.json tests/template-hardening
# sin salida

npm run test:template-hardening
npm error enoent Could not read package.json: ENOENT: no such file or directory
npm_exit_code=-4058

# Limpieza
git worktree remove --force C:\Users\User\AppData\Local\Temp\opencode\template-hardening-task09-clean
worktree_remove_exit_code=0
```

### Evidencia y bloqueo

El worktree temporal fue limpio y se eliminó correctamente, pero `HEAD` no contiene `package.json`, el comando de validación, las pruebas ni los artefactos de la feature. Por ello no fue posible ejecutar la validación completa desde una copia limpia.

Los dos artefactos de entrada (`architecture/architecture.md` y `scripts/security-trigger.config.json`) tampoco están rastreados en `HEAD`; en el worktree principal sus directorios figuran como no rastreados. No hay una referencia Git limpia contra la que demostrar que permanecieron sin cambios, ni esos archivos estuvieron incluidos en el worktree de validación. La comprobación de ausencia de artefactos locales y la validación de los AC de la feature quedan bloqueadas hasta que la integración esté disponible en un commit o se provea un árbol limpio equivalente que la contenga.
