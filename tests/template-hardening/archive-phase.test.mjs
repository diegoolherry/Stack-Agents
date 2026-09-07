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

// TASK-01: gates bloqueantes y veredictos
test('TASK-01: skill archive documenta los 5 gates bloqueantes con matriz PASS/BLOCKED y CRITICAL sin override', () => {
  assert.ok(exists('.opencode/skills/archive/SKILL.md'), 'falta SKILL.md archive');
  const content = read('.opencode/skills/archive/SKILL.md');
  assert.match(content, /Verify PASS/i, 'gate Verify PASS');
  assert.match(content, /Review.*APRUEBA|APRUEBA.*Review/i, 'gate Review APRUEBA');
  assert.match(content, /cero CRITICAL|0 CRITICAL/i, 'gate cero CRITICAL');
  assert.match(content, /tasks 100%|100%.*tasks/i, 'gate tasks 100%');
  assert.match(content, /CRs.*aprobados|aprobados/i, 'gate CRs aprobados');
  assert.match(content, /BLOCKED/, 'matriz PASS/BLOCKED');
  assert.match(content, /CRITICAL.*(nunca|jamás|sin).*override|override.*CRITICAL/i, 'CRITICAL nunca con override');
});

test('TASK-01: skill archive documenta gates degradados Quick, stale-solo-con-prueba y partial-solo-declarado', () => {
  const content = read('.opencode/skills/archive/SKILL.md');
  assert.match(content, /Quick.*sin verify-report|gates degradados/i, 'gates degradados Quick');
  assert.match(content, /stale.*prueba|prueba.*stale/i, 'stale solo con prueba');
  assert.match(content, /PARTIAL-INTENCIONAL/, 'partial intencional declarado');
});

// TASK-02: plantilla del acta de cierre
test('TASK-02: skill archive define el contrato del acta con 7 secciones y Final-State Authority', () => {
  const content = read('.opencode/skills/archive/SKILL.md');
  for (const section of ['Metadata', 'Specs Consolidados', 'Contenidos', 'Source of Truth', 'Reconciliaciones', 'Verificación', 'Veredicto']) {
    assert.ok(content.includes(section), `falta seccion ${section}`);
  }
  assert.match(content, /Final-State Authority/i, 'jerarquia Final-State Authority');
  assert.match(content, /ambas fuentes|contradicci/i, 'registro de contradicciones con ambas fuentes');
  assert.match(content, /references\/report-format\.md|report-format/, 'referencia a la plantilla del acta');
});

test('TASK-02: references/report-format.md con las 7 secciones fijas y veredictos cerrados', () => {
  assert.ok(exists('.opencode/skills/archive/references/report-format.md'), 'falta report-format.md archive');
  const content = read('.opencode/skills/archive/references/report-format.md');
  for (const section of ['Metadata', 'Specs Consolidados', 'Contenidos', 'Source of Truth', 'Reconciliaciones', 'Verificación', 'Veredicto']) {
    assert.ok(content.includes(section), `falta seccion ${section}`);
  }
  assert.match(content, /ARCHIVED \| BLOCKED \| PARTIAL-INTENCIONAL/, 'veredictos cerrados');
  assert.match(content, /reports\/<feature>-archive\.md/, 'ruta del acta');
});

// TASK-03: inmutabilidad, movimiento excepcional y colisiones
test('TASK-03: skill archive fija Opcion A inmutable, rutas estables y movimiento excepcional mecanico con diff -r', () => {
  const content = read('.opencode/skills/archive/SKILL.md');
  assert.match(content, /Opci[oó]n A/i, 'modelo Opcion A');
  assert.match(content, /inmutable/i, 'specs inmutable');
  assert.match(content, /sin movimiento/i, 'sin movimiento por defecto');
  assert.match(content, /rutas estables/i, 'rutas estables para la PR');
  assert.match(content, /diff -r/, 'diff -r obligatorio');
  assert.match(content, /verbatim/i, 'salida verbatim');
  assert.match(content, /colisi[oó]n/i, 'regla de colision');
  assert.match(content, /sufijos|sobrescri|overwrites/i, 'prohibe sufijos/overwrites');
  assert.match(content, /autorizaci[oó]n humana/i, 'solo con autorizacion humana');
  assert.doesNotMatch(content, /sdd-archive-compose/, 'sin binario sdd-archive-compose');
  assert.doesNotMatch(content, /Engram|observation/i, 'sin Engram/MCP');
  assert.doesNotMatch(content, /Read→Write|Read->Write/, 'nunca Read→Write del modelo');
});

