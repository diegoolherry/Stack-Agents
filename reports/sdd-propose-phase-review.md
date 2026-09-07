# Review — sdd-propose-phase

## Metadata
reviewer_round: 1
architecture_drift: false

## Pasada 1: Negocio + Tests
### Requisitos cubiertos
- RF-01: ✅ Template fijo + ubicación canónica única `research/<feature>/proposal.md` en `.opencode/skills/propose/SKILL.md` (líneas 24-76, regla línea 89 prohíbe `specs/<feature>/proposal.md` u otro layout rival); agente `.opencode/agents/propose.md` emite ese output. Sin `openspec/` (verificado: no existe en repo).
- RF-02: ✅ Gate humano bloqueante post-proposal/pre-spec documentado en `.opencode/AGENTS.md` ("Fase Propose" — solo ante aprobación delega al Spec Author; ante rechazo vuelve a Researcher; nunca se avanza a `specs/` sin proposal aprobada) y en `shared/AGENTS.md` paso 2 + paso 3 ("no inicia sin proposal aprobada").
- RF-03: ✅ Obligatoria en Full / exenta en Quick en ambos AGENTS.md (Full incluye `[Propose + gate liviano]`; Quick declara "exento de Propose: no produce ni exige `proposal.md`"; "sin opt-out intra-Full").
- RF-04: ✅ Regla `blocked` en SKILL.md (líneas 78-81: ante findings ausente/ambiguo NO crear ni sobrescribir, retornar envelope `blocked`, no re-explorar/re-entrevistar/reparar); agente declara output `blocked` "sin writes si el findings falta o es ambiguo".
- RF-05: ✅ Contrato Capabilities → spec files en SKILL.md (líneas 83-86: cada fila `new/modified` declara spec file; `none` solo con justificación de refactor puro; Spec Author debe rechazar malformadas).
- RF-06: ✅ `.opencode/AGENTS.md` (fila `propose`, Full con `[Propose + gate liviano]`, Quick exento, sección Fase Propose con retorno a Researcher) y `shared/AGENTS.md` (fila `propose`, paso 2 `[Propose + gate liviano]` con obligatoriedad/exención/retorno, paso 3 "no inicia sin proposal aprobada; rechaza malformadas").
- RF-07: ✅ Existen `.opencode/agents/propose.md` + `.opencode/skills/propose/SKILL.md`; instaladores `init-sdd.ps1`/`init-sdd.sh` copian el dotfolder `.opencode/` recursivamente y sus exclusiones (`node_modules`, manifests, `.gitignore`) no omiten los nuevos paths → distribución automática sin cambios; `git status` muestra cero cambios bajo `.claude/` y `.gemini/`; sin binarios/MCP (SKILL línea 93).
- RF-08: ✅ SKILL exige paths concretos kebab-case (`specs/<feature>/`, `research/<feature>/`), Rollback y Success obligatorios no vacíos, concisión guía ~400–450 palabras SHOULD sin validador (líneas 90-91), consistente con RNF-06.
- RF-09: ✅ Orquestación del Leader documentada (invoca `propose` tras Researcher, presenta al gate, bifurca aprobación→Spec Author con ruta aprobada / rechazo→Researcher) en ambos AGENTS.md.
- RNF-01/02/03/04/05/06: ✅ Solo Markdown + front matter (`mode: subagent`, permisos); sin MCP/`gh`/red en runtime de Propose; permisos `read:*` + `edit: research/**` (+ `bash:*` para ejecución, idéntico al patrón `researcher.md` — no es escritura fuera de alcance); `specs/**` y `architecture/decisions/**` reservados al Spec Author (propose no los toca); `feature_list.json` sin cambio de schema (solo nuevas entradas con campos idénticos); `tasks.md` conserva `área: pipeline`; enforcement por convención + humano declarado.

### Cobertura de criterios de aceptación
- AC-01 (ubicación + 9 secciones + tablas, sin rival): ✅ por construcción del template (Intent, Scope In/Out como una sección normativa, Capabilities, Approach, Affected, Risks, Rollback, Dependencies, Success = 9 normativas; nota línea 76 lo explicita). Verificado: no existe `specs/sdd-propose-phase/proposal.md`, `research/sdd-propose-phase/proposal.md` rival ni `openspec/`. La "proposal de prueba" es la simulación documental de TASK-05 (feature de orquestación sin código de producto; no se exige artefacto `proposal.md` persistido para esta misma feature).
- AC-02 (rechazo → sin writes en `specs/`, retorno a Researcher): ✅ documentado y observable por diseño (gate G1→R en `design.md` + ambos AGENTS.md).
- AC-03 (Quick sin proposal; Full no alcanza Spec sin aprobada): ✅ documentado en ambos AGENTS.md.
- AC-04 (`blocked` sin writes / sin sobrescribir aprobada): ✅ regla en SKILL + envelope del agente.
- AC-05 (Capabilities 1:1 con diff de `specs/` o `None` justificado): ✅ contrato vinculante + deber de rechazo del Spec Author.
- AC-06 (docs con orden + fila + exención + retorno): ✅ verificado en diff (hunks de `.opencode/AGENTS.md` y `shared/AGENTS.md`).
- AC-07 (agente+skill existen, instalación los distribuye, `.claude/`/`.gemini/` intactos): ✅ verificado en disco + instaladores + `git status`.
- AC-08 (rollback/success no vacíos, paths concretos, guía ~450 salvo justificación en gate): ✅ exigido en SKILL (SHOULD, control = gate humano + Spec Author).
- AC-09 (schema intacto, `área` intacta): ✅ `feature_list.json` mantiene `id/title/mode/status/created_at/updated_at`; `tasks.md` usa `área: pipeline` única.
- AC-10 (sin writes fuera de `research/**`, sin ADRs): ✅ front matter del agente (`edit: research/**` únicamente; sin `specs/**` ni `architecture/decisions/**`) + prohibiciones explícitas ("NO emitir ADRs", "NO escribir fuera de `research/**`") + ausencia de ADR de propose en `architecture/decisions/` (solo existe `ADR-001` de `sdd-archive-phase`, ajeno a esta feature).

