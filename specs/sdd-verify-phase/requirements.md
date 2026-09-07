# Requirements — sdd-verify-phase

Baseline: v1
Feature: sdd-verify-phase

## Descripción general

Crear la fase SDD **Verify** como quality gate funcional independiente en el pipeline **Full solo-opencode**, ubicado sobre el diff integrado post-`scm` y pre-`Reviewer`. Verify comprueba conformidad contra la baseline aprobada (`requirements.md` / `design.md` / `tasks.md` + CRs) con evidencia de runtime real (tests/build/type-check del proyecto destino). No sustituye al Reviewer (calidad/drift) ni al Security Auditor (seguridad); los precede y les entrega evidencia estructurada en `reports/<feature>-verify.md` con veredicto `PASS | PASS WITH WARNINGS | FAIL`.

Modo de la feature: `full`. Estado inicial en `feature_list.json`: `in_progress`. Alcance restringido a **solo-opencode** (`.opencode/` + `shared/`); `.claude/` y `.gemini/` no se tocan. Sin binario validador, sin MCP, sin Engram.

## Requisitos Funcionales

- **RF-01**: Verify corre exclusivamente sobre el **diff integrado** de la rama `feature/<feature-id>` post-integración `scm` (worktrees ya mergeados). Nunca verifica worktrees sueltos (`wt-<feature-id>-<área>`).
- **RF-02**: Verify comprueba **completitud de tasks**: toda task de `specs/<feature>/tasks.md` marcada pendiente → veredicto `FAIL` con estado `blocked`, sin ejecutar la suite completa (solo conteo + reporte).
- **RF-03**: Verify construye la **matriz requisito/escenario → evidencia + covering test pasado en runtime**. Cada RF/AC de `requirements.md` debe mapear a ≥1 test que pasó en runtime con comando + exit code registrados.
- **RF-04**: Verify comprueba **coherencia con `design.md`**: desviación del diff respecto al diseño = `WARNING`, salvo que rompa un RF/AC, en cuyo caso escala a `CRITICAL` (FAIL).
- **RF-05**: Verify ejecuta evidencia de runtime con los **runners del proyecto destino** (`npm test` / `dotnet test` / equivalente + build + type-check si existen), registrando comando, exit code y hash de salida (`test_output_hash` / `build_output_hash` como campos documentados, sin binario).
- **RF-06**: Verify **nunca edita código ni fija issues**; solo reporta hallazgos accionables con archivo/línea y test faltante o fallido.
- **RF-07**: Verify clasifica cada hallazgo en severidad cerrada **CRITICAL | WARNING | SUGGESTION** y emite un único veredicto cerrado **PASS | PASS WITH WARNINGS | FAIL** con regla de cómputo determinista (ver RF-08).
- **RF-08**: Regla de veredicto: `FAIL` si ≥1 CRITICAL o si hay tasks pendientes (blocked); `PASS WITH WARNINGS` si 0 CRITICAL y ≥1 WARNING; `PASS` si solo SUGGESTIONs o sin hallazgos.
- **RF-09**: Efecto del veredicto (bloqueante parcial): `FAIL` → 1 vuelta a Implementer (dentro del presupuesto Verify); `PASS WITH WARNINGS` → avanza a Reviewer con warnings visibles; `PASS` → avanza a Reviewer limpio.
- **RF-10**: Presupuesto de vueltas Verify **propio e independiente** del de Reviewer y del contador de CRs: **máx. 2 rondas Verify → Implementer → Verify**. Si no converge, escala a humano. Regla anti-loop: Verify nunca inicia otro review/fix loop por sí mismo; una contradicción irresoluble spec-vs-design-vs-diff = `FAIL` + escalación, no reintento.
- **RF-11**: Delimitación de solape con Reviewer P1: Verify es **autoridad de conformidad funcional** (tasks completas, RF/escenario→test pasado, coherencia design). Reviewer P1 **consume** `reports/<feature>-verify.md` como evidencia y no re-verifica lo ya PASS salvo contradicción concreta documentada; Reviewer conserva autoridad exclusiva sobre P2 (CRAP/mutation/naming/drift/ADRs) y sobre el veredicto final APRUEBA/RECHAZA.
- **RF-12**: Relación con preflight: Verify **consume** `reports/<feature>-preflight.md` si existe como evidencia adicional; **no lo reemplaza ni lo exige**. Si no existe, lo documenta y ejecuta los checks mínimos del RF-05 (coexiste, no sustituye).
- **RF-13**: Degradación documentada por artefactos faltantes o sin runner (matriz cerrada, ver AC-09): dimensions skipeadas se registran como `SKIPPED` con motivo, nunca como PASS silencioso.
- **RF-14**: Nuevo rol solo-opencode: agente `.opencode/agents/verify.md` + skill `.opencode/skills/verify/SKILL.md` (Opción A adaptada). No se extiende `reviewer.md`; no se crea binario; no se usa MCP/Engram.
- **RF-15**: Distribución y pipeline: instaladores (`init-sdd.ps1` / `init-sdd.sh`) distribuyen el nuevo agente/skill solo-opencode; `.opencode/AGENTS.md` y `shared/AGENTS.md` actualizan el orden Full a `... Integración (scm) → Verify (máx. 2 rondas) → Preflight + Reviewer (máx. 2 vueltas) → Security Auditor (condicional) → PR + done`. Quick Mode no incluye Verify.

