import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';

// TASK-04 (área plantilla): init-sdd.ps1 / init-sdd.sh deben distribuir
// .opencode/agents/onboard.md y .opencode/skills/onboard/SKILL.md en
// instalaciones frescas, con checklist AC-12/AC-14.
const ONBOARD_AGENT = '.opencode/agents/onboard.md';
const ONBOARD_SKILL = '.opencode/skills/onboard/SKILL.md';

function withTemplateFixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'sdd-onboard-installer-'));
  const fixture = join(root, 'template');
  try {
    mkdirSync(fixture, { recursive: true });
    for (const entry of ['init-sdd.ps1', 'init-sdd.sh', 'shared', '.claude', '.opencode', '.gemini']) {
      const src = join(repositoryRoot, entry);
      if (existsSync(src)) {
        cpSync(src, join(fixture, basename(entry)), {
          recursive: true,
          filter: (source) => basename(source) !== 'node_modules' && !source.includes(`${join('.git')}`),
        });
      }
    }
    run({ fixture, root });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function removeOnboardSources(fixture) {
  // Caso "sin seed": borra explícitamente las fuentes onboard del fixture
  // copiado en vez de asumir su ausencia (válido pre y post merge).
  rmSync(join(fixture, ONBOARD_AGENT), { force: true });
  rmSync(join(fixture, ONBOARD_SKILL), { force: true });
}

function seedOnboardSources(fixture) {
  const agentDst = join(fixture, ONBOARD_AGENT);
  const skillDst = join(fixture, ONBOARD_SKILL);
  mkdirSync(join(fixture, '.opencode', 'agents'), { recursive: true });
  mkdirSync(join(fixture, '.opencode', 'skills', 'onboard'), { recursive: true });
  writeFileSync(agentDst, '# onboard narrator (fixture)\n');
  writeFileSync(skillDst, '# onboard skill (fixture)\n');
}

function installPowerShell(fixture, target, provider) {
  return spawnSync(powershell, [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(fixture, 'init-sdd.ps1'),
    '-TargetDir', target, '-Provider', provider,
  ], { encoding: 'utf8' });
}

test('PowerShell (opencode): instalación fresca distribuye agente+skill onboard (AC-14)', () => {
  withTemplateFixture(({ fixture, root }) => {
    seedOnboardSources(fixture);
    const target = join(root, 'destino-fresco');
    const result = installPowerShell(fixture, target, 'opencode');
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.ok(existsSync(join(target, ONBOARD_AGENT)), 'falta .opencode/agents/onboard.md en destino fresco');
    assert.ok(existsSync(join(target, ONBOARD_SKILL)), 'falta .opencode/skills/onboard/SKILL.md en destino fresco');
    assert.equal(readFileSync(join(target, ONBOARD_AGENT), 'utf8'), '# onboard narrator (fixture)\n');
    assert.equal(readFileSync(join(target, ONBOARD_SKILL), 'utf8'), '# onboard skill (fixture)\n');
    // AC-12: sin toques a .claude/ ni .gemini/ cuando provider=opencode
    assert.equal(existsSync(join(target, '.claude')), false, 'provider opencode no debe crear .claude/');
    assert.equal(existsSync(join(target, '.gemini')), false, 'provider opencode no debe crear .gemini/');
    // Carpetas del pipeline operativas
    for (const dir of ['research', 'specs', 'reports', 'changes', 'progress', 'scripts']) {
      assert.ok(existsSync(join(target, dir)), `falta carpeta operativa ${dir}/`);
    }
  });
});

test('PowerShell: verificación falla si faltan agente/skill onboard en la plantilla (AC-14)', () => {
  withTemplateFixture(({ fixture, root }) => {
    // Sin seed: borra las fuentes onboard del fixture copiado (válido pre y post merge).
    removeOnboardSources(fixture);
    const target = join(root, 'destino');
    const result = installPowerShell(fixture, target, 'opencode');
    assert.notEqual(result.status, 0, 'la verificación debe fallar si falta el onboard en la plantilla');
    assert.match(`${result.stdout}${result.stderr}`, /onboard\.md/, 'debe reportar el agente onboard faltante');
    assert.match(`${result.stdout}${result.stderr}`, /onboard\/SKILL\.md/, 'debe reportar la skill onboard faltante');
  });
});

test('instaladores sin binarios/MCP/red: solo copia local de Markdown/config (AC-12)', () => {
  for (const file of ['init-sdd.ps1', 'init-sdd.sh']) {
    const content = readFileSync(join(repositoryRoot, file), 'utf8');
    for (const banned of ['Invoke-WebRequest', 'Invoke-RestMethod', 'Start-BitsTransfer', 'curl ', 'wget ', 'npm install', 'choco ', 'mcp']) {
      assert.equal(content.toLowerCase().includes(banned.toLowerCase()), false, `${file} no debe usar ${banned}`);
    }
  }
});

const bashCandidates = process.platform === 'win32'
  ? ['bash.exe', 'C:/Program Files/Git/bin/bash.exe', 'C:/Program Files/Git/usr/bin/bash.exe']
  : ['bash'];
const bash = bashCandidates.find((candidate) => {
  const result = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
  return !result.error && result.status === 0;
});

function installBash(fixture, target, provider) {
  return spawnSync(bash, [join(fixture, 'init-sdd.sh'), '--target', target, '--provider', provider], {
    encoding: 'utf8',
  });
}

if (!bash) {
  test.skip('Bash no disponible: escenarios Bash del onboard no ejecutados', () => {});
} else {
  test('Bash (opencode): instalación fresca distribuye agente+skill onboard (AC-14)', () => {
    withTemplateFixture(({ fixture, root }) => {
      seedOnboardSources(fixture);
      const target = join(root, 'destino-fresco-bash');
      mkdirSync(target, { recursive: true });
      const result = installBash(fixture, target, 'opencode');
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.ok(existsSync(join(target, ONBOARD_AGENT)), 'falta .opencode/agents/onboard.md en destino fresco');
      assert.ok(existsSync(join(target, ONBOARD_SKILL)), 'falta .opencode/skills/onboard/SKILL.md en destino fresco');
      assert.equal(existsSync(join(target, '.claude')), false, 'provider opencode no debe crear .claude/');
      assert.equal(existsSync(join(target, '.gemini')), false, 'provider opencode no debe crear .gemini/');
    });
  });

  test('Bash: verificación falla si faltan agente/skill onboard en la plantilla (AC-14)', () => {
    withTemplateFixture(({ fixture, root }) => {
      removeOnboardSources(fixture);
      const target = join(root, 'destino-bash');
      mkdirSync(target, { recursive: true });
      const result = installBash(fixture, target, 'opencode');
      assert.notEqual(result.status, 0, 'la verificación debe fallar si falta el onboard en la plantilla');
      assert.match(`${result.stdout}${result.stderr}`, /onboard\.md/, 'debe reportar el agente onboard faltante');
      assert.match(`${result.stdout}${result.stderr}`, /onboard\/SKILL\.md/, 'debe reportar la skill onboard faltante');
    });
  });
}
