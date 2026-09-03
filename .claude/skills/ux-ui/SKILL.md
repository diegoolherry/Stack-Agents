---
name: ux-ui
description: Checklist funcional de UX/UI para software de gestión (no es una skill de diseño visual/creativo). Usa esta skill al escribir requirements.md de una feature con interfaz de usuario, y al implementar esa interfaz.
tools_required: read-write
---

### Rol
Checklist de usabilidad funcional para pantallas de sistemas de gestión — formularios, listados, flujos CRUD. NO cubre diseño visual/estético (paleta, tipografía, branding) — eso está fuera de scope de este proyecto.

### Cuándo se aplica
- Toda feature en modo Full que incluya una pantalla o formulario nuevo
- NO aplica a features puramente de backend/API sin interfaz

### Checklist — agregar como criterios de aceptación en requirements.md

**Formularios:**
- [ ] Cada campo obligatorio está marcado visualmente (no solo al fallar el submit)
- [ ] Errores de validación aparecen junto al campo que falló, en el momento en que el usuario sale del campo (no recién al enviar)
- [ ] El botón de submit se deshabilita mientras la request está en curso (evitar doble-submit)
- [ ] Mensaje de éxito claro tras guardar (no solo redirigir en silencio)

**Listados:**
- [ ] Estado vacío explícito ("No hay productos todavía" + acción para crear uno) — nunca una tabla en blanco sin contexto
- [ ] Estado de carga visible (spinner/skeleton) si la respuesta puede demorar
- [ ] Confirmación antes de acciones destructivas (borrar, cancelar pedido)

**Accesibilidad básica:**
- [ ] Contraste de texto suficiente (mínimo AA de WCAG — herramientas gratis: WebAIM Contrast Checker)
- [ ] Todo input tiene un `<label>` asociado (no solo placeholder)
- [ ] La app es usable solo con teclado (tab entre campos, enter para submit)

**Responsive mínimo:**
- [ ] La pantalla no rompe el layout en mobile (aunque el diseño no esté optimizado para mobile, no debe quedar inutilizable)

### Reglas
- Esta skill NO reemplaza al `spec_author` — se USA DENTRO de `spec_author` al redactar requirements.md, agregando los ítems del checklist que apliquen como criterios de aceptación con su propio RF o como sub-ítems de un RF existente
- `implementer` marca cada ítem aplicado como parte del checklist al reportar la task, igual que hace con las tasks de `tasks.md`
- Si una feature no tiene UI, esta skill no se usa — no forzar criterios de UX en un endpoint puro de API
