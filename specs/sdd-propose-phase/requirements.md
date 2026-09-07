# Requirements — sdd-propose-phase

Baseline: v1
Feature: sdd-propose-phase

## Descripción general

Esta feature introduce la fase **Propose** al pipeline SDD en modo Full (solo opencode): entre el Researcher y el Spec Author se produce un artefacto `proposal.md` que fija intent, scope (in/out), approach, riesgos, rollback y criterios de éxito, más un contrato `Capabilities` que indica al Spec Author qué archivos de spec debe crear o actualizar. La proposal se somete a un **gate humano bloqueante pre-spec**, previo e independiente del gate de baseline existente. En modo Quick la fase no existe. Todo es portable en disco (Markdown + front matter), sin binarios ni MCP obligatorio, sin tocar `.claude/` ni `.gemini/`.

**Decisiones cerradas sobre las 6 preguntas abiertas del findings** (trazables a RF/AC):

| # | Pregunta | Decisión | Trazabilidad |
|---|---|---|---|
| Q1 | Ubicación canónica de `proposal.md` | `research/<feature>/proposal.md` (única canónica; no se admite espejo en `specs/`) | RF-01, AC-01 |
| Q2 | Gate bloqueante o consultivo, quién aprueba | Bloqueante en Full; aprueba humano siempre; el Leader no auto-aprueba; rechazo → vuelta a Researcher | RF-02, AC-02 |
| Q3 | Obligatoriedad | Obligatoria en modo Full; exenta en modo Quick; sin opt-in/opt-out intra-Full | RF-03, AC-03 |
| Q4 | Presupuesto de tamaño y tablas obligatorias | Estructura y tablas obligatorias; concisión ~450 palabras como guía SHOULD (no validador duro); rollback y success criteria obligatorios | RF-08, AC-08 |
| Q5 | Regla no-reentrevista + contrato Capabilities | Sí a ambas: ante findings ausente/ambiguo retorna `blocked` sin re-explorar; Capabilities es contrato vinculante hacia spec files | RF-04, RF-05, AC-04, AC-05 |
| Q6 | Agente vs skill vs paso | Opción A adaptada: nuevo agente `.opencode/agents/propose.md` + nueva skill `.opencode/skills/propose/SKILL.md` (solo opencode) | RF-06, RF-07, AC-06, AC-07 |

## Requisitos Funcionales

- **RF-01**: El pipeline Full debe producir, para cada feature en modo `full`, un archivo canónico `research/<feature>/proposal.md` con las secciones fijas: Intent, Scope (In / Out), Capabilities (New / Modified), Approach, Affected Areas (tabla path/impacto), Risks (tabla riesgo/probabilidad/mitigación), Rollback Plan, Dependencies, Success Criteria (checkboxes). No debe existir otra ubicación canónica ni layout rival tipo `openspec/changes/`.
- **RF-02**: Debe existir un gate humano bloqueante post-proposal y pre-spec: el Spec Author no debe iniciar `specs/<feature>/{requirements,design,tasks}.md` sin una proposal aprobada. Si el humano rechaza, el Leader debe devolver la feature al Researcher (re-exploración), no avanzar a spec.
- **RF-03**: La fase Propose debe ser obligatoria en modo Full y estar exenta en modo Quick (que sigue siendo solo `Implementer → Reviewer`). No debe existir exención ni opt-out de Propose dentro del modo Full.
- **RF-04**: El proposer no debe re-explorar el codebase ni re-entrevistar ni reparar decisiones pendientes: si el findings (`research/<feature>/<feature>-findings.md`) o el brief falta o es ambiguo, debe retornar estado `blocked` listando las preguntas pendientes, sin emitir proposal.
- **RF-05**: La sección Capabilities de la proposal debe funcionar como contrato vinculante hacia el Spec Author: cada capability debe declarar qué archivos de spec crea o actualiza (`requirements.md` / `design.md` / `tasks.md` / ADR opcional); si es refactor puro sin spec nuevo debe declararse `None` explícito.
- **RF-06**: `.opencode/AGENTS.md` y `shared/AGENTS.md` deben documentar el orden Full `Researcher → [Propose + gate liviano] → Spec Author → [Gate baseline] → Implementer(s) → …`, el rol `propose`, la exención en Quick y la regla de retorno a Researcher ante rechazo.
- **RF-07**: La fase debe implementarse como agente ejecutor dedicado `.opencode/agents/propose.md` más skill propia `.opencode/skills/propose/SKILL.md`, distribuibles por los instaladores existentes mediante copia del dotfolder, sin binarios, sin MCP obligatorio y sin modificar `.claude/` ni `.gemini/`.
- **RF-08**: Cada proposal debe usar paths concretos existentes o a crear (kebab-case, convenciones `specs/<feature>/`, `research/<feature>/`), incluir Rollback Plan y Success Criteria no vacíos, y mantener el cuerpo conciso (guía: ~450 palabras excluyendo tablas, sin validador nativo).
- **RF-09**: El Leader debe orquestar la fase: invocar a `propose` tras un Researcher exitoso, presentar `research/<feature>/proposal.md` al gate humano, y solo ante aprobación delegar al Spec Author pasando la ruta de la proposal aprobada como input previo.

