# Review — fix-13-14-onboard-model-pr-status

## Metadata
reviewer_round: 1
architecture_drift: false
baseline: `FIX-APLICAR.md` (FIX-13 + FIX-14, modo quick, 2 pasadas P1+P2)
preflight: no configurado — revisión manual (docs-only, sin código ejecutable)

## Pasada 1: Negocio + Tests (conformidad funcional vs FIX-APLICAR.md)

### FIX-13 — Modelo liviano para `onboard.md`
- Frontmatter válido (`---` ... `---`, claves description/mode/model/permissions): ✅
- `model: openai/gpt-5.6-luna` presente en línea 4, inmediatamente después de `mode: subagent`: ✅ (línea exacta según baseline)
- Rol narrador puro preservado (1-3 oraciones por fase, solo `read *`, sin escritura): ✅ — no se agregó ningún permiso de escritura

### FIX-14 — Estado `pr` en `feature_list.json`
- Schema nuevo en `shared/AGENTS.md` (líneas ~103-104): `"status": "pending | in_progress | pr | done"` + campo `pr_url` ("se setea al entrar en `pr`, opcional en el resto"): ✅
- Línea de Campos `status` (~116): `pending → in_progress → pr → done` + regla de rechazo `pr → in_progress` + `done` solo tras merge humano + `pr` = pipeline completo con PR abierta + sin `cancelled`: ✅
- Transiciones completas (las 3 de la tabla baseline):
  - `in_progress → pr` (scm abre PR y reporta URL; Leader setea `pr` + `pr_url`): ✅ — `.opencode/AGENTS.md:60` + `scm/SKILL.md:77`
  - `pr → done` (humano mergea y avisa; Leader marca `done` + `current.md`): ✅ — `.opencode/AGENTS.md:60`
  - `pr → in_progress` (rechazo documentado; MISMA PR, no otra): ✅ — `.opencode/AGENTS.md:60` ("actualiza la MISMA PR") + `scm/SKILL.md:120` (línea de misma-PR preservada)
- `.opencode/AGENTS.md` cierre con pr (`Archive → push/PR (scm) → Leader setea pr + pr_url → merge humano → done`): ✅ línea 60
- `scm/SKILL.md` Cierre: reporte URL obligatorio al Leader para setear `pr` + misma-PR en iteración de CRs: ✅ líneas 77 y 120
- `README.md` línea ~224: `pending → in_progress → pr → done` + mención `pr_url?` + rechazo con MISMA PR: ✅

### Residuos de schema viejo
- Grep `pending | in_progress | done` sin `pr`: ✅ sin apariciones en `shared/AGENTS.md`, `.opencode/AGENTS.md`, `README.md` (único hit del repo es el propio `FIX-APLICAR.md`, que es el documento baseline temporal, no código/docs del producto)

### Alcance
- Archivos tocados: `.opencode/agents/onboard.md`, `shared/AGENTS.md`, `.opencode/AGENTS.md`, `.opencode/skills/scm/SKILL.md`, `README.md` + entrada nueva en `feature_list.json`: ✅ dentro de "solo-opencode + shared + README"
- `.claude/` y `.gemini/`: ✅ intactos (sin entradas en el diff)
- `feature_list.json` existente: ✅ entradas previas quedan `done` sin modificar; el diff solo AÑADE la entrada de tracking `fix-13-14-onboard-model-pr-status` (`in_progress`), que es la práctica estándar del Leader para la feature en curso, no una mutación del schema aplicado retroactivamente. Conforme al punto 5 del baseline.

### Tests
- N/A — fix exclusivamente documental/configuracional, sin código ejecutable ni tests asociados. Sin regresiones posibles por suite.

## Pasada 2: Calidad

### Métricas (del preflight)
- Preflight no configurado — revisión manual. Sin CRAP/mutation aplicables al diff (markdown + frontmatter YAML únicamente).

### ADRs respetados
- Sin ADRs en el repo que regulen modelos de subagentes o estados de backlog; nada que contradecir.

### Architecture drift
- Sin `architecture/architecture.md` afectado ni contradicción arquitectónica: el cambio es de documentación operativa del workflow SDD, no de estructura de código. `architecture_drift: false`, sin ADR emitido.

### Observaciones de calidad
1. Consistencia de frontmatter P2: `onboard.md` (`openai/gpt-5.6-luna`) vs `leader.md` (`openai/gpt-5.6-terra`) — ✅ misma familia de modelos, tier liviano para narrador puro coherente con su permiso `read *` y la prohibición de escribir código. Sin ruptura de convenciones.
2. Nit no bloqueante: `shared/AGENTS.md:64` (paso 8 del pipeline) sigue diciendo "→ `done`" sin mencionar el paso intermedio `pr`; el schema y la sección de Campos ya lo documentan, por lo que no hay inconsistencia funcional, pero una futura pasada podría uniformar esa línea.
3. Nit no bloqueante: `FIX-APLICAR.md` es un archivo temporal ("borrar al terminar") que queda como untracked en el working tree; el Leader debe eliminarlo tras el merge, fuera del alcance de este review.

## Veredicto
APRUEBA

### Motivos de rechazo (si aplica)
N/A — sin motivos de rechazo. Todos los checks P1 (frontmatter, schema sin residuos, transiciones completas, alcance) y P2 (consistencia luna/terra, sin drift, sin ruptura de convenciones) pasan.
