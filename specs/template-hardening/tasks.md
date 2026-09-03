# Tasks — template-hardening

Baseline: v1
Feature: template-hardening

## Tareas

> **Precondición:** `architecture/architecture.md` y `scripts/security-trigger.config.json` ya fueron generados. No hay tarea para crearlos, regenerarlos ni modificarlos.

### Task 1: Endurecer el instalador PowerShell y su validación
- [ ] **TASK-01**: Definir primero pruebas automatizadas de PowerShell para selecciones válidas, destino con espacios, destino preexistente/incremental, exclusión de artefactos locales, archivos ocultos distribuibles y códigos de salida ante faltantes. Ubicar las pruebas en el archivo exclusivo del área y ejecutarlas contra directorios temporales.
área: installer-powershell
RF relacionado: RF-01, RF-02, RF-03, RF-04, RF-05, RF-07, RF-08

- [ ] **TASK-02**: Modificar `init-sdd.ps1` para copiar solamente el inventario distribuible, incluyendo dotfiles permitidos y excluyendo recursivamente los artefactos definidos; preservar artefactos excluidos existentes en destino y hacer fallar la verificación con salida no cero cuando corresponda.
área: installer-powershell
RF relacionado: RF-04, RF-05, RF-07, RF-08

### Task 2: Endurecer el instalador Bash y su validación
- [ ] **TASK-03**: Definir primero pruebas automatizadas exclusivas de Bash para los mismos escenarios de instalación, inventario, exclusión y salida que PowerShell, incluido `--provider invalido`; registrar explícitamente Bash no disponible sin presentarlo como éxito.
área: installer-bash
RF relacionado: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08

- [ ] **TASK-04**: Modificar `init-sdd.sh` para validar el provider antes de copiar, usar la copia distribuible con soporte de ocultos permitidos y exclusiones recursivas, y devolver código no cero para provider inválido, faltantes o fallos de verificación.
área: installer-bash
RF relacionado: RF-04, RF-05, RF-06, RF-07, RF-08

### Task 3: Incorporar el orquestador de validación y paridad
- [ ] **TASK-05**: Crear el comando y la configuración mínima versionada para ejecutar el runner nativo de Node.js sin paquetes externos, descubriendo los archivos de prueba de las áreas de instalador.
área: validation-orchestrator
RF relacionado: RF-01

- [ ] **TASK-06**: Añadir al orquestador la comparación de inventarios normalizados entre resultados de PowerShell y Bash para cada provider válido, y el resultado explícito de plataforma cuando Bash no esté disponible; garantizar limpieza de temporales ante éxito o fallo.
área: validation-orchestrator
RF relacionado: RF-05

### Task 4: Corregir política de trazabilidad e ignore
- [ ] **TASK-07**: Ajustar `.gitignore` de raíz para ignorar dependencias locales sin ocultar los manifiestos/lockfiles versionados de la validación, y actualizar en ambos instaladores el bloque SDD para que no ignore `scripts/security-trigger.config.json`; cubrir su contenido generado e idempotencia mediante pruebas documentales o de instalador en esta misma área.
área: traceability-policy
RF relacionado: RF-09

### Task 5: Unificar el contrato de reportes de auditoría
- [ ] **TASK-08**: Actualizar el comando Claude y las tres skills distribuidas de Security Auditor para que el único nombre de reporte sea `reports/<feature>-security.md`, y añadir una comprobación documental automatizada que impida reintroducir el nombre inconsistente.
área: security-report-contract
RF relacionado: RF-10

### Task 6: Verificación integrada de baseline
- [ ] **TASK-09**: Ejecutar el comando completo de validación desde un clon/worktree limpio, revisar que no se incluyan artefactos locales ni cambios a los dos artefactos existentes de arquitectura/triggers, y registrar los comandos y resultados en el reporte de cambio de la feature.
área: integration-verification
RF relacionado: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10
