const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const PROVIDERS = Object.freeze(['all', 'claude', 'opencode', 'gemini']);
const EXCLUDED_NAMES = new Set([
  'node_modules',
  'package.json',
  'package-lock.json',
  'bun.lock',
  '.gitignore',
]);

function providersFor(provider) {
  if (!PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  return provider === 'all' ? PROVIDERS.slice(1) : [provider];
}

function inventoryFor(rootDirectory, provider) {
  const inventory = [];

  for (const name of providersFor(provider)) {
    const providerDirectory = path.join(rootDirectory, `.${name}`);
    if (fs.existsSync(providerDirectory)) {
      collectFiles(rootDirectory, providerDirectory, inventory);
    }
  }

  return inventory.sort();
}

function collectFiles(rootDirectory, directory, inventory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (EXCLUDED_NAMES.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(rootDirectory, entryPath, inventory);
    } else if (entry.isFile()) {
      inventory.push(path.relative(rootDirectory, entryPath).split(path.sep).join('/'));
    }
  }
}

function compareInventories(powerShellRoot, bashRoot) {
  return PROVIDERS.map((provider) => {
    const powerShell = inventoryFor(powerShellRoot, provider);
    const bash = inventoryFor(bashRoot, provider);

    return {
      provider,
      powerShell,
      bash,
      matches: JSON.stringify(powerShell) === JSON.stringify(bash),
    };
  });
}

function getBashPlatformResult(isBashAvailable = bashIsAvailable) {
  return isBashAvailable()
    ? { platform: 'bash', status: 'available' }
    : {
      platform: 'bash',
      status: 'not-executed',
      reason: 'Bash is not available on this platform.',
    };
}

function bashIsAvailable() {
  const result = spawnSync('bash', ['--version'], { stdio: 'ignore' });
  return result.status === 0 && !result.error;
}

async function withTemporaryDirectory(prefix, callback) {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));

  try {
    return await callback(directory);
  } finally {
    await fs.promises.rm(directory, { recursive: true, force: true });
  }
}

module.exports = {
  compareInventories,
  getBashPlatformResult,
  inventoryFor,
  withTemporaryDirectory,
};
