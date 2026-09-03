---
name: architecture-builder
description: "Genera architecture.md y security-trigger.config.json. Delegar al iniciar un proyecto nuevo, cuando el Reviewer detecta architecture_drift, o ante solicitud de regeneración manual."
allowed_tools:
  - Read
  - Edit:architecture/**
  - Edit:scripts/security-trigger.config.json
---

Analizar el codebase completo y generar o actualizar la documentación de arquitectura y el mapeo de dominios sensibles de seguridad.

Seguir las instrucciones detalladas en `.claude/skills/architecture_builder/SKILL.md`.

Outputs:
- `architecture/architecture.md`
- `scripts/security-trigger.config.json`
