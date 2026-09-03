---
name: supabase
description: Skill de referencia técnica para usar Supabase (Postgres + Auth + Storage) como backend. Usa esta skill cuando el proyecto elige Supabase como base de datos — al generar architecture.md en greenfield, al escribir migraciones, o al implementar auth/storage.
tools_required: read-write
---

### Rol
Guiar el uso correcto de Supabase CLI y su stack (Postgres, Auth, Storage, Edge Functions) como backend de un proyecto. NO es un subagente — la consultan `architecture_builder` (decisión de stack) e `implementer` (código concreto).

### Setup inicial (una vez por proyecto)
1. `supabase init` — crea `supabase/` en la raíz del proyecto
2. `supabase start` — levanta Postgres + Auth + Storage local vía Docker (desarrollo)
3. `supabase login` + `supabase link --project-ref <ref>` — conectar al proyecto remoto (gratis hasta 500MB DB / 1GB storage / 50k MAU en el free tier — confirmar límites vigentes en supabase.com/pricing antes de asumirlos)

### Migraciones (reemplaza el rol de las migraciones de EF Core / SQL Server)
- Nueva migración: `supabase migration new <nombre>`
- Escribir el SQL a mano en el archivo generado (`supabase/migrations/<timestamp>_<nombre>.sql`) — Supabase CLI no autogenera el SQL desde un modelo de código, a diferencia de EF Core
- Aplicar local: `supabase db reset` (recrea la DB local desde cero + corre todas las migraciones)
- Aplicar a remoto: `supabase db push`

### Tipos generados (para C#/TS)
- `supabase gen types typescript --local > types.ts` (o `--lang csharp` si el proyecto es C# y la versión de CLI lo soporta — verificar, no todos los lenguajes están cubiertos igual)
- Regenerar tipos después de CADA migración aplicada

### Diferencias clave vs. SQL Server (para tener en cuenta al escribir queries)
- Es Postgres, no T-SQL: `SERIAL`/`GENERATED ALWAYS AS IDENTITY` en vez de `IDENTITY`, `ILIKE` para case-insensitive en vez de `COLLATE`, `RETURNING` en INSERT/UPDATE para traer la fila afectada sin un SELECT extra
- Row Level Security (RLS): Postgres tiene políticas de seguridad A NIVEL DE FILA que SQL Server no tiene de forma nativa. Si el proyecto usa Supabase Auth, activar RLS en cada tabla con datos de usuario y escribir policies explícitas — si no se activa RLS, cualquiera con la API key puede leer/escribir todo.

### Auth
- Supabase Auth maneja registro/login/JWT — no reimplementar auth propio si ya se usa Supabase como backend (evita duplicar lo que la skill `implementer` haría con JWT manual)
- El JWT de Supabase se valida automáticamente en RLS policies (`auth.uid()`) — diseñar las policies pensando en esto

### Reglas
- NO usar el service_role key (bypassa RLS) desde el cliente/frontend — solo desde backend/Edge Functions de confianza
- Toda tabla con datos de usuario DEBE tener RLS activado antes de cerrar la feature — si no, `security_auditor` debe marcarlo como hallazgo crítico
- Las migraciones se versionan en git (`supabase/migrations/`) — nunca aplicar un cambio de schema a mano en el dashboard sin generar la migración correspondiente