// TASK-04: agente dedicado archive + skill (Opcion C)
test('TASK-04: .opencode/agents/archive.md existe con permisos acotados y prohibiciones RF-10', () => {
  assert.ok(exists('.opencode/agents/archive.md'), 'falta .opencode/agents/archive.md');
  const content = read('.opencode/agents/archive.md');
  assert.match(content, /mode:\s*subagent/, 'debe ser subagent');
  assert.match(content, /action:\s*read/, 'permiso read');
  assert.match(content, /reports\/\*\*/, 'permiso edit reports/**');
  assert.match(content, /action:\s*bash/, 'permiso bash');
  assert.match(content, /reports\/<feature>-archive\.md/, 'output reports/<feature>-archive.md');
  assert.match(content, /skills\/archive\/SKILL\.md/, 'referencia a la skill archive');
  assert.match(content, /commitea/i, 'prohibe commitear');
  assert.match(content, /pushea/i, 'prohibe pushear');
  assert.match(content, /merge/i, 'prohibe mergear');
  assert.match(content, /PR/i, 'prohibe abrir PR');
  assert.match(content, /done/, 'prohibe marcar done');
  assert.match(content, /current\.md/, 'prohibe tocar progress/current.md');
  assert.match(content, /specs/i, 'prohibe editar specs');
  assert.match(content, /colisi/i, 'prohibe auto-resolver colisiones');
  assert.doesNotMatch(content, /resource:\s*"src\/\*\*"/, 'no debe editar src/**');
  assert.doesNotMatch(content, /resource:\s*"tests\/\*\*"/, 'no debe editar tests/**');
});

test('TASK-04: skill archive solo-opencode sin contrapartes en .claude/.gemini', () => {
  assert.equal(exists('.claude/agents/archive.md'), false, '.claude no debe tener archive');
  assert.equal(exists('.gemini/agents/archive.md'), false, '.gemini no debe tener archive');
  assert.equal(exists('.claude/skills/archive/SKILL.md'), false, '.claude no debe tener skill archive');
  assert.equal(exists('.gemini/skills/archive/SKILL.md'), false, '.gemini no debe tener skill archive');
});

// TASK-05: orden del pipeline, roles, AGENTS e instaladores
test('TASK-05: .opencode/AGENTS.md registra archive con orden ... Verify -> Reviewer -> Security -> Archive -> PR -> merge -> done', () => {
  const content = read('.opencode/AGENTS.md');
  assert.ok(content.includes('archive'), 'debe mencionar archive');
  assert.match(content, /Verify.*Reviewer.*Security.*Archive/is, 'orden Verify -> Reviewer -> Security -> Archive');
  assert.match(content, /Archive.*(push|PR|scm)/is, 'Archive antes del push/PR de scm');
  assert.match(content, /merge humano/i, 'merge humano');
  assert.match(content, /Leader.*archive|invoca.*archive/i, 'Leader invoca a archive');
  assert.match(content, /scm.*no.*Archive|no.*ejecuta.*Archive/i, 'scm no ejecuta Archive');
  assert.match(content, /done.*merge|merge.*done|tras.*acta.*merge/i, 'done solo tras acta + merge humano');
});

