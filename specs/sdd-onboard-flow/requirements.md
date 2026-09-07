# Requirements — Flujo SDD Onboard guiado

Baseline: v1
Feature: sdd-onboard-flow

## Descripción general

Walkthrough end-to-end guiado e interactivo del pipeline SDD real (modo `full`) sobre un codebase existente (brownfield), con propósito didáctico: enseñar haciendo. El flujo selecciona una mejora demo real pequeña y segura (`onboard-demo-*`), recorre Researcher → Spec Author → Gate → Implementer (TDD) → Reviewer → cierre sin merge, narra cada fase en 1-3 oraciones, y finaliza con un summary estandarizado. Es solo-opencode, sin binarios ni MCP, con rama aislada obligatoria, criterios small&safe medibles con STOP si no hay candidata, sin marcar `done` ni merge automático, pasos Propose/Verify/Archive parametrizados según existan, idioma fijado (artefactos en español, narración en español) y permisos mínimos por agente (delegación por fase como ejecución por defecto).

Base factual: `research/sdd-onboard-flow/sdd-onboard-flow-findings.md` (opciones A/B/C, referencia gentle-ai `sdd-onboard` v1.0 de 10 fases, riesgos de permisos/mutación/coste/dependencias/idioma).

## Requisitos Funcionales