## Requisitos No Funcionales

- **RNF-01**: Solo-opencode: ningún cambio en `.claude/`, `.gemini/` ni en el schema de `feature_list.json`.
- **RNF-02**: Sin binario validador (`sdd-verify-validate` u otro) y sin dependencias nuevas; validación por convención + runners del proyecto destino.
- **RNF-03**: Sin MCP (Engram/Context7/GitHub) y sin modos `engram/hybrid`; persistencia portable = fichero `reports/<feature>-verify.md`.
- **RNF-04**: Sin fence YAML inicial obligatorio ni conteo nativo de requisitos; el formato del reporte es Markdown con secciones fijas verificables por convención.
- **RNF-05**: Evidencia trazable: cada comando ejecutado registra comando exacto, exit code y hash de salida; hashes como texto documentado, no como binario.
- **RNF-06**: Coste controlado: Verify no triplica la ejecución de la suite completa (política de ejecución única, ver design.md); reusa evidencia fresca de `scm`/preflight cuando el commit hash coincide.

## Criterios de Aceptación

- [ ] AC-01: Con diff integrado y tasks todas completadas, Verify produce `reports/<feature>-verify.md` con tabla completeness, evidencia y matriz spec (mapea a RF-01, RF-02, RF-03).
- [ ] AC-02: Con ≥1 task pendiente, Verify emite `FAIL` + `blocked` sin correr la suite completa y lo registra (mapea a RF-02).
- [ ] AC-03: Cada RF/AC mapea a ≥1 covering test con comando + exit code 0 + hash; escenario sin covering test pasado = `CRITICAL UNTESTED` cuando hay runner (mapea a RF-03, RF-05, RF-07).
- [ ] AC-04: Desviación solo-design = `WARNING`; desviación que rompe RF/AC = `CRITICAL` + `FAIL` (mapea a RF-04, RF-08).
- [ ] AC-05: El reporte contiene veredicto único del conjunto cerrado y su cómputo es reproducible desde los hallazgos (mapea a RF-07, RF-08).
- [ ] AC-06: `FAIL` retorna a Implementer consumiendo 1 ronda del presupuesto Verify; `PASS WITH WARNINGS` y `PASS` avanzan a Reviewer (mapea a RF-09).
- [ ] AC-07: Tras 2 rondas Verify sin converger, el Leader escala a humano y no se inicia una tercera ronda automática; contradicción irresoluble = `FAIL` + escalación (mapea a RF-10).
- [ ] AC-08: Reviewer consume el reporte Verify; no existe doble rechazo contradictorio sin motivo concreto documentado; P2 sigue siendo autoridad exclusiva del Reviewer (mapea a RF-11).
- [ ] AC-09: Matriz de degradación verificable: (a) sin `design.md` → dimensión coherencia-design = `SKIPPED` + `WARNING`; (b) sin `requirements.md` → `FAIL` + `blocked` (nada que verificar); (c) tasks-only → solo completitud; (d) sin runner detectable → checks runtime = `SKIPPED` + `WARNING` con checklist manual documentado, nunca `CRITICAL` por falta de runner (mapea a RF-13).
- [ ] AC-10: `reports/<feature>-verify.md` incluye comandos exactos, exit codes y hashes de salida; Verify no edita `src/`/`tests/` (mapea a RF-05, RF-06, RNF-05).
- [ ] AC-11: Existen `.opencode/agents/verify.md` y `.opencode/skills/verify/SKILL.md`; no hay binario nuevo ni referencia MCP/Engram; `.claude/` y `.gemini/` intactos (mapea a RF-14, RNF-01, RNF-02, RNF-03).
- [ ] AC-12: `.opencode/AGENTS.md` y `shared/AGENTS.md` declaran el orden con Verify pre-Reviewer y presupuestos separados (Verify máx. 2 rondas / Reviewer máx. 2 vueltas); Quick Mode sin Verify (mapea a RF-15).
- [ ] AC-13: Evidencia de no-triple-ejecución: si la suite completa ya corrió sobre el mismo commit hash en integración `scm` o preflight, Verify la reusa y solo ejecuta covering tests faltantes, registrándolo (mapea a RNF-06).

## Fuera de Alcance

- Auditoría de seguridad (inyección/XSS/RLS/secretos/concurrencia): autoridad exclusiva del Security Auditor.
- Calidad estructural y drift (CRAP>30, mutation break<60/high<80, ADRs, `architecture_drift`): autoridad exclusiva del Reviewer P2.
- Fijar código, emitir CRs o abrir PRs: Verify no escribe en `src/`, `tests/`, `changes/` ni ejecuta cierre `scm`.
- Validador binario (`sdd-verify-validate`), fence YAML inicial estricto, conteo nativo de requisitos, persistencia Engram/openspec/hybrid: no-fit declarado, no se portan.
- Revisión adversarial posterior (Judgment Day / RDD / 4R / refuter): opt-in separado, nunca parte de Verify.
- Transacción/ledger/receipt de RDD: explícitamente excluido.
- Cambios de schema en `feature_list.json` o en providers `.claude/`/`.gemini/`.