test('TASK-05: shared/AGENTS.md registra archive con el mismo orden y roles', () => {
  const content = read('shared/AGENTS.md');
  assert.ok(content.includes('archive'), 'debe mencionar archive');
  assert.match(content, /Verify.*Reviewer.*Security.*Archive/is, 'orden con Archive');
  assert.match(content, /Archive.*(push|PR|scm)/is, 'Archive antes del push/PR');
  assert.match(content, /Leader.*archive|invoca.*archive/i, 'Leader invoca a archive');
  assert.match(content, /done.*merge|merge.*done|tras.*acta.*merge/i, 'done tras acta + merge');
});

test('TASK-05: skill scm cita el acta archive en el body de la PR y exige acta antes del push/PR', () => {
  const content = read('.opencode/skills/scm/SKILL.md');
  assert.match(content, /reports\/<feature.*>-archive\.md/, 'cita reports/<feature>-archive.md en PR');
  assert.match(content, /archive/i, 'menciona fase Archive');
  assert.match(content, /scm.*no.*Archive|no.*ejecuta.*Archive|Archive.*agente archive/i, 'scm no ejecuta Archive');
});

test('TASK-05: instaladores verifican agente y skill archive solo en flujo opencode/all', () => {
  const ps1 = read('init-sdd.ps1');
  assert.ok(ps1.includes('agents/archive.md') || ps1.includes('agents\\archive.md'), 'ps1 verifica agents/archive.md');
  assert.ok(ps1.includes('skills/archive') || ps1.includes('skills\\archive'), 'ps1 verifica skills/archive');
  assert.doesNotMatch(ps1, /\.claude.*archive/i, 'ps1 no toca .claude');
  assert.doesNotMatch(ps1, /\.gemini.*archive/i, 'ps1 no toca .gemini');
  const sh = read('init-sdd.sh');
  assert.ok(sh.includes('agents/archive.md'), 'sh verifica agents/archive.md');
  assert.ok(sh.includes('skills/archive'), 'sh verifica skills/archive');
  assert.doesNotMatch(sh, /\.claude.*archive/i, 'sh no toca .claude');
  assert.doesNotMatch(sh, /\.gemini.*archive/i, 'sh no toca .gemini');
});

// TASK-06: verificacion integrada baseline v2
test('TASK-06: baseline v2 consistente — RF-10/AC-11, pregunta 5 = Opcion C, ADR-001 enmienda v2', () => {
  const requirements = read('specs/sdd-archive-phase/requirements.md');
  assert.match(requirements, /RF-10/, 'RF-10 agente archive');
  assert.match(requirements, /AC-11/, 'AC-11 cubre RF-10');
  for (let n = 1; n <= 10; n++) {
    assert.ok(requirements.includes(`RF-${String(n).padStart(2, '0')}`), `falta RF-${String(n).padStart(2, '0')}`);
  }
  const design = read('specs/sdd-archive-phase/design.md');
  assert.match(design, /Opci[oó]n C/i, 'pregunta 5 = Opcion C');
  assert.match(design, /agente.*archive|archive.*agente/i, 'design fija agente archive');
  const adr = read('architecture/decisions/ADR-001.md');
  assert.match(adr, /Enmienda v2/i, 'ADR-001 con enmienda v2');
  assert.match(adr, /archive/i, 'enmienda menciona ejecutor archive');
});

test('TASK-06: sin binarios/Engram/carpetas archive ni rutas rotas en la fase', () => {
  assert.equal(exists('.opencode/skills/archive/sdd-archive-compose'), false, 'sin binario');
  assert.equal(exists('specs/archive'), false, 'sin carpeta specs/archive por defecto');
  const skill = read('.opencode/skills/archive/SKILL.md');
  assert.doesNotMatch(skill, /mcp|context7/i, 'sin MCP');
  assert.doesNotMatch(skill, /openspec\/specs/i, 'sin main-specs por dominio');
  const agent = read('.opencode/agents/archive.md');
  assert.doesNotMatch(agent, /sdd-archive-compose|Engram/i, 'agente sin binario ni Engram');
});
