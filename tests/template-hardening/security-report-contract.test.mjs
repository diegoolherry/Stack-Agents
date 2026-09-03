import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url));
const canonicalReport = 'reports/<feature>-security.md';
const inconsistentReport = 'reports/<feature>-security-audit.md';
const securityAuditDocuments = [
  '.claude/commands/security-audit.md',
  '.claude/skills/security_auditor/SKILL.md',
  '.opencode/skills/security_auditor/SKILL.md',
  '.gemini/skills/security_auditor/SKILL.md',
];

test('Security Auditor documentation uses only the canonical report path', async () => {
  for (const documentPath of securityAuditDocuments) {
    const content = await readFile(new URL(documentPath, `file:///${repositoryRoot}/`), 'utf8');

    assert.ok(content.includes(canonicalReport), `${documentPath} must use the canonical report path`);
    assert.ok(!content.includes(inconsistentReport), `${documentPath} must not use the inconsistent report path`);
  }
});
