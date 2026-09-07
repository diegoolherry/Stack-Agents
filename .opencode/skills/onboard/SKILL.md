---
name: onboard
description: Skill del recorrido Onboard SDD. Walkthrough guiado e interactivo del pipeline real en modo full sobre un codebase existente (brownfield) con una mejora demo pequeña y segura. Usa esta skill cuando el usuario quiera aprender el pipeline SDD haciendo una demo guiada.
tools_required: read-only
---

### Rol

Guiar un walkthrough end-to-end del pipeline SDD real (modo `full`) sobre un codebase existente (brownfield), con propósito didáctico: enseñar haciendo. El flujo selecciona una mejora demo real pequeña y segura (`onboard-demo-*`), recorre Researcher → Spec Author → Gate → Implementer (TDD) → Reviewer → cierre sin merge, narra cada fase en 1-3 oraciones, y finaliza con un summary estandarizado.

Esta skill es el contrato ejecutable del walkthrough; no otorga permisos por sí misma. La ejecución por defecto delega cada fase a su agente existente con sus permisos vigentes. El narrador `onboard` solo lee y narra.

### Cuándo se activa

- El usuario pide un tour guiado, una demo del pipeline o aprender SDD haciendo.
- El repo destino es brownfield: hay código fuente y (idealmente) `architecture/architecture.md`.
- Si el repo es greenfield (sin código fuente ni `architecture/architecture.md`), NO iniciar: derivar a Discovery (ver § Discovery-vs-Onboard).

### How to invoke this skill

- CLI: invocar la skill `onboard` (solo-opencode).
- Orquestación: el Leader invoca al narrador `.opencode/agents/onboard.md` para narrar y a los agentes reales por fase (researcher → spec-author → implementer → reviewer → scm/security-auditor según aplique). El Leader es el único que puede invocar subagentes.

### Discovery-vs-Onboard

| | Discovery | Onboard |
|---|---|---|
| Punto de partida | greenfield (sin código) | brownfield (con código, guiado) |
| Pregunta que responde | ¿Qué vamos a construir? | ¿Cómo trabaja el pipeline SDD sobre código real? |
| Output | `research/project-brief.md` (brief de proyecto) | Demo `onboard-demo-*` + summary `reports/onboard-*.md` |
| Entrevista / demo | Entrevista estructurada por fases | Walkthrough haciendo (10 fases narradas) |

Regla de derivación greenfield: si en F1 se detecta que no hay código fuente ni `architecture/architecture.md`, el flujo deriva a Discovery (`research/project-brief.md`) y NO fuerza el Onboard brownfield. Discovery = greenfield, Onboard = brownfield guiado.

### Criterios small&safe (RF-01)

Toda candidata demo DEBE cumplir TODOS los criterios medibles. El scan presenta 2-3 candidatas, cada una con veredicto criterio-por-criterio:

1. Esfuerzo estimado 30-60 min (si supera 60 min, se descarta).
2. Sin breaking changes.
3. Sin migraciones de datos ni de esquema.
4. Valor real verificable (no toy desconectado del código).
5. Spec-worthy: al menos 1 requisito + al menos 2 escenarios testeables.
6. Fuera de los paths sensibles de `scripts/security-trigger.config.json`, salvo opt-in explícito del usuario (con auditoría).

Ejemplos válidos: validación faltante, mensajes inconsistentes, util extraíble, estado loading/error, TODO claro y acotado.

### STOP y validación de propuesta (RF-02, RF-03)

- STOP: si el scan no encuentra ninguna mejora que cumpla los criterios small&safe, el flujo se detiene (STOP) con explicación escrita de por qué cada candidata fue descartada. PROHIBIDO forzar o inventar una demo que viole los criterios.
- Propuesta del usuario: si el usuario propone su propia mejora, validarla contra los criterios small&safe; si no cumple, rechazarla con justificación criterio-por-criterio y ofrecer alternativa(s) que sí cumplan.

### Pausas obligatorias (RF-04, RF-11)

El flujo pausa exactamente en estos 3 puntos (pausas adicionales solo si el usuario las pide; fuera de esos puntos avanza sin bloqueos artificiales):

1. Elección de la candidata demo por el usuario tras el scan.
2. Aprobación explícita post-proposal: tras presentar la change folder / proposal de la demo, NO avanzar a specs sin aprobación explícita del humano (gate didáctico principal).
3. Confirmación antes de Apply (paso a código).

El gate de baseline del pipeline Full se mantiene vigente.

### Guion de 10 fases (RF-10)

Cada fase se narra en 1-3 oraciones cortas más el artefacto o la acción correspondiente. PROHIBIDO volcar artefactos completos en chat; se enlazan por ruta. Artefactos y narración en español neutro; los términos propios del pipeline (proposal, baseline, worktree, PR) se conservan en inglés.

