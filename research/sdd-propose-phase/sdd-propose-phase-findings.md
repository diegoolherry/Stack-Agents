# Findings — sdd-propose-phase

## 1. Archivos relevantes
- `.opencode/AGENTS.md`: pipeline Full actual `Discovery/Arch → Researcher → Spec Author → [Gate] → Implementer(s) → Integración (scm) → Reviewer → Security Auditor`. No existe fase Propose explícita ni artefacto `proposal.md`. Importa porque cualquier Propose debe insertarse entre Researcher y Spec Author sin romper el Gate existente.
- `shared/AGENTS.md`: mismo pipeline Full (pasos 1-7), schema `feature_list.json` (`id/title/mode/status/created_at/updated_at`), paralelismo de Implementers por `área`. Importa porque Propose no debe alterar el schema ni la unidad de paralelismo (`área`).
- `architecture/architecture.md`: plantilla SDD portable sin código de producto; instaladores `init-sdd.ps1/.sh` de 7 etapas; sin ADRs en `architecture/decisions/`. Importa porque Propose debe ser portable (solo Markdown en disco, sin binarios) y distribuible vía dotfolder + `shared/`.
- `.opencode/agents/leader.md`: Leader orquesta y delega, nunca edita `specs/` ni `research/` directamente. Importa porque el gate Propose→Spec sería decisión del Leader + humano, no auto-avance.
- `.opencode/agents/researcher.md` + `.opencode/skills/researcher/SKILL.md`: Researcher solo descubre y reporta en `research/<feature>/<feature>-findings.md` (5 secciones fijas), sin recomendaciones de diseño. Importa porque Propose es el primer lugar donde aparece "intent/scope/approach" con opinión; hoy nadie lo produce.
- `.opencode/agents/spec-author.md` + `.opencode/skills/spec_author/SKILL.md`: consume findings + ADRs + `architecture.md` y produce `specs/<feature>/{requirements,design,tasks}.md` + ADR opcional; congela baseline v1; cada task exige campo `área`. Importa porque Propose sería su input previo (contrato de capacidades).
- `.opencode/agents/discovery.md` + `.opencode/skills/discovery/SKILL.md`: entrevista greenfield → `research/project-brief.md`. Importa porque Propose no existe ni siquiera como entrevista parcial: hoy se salta de brief/findings directo a requirements.
- `.opencode/skills/scm/SKILL.md`: ramas `feature/<id>`, worktrees `wt-<feature>-<área>`, PR como único cierre. Importa porque `proposal.md` debe vivir en `research/` o `specs/` (trazable en la rama) y no crear un layout rival tipo `openspec/changes/`.
- `feature_list.json`: ya registra `sdd-propose-phase/mode:full/status:pending`. Importa como contexto de alcance (solo-opencode, escalable).
- `specs/template-hardening/{requirements,design,tasks}.md` + `research/template-hardening/template-hardening-findings.md`: ejemplo de baseline real sin proposal previa. Importa como caso de comparación (qué se habría filtrado con Propose).
- Referencia externa verificada vía webfetch (2026-09-07): `https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/internal/assets/skills/sdd-propose/SKILL.md` (v2.0, `delegate_only:true`), `docs/components.md` (tabla SDD 10 fases + Judgment Day).

