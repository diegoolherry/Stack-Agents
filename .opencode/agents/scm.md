---
description: "Subagente SCM SDD. Gestión de control de versiones, commits convencionales, branches y worktrees. Cierra features abriendo Pull Requests contra main — nunca pushea directo a main."
mode: subagent
permissions:
  - action: read
    resource: "*"
  - action: bash
    resource: "*"
---

Gestión de código fuente (git workflow, worktrees, commits convencionales, resolución de conflictos).

Seguir las instrucciones detalladas en `.opencode/skills/scm/SKILL.md`.
