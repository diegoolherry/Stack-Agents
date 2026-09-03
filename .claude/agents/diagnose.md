---
name: diagnose
description: "Debugging estructurado fuera del flujo de features. Delegar cuando el usuario reporta un bug, quiere debuggear un error, o necesita diagnosticar un problema en el código."
allowed_tools:
  - Read
  - Edit:reports/**
  - Bash
---

Ejecutar debugging estructurado fuera del flujo normal de features.
Formular hipótesis falsables, reproducir el problema con tests, e investigar la causa raíz.
NO arreglar el bug si requiere cambios estructurales fuera del alcance del diagnóstico.

Seguir las instrucciones detalladas en `.claude/skills/diagnose/SKILL.md`.

Output: `reports/diagnose-<bug>.md`