## 2. Patrones existentes
- **Patrón actual pre-spec**: Researcher entrega hallazgos factuales (archivos/patrones/dependencias/riesgos/ADRs) → Spec Author redacta baseline v1 → Gate humano. No hay documento intermedio que fije intent/scope/out-of-scope/approach/riesgos/rollback/criterios de éxito antes de escribir RF/RNF/AC.
- **Patrón de gates actual**: un solo Gate humano (post-spec, pre-implementación). Preflight del Reviewer es degradable ("Preflight no configurado — revisión manual", sin rechazo por falta de métricas). Patrón reutilizable para un eventual gate liviano post-proposal.
- **Patrón de artefactos en disco**: todo en `research/`, `specs/`, `reports/`, `changes/`, `architecture/decisions/`; Leader recibe solo rutas (anti-teléfono-descompuesto). Cualquier proposal debe seguirlo.
- **Patrón portable solo-opencode**: skills en Markdown + agentes con front matter (`mode`, `permissions`); sin binarios ni MCP obligatorio. `scm` usa `gh` CLI como fallback documentado.
- **Referencia gentle-ai observada (sdd-propose v2.0, factual)**:
  - Sub-agente ejecutor dedicado `sdd-propose` con ORCHESTRATOR GATE (si el orquestador carga la skill, debe delegar, no ejecutar inline).
  - Input: change-name + handoff pre-proposal confirmado + modo de persistencia (`engram | openspec | hybrid | none`).
  - Output: `proposal.md` dentro del change folder (`openspec/changes/{change}/proposal.md` en modo openspec/hybrid; solo Engram en modo engram; inline en modo none).
  - Template fijo: Intent, Scope (In/Out), Capabilities (New/Modified — contrato con sdd-spec; "None" explícito si refactor puro), Approach, Affected Areas (tabla path/impacto), Risks (tabla riesgo/probabilidad/mitigación), Rollback Plan, Dependencies, Success Criteria (checkboxes).
  - Reglas observadas: conciso (<450 palabras), rollback y success criteria obligatorios, paths concretos, aplicar `rules.proposal` de `openspec/config.yaml`, si existe proposal previa leerla y actualizarla, retorno envelope Sección D de `sdd-phase-common.md`.
  - Orquestación observada (README gentle-ai): `Explore → Propose → [usuario aprueba propuesta? no→Explore] → Spec → Design → Tasks → Apply → Verify → ... → Archive`. El gate de proposal es previo al de spec.
- **Contraste factual**: Stack-Agents colapsa Explore+Propose en Researcher (sin intent/rollback/success criteria ni sección Capabilities como contrato). gentle-ai los separa y hace de Capabilities el contrato que dice a sdd-spec qué spec files crear/actualizar.

## 3. Dependencias afectadas
- **Directas**: `.opencode/AGENTS.md` y `shared/AGENTS.md` (definición del pipeline Full y orden de fases); `.opencode/agents/` (si se añade agente `propose.md` o se extiende `researcher`/`spec-author`); `.opencode/skills/` (nueva skill `propose/` o extensión de `researcher`/`spec-author`); `research/` (ubicación de `proposal.md` o `research/<feature>/proposal.md`); `specs/<feature>/` (consumidor del contrato de capacidades).
- **Indirectas**: `feature_list.json` (sin cambio de schema requerido; el estado `pending/in_progress` ya cubre la fase); `init-sdd.ps1/.sh` + dotfolder `.opencode/` (si la skill/agente nuevo debe distribuirse); `.claude/` y `.gemini/` (fuera de alcance por requisito solo-opencode, pero la paridad de plantilla debe documentarse como no tocada); `architecture/decisions/` (Propose no emite ADRs; solo Spec Author lo hace).
- **Impacto en pipeline Full observado**: inserción entre Researcher y Spec Author: `Researcher → [Propose + gate liviano] → Spec Author → [Gate baseline] → Implementer → ...`. Sin impacto en Implementer/Reviewer/Security Auditor salvo que la proposal mejore el filtrado temprano (menos CRs adaptativos/perfectivos).
- **Criterios escalables observados**: sin binarios (a diferencia de `gentle-ai` binario + `gga` + `sdd-archive-compose` nativo + `sdd-verify-validate`); sin MCP obligatorio (a diferencia de Engram/Context7 en gentle-ai); portable en disco (Markdown + front matter). Modos `engram/openspec/hybrid/none` de gentle-ai no son portables tal cual; el modo adaptable es el equivalente a su `none`+fichero (`proposal.md` en `research/`).
- **Dependencias externas**: ninguna nueva requerida. `gh` CLI sigue siendo solo fallback de `scm`. Webfetch usado solo para esta investigación, no es dependencia runtime.