## Requisitos No Funcionales

- **RNF-01**: Portabilidad en disco — solo Markdown con front matter (`mode`, `permissions`) más documentación; ningún ejecutable, binario, hook nativo ni servicio externo.
- **RNF-02**: Sin dependencias runtime nuevas — no se exige MCP (Engram/Context7), ni `gh` CLI, ni red para ejecutar Propose; webfetch queda fuera del runtime.
- **RNF-03**: Permisos mínimos — el agente `propose` solo puede leer el repo y escribir `research/**` (la escritura de `specs/**` sigue reservada al Spec Author); no emite ADRs (reservado al Spec Author en `architecture/decisions/`).
- **RNF-04**: Compatibilidad de esquema y paralelismo — no se altera el schema de `feature_list.json` (`id/title/mode/status/created_at/updated_at`) ni la unidad de paralelismo por `área` de `tasks.md`.
- **RNF-05**: Convenciones — slug kebab-case para features, minúsculas/plural en directorios, retorno anti-teléfono-descompuesto (solo rutas en disco).
- **RNF-06**: Enforcement por convención + revisión humana — al no haber validador nativo, el límite de tamaño es guía documentada y el gate humano más la revisión del Spec Author (que debe rechazar proposals malformadas) son el mecanismo de control.

## Criterios de Aceptación

- [ ] **AC-01**: Para una feature de prueba en modo Full existe `research/<feature>/proposal.md` con las 9 secciones fijas y ambas tablas con al menos una fila de paths/riesgos concretos; no existe `openspec/` ni `specs/<feature>/proposal.md` canónico rival. (RF-01)
- [ ] **AC-02**: Con proposal rechazada por el humano es observable que no se crea ni modifica ningún archivo bajo `specs/<feature>/` y que el siguiente paso orquestado es Researcher (re-exploración), verificable en el log/decisión del Leader. (RF-02, RF-09)
- [ ] **AC-03**: Una feature en modo Quick completa `Implementer → Reviewer` sin producir ni exigir `proposal.md`; una feature en modo Full no alcanza Spec Author sin proposal aprobada. (RF-03)
- [ ] **AC-04**: Ante findings ausente o marcado ambiguo, la invocación a `propose` retorna `blocked` con la lista de preguntas pendientes y no escribe `proposal.md` (o no la sobrescribe si ya existía una aprobada). (RF-04)
- [ ] **AC-05**: La proposal de prueba declara Capabilities que mapean 1:1 a los archivos que el Spec Author crea/actualiza después (o `None` explícito con justificación de refactor puro), verificable por inspección del diff de `specs/<feature>/`. (RF-05)
- [ ] **AC-06**: `.opencode/AGENTS.md` y `shared/AGENTS.md` contienen el orden con `[Propose + gate]` entre Researcher y Spec Author, la fila del rol `propose`, la exención Quick y la regla de retorno a Researcher. (RF-06, RF-09)
- [ ] **AC-07**: Existen `.opencode/agents/propose.md` y `.opencode/skills/propose/SKILL.md`, una instalación limpia vía `init-sdd` los distribuye, y `git status` muestra cero cambios bajo `.claude/` y `.gemini/`. (RF-07)
- [ ] **AC-08**: La proposal de prueba tiene Rollback Plan y Success Criteria no vacíos, usa paths concretos con convenciones del repo, y su cuerpo (sin tablas) no supera sustancialmente la guía de ~450 palabras salvo justificación registrada en el gate. (RF-08, RNF-06)
- [ ] **AC-09**: `feature_list.json` mantiene su schema sin campos nuevos y `tasks.md` de esta feature conserva el campo `área` como unidad de paralelismo. (RNF-04)
- [ ] **AC-10**: El agente `propose` no escribe fuera de `research/**` ni emite archivos en `architecture/decisions/` (verificable por front matter de permisos y por ausencia de writes fuera de alcance en una ejecución de prueba). (RNF-03)

## Fuera de Alcance

- Tocar `.claude/`, `.gemini/` o cualquier provider distinto de opencode (la paridad se documenta como no tocada).
- Adoptar `openspec/changes/`, `openspec/specs/`, `openspec/config.yaml`, modos de persistencia `engram/openspec/hybrid/none` o store Engram/MCP.
- Binario o validador nativo de proposal (equivalente a `sdd-verify-validate` / `sdd-archive-compose`), CI de tamaño, o Judgment Day / Archive / Verify (features hermanas `sdd-verify-phase`, `sdd-archive-phase`).
- Emisión de ADRs desde Propose; los ADRs siguen reservados al Spec Author.
- Cambios de comportamiento en Implementer, Reviewer, Security Auditor, `scm` o Discovery; solo los consumen indirectamente vía mejor filtrado temprano.
- Re-entrevista greenfield o sustitución de `research/project-brief.md`.
