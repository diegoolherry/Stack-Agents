---
description: "Subagente Architecture Builder SDD. Genera architecture.md y security-trigger.config.json."
mode: subagent
permissions:
  - action: read
    resource: "*"
  - action: edit
    resource: "architecture/**"
  - action: edit
    resource: "scripts/security-trigger.config.json"
  - action: edit
    resource: ".github/**"
---

Analizar el codebase completo y generar o actualizar la documentación de arquitectura y el mapeo de dominios sensibles de seguridad.

Seguir las instrucciones detalladas en `.opencode/skills/architecture_builder/SKILL.md`.

Outputs:
- `architecture/architecture.md`
- `scripts/security-trigger.config.json`
- .github/workflows/ci.yml (y deploy.yml si aplica)
