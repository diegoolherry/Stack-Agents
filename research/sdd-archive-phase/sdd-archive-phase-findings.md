# Findings — sdd-archive-phase

## 1. Archivos relevantes
- `.opencode/AGENTS.md` y `shared/AGENTS.md`: el Cierre actual es PR a main (`scm`) + `feature_list.json → done` + `progress/current.md`; pipeline Full paso 7 "Cierre: PR (scm) + done + current.md". No existe fase Archive ni concepto delta-spec→main-spec. Importa porque Archive debe definirse antes del Cierre sin sustituir la PR.
- `.opencode/skills/scm/SKILL.md` (§ Integración y § Cierre PR): merge de worktrees, suite completa, push de `feature/<id>`, PR con body fijo (Resumen, Tasks, RFs, Áreas, CRs, Checklist UX/UI, Reportes), merge final humano con squash. Importa como límite: Archive no commitea/pushea/mergea; eso sigue siendo `scm`+humano.
- `.opencode/skills/spec_author/SKILL.md`: baseline v1 congelada tras aprobación; solo se modifica vía CR; tasks con `área`; ADRs en `architecture/decisions/`. Importa porque Archive toca specs congeladas y debe respetar el mecanismo CR/ADR.
- `.opencode/skills/reviewer/SKILL.md`: flag `architecture_drift:true` + ADR ante contradicción con `architecture.md`. Importa porque un merge de delta-specs puede introducir drift si reescribe requisitos no mencionados.
- `.opencode/skills/implementer/SKILL.md`: CRs en `changes/<feature>/<área>/CR-NNN.md` (Corrección avanza sola; Adaptativo/Perfectivo/Preventivo paran hasta aprobación; Spec Author versiona baseline v1→v2). Importa porque al cerrar hay que conciliar qué baseline quedó vigente.
- `specs/<feature>/{requirements,design,tasks}.md`, `changes/<feature>/`, `reports/<feature>-{review,security}.md`, `architecture/architecture.md`, `architecture/decisions/`, `feature_list.json`, `progress/current.md`: universo de artefactos cuyo estado final debe quedar trazable tras Archive.
- `init-sdd.ps1/.sh`, `.opencode/`, `shared/`: distribución; si Archive añade convención de carpetas (`archive/`) o reglas, los instaladores deben crearlas.
- Referencia externa verificada vía webfetch (2026-09-07): `.../skills/sdd-archive/SKILL.md` v2.0 (`delegate_only:true`), con Mechanical Copy Contract, Task Completion Gate, Strict-vs-OpenSpec policy, Final-State Authority y `sdd-archive-compose` nativo.

## 2. Patrones existentes
- **Patrón actual de cierre**: no hay merge de specs ni carpeta archive; la baseline vive siempre en `specs/<feature>/` y la historia en `changes/`+`reports/`+PR. La fuente de verdad por feature es su carpeta `specs/<feature>/`; no hay `specs/` canónicos por dominio que acumulan comportamiento (a diferencia de `openspec/specs/{domain}/spec.md`).
- **Patrón de versionado**: baseline v1→v2 vía CRs aprobados (Spec Author actualiza). Patrón reutilizable para "sync" sin inventar merge semántico.
- **Patrón de auditoría**: `reports/` + ADRs + body de PR con enlaces a reportes. Reutilizable para el "archive report" como acta de cierre.
- **Referencia gentle-ai observada sdd-archive v2.0 (factual)**:
  - Rol: sub-agente dedicado; fusiona delta specs en main specs (fuente de verdad) y mueve change folder a `openspec/changes/archive/YYYY-MM-DD-{change}/`; completa el ciclo SDD.
  - Precondiciones observadas: estado estructurado con `reviewGate.result: allow`; Task Completion Gate (persisted tasks artifact manda; `sdd-apply` marca, `sdd-archive` valida; si hay `- [ ]` → `blocked`, salvo reconciliación excepcional de stale checkboxes con prueba en apply-progress/verify-report y registro del motivo); CRITICAL en verify-report siempre bloquea (sin override); `actionContext.mode: workspace-planning` → STOP; respetar `allowedEditRoots`; oferta RDD `reviewOffer` nunca es estado de archive.
  - Strict-vs-OpenSpec: OpenSpec permite archivar incompletos con confirmación; gentle-ai es más estricto (incompletos bloquean salvo stale probado; CRITICAL nunca con override; artefactos faltantes solo como partial intencional registrado).
  - Final-State Authority observada: el archive report describe el estado AL CIERRE, no snapshots intermedios; jerarquía: 1) tasks persistido, 2) hechos finales explícitos del launch prompt, 3) verify-report/apply-progress (snapshots). Contradicciones no rankeables se registran con ambas fuentes y fechas, nunca se resuelven en silencio; números finales de la fuente de mayor rango; nunca fusionar defectos distintos en una historia causal sin evidencia.
  - Mechanical Copy Contract observado (MANDATORIO): copiar/mover solo con shell (`cp -R`/`mv`/`git mv`), NUNCA Read→Write del modelo; `diff -r` obligatorio con salida verbatim en el resultado (vacío = único pass; faltante o con diff = FAIL); sin shell → `blocked` (sin fallback). Composición a main specs NUNCA manual: comando nativo `sdd-archive-compose --canonical ... --delta ... --output ....compose-tmp && mv` (aplica RENAMED→MODIFIED→REMOVED→ADDED, preserva no mencionados byte-for-byte, atómico vía tmp+mv; error = `blocked` con stderr exacto). Nuevo dominio sin main spec = copia mecánica con tmp+cp+diff+mv. Colisiones de destino no se auto-resuelven (sin sufijos/overwrites); recuperación de nesting histórico solo manual.
  - Verificación observada: checklist (main specs actualizados, carpeta movida, artefactos completos, tasks sin pendientes salvo reconciliación aprobada, active changes limpio) + `diff -r` verbatim. Reporte de archive MANDATORIO (`archive-report`, topic `sdd/{change}/archive-report`, type architecture) con observation IDs en modo Engram.
  - Retorno observado: `## Change Archived` (change, destino, tabla Specs Synced por dominio Created/Updated, Archive Contents, Source of Truth Updated, SDD Cycle Complete).
