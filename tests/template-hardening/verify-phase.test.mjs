import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '..', '..');

function read(rel) {
  return readFileSync(join(repositoryRoot, rel), 'utf8');
}

function exists(rel) {
  return existsSync(join(repositoryRoot, rel));
}

// TASK-01: agente verify solo-opencode
test('TASK-01: .opencode/agents/verify.md existe con permisos read + edit reports/** + bash y sin edicion de codigo', () => {
  assert.ok(exists('.opencode/agents/verify.md'), 'falta .opencode/agents/verify.md');
  const content = read('.opencode/agents/verify.md');
  assert.match(content, /mode:\s*subagent/, 'debe ser subagent');
  assert.match(content, /action:\s*read/, 'permiso read');
  assert.match(content, /reports\/\*\*/, 'permiso edit reports/**');
  assert.match(content, /action:\s*bash/, 'permiso bash');
  assert.match(content, /reports\/<feature>-verify\.md/, 'output reports/<feature>-verify.md');
  assert.match(content, /NUNCA.*(edita|c[oó]digo)|no edita c[oó]digo/i, 'no edita codigo');
  assert.doesNotMatch(content, /resource:\s*"src\/\*\*"/, 'no debe editar src/**');
  assert.doesNotMatch(content, /resource:\s*"tests\/\*\*"/, 'no debe editar tests/**');
  assert.match(content, /skills\/verify\/SKILL\.md/, 'referencia a la skill verify');
});

