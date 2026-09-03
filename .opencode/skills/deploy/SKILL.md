---
name: deploy
description: Skill de referencia para configurar CI/CD y hosting gratuito de un proyecto. Usa esta skill al iniciar un proyecto nuevo (junto con architecture_builder) para dejar el pipeline de deploy configurado desde el principio, no como una tarea aparte al final.
tools_required: read-write
---

### Rol
Configurar CI (tests automáticos en cada push) y CD (deploy a un hosting gratuito) usando servicios sin costo. Se ejecuta UNA VEZ al iniciar el proyecto (parte del setup de `architecture_builder`), no es un paso recurrente del pipeline de features.

### CI — GitHub Actions (gratis en repos públicos y privados, con límite de minutos/mes)

Generar `.github/workflows/ci.yml` que:
1. Corre en cada push/PR a `main`
2. Instala dependencias
3. Corre la suite completa de tests (el mismo comando que usa `scm` en el paso de Integración)
4. Falla el check si algún test rompe — esto es lo que después usás como gate antes de mergear a `main`, además del Reviewer

### CD — hosting gratuito según tipo de proyecto

| Tipo de proyecto | Opción gratis | Notas |
|---|---|---|
| API backend (C#/.NET, Node) | Railway o Render (free tier) | Ambos "duermen" el servicio tras inactividad en el plan gratis — la primera request después de dormir tarda unos segundos |
| Frontend estático/SPA | Vercel o Netlify (free tier) | Sin límite de sleep, deploy automático por push |
| DB | Supabase (ver skill `supabase`) | Ya cubre DB + auth + storage gratis |

Generar `.github/workflows/deploy.yml` (o extender `ci.yml`) que, si CI pasa en `main`, dispare el deploy al servicio elegido (la mayoría de estos servicios ya tienen su propia integración nativa con GitHub y no necesitan un workflow manual — verificar primero si el hosting elegido lo resuelve solo antes de escribir un action custom).

### Reglas
- El deploy automático a producción NUNCA se dispara desde una rama que no sea `main` — respeta la restricción de `scm` de "no commits directos a main"
- Documentar en `architecture/architecture.md` qué servicio se usa para qué (DB, backend, frontend) y cualquier límite del free tier relevante (sleep, cuota de builds/mes)
- Si el proyecto es solo para aprendizaje/prueba y no necesita estar siempre disponible, el sleep del free tier no es un problema — no gastar tiempo evitándolo salvo que sea necesario
