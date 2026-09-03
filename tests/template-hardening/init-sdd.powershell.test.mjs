import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repository = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
const excludedNames = ['node_modules', 'package.json', 'package-lock.json', 'bun.lock', '.gitignore'];

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'template-hardening-powershell-'));
  const template = join(root, 'template');
  await cp(repository, template, {
    recursive: true,
    filter: source => !source.includes(`${join('.opencode', 'node_modules')}`) && !source.includes(`${join('.git')}`),
  });
  return { root, template };
}

function install(template, target, provider) {
  return spawnSync(powershell, [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(template, 'init-sdd.ps1'),
    '-TargetDir', target, '-Provider', provider,
  ], { encoding: 'utf8' });
}

function assertFile(target, relativePath) {
  assert.ok(existsSync(join(target, relativePath)), `expected ${relativePath} to exist`);
}

test('PowerShell installs every valid provider selection in temporary destinations', async t => {
  const { root, template } = await createFixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  for (const [provider, expected] of Object.entries({
    claude: ['.claude/CLAUDE.md'],
    opencode: ['.opencode/AGENTS.md'],
    gemini: ['.gemini/GEMINI.md'],
    all: ['.claude/CLAUDE.md', '.opencode/AGENTS.md', '.gemini/GEMINI.md'],
  })) {
    const target = join(root, `destination-${provider}`);
    const result = install(template, target, provider);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    for (const shared of ['AGENTS.md', 'feature_list.json', 'progress/current.template.md']) assertFile(target, shared);
    for (const path of expected) assertFile(target, path);
  }
});

test('PowerShell supports targets with spaces and preserves existing shared files', async t => {
  const { root, template } = await createFixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = join(root, 'existing destination with spaces');
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'AGENTS.md'), 'existing shared content');

  const result = install(template, target, 'claude');

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(await readFile(join(target, 'AGENTS.md'), 'utf8'), 'existing shared content');
  assertFile(target, '.claude/CLAUDE.md');
});

test('PowerShell copies distributable hidden files but excludes local artifacts recursively', async t => {
  const { root, template } = await createFixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(template, '.opencode');
  const target = join(root, 'destination');
  await writeFile(join(source, '.distributable'), 'hidden content');
  await mkdir(join(source, 'nested', 'node_modules'), { recursive: true });
  await writeFile(join(source, 'nested', 'node_modules', 'local.js'), 'local');
  for (const name of excludedNames.filter(name => name !== 'node_modules')) {
    await writeFile(join(source, 'nested', name), `source-${name}`);
  }
  await mkdir(join(target, '.opencode', 'nested', 'node_modules'), { recursive: true });
  for (const name of excludedNames) {
    const destination = join(target, '.opencode', 'nested', name);
    if (name === 'node_modules') await writeFile(join(destination, 'preserved.js'), 'destination');
    else await writeFile(destination, `destination-${name}`);
  }

  const result = install(template, target, 'opencode');

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(await readFile(join(target, '.opencode', '.distributable'), 'utf8'), 'hidden content');
  for (const name of excludedNames) {
    const destination = join(target, '.opencode', 'nested', name);
    assert.ok(existsSync(destination), `pre-existing ${name} must be preserved`);
    if (name !== 'node_modules') assert.equal(await readFile(destination, 'utf8'), `destination-${name}`);
  }
  assert.ok(!existsSync(join(target, '.opencode', 'nested', 'node_modules', 'local.js')));
});

test('PowerShell reports missing required artifacts and exits non-zero', async t => {
  const { root, template } = await createFixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  await rm(join(template, '.claude', 'CLAUDE.md'));

  const result = install(template, join(root, 'destination'), 'claude');

  assert.notEqual(result.status, 0, 'a failed verification must return a non-zero status');
  assert.match(`${result.stdout}${result.stderr}`, /Faltante: .claude\/CLAUDE\.md/);
});
