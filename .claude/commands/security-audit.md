Run a security audit.

Usage: /security-audit $ARGUMENTS

Modes:
- **Feature mode** (default): Audit only the current feature's diff against `scripts/security-trigger.config.json`.
- **Global mode** (`--global`): Audit the entire repository.

Process:
1. Determine mode from arguments (if `$ARGUMENTS` contains `--global`, use global mode).
2. Delegate to the `security-auditor` agent with the appropriate scope.
3. The agent will produce `reports/<feature>-security.md`.