// TASK-02: skill verify + formato de reporte
test('TASK-02: .opencode/skills/verify/SKILL.md con orden, severidades, veredictos, covering test, ejecucion unica y degradacion', () => {
  assert.ok(exists('.opencode/skills/verify/SKILL.md'), 'falta SKILL.md verify');
  const content = read('.opencode/skills/verify/SKILL.md');
  assert.match(content, /specs.*design.*tasks/is, 'orden specs->design->tasks');
  assert.match(content, /CRITICAL/, 'severidad CRITICAL');
  assert.match(content, /WARNING/, 'severidad WARNING');
  assert.match(content, /SUGGESTION/, 'severidad SUGGESTION');
  assert.match(content, /PASS WITH WARNINGS/, 'veredicto PASS WITH WARNINGS');
  assert.match(content, /covering test/i, 'definicion de covering test');
  assert.match(content, /ejecuci[oó]n [uú]nica/i, 'politica de ejecucion unica');
  assert.match(content, /SKIPPED/, 'matriz de degradacion con SKIPPED');
  assert.match(content, /verify_round/, 'contador verify_round');
  assert.doesNotMatch(content, /Engram/i, 'sin MCP/Engram');
  assert.doesNotMatch(content, /sdd-verify-validate/, 'sin binario validador');
  assert.doesNotMatch(content, /```yaml/, 'sin fence YAML obligatorio');
});

test('TASK-02: references/report-format.md con las 7 secciones fijas', () => {
  assert.ok(exists('.opencode/skills/verify/references/report-format.md'), 'falta report-format.md');
  const content = read('.opencode/skills/verify/references/report-format.md');
  for (const section of ['Metadata', 'Completeness', 'Evidencia de runtime', 'Matriz spec', 'Coherencia con design', 'Issues', 'Veredicto', 'Trazabilidad']) {
    assert.ok(content.includes(section), `falta seccion ${section}`);
  }
  assert.match(content, /PASS \| PASS WITH WARNINGS \| FAIL/, 'veredictos cerrados');
});

// TASK-03: cableado al pipeline
test('TASK-03: .opencode/AGENTS.md declara Verify pre-Reviewer con presupuestos y Quick sin Verify', () => {
  const content = read('.opencode/AGENTS.md');
  assert.ok(content.includes('verify'), 'debe mencionar verify');
  assert.match(content, /Integraci[oó]n.*Verify.*Reviewer/is, 'orden Integracion -> Verify -> Reviewer');
  assert.match(content, /2 rondas|m[aá]x.*2.*ronda/is, 'presupuesto max 2 rondas Verify');
  assert.match(content, /Quick.*sin Verify|sin Verify/i, 'Quick Mode sin Verify');
  assert.match(content, /verify_round/, 'contador verify_round');
  assert.match(content, /reviewer_round/, 'contador reviewer_round');
  assert.match(content, /anti-loop/i, 'regla anti-loop');
});

test('TASK-03: shared/AGENTS.md declara orden Full con Verify, tabla Verify vs Reviewer y contadores', () => {
  const content = read('shared/AGENTS.md');
  assert.ok(content.includes('verify'), 'debe mencionar verify');
  assert.match(content, /Verify.*Reviewer|Verify.*Preflight/is, 'Verify pre-Reviewer');
  assert.match(content, /2 rondas|m[aá]x.*2/is, 'presupuesto Verify max 2');
  assert.match(content, /2 vueltas|m[aá]x.*2.*vuelta/is, 'presupuesto Reviewer max 2 vueltas');
  assert.match(content, /Quick.*sin Verify|Implementer → Reviewer/i, 'Quick sin Verify');
  assert.match(content, /verify_round/, 'verify_round');
  assert.match(content, /reviewer_round/, 'reviewer_round');
  assert.match(content, /P1|P2/, 'delimitacion P1/P2');
});

// TASK-04: instaladores distribuyen agente + skill
test('TASK-04: init-sdd.ps1 verifica agente y skill verify en providers opencode/all', () => {
  const content = read('init-sdd.ps1');
  assert.ok(content.includes('agents/verify.md') || content.includes('agents\\verify.md'), 'ps1 menciona agents/verify.md');
  assert.ok(content.includes('skills/verify') || content.includes('skills\\verify'), 'ps1 menciona skills/verify');
  assert.doesNotMatch(content, /\.claude.*verify/i, 'no toca .claude');
  assert.doesNotMatch(content, /\.gemini.*verify/i, 'no toca .gemini');
});

test('TASK-04: init-sdd.sh verifica agente y skill verify en providers opencode/all', () => {
  const content = read('init-sdd.sh');
  assert.ok(content.includes('agents/verify.md'), 'sh menciona agents/verify.md');
  assert.ok(content.includes('skills/verify'), 'sh menciona skills/verify');
  assert.doesNotMatch(content, /\.claude.*verify/i, 'no toca .claude');
  assert.doesNotMatch(content, /\.gemini.*verify/i, 'no toca .gemini');
});

// TASK-05: trazabilidad Verify -> Reviewer -> PR
test('TASK-05: skill scm cita el reporte verify en el body de la PR', () => {
  const content = read('.opencode/skills/scm/SKILL.md');
  assert.ok(content.includes('verify'), 'scm SKILL.md debe citar el reporte verify');
  assert.match(content, /reports\/<feature.*>-verify\.md/, 'cita reports/<feature>-verify.md en PR');
});

test('TASK-05: skill verify documenta consumo por Reviewer P1 y P2 exclusivo', () => {
  const content = read('.opencode/skills/verify/SKILL.md');
  assert.match(content, /Reviewer/i, 'menciona Reviewer');
  assert.match(content, /P1/, 'delimitacion P1');
  assert.match(content, /P2/, 'P2 exclusivo del Reviewer');
});

test('TASK-05: existe reports/sdd-verify-phase-verify.md con veredicto y evidencia AC-01 a AC-13', () => {
  assert.ok(exists('reports/sdd-verify-phase-verify.md'), 'falta el reporte verify de la feature');
  const content = read('reports/sdd-verify-phase-verify.md');
  assert.match(content, /## Veredicto/, 'seccion Veredicto');
  assert.match(content, /PASS|FAIL/, 'veredicto cerrado');
  assert.match(content, /AC-01/, 'trazabilidad AC-01');
  assert.match(content, /AC-13/, 'trazabilidad AC-13');
  assert.match(content, /blocked/, 'caso tasks pendientes -> blocked');
  assert.match(content, /SKIPPED/, 'caso sin runner -> SKIPPED');
});

// RNF: solo-opencode, sin binario/MCP, sin cambios de schema
test('RNF: .claude y .gemini intactos, sin binario ni MCP en verify', () => {
  assert.equal(exists('.claude/agents/verify.md'), false, '.claude no debe tener verify');
  assert.equal(exists('.gemini/agents/verify.md'), false, '.gemini no debe tener verify');
  assert.equal(exists('.opencode/skills/verify/sdd-verify-validate'), false, 'sin binario');
  const skill = read('.opencode/skills/verify/SKILL.md');
  assert.doesNotMatch(skill, /mcp|context7|github.*mcp/i, 'sin MCP');
});