- **Contraste factual**: Stack-Agents no tiene main-specs por dominio ni change folders efímeros; archivar como "mover `specs/<feature>/`" rompería la fuente de verdad actual y la convención de instaladores. Lo portable es el acta de cierre + conciliación de baseline, no el merge semántico con binario.

## 3. Dependencias afectadas
- **Directas**: `specs/<feature>/` (¿se congela, se versiona vFinal, se mueve a `specs/archive/` o se deja?); posible nueva carpeta `specs/archive/` o `research/archive/` si se adopta movimiento fechado; `reports/` (nuevo `reports/<feature>-archive.md`); `architecture/decisions/` (ADRs de riesgos estructurales pendientes); `feature_list.json` + `progress/current.md` (quién marca `done`: Leader tras Archive o tras PR).
- **Indirectas**: `.opencode/AGENTS.md`+`shared/AGENTS.md` (orden `... Verify → Archive → Cierre PR`); `.opencode/agents/`+`.opencode/skills/` (nuevo `archive.md`/skill vs paso `scm` vs paso Leader); `init-sdd.*` (crear `specs/archive/` si se adopta); `.claude/`/`.gemini/` no tocados (solo-opencode).
- **Impacto en pipeline Full observado**: Archive sería el último paso agente antes del Cierre humano (`scm` PR). Debe correr tras Verify PASS (y Reviewer/Security según pipeline) y antes del push/PR. Si mueve carpetas, la PR y su body (que referencia `specs/<feature>/...` y `reports/...`) deben apuntar a rutas estables.
- **Criterios escalables**: sin binario `sdd-archive-compose` (composición semántica por secciones ADDED/MODIFIED/REMOVED/RENAMED no portable sin ese nativo); sin Engram/MCP; operaciones con shell estándar (`mv`, `diff -r`) admisibles porque ya se usan vía tool bash, pero la regla "sin shell → blocked" debe adaptarse (Stack-Agents siempre tiene bash). Modos `engram/hybrid` = no-fit; fichero en `reports/` = fit.
- **Dependencias externas**: ninguna nueva. `git mv`/`mv`/`diff -r` del entorno; `gh` CLI sigue en `scm`.