- **RF-01 — Scan de oportunidades con criterios small&safe medibles**: el flujo DEBE escanear el codebase destino y presentar 2-3 candidatas de mejora demo que cumplan TODOS los criterios medibles: (a) esfuerzo estimado 30-60 min; (b) sin breaking changes; (c) sin migraciones de datos/esquema; (d) valor real verificable; (e) spec-worthy: ≥1 requisito + ≥2 escenarios testeables; (f) fuera de paths sensibles de `scripts/security-trigger.config.json` salvo opt-in explícito. Ejemplos válidos: validación faltante, mensajes inconsistentes, util extraíble, estado loading/error, TODO claro y acotado.
- **RF-02 — STOP si no hay candidata**: si el scan no encuentra ninguna mejora que cumpla RF-01, el flujo DEBE detenerse (STOP) con explicación escrita de por qué cada candidata fue descartada. PROHIBIDO forzar o inventar una demo que viole los criterios.
- **RF-03 — Propuesta del usuario validada**: si el usuario propone su propia mejora, el flujo DEBE validarla contra RF-01; si no cumple, rechazarla con justificación criterio-por-criterio y ofrecer alternativa(s) que sí cumplan.
- **RF-04 — Aprobación explícita post-proposal obligatoria**: tras presentar la change folder / proposal de la demo (intent/scope/approach o equivalente vigente), el flujo DEBE pedir aprobación explícita del humano y NO avanzar a specs sin ella. Es el gate didáctico principal del walkthrough.
- **RF-05 — Recorrido completo con artefactos reales**: el walkthrough DEBE producir artefactos reales en disco con los formatos locales vigentes (findings 5 secciones, requirements/design/tasks + baseline, código TDD, report de Reviewer) y summary final. PROHIBIDO simular fases o usar contenido toy desconectado del código.
- **RF-06 — Rama aislada obligatoria**: toda mutación de la demo DEBE ocurrir en rama `feature/onboard-*` (worktree `wt-onboard-*` si aplica convención `scm`), creada antes de cualquier escritura en `src/`/`tests/`. PROHIBIDO trabajar sobre `main`/rama de feature ajena.
- **RF-07 — Prohibición de merge auto y de marca done**: el flujo DEBE terminar sin merge automático a `main` (el PR queda abierto o la rama queda local para revisión) y SIN marcar la demo como `done` en `feature_list.json` ni en `progress/current.md`. La demo es material didáctico desechable, no una feature del producto.
- **RF-08 — Registro de la demo aislado de feature_list.json**: la demo (`onboard-demo-*`) NO se registra como feature `full` en `feature_list.json`. El tracking vive solo en su rama/carpeta (`specs/onboard-demo-*/`, `research/onboard-demo-*/`, `reports/onboard-demo-*`). La entrada `sdd-onboard-flow` (mode `full`, `in_progress`) es la única registrada.
- **RF-09 — Pasos Propose/Verify/Archive parametrizados**: el guion DEBE tratar los pasos Propose, Verify independiente y Archive como condicionales: si la fase existe en el pipeline vigente se ejecuta/narra con su formato real; si no existe se omite con una línea explícita ("paso aún no adoptado — se omite"). PROHIBIDO enseñar un paso inexistente como si existiera.
- **RF-10 — Guion de 10 fases narradas**: el flujo DEBE implementar el guion de 10 fases adaptado de la referencia (1 Welcome+scan, 2 Explore narrado, 3 Propose narrado, 4 Specs, 5 Design, 6 Tasks, 7 Apply narrado por task con TDD RED→GREEN→REFACTOR, 8 Verify narrado, 9 Archive narrado condicional, 10 Summary). Cada fase se narra en 1-3 oraciones cortas más el artefacto/acción correspondiente.
- **RF-11 — Puntos de pausa definidos**: además del gate post-proposal (RF-04), el flujo DEBE pausar para (a) elección de candidata demo por el usuario tras el scan, y (b) confirmación antes de Apply (paso a código). Pausas adicionales solo si el usuario las pide. Fuera de esos puntos el flujo avanza sin bloqueos artificiales.
- **RF-12 — Derivación a Discovery cuando corresponda**: si durante el Welcome/scan se detecta repo greenfield (sin código fuente, sin `architecture/architecture.md`), el flujo DEBE derivar a Discovery (`research/project-brief.md`) y NO forzar el Onboard brownfield. Debe explicar la diferencia (Discovery = greenfield, Onboard = brownfield guiado).
- **RF-13 — Detección previa de stack/testing (sdd-init ausente)**: ante la ausencia de `sdd-init`, el paso 1 del guion DEBE incluir detección mínima previa al scan: stack/lenguaje, runner de tests, presencia/ausencia de suite, skills aplicables (architecture_builder, supabase, ux-ui, deploy). Si no hay suite de tests, degradar Apply/Verify como en Reviewer/Verify (tests manuales/checklist explícita).
- **RF-14 — Summary final con template fijo**: el flujo DEBE cerrar con el template `## Onboarding Complete!` que incluye: change elegido, artefactos WHY/WHAT/HOW/STEPS, archivos cambiados, one-liner `explore → propose → spec → design → tasks → apply → verify → archive`, cuándo usar SDD vs codear directo, y next steps (p. ej. `/sdd-new`, `specs/` como source of truth). El summary se muestra en chat Y se guarda en `reports/onboard-*.md` (ver RF-15).
- **RF-15 — Persistencia del summary**: el summary DEBE guardarse en `reports/onboard-<fecha>-<demo>.md` además de mostrarse en chat, para trazabilidad y relectura.
- **RF-16 — Solo-opencode, sin binarios/MCP/red**: la implementación DEBE limitarse a Markdown + wiring de agentes/skills bajo `.opencode/`; PROHIBIDO binarios, MCP, dependencias de red, o replicar a `.claude/`/`.gemini/`. Debe funcionar con lo instalado por `init-sdd` (`research/`, `specs/`, `reports/`, `changes/`, `progress/`, `scripts/`).
- **RF-17 — Permisos mínimos por defecto (delegación por fase)**: la ejecución por defecto DEBE delegar cada fase a su agente existente con sus permisos vigentes (researcher→spec-author→implementer→reviewer→security/scm), sin crear un superset de permisos. Cualquier agente nuevo solo obtiene `read *` + narración; nunca `edit` amplio.
- **RF-18 — Distribución vía instaladores y AGENTS**: la entrega DEBE incluir actualización de `init-sdd.ps1`/`.sh` (si crean dotfolders por copia, que incluyan el nuevo agente/skill) y documentar el modo Onboard en `.opencode/AGENTS.md` + `shared/AGENTS.md` como recorrido guiado del modo Full (no como modo nuevo que altere el pipeline).

## Requisitos No Funcionales

