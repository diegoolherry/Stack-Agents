import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = join(import.meta.dirname, '..', '..');

function read(rel) {
  const p = join(root, rel);
  assert.ok(existsSync(p), `falta archivo esperado: ${rel}`);
  return readFileSync(p, 'utf8');
}

// ── TASK-01: skill onboard ──────────────────────────────────────────
test('TASK-01: SKILL.md existe con guion de 10 fases', () => {
  const skill = read('.opencode/skills/onboard/SKILL.md');
  for (const f of ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10']) {
    assert.match(skill, new RegExp(f), `falta fase ${f}`);
  }
  assert.match(skill, /Welcome/i, 'falta Welcome (F1)');
  assert.match(skill, /Summary|Onboarding Complete/i, 'falta Summary (F10)');
});

test('TASK-01: criterios small&safe medibles RF-01 con veredicto criterio-por-criterio', () => {
  const skill = read('.opencode/skills/onboard/SKILL.md');
  assert.match(skill, /30-?60 min/, 'falta esfuerzo 30-60 min');
  assert.match(skill, /breaking/i, 'falta criterio breaking changes');
  assert.match(skill, /migraci/i, 'falta criterio migraciones');
  assert.match(skill, /security-trigger/i, 'falta referencia a paths sensibles');
  assert.match(skill, /spec-worthy|escenarios testeables/i, 'falta criterio spec-worthy');
});

test('TASK-01: reglas STOP, validación de propuesta y pausas obligatorias', () => {
  const skill = read('.opencode/skills/onboard/SKILL.md');
  assert.match(skill, /STOP/, 'falta regla STOP (RF-02)');
  assert.match(skill, /criterio-por-criterio/, 'falta validación criterio-por-criterio (RF-03)');
  assert.match(skill, /post-proposal|aprobaci.n expl.cita/i, 'falta pausa post-proposal (RF-04)');
  assert.match(skill, /pre-Apply|antes de Apply/i, 'falta pausa pre-Apply (RF-11)');
  assert.match(skill, /elecci.n.*candidata|candidata.*elecci.n/i, 'falta pausa elección de candidata');
});

test('TASK-01: parametrización Propose/Verify/Archive + template summary + narración + idioma', () => {
  const skill = read('.opencode/skills/onboard/SKILL.md');
  assert.match(skill, /Propose/i, 'falta Propose');
  assert.match(skill, /Verify/i, 'falta Verify');
  assert.match(skill, /Archive/i, 'falta Archive');
  assert.match(skill, /a.n no adoptado.*se omite|se omite.*a.n no adoptado/, 'falta línea explícita de omisión');
  assert.match(skill, /## Onboarding Complete!/, 'falta template Onboarding Complete (RF-14)');
  assert.match(skill, /reports\/onboard-/, 'falta persistencia reports/onboard-*.md (RF-15)');
  assert.match(skill, /1-3 oraciones/, 'falta regla narración 1-3 oraciones');
  assert.match(skill, /espa.ol/i, 'falta idioma español fijado');
  assert.match(skill, /TDD|RED.*GREEN.*REFACTOR/, 'falta TDD en Apply (F7)');
  assert.match(skill, /feature\/onboard-/, 'falta rama feature/onboard-* obligatoria');
});

test('TASK-01: tabla Discovery-vs-Onboard + derivación greenfield + detección stack', () => {
  const skill = read('.opencode/skills/onboard/SKILL.md');
  assert.match(skill, /Discovery.*Onboard|Onboard.*Discovery/, 'falta tabla Discovery-vs-Onboard');
  assert.match(skill, /greenfield/, 'falta derivación greenfield (RF-12)');
  assert.match(skill, /brownfield/, 'falta mención brownfield');
  assert.match(skill, /stack|runner de tests|suite de tests/i, 'falta detección stack/testing (RF-13)');
});

// ── TASK-02: agente narrador ────────────────────────────────────────
test('TASK-02: onboard.md es subagent con SOLO read *', () => {
  const agent = read('.opencode/agents/onboard.md');
  assert.match(agent, /mode:\s*subagent/, 'front matter debe declarar mode: subagent');
  assert.match(agent, /action:\s*read/, 'debe tener permiso read');
  assert.match(agent, /resource:\s*"\*"/, 'read debe ser sobre *');
  const permBlock = agent.split('---')[1] ?? '';
  assert.doesNotMatch(permBlock, /action:\s*edit/, 'el bloque permissions NO debe contener edit');
  assert.doesNotMatch(permBlock, /action:\s*bash/, 'el bloque permissions NO debe contener bash');
  assert.doesNotMatch(permBlock, /action:\s*subagent/, 'el bloque permissions NO debe contener subagent');
});

test('TASK-02: narrador que delega y referencia la skill', () => {
  const agent = read('.opencode/agents/onboard.md');
  assert.match(agent, /delegaci|delega/i, 'falta delegación al agente de fase');
  assert.match(agent, /negar|niega|NUNCA escribe|no escribe/i, 'falta negativa a escribir artefactos/código');
  assert.match(agent, /skills\/onboard\/SKILL\.md/, 'falta referencia a la skill como fuente de verdad');
  assert.match(agent, /1-3 oraciones|rutas/i, 'falta narración por rutas');
});

// ── TASK-03: AGENTS ────────────────────────────────────────────────
for (const file of ['.opencode/AGENTS.md', 'shared/AGENTS.md']) {
  test(`TASK-03: ${file} documenta Onboard como recorrido Full`, () => {
    const doc = read(file);
    assert.match(doc, /[Oo]nboard/, `falta mención Onboard en ${file}`);
    assert.match(doc, /recorrido.*Full|Full.*recorrido/i, `falta Onboard como recorrido Full en ${file}`);
    assert.match(doc, /Discovery.*Onboard|Onboard.*Discovery/, `falta Discovery vs Onboard en ${file}`);
    assert.match(doc, /feature\/onboard-/, `falta rama feature/onboard-* obligatoria en ${file}`);
    assert.match(doc, /merge/i, `faltan prohibiciones (merge) en ${file}`);
    assert.match(doc, /done|feature_list\.json/, `falta prohibición marca done/registro en ${file}`);
    assert.match(doc, /reports\/onboard-/, `falta persistencia summary en ${file}`);
  });
}

test('TASK-03: instaladores intactos (área plantilla)', () => {
  const ps = read('init-sdd.ps1');
  const sh = read('init-sdd.sh');
  assert.doesNotMatch(ps, /onboard/, 'init-sdd.ps1 es del área plantilla — no tocar');
  assert.doesNotMatch(sh, /onboard/, 'init-sdd.sh es del área plantilla — no tocar');
});
