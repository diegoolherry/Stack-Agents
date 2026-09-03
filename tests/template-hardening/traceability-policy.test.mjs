import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const repositoryRoot = join(import.meta.dirname, '..', '..');
const forbiddenTriggerRule = 'scripts/security-trigger.config.json';

function availableCommand(candidates, probeArguments = ['--version']) {
  return candidates.find((candidate) => (
    spawnSync(candidate, probeArguments, { stdio: 'ignore' }).status === 0
  ));
}

const powershell = availableCommand(
  process.platform === 'win32' ? ['powershell.exe'] : ['pwsh'],
  ['-NoProfile', '-Command', '$PSVersionTable.PSVersion'],
);
const bash = availableCommand(process.platform === 'win32'
  ? ['bash.exe', 'C:/Program Files/Git/bin/bash.exe', 'C:/Program Files/Git/usr/bin/bash.exe']
  : ['bash']);

function installAndReadGitignore(command, args) {
  const target = mkdtempSync(join(tmpdir(), 'sdd traceability policy '));
  try {
    execFileSync(command, [...args, target], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const firstInstall = readFileSync(join(target, '.gitignore'), 'utf8');

    execFileSync(command, [...args, target], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const secondInstall = readFileSync(join(target, '.gitignore'), 'utf8');

    return { firstInstall, secondInstall };
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
}

test('root ignore policy excludes local dependencies but not validation manifests or lockfiles', () => {
  const gitignore = readFileSync(join(repositoryRoot, '.gitignore'), 'utf8');

  assert.match(gitignore, /^node_modules\/$/m);
  assert.doesNotMatch(gitignore, /^package\.json$/m);
  assert.doesNotMatch(gitignore, /^package-lock\.json$/m);
  assert.doesNotMatch(gitignore, /^bun\.lock$/m);
});

test('both installer SDD blocks preserve the traceable trigger map and their idempotency marker', () => {
  const installers = [
    ['PowerShell', 'init-sdd.ps1', /\$existing -notmatch "SDD Workflow"/],
    ['Bash', 'init-sdd.sh', /grep -q "SDD Workflow"/],
  ];

  for (const [name, file, idempotencyMarker] of installers) {
    const installer = readFileSync(join(repositoryRoot, file), 'utf8');

    assert.doesNotMatch(installer, new RegExp(forbiddenTriggerRule.replace('.', '\\.')), name);
    assert.match(installer, idempotencyMarker, name);
  }
});

test('PowerShell creates an idempotent SDD ignore block that tracks the security trigger map', {
  skip: !powershell,
}, () => {
  const { firstInstall, secondInstall } = installAndReadGitignore(powershell, [
    '-NoProfile', '-File', join(repositoryRoot, 'init-sdd.ps1'), '-TargetDir',
  ]);

  assert.doesNotMatch(firstInstall, new RegExp(forbiddenTriggerRule.replace('.', '\\.')));
  assert.equal(secondInstall, firstInstall);
});

test('Bash creates an idempotent SDD ignore block that tracks the security trigger map', {
  skip: !bash,
}, () => {
  const { firstInstall, secondInstall } = installAndReadGitignore(bash, [
    join(repositoryRoot, 'init-sdd.sh'), '--target',
  ]);

  assert.doesNotMatch(firstInstall, new RegExp(forbiddenTriggerRule.replace('.', '\\.')));
  assert.equal(secondInstall, firstInstall);
});
