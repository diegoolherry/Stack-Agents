import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const bashCandidates = process.platform === 'win32'
  ? ['bash.exe', 'C:/Program Files/Git/bin/bash.exe', 'C:/Program Files/Git/usr/bin/bash.exe']
  : ['bash'];
const bash = bashCandidates.find((candidate) => {
  const result = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
  return !result.error && result.status === 0;
});

function withFixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'template-hardening-bash-'));
  const fixture = join(root, 'fixture');
  try {
    mkdirSync(fixture);
    for (const entry of ['init-sdd.sh', 'shared', '.claude', '.opencode', '.gemini']) {
      cpSync(join(repositoryRoot, entry), join(fixture, basename(entry)), {
        recursive: true,
        filter: (source) => basename(source) !== 'node_modules',
      });
    }
    run({ fixture, root });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function install(fixture, target, provider = 'all') {
  return spawnSync(bash, [join(fixture, 'init-sdd.sh'), '--target', target, '--provider', provider], {
    encoding: 'utf8',
  });
}

function assertSuccessfulInstallation(target, providers) {
  for (const file of ['AGENTS.md', 'feature_list.json', 'progress/current.template.md']) {
    assert.ok(existsSync(join(target, file)), `missing shared artifact ${file}`);
  }
  const primaryFiles = {
    claude: '.claude/CLAUDE.md',
    opencode: '.opencode/AGENTS.md',
    gemini: '.gemini/GEMINI.md',
  };
  for (const [provider, file] of Object.entries(primaryFiles)) {
    assert.equal(existsSync(join(target, file)), providers.includes(provider), `unexpected ${file}`);
  }
}

function distributableInventory(root, relative = '') {
  const excluded = new Set(['node_modules', 'package.json', 'package-lock.json', 'bun.lock', '.gitignore']);
  return readdirSync(join(root, relative), { withFileTypes: true })
    .flatMap((entry) => {
      if (excluded.has(entry.name)) return [];
      const path = join(relative, entry.name);
      return entry.isDirectory() ? distributableInventory(root, path) : [path.replaceAll('\\', '/')];
    })
    .sort();
}

if (!bash) {
  test.skip('Bash unavailable: Bash installation scenarios were not executed', () => {});
} else {
  test('installs each valid provider and all into destinations with spaces', () => {
    withFixture(({ fixture, root }) => {
      for (const provider of ['claude', 'opencode', 'gemini', 'all']) {
        const target = join(root, `destination with spaces ${provider}`);
        mkdirSync(target);
        const result = install(fixture, target, provider);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        assertSuccessfulInstallation(target, provider === 'all' ? ['claude', 'opencode', 'gemini'] : [provider]);
      }
    });
  });

  test('preserves existing shared artifacts and excluded destination artifacts', () => {
    withFixture(({ fixture, root }) => {
      const target = join(root, 'existing destination');
      mkdirSync(join(target, '.opencode', 'nested'), { recursive: true });
      writeFileSync(join(target, 'AGENTS.md'), 'existing shared artifact');
      for (const file of ['node_modules/keep.txt', 'package.json', 'package-lock.json', 'bun.lock', '.gitignore']) {
        const path = join(target, '.opencode', 'nested', file);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, 'preserve me');
      }

      const result = install(fixture, target, 'opencode');
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.equal(readFileSync(join(target, 'AGENTS.md'), 'utf8'), 'existing shared artifact');
      for (const file of ['node_modules/keep.txt', 'package.json', 'package-lock.json', 'bun.lock', '.gitignore']) {
        assert.equal(readFileSync(join(target, '.opencode', 'nested', file), 'utf8'), 'preserve me');
      }
    });
  });

  test('copies distributable hidden files and recursively excludes provider-local artifacts', () => {
    withFixture(({ fixture, root }) => {
      const source = join(fixture, '.opencode');
      writeFileSync(join(source, '.distributable'), 'hidden and distributable');
      for (const file of ['node_modules/blocked.txt', 'nested/node_modules/blocked.txt', 'nested/package.json', 'nested/package-lock.json', 'nested/bun.lock', 'nested/.gitignore']) {
        const path = join(source, file);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, 'must not copy');
      }

      const target = join(root, 'target');
      mkdirSync(target);
      const result = install(fixture, target, 'opencode');
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.equal(readFileSync(join(target, '.opencode', '.distributable'), 'utf8'), 'hidden and distributable');
      assert.deepEqual(
        distributableInventory(join(target, '.opencode')),
        distributableInventory(source),
        'installed provider inventory must match the distributable source inventory',
      );
      for (const file of ['node_modules/blocked.txt', 'nested/node_modules/blocked.txt', 'nested/package.json', 'nested/package-lock.json', 'nested/bun.lock', 'nested/.gitignore']) {
        assert.equal(existsSync(join(target, '.opencode', file)), false, `copied excluded artifact ${file}`);
      }
    });
  });

  test('rejects an invalid provider before copying provider content', () => {
    withFixture(({ fixture, root }) => {
      const target = join(root, 'target');
      mkdirSync(target);
      const result = install(fixture, target, 'invalido');
      assert.notEqual(result.status, 0);
      assert.match(`${result.stdout}${result.stderr}`, /invalido/i);
      for (const provider of ['.claude', '.opencode', '.gemini']) {
        assert.equal(existsSync(join(target, provider)), false, `copied ${provider} for invalid provider`);
      }
    });
  });

  test('returns a nonzero status and reports a missing selected artifact', () => {
    withFixture(({ fixture, root }) => {
      unlinkSync(join(fixture, '.gemini', 'GEMINI.md'));
      const target = join(root, 'target');
      mkdirSync(target);
      const result = install(fixture, target, 'gemini');
      assert.notEqual(result.status, 0);
      assert.match(`${result.stdout}${result.stderr}`, /Faltante.*\.gemini\/GEMINI\.md/i);
    });
  });
}