- **F1 — Welcome + scan**: bienvenida (1-3 oraciones), detección mínima de stack/lenguaje, runner de tests, presencia/ausencia de suite, skills aplicables (architecture_builder, supabase, ux-ui, deploy). Scan small&safe con veredicto criterio-por-criterio; se presentan 2-3 opciones. Pausa: el usuario elige la candidata. Si greenfield → derivar a Discovery. Si no hay suite de tests → degradar Apply/Verify a checklist explícita documentada.
- **F2 — Explore narrado**: el researcher real produce `research/onboard-demo-*/findings.md` (5 secciones); el narrador resume en 1-3 oraciones + ruta.
- **F3 — Propose narrado (parametrizado)**: si la fase Propose existe, el flujo vigente crea change folder + `proposal.md` y se pide aprobación explícita post-proposal. Si no existe: línea explícita "paso aún no adoptado — se omite; el gate Full de baseline sigue vigente" y se avanza a Specs.
- **F4 — Specs**: el spec-author real produce `specs/onboard-demo-*/{requirements,design,tasks}.md` como delta Given/When/Then testeable. Gate de baseline Full vigente.
- **F5 — Design narrado**: se narra desde el `design.md` de la demo (decisiones + por qué vs alternativas) en 1-3 oraciones + ruta.
- **F6 — Tasks narradas**: se narran las tasks concretas y checkeables con su área en 1-3 oraciones + ruta. Pausa: confirmación antes de Apply.
- **F7 — Apply narrado por task**: `scm` crea la rama `feature/onboard-*` (worktree `wt-onboard-*` si aplica) ANTES de cualquier escritura en `src/`/`tests/`; el implementer ejecuta TDD RED→GREEN→REFACTOR por task; el narrador cuenta el avance por task sin pegar código.
- **F8 — Verify narrado (parametrizado)**: si existe Verify independiente, matriz COMPLIANT/FAILING/UNTESTED; si no existe: línea explícita "paso aún no adoptado — se omite" y verificación vía Reviewer (2 pasadas, máx. 2 vueltas). Sin suite → checklist explícita degradada.
- **F9 — Archive narrado (parametrizado)**: si existe Archive, merge de delta-specs + carpeta `archive/`; si no existe: línea explícita "paso aún no adoptado — se omite" y el cierre es rama abierta sin merge + summary. En ambos casos: NUNCA merge a `main`, NUNCA marca `done`.
- **F10 — Summary**: template `## Onboarding Complete!` en chat + persistencia en `reports/onboard-<fecha>-<demo>.md`.

### Matriz de parametrización Propose/Verify/Archive (RF-09)

| Estado del pipeline | Propose (F3) | Verify (F8) | Archive (F9) |
|---|---|---|---|
| Fase existe (adoptada) | Ejecutar con formato real + gate | Matriz COMPLIANT/FAILING/UNTESTED | Merge delta-specs + `archive/` |
| Fase ausente (aún no adoptada) | Línea explícita "paso aún no adoptado — se omite; el gate Full de baseline sigue vigente" | Línea explícita "paso aún no adoptado — se omite"; verifica el Reviewer (2 pasadas) | Línea explícita "paso aún no adoptado — se omite"; cierre = rama abierta sin merge + summary |

Regla: NUNCA enseñar un paso inexistente como si existiera. Verificar existencia antes de narrarlo.

### Rama aislada y prohibiciones (RF-06, RF-07, RF-08)

- Toda mutación de la demo ocurre en rama `feature/onboard-*` (worktree `wt-onboard-*` si aplica), creada antes de cualquier escritura en `src/`/`tests/`. PROHIBIDO trabajar sobre `main` o rama de feature ajena.
- El flujo termina sin merge automático a `main` (el PR queda abierto o la rama queda local) y SIN marcar la demo como `done` en `feature_list.json` ni en `progress/current.md`.
- La demo (`onboard-demo-*`) NO se registra como feature `full` en `feature_list.json`. El tracking vive solo en su rama/carpeta (`specs/onboard-demo-*/`, `research/onboard-demo-*/`, `reports/onboard-demo-*`). La demo es reversible con `git checkout main` + borrado de rama/worktree `feature/onboard-*`.
- Alcance técnico: solo Markdown + wiring de agentes/skills bajo `.opencode/`; PROHIBIDO binarios, MCP, dependencias de red o replicar a `.claude/`/`.gemini/`.

### Template del summary (RF-14, RF-15)

El cierre muestra este template en chat Y lo guarda en `reports/onboard-<fecha>-<demo>.md`:

```markdown
## Onboarding Complete!

### Change elegido
<demo `onboard-demo-*` + por qué se eligió>

### Artefactos
- WHY: `research/onboard-demo-*/findings.md`
- WHAT: `specs/onboard-demo-*/requirements.md`
- HOW: `specs/onboard-demo-*/design.md`
- STEPS: `specs/onboard-demo-*/tasks.md`

### Archivos cambiados
<rutas en la rama `feature/onboard-*`>

### El pipeline en una línea
explore → propose → spec → design → tasks → apply → verify → archive

### Cuándo usar SDD vs codear directo
<features medianas/grandes → Full; tareas chicas → Quick; demo didáctica → Onboard>

### Next steps
<por ejemplo: `/sdd-new`, `specs/` como source of truth>
```

### Reglas

- NUNCA simular fases ni usar contenido toy desconectado del código (artefactos reales en disco).
- NUNCA enseñar un paso Propose/Verify/Archive inexistente como existente.
- NUNCA trabajar sobre `main` ni hacer merge automático ni marcar `done`.
- Narración siempre en 1-3 oraciones por fase, en español neutro, enlazando rutas (protocolo anti-teléfono-descompuesto: los subagentes escriben en disco y retornan SOLO rutas).
- Devolver al Leader SOLO las rutas de los archivos generados.