## 4. Riesgos detectados
- **Gap real**: no hay Propose explícito; el salto findings→requirements deja intent/scope/out-of-scope/rollback/success-criteria implícitos. Evidencia: template `requirements.md` tiene "Fuera de Alcance" pero se redacta ya dentro de la baseline, sin aprobación previa separada.
- **Riesgo de burocracia**: doble gate (proposal + baseline) puede ralentizar features chicas. Dato atenuante: modo Quick (`Implementer → Reviewer`) ya existe y puede eximir Propose; el pipeline Full es opt-in por `mode:full`.
- **Riesgo de solape Researcher/Propose**: si Propose re-explora código duplica trabajo. En gentle-ai el handoff es explícito (exploration analysis o input directo + decisiones confirmadas; el proposer no re-entrevista ni repara decisiones pendientes, retorna `blocked`). Reutilizable como regla.
- **Riesgo de formato rival**: importar `openspec/changes/` + `openspec/specs/` + `openspec/config.yaml` rompería convenciones (`specs/`, `research/`, minúsculas/plural, kebab-case) y los instaladores. Debe adaptarse a `research/<feature>/proposal.md` o `specs/<feature>/proposal.md`.
- **Riesgo de enforcement**: presupuesto "MUST under 450 words" y `rules.proposal` de config.yaml no tienen equivalente local; sin validador nativo (gentle-ai usa binario `gentle-ai sdd-verify-validate` / `sdd-archive-compose`) solo queda convención documentada + revisión humana/Reviewer.
- **Riesgo de delegación**: gentle-ai exige sub-agente dedicado con `delegate_only:true`. En Stack-Agents crear `.opencode/agents/propose.md` añade superficie a mantener en 3 providers; extender `spec-author` o `researcher` reduce superficie pero mezcla responsabilidades (researcher tiene prohibido opinar diseño).
- **Compatibilidad observada (fit/no-fit/adaptar, factual)**: Propose como documento/contrato = **adaptar** (formato y gate portables, sin Engram/binario). Propose como binario/validador nativo o store Engram/MCP = **no-fit** (viola criterios escalables). Propose como paso dentro de Researcher = **no-fit** (viola regla "sin opiniones de diseño" del Researcher).
- **Deuda/edge cases**: `architecture/decisions/` vacío (sin ADRs que restrinjan approach); instaladores copian `node_modules/` por copia recursiva (ruido, no bloqueante); sin CI que valide tamaño de proposal.

## 5. ADRs relevantes
- N/A — `architecture/decisions/` no contiene ADRs (verificado en `architecture/architecture.md` § "Decisiones y ausencias actuales" y directorio `architecture/` con un solo archivo).
- **Plan de spec sugerido (inputs para Spec Author, sin decisión de diseño)**:
  1. `specs/sdd-propose-phase/requirements.md`: RFs observables — producir `proposal.md` con secciones Intent/Scope/Capabilities/Approach/Affected/Risks/Rollback/Dependencies/Success; gate humano liviano pre-spec; exención en modo Quick; ubicación en `research/<feature>/` (o `specs/<feature>/`) con trazabilidad en rama `feature/<id>`; RNFs — <450 palabras o límite documentado, sin binarios/MCP, portable vía `init-sdd`.
  2. `design.md`: puntos de integración a definir — nuevo agente `propose.md` vs paso en `spec-author` vs skill `propose/`; orden exacto en `.opencode/AGENTS.md` + `shared/AGENTS.md`; contrato Capabilities→spec files; qué hace el Leader si proposal rechazada (vuelta a Researcher).
  3. `tasks.md`: tareas por área (`área` única si es solo plantilla, p. ej. `plantilla` o `pipeline`); incluir actualización de instaladores/dotfolder si aplica y actualización de `research/`+`specs/` de ejemplo.
- **Opciones observadas para Spec Author (mínimo 2, sin prescripción)**:
  - Opción A (observada en gentle-ai, adaptada): agente ejecutor dedicado `propose` + `SKILL.md` propio + gate humano pre-spec; mayor fidelidad, mayor superficie (nuevo `.opencode/agents/propose.md`).
  - Opción B (paso en agente existente): Spec Author fase 0 "proposal" previa a requirements dentro del mismo `specs/<feature>/proposal.md`; menor superficie, mezcla propuesta con baseline salvo gate intermedio explícito.
  - Opción C (minimalista): template `research/<feature>/proposal.md` + checklist del Leader sin agente/skill nuevos; coste mínimo, enforcement solo por convención.
- **Preguntas abiertas para Spec Author**:
  1. ¿Ubicación canónica de `proposal.md`: `research/<feature>/proposal.md` vs `specs/<feature>/proposal.md`?
  2. ¿Gate de proposal bloqueante o consultivo, y quién lo aprueba (humano siempre o Leader en cambios chicos)?
  3. ¿Propose obligatorio en modo Full y exento en Quick, o también opt-in dentro de Full?
  4. ¿Se adopta el presupuesto de tamaño (<450 palabras) y las tablas Affected/Risks/Success como obligatorias?
  5. ¿Se replica la regla "proposer no re-entrevista ni repara decisiones; retorna blocked" y el contrato Capabilities→spec files?
  6. ¿Nuevo agente `.opencode/agents/propose.md` vs skill `propose/` vs paso en `spec-author` (considerando mantener solo-opencode y no tocar `.claude/`/`.gemini/`)?