### Tareas completadas
- TASK-01 ✅, TASK-02 ✅, TASK-03 ✅, TASK-04 ✅, TASK-05 ✅ — las 5 marcadas `[x]` en `specs/sdd-propose-phase/tasks.md`, área única `pipeline` coherente (1 implementer, sin worktrees). Trazabilidad RF declarada por task consistente con la verificada arriba.

## Pasada 2: Calidad
### Métricas (del preflight)
- Preflight no configurado — revisión manual. No existe `reports/sdd-propose-phase-preflight.md`. El repo es plantilla SDD sin suite de tests (`package.json` raíz `{}`, sin runner; `architecture.md` lo confirma), y la feature es solo orquestación en disco (2 Markdown nuevos + 2 docs modificados, sin código ejecutable): CRAP/mutation no aplicables al diff. Verificación manual ejecutada: existencia de archivos, `git diff`/`git status`, grep de instaladores, ausencia de `openspec/` y de writes fuera de alcance. Tests: N/A (sin código testeable) — no bloqueante.

### ADRs respetados
- `architecture/decisions/` no contenía ADRs previos (findings §5, design § "ADRs referenciados: N/A"). El agente `propose` NO emite ADRs por norma (SKILL línea 8, agente línea 14) y no existe ADR de esta feature — correcto: la decisión Opción A adaptada + ubicación + gate + obligatoriedad + SHOULD + `blocked`/Capabilities queda trazada en la baseline (`requirements.md` Q1–Q6, `design.md` § Decisión y § ADRs referenciados), sin árbol de ADRs que extender. `ADR-001` presente es de `sdd-archive-phase`, ajeno; no interfiere.

### Architecture drift
- Sin drift. El diff es solo orquestación (nuevo agente + skill solo-opencode, pipeline documentado), sin código de producto, sin cambios de modelo/schema/paralelismo, sin binarios/MCP, sin tocar `.claude/`/`.gemini/`. El diagrama de `architecture/architecture.md` (Researcher→Spec Author sin Propose) queda descriptivamente desactualizado, pero es la evolución prevista y registrada en la baseline, no una contradicción de decisión arquitectónica; su regeneración corresponde al `architecture_builder`, no a esta feature. `architecture_drift: false`, sin ADR emitido por el reviewer.

### Observaciones de calidad
- Naming/patrones: `propose.md` espeja fielmente el patrón `researcher.md` (mismo front matter `mode: subagent`, mismos permisos `read:*`/`edit: research/**`/`bash:*`); `spec-author.md` conserva en exclusiva `specs/**` + `architecture/decisions/**`. Separación Researcher (factual) / Propose (opinión con scope) / Spec Author (baseline) respetada. Convenciones kebab-case, `research/<feature>/`, `specs/<feature>/`, envelope solo-rutas (anti-teléfono-descompuesto) cumplidas.
- Fidelidad Gentle-AI adaptada: template (Intent, Scope In/Out, Capabilities New/Modified + `None` explícito, Approach, Affected, Risks, Rollback, Dependencies, Success checkboxes), regla no-reentrevista/`blocked`, actualizar-previa-sin-duplicar, concisión ~400–450 como SHOULD sin validador, gate previo al de spec — todo portado sin `openspec/changes/`, sin Engram/MCP, sin binario, sin `config.yaml`. Correcto.
- No bloqueantes (registro): (a) en el working directory coexisten cambios ajenos a esta feature — hunk de `Dispatch de Implementers`/`.opencode/skills/implementer/SKILL.md` (FIX-12 worktrees) y entradas `fix-12/sdd-verify-phase/sdd-archive-phase/sdd-onboard-flow` en `feature_list.json`; no atribuibles a propose, no afectan su veredicto, pero el merge debe separarlos por feature; (b) `shared/AGENTS.md` mantiene numeración duplicada `3.` preexistente (estilo, no introducido por propose); (c) sin `proposal.md` de prueba persistido — aceptable por ser TASK-05 simulación documental de feature de orquestación.

## Veredicto
APRUEBA

### Motivos de rechazo (si aplica)
N/A.