- **RNF-01 — Tiempo objetivo 30-60 min**: el ciclo demo completo (scan → summary) DEBE estar acotado a 30-60 min; el criterio de selección RF-01 es el control. Si la estimación supera 60 min, descartar la candidata.
- **RNF-02 — Narración concisa**: cada fase se narra en 1-3 oraciones. PROHIBIDO volcar artefactos completos en chat; se enlazan por ruta (protocolo anti-teléfono-descompuesto).
- **RNF-03 — Idioma fijado**: artefactos Y narración en español neutro (convención vigente de Stack-Agents). No se adopta el contrato inglés-neutro de gentle-ai. Términos técnicos del pipeline (proposal, baseline, worktree, PR) se conservan en inglés cuando sean nombres propios de artefacto.
- **RNF-04 — Reversibilidad**: la demo DEBE ser reversible con `git checkout main` + borrado de rama/worktree `feature/onboard-*` sin efectos colaterales (sin migraciones, sin secretos, sin cambios en instaladores del repo destino).
- **RNF-05 — Trazabilidad anti-teléfono-descompuesto**: todos los subagentes escriben en disco y retornan SOLO rutas. El Onboard narra rutas, nunca pega contenido integral por chat.
- **RNF-06 — Portabilidad Markdown**: guion en Markdown portable, ejecutable con `bash` + tests del proyecto destino; sin dependencia de red salvo la investigación ya hecha.

## Criterios de Aceptación

- [ ] AC-01: Dado un codebase brownfield con ≥1 mejora small&safe, el scan presenta 2-3 candidatas cada una con veredicto criterio-por-criterio RF-01 (mapea RF-01).
- [ ] AC-02: Dado un repo sin candidata válida, el flujo hace STOP con explicación escrita y no crea rama ni escribe código (mapea RF-02).
- [ ] AC-03: Dada una propuesta del usuario que viola RF-01 (p. ej. requiere migración), el flujo la rechaza con justificación y ofrece alternativa válida (mapea RF-03).
- [ ] AC-04: Verificado que sin aprobación explícita post-proposal el flujo no avanza a specs (mapea RF-04, RF-11).
- [ ] AC-05: La demo produce artefactos reales en disco (findings/specs/código/tests/report/summary) trazables a la rama `feature/onboard-*` (mapea RF-05, RF-06).
- [ ] AC-06: Verificado que tras el walkthrough no hay merge a `main`, `feature_list.json` no contiene `onboard-demo-*`, y `progress/current.md` no marca `done` para la demo (mapea RF-07, RF-08).
- [ ] AC-07: Con Propose/Verify/Archive ausentes el guion los omite con línea explícita; con las fases presentes las ejecuta con formato real (mapea RF-09; parametrización verificada en ambos estados).
- [ ] AC-08: El guion contiene las 10 fases con narración ≤3 oraciones por fase (mapea RF-10, RNF-02).
- [ ] AC-09: Dado un repo greenfield, el flujo deriva a Discovery y no inicia demo brownfield (mapea RF-12).
- [ ] AC-10: Dado un repo sin suite de tests, Apply/Verify se degradan a checklist explícita documentada (mapea RF-13).
- [ ] AC-11: El cierre muestra el template `## Onboarding Complete!` con todos los campos RF-14 y persiste en `reports/onboard-*.md` (mapea RF-14, RF-15).
- [ ] AC-12: Verificado que no se agregan binarios/MCP/dependencias de red ni archivos en `.claude/`/`.gemini/`, y que el flujo corre sobre carpetas `init-sdd` (mapea RF-16).
- [ ] AC-13: Verificado que ningún agente nuevo posee `edit` fuera de lo permitido y que la ejecución por defecto delega por fase con permisos existentes (mapea RF-17).
- [ ] AC-14: Instaladores incluyen el nuevo agente/skill en destino fresco y AGENTS documenta Onboard como recorrido Full (mapea RF-18).
- [ ] AC-15: Artefactos y narración verificados en español; demo reversible vía borrado de rama (mapea RNF-03, RNF-04).

## Fuera de Alcance

- Crear `sdd-init` (detección workspace-wide, Strict TDD nativo, `.atl/skill-registry`): gap conocido, feature separada futura.
- Crear las fases Propose/Verify/Archive como tales: pertenecen a `sdd-propose-phase`, `sdd-verify-phase`, `sdd-archive-phase`; Onboard solo las parametriza.
- Replicar a `.claude/`/`.gemini/`: esta feature es solo-opencode por restricción.
- Cambios de producto reales más allá de la demo desechable: la demo es didáctica y no se mergea.
- Evaluaciones automatizadas de aprendizaje, telemetría o Strict TDD con triangulación nativa: no se adopta el modelo gentle-ai.
- Soporte multi-idioma de artefactos (inglés neutro): se fija español.