## 4. Riesgos detectados
- **Riesgo de modelo de specs incompatible**: no hay `openspec/specs/{domain}/` canónicos ni delta specs por capability; forzar merge semántico inventa un segundo sistema de specs rival de `specs/<feature>/`. El valor portable está en conciliar baseline v1→vN + CRs, no en componer requisitos por nombre.
- **Riesgo de pérdida/corrupción**: la razón del Mechanical Copy Contract (el modelo trunca/altera bytes en Read→Write silenciosamente) aplica igual aquí; cualquier movimiento debe ser mecánico + `diff -r` verbatim. Evidencia local: instaladores ya hacen copias recursivas; un Archive mal definido podría mover `specs/<feature>/` y romper links del body de PR y de `feature_list.json`.
- **Riesgo de archivar verde falso**: tasks con checkboxes stale, CRITICAL en verify/review pendientes, o CRs Adaptativos sin aprobación. Las gates observadas (tasks gate + CRITICAL bloquea + reconciliación solo con prueba + partial intencional registrado) son reutilizables como convención.
- **Riesgo de colisión/fechado**: prefijo `YYYY-MM-DD-{change}` colisiona si dos archives el mismo día; gentle-ai prohíbe auto-sufijos/overwrites (STOP y resolución manual). Si se adopta archive físico, copiar esa regla.
- **Riesgo de solape con `scm`/Leader**: quién mueve, quién marca `done`, quién actualiza `progress/current.md`. Hoy el Leader marca estados y `scm` hace PR; Archive no debe asumir ninguno sin definirlo.
- **Riesgo de auditoría vs autoridad de delivery**: Judgment Day/RDD recuerdan que review/archivo no autorizan delivery (lo hace la política del repo + humano que mergea). Archive es acta, no gate de merge.
- **Compatibilidad observada**: acta de cierre + gates + copia mecánica + fechado = **adaptar**; merge semántico con `sdd-archive-compose` + Engram observation IDs + `openspec/changes/archive/` = **no-fit** sin ese layout y binario.
- **Edge cases**: repos sin Verify (Quick mode) — ¿Archive exige verify-report o acepta review solo?; partial archive intencional (qué se registra); nesting histórico malformado (solo recuperación manual); destructive merge (avisar y pedir confirmación, como en gentle-ai).

## 5. ADRs relevantes
- N/A — sin ADRs en `architecture/decisions/`.
- **Plan de spec sugerido (inputs para Spec Author, sin decisión de diseño)**:
  1. `requirements.md`: RFs — precondiciones (Verify/Review PASS, cero CRITICAL pendientes, tasks 100% en artefacto persistido, CRs no-corrección aprobados); acta `reports/<feature>-archive.md` (specs sincronizados/consolidados, contenidos, source of truth, ciclo completo); reglas de no-deleción de archive y de colisión; RNFs — operaciones mecánicas + `diff -r` verbatim en el acta; sin binarios/MCP.
  2. `design.md`: definir si Archive mueve carpetas (`specs/archive/YYYY-MM-DD-<id>/` vs dejar `specs/<id>/` inmutable) o solo emite acta; orden exacto vs PR/`done`; formato del acta; reconciliación de baseline v1→vN y de CRs; qué hace con ADRs pendientes.
  3. `tasks.md`: con `área` (p. ej. única `pipeline`); incluir instaladores si se crea carpeta archive y actualización de AGENTS en ambos.
- **Opciones observadas para Spec Author (mínimo 2, sin prescripción)**:
  - Opción A (acta sin movimiento): Archive = validación de gates + `reports/<feature>-archive.md`; `specs/<feature>/` queda inmutable como audit trail; PR referencia rutas estables. Mínimo riesgo de rotura.
  - Opción B (acta + movimiento fechado adaptado): mover copia a `specs/archive/YYYY-MM-DD-<id>/` (o `research/archive/`) con shell + `diff -r`, manteniendo `specs/<id>/` o no según se defina; máxima fidelidad a gentle-ai, mayor riesgo de links rotos.
  - Opción C (paso `scm`/Leader sin agente nuevo): checklist de cierre ejecutada por Leader/`scm` pre-PR; coste mínimo, enforcement por convención.
- **Preguntas abiertas para Spec Author**:
  1. ¿Archive mueve artefactos o solo emite acta? ¿Qué carpeta exacta y con qué prefijo de fecha?
  2. ¿Precondiciones bloqueantes: Verify PASS + Review APRUEBA + cero CRITICAL + tasks 100% + CRs aprobados?
  3. ¿Reconciliación de stale checkboxes permitida y con qué prueba exacta (qué report la respalda)?
  4. ¿Partial archive intencional permitido y cómo se marca (`intentional-with-warnings`)?
  5. ¿Quién ejecuta Archive (agente `archive` nuevo vs `scm` vs Leader) y quién marca `done`/`current.md` después?
  6. ¿Se exige `diff -r` verbatim en el acta para cada copia/movimiento?
  7. ¿Cómo se concilian baseline v1→vN, CRs y ADRs pendientes en el acta?
  8. ¿Archive en modo Quick (sin Verify) con qué gates degradados?
