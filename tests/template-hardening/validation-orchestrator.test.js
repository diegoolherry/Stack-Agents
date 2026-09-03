const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  compareInventories,
  getBashPlatformResult,
  withTemporaryDirectory,
} = require('./validation-orchestrator');

test('the versioned validation command discovers installer-area tests with Node native runner', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'),
  );

  assert.equal(
    packageJson.scripts['test:template-hardening'],
    'node --test "tests/template-hardening/**/*.test.js" "tests/template-hardening/**/*.test.mjs"',
  );
});

test('compares normalized PowerShell and Bash inventories for every valid selection', () => {
  const powerShellRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'template-hardening-'));
  const bashRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'template-hardening-'));

  try {
    for (const root of [powerShellRoot, bashRoot]) {
      fs.mkdirSync(path.join(root, '.claude', 'skills'), { recursive: true });
      fs.mkdirSync(path.join(root, '.opencode', 'node_modules'), { recursive: true });
      fs.mkdirSync(path.join(root, '.gemini'), { recursive: true });
      fs.writeFileSync(path.join(root, '.claude', '.hidden'), 'distributed');
      fs.writeFileSync(path.join(root, '.claude', 'skills', 'guide.md'), 'distributed');
      fs.writeFileSync(path.join(root, '.opencode', 'AGENTS.md'), 'distributed');
      fs.writeFileSync(path.join(root, '.opencode', 'node_modules', 'local.js'), 'excluded');
      fs.writeFileSync(path.join(root, '.gemini', 'GEMINI.md'), 'distributed');
    }

    const comparisons = compareInventories(powerShellRoot, bashRoot);

    assert.deepEqual(comparisons.map(({ provider }) => provider), [
      'all', 'claude', 'opencode', 'gemini',
    ]);
    assert.ok(comparisons.every(({ matches }) => matches));
    assert.deepEqual(comparisons[0].powerShell, [
      '.claude/.hidden',
      '.claude/skills/guide.md',
      '.gemini/GEMINI.md',
      '.opencode/AGENTS.md',
    ]);
  } finally {
    fs.rmSync(powerShellRoot, { recursive: true, force: true });
    fs.rmSync(bashRoot, { recursive: true, force: true });
  }
});

test('reports unavailable Bash explicitly and removes temporary directories after success or failure', async () => {
  assert.deepEqual(getBashPlatformResult(() => false), {
    platform: 'bash',
    status: 'not-executed',
    reason: 'Bash is not available on this platform.',
  });

  let successfulDirectory;
  await withTemporaryDirectory('template-hardening-', async (directory) => {
    successfulDirectory = directory;
    fs.writeFileSync(path.join(directory, 'result.txt'), 'ok');
  });
  assert.equal(fs.existsSync(successfulDirectory), false);

  let failedDirectory;
  await assert.rejects(
    withTemporaryDirectory('template-hardening-', async (directory) => {
      failedDirectory = directory;
      throw new Error('expected failure');
    }),
    /expected failure/,
  );
  assert.equal(fs.existsSync(failedDirectory), false);
});
