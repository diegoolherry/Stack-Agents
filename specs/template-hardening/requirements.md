# Requirements — template-hardening

Baseline: v1
Feature: template-hardening

## Descripción general

Esta feature endurece la distribución de la plantilla SDD para que ambos instaladores copien únicamente contenido distribuible, rechacen proveedores inválidos de forma equivalente y se puedan validar automáticamente. También corrige la trazabilidad Git de artefactos operacionales y unifica el contrato del reporte de auditoría de seguridad.

**Precondición y artefactos existentes:** la generación inicial de `architecture/architecture.md` y de `scripts/security-trigger.config.json` ya fue realizada antes de esta baseline. Estos archivos son entradas existentes de esta feature; no se regeneran ni se modifica su esquema o contenido como parte de ella.

## Requisitos Funcionales

- **RF-01**: Debe existir una validación automatizada y ejecutable desde el repositorio que cubra `init-sdd.ps1` e `init-sdd.sh` en directorios temporales, sin requerir dependencias de terceros.
- **RF-02**: La validación debe comprobar, para cada proveedor admitido (`claude`, `opencode`, `gemini`) y para `all`, la creación de los artefactos compartidos y de los archivos principales del proveedor solicitado; en `all` debe comprobar los tres proveedores.
- **RF-03**: La validación debe comprobar que los instaladores preservan el comportamiento incremental de los artefactos compartidos existentes y pueden operar sobre un destino preexistente y una ruta de destino con espacios.
- **RF-04**: Al copiar un provider, ambos instaladores deben excluir de forma explícita y recursiva dependencias y artefactos locales no distribuibles: `node_modules/`, `package.json`, `package-lock.json`, `bun.lock` y el `.gitignore` local del provider. La exclusión no debe eliminar ni modificar esos artefactos si ya existen en el destino.
- **RF-05**: La copia de providers debe incluir los archivos ocultos distribuibles y producir el mismo árbol distribuible para PowerShell y Bash, salvo diferencias de plataforma documentadas por la validación.
- **RF-06**: Bash debe aceptar exclusivamente los valores de `Provider`/`--provider` `all`, `claude`, `opencode` y `gemini`, con la misma semántica de selección que PowerShell. Un valor inválido debe informar el error, no copiar providers y finalizar con código distinto de cero.
- **RF-07**: La verificación posterior de ambos instaladores debe fallar con código distinto de cero cuando falte un artefacto requerido del conjunto seleccionado, e informar los faltantes. Un resultado exitoso debe implicar que las comprobaciones aplicables pasaron.
- **RF-08**: La validación automatizada debe detectar la presencia en el destino de cualquiera de los artefactos excluidos de RF-04 y debe fallar si un instalador los copia.
- **RF-09**: La política `.gitignore` del repositorio debe ignorar dependencias instaladas localmente en la raíz, sin ignorar los manifiestos y lockfiles de la automatización de validación que deban quedar trazados. Las reglas de ignore de los proyectos destino generadas por ambos instaladores no deben ignorar `scripts/security-trigger.config.json`.
- **RF-10**: El nombre canónico del entregable del Security Auditor debe ser `reports/<feature>-security.md`. El comando de auditoría y las tres copias distribuibles de la skill Security Auditor deben referir ese mismo nombre.

## Requisitos No Funcionales

- **RNF-01**: La automatización debe usar únicamente capacidades disponibles en el stack actual (Node.js y las herramientas de shell/plataforma); no debe introducir paquetes npm ni un framework de pruebas externo.
- **RNF-02**: Las pruebas no deben escribir en el worktree ni depender de `.opencode/node_modules`; deben limpiar los directorios temporales aun ante un fallo.
- **RNF-03**: La validación de Bash debe poder ejecutarse cuando Bash esté disponible (Linux, macOS, Git Bash o WSL); si no está disponible, el resultado debe dejar constancia explícita de que esa plataforma no fue ejecutada, no simular éxito.
- **RNF-04**: Los cambios deben mantener compatibilidad con las interfaces públicas documentadas de ambos instaladores: parámetros actuales, provider por defecto `all` y siete etapas operativas.
- **RNF-05**: Los nuevos archivos de automatización y la política de trazabilidad deben ser reproducibles desde un clon limpio y quedar versionados cuando correspondan.

## Criterios de Aceptación

- [ ] **AC-01**: Existe un comando versionado que ejecuta la validación automatizada y finaliza exitosamente en un entorno con PowerShell, Node.js y Bash disponibles. (RF-01, RNF-01)
- [ ] **AC-02**: La validación instala cada selección válida y verifica `AGENTS.md`, `feature_list.json`, `progress/current.template.md` y los archivos principales aplicables de `.claude`, `.opencode` y `.gemini`. (RF-02)
- [ ] **AC-03**: La validación cubre un destino preexistente y una ruta con espacios, y demuestra que los archivos compartidos ya existentes no se sobrescriben. (RF-03)
- [ ] **AC-04**: Después de instalar `opencode` y `all` con cualquiera de los instaladores, el destino no contiene artefactos copiados llamados `node_modules`, `package.json`, `package-lock.json`, `bun.lock` ni `.gitignore` provenientes del provider. (RF-04, RF-08)
- [ ] **AC-05**: Un archivo oculto distribuible de un provider se instala mediante PowerShell y Bash, y la comparación de inventarios normalizados confirma paridad del contenido distribuible para cada selección. (RF-05)
- [ ] **AC-06**: `init-sdd.sh --provider invalido` no crea ni copia providers, informa el valor inválido y termina con código distinto de cero; los cuatro valores admitidos mantienen la selección esperada. (RF-06)
- [ ] **AC-07**: Cuando se fuerza la ausencia de un archivo requerido, cada instalador informa el faltante y retorna código distinto de cero; una instalación íntegra retorna cero. (RF-07)
- [ ] **AC-08**: La raíz ignora `node_modules/`, pero los archivos de definición del comando de validación están rastreados; el bloque SDD generado por ambos instaladores no contiene una regla para `scripts/security-trigger.config.json`. (RF-09)
- [ ] **AC-09**: Una búsqueda en el comando Claude y en las tres skills de Security Auditor no encuentra `reports/<feature>-security-audit.md` y todas las referencias de output usan `reports/<feature>-security.md`. (RF-10)
- [ ] **AC-10**: La implementación no regenera ni altera `architecture/architecture.md` ni `scripts/security-trigger.config.json`. (Precondición)

## Fuera de Alcance

- Generar, regenerar o modificar la arquitectura inicial o el mapa de triggers de seguridad; son artefactos existentes de entrada.
- Agregar CI/CD, una plataforma de despliegue o una suite de pruebas para una aplicación de producto inexistente.
- Instalar, actualizar o versionar `@opencode-ai/plugin` y sus dependencias locales.
- Cambiar el esquema de `security-trigger.config.json` o automatizar la decisión de dispatch del Security Auditor.
- Alterar los comandos, skills o configuraciones de provider no necesarios para el contrato de reporte de auditoría.
