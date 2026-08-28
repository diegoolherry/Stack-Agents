# Findings — Agregar autenticación OAuth2

## 1. Archivos relevantes
- `src/routes/auth.js`: Actualmente maneja la autenticación básica, necesitará nuevos endpoints para OAuth2 (`/auth/google`, `/auth/github`).
- `src/models/user.js`: El modelo actual solo incluye `email` y `password`. Se necesitarán nuevos campos (ej. `provider_id`, `provider`).
- `src/middlewares/auth.js`: Se encarga de la verificación JWT actual, que podría necesitar ajustes si el payload o el método cambian con OAuth2.

## 2. Patrones existentes
- **Autenticación Actual**: Se utiliza JWT para el manejo de sesiones después del login clásico. El patrón actual es stateless, almacenando el token en el cliente (localStorage).
- **Manejo de Errores**: Se usa un middleware centralizado (`src/middlewares/errorHandler.js`) que captura errores `401 Unauthorized`. Las nuevas rutas OAuth2 deberían adherirse a este formato.
- **Variables de Entorno**: La configuración sensible se maneja usando `dotenv` y se valida al inicio (`src/config/env.js`).

## 3. Dependencias afectadas
- `passport` o dependencias específicas (ej. `passport-google-oauth20`, `passport-github2`): Necesitarán ser instaladas y configuradas.
- `express-session`: Posiblemente requerida si se opta por un flujo donde se necesite mantener el estado temporal antes del JWT final (dependiendo de la implementación de Passport).

## 4. Riesgos detectados
- **Edge cases en el Modelo User**: Los usuarios existentes con autenticación por contraseña podrían intentar usar OAuth2 con el mismo email, lo que podría requerir un flujo de vinculación de cuentas (account linking).
- **Deuda técnica**: El archivo `auth.js` de rutas es bastante grande y mezcla lógica de negocio con definición de endpoints; añadir OAuth2 podría empeorarlo si no se refactoriza extrayendo a controladores.

## 5. ADRs relevantes
- **ADR-003: Uso de JWT para Sesiones**: Decisión previa de no usar sesiones en servidor para escalar horizontalmente. (Debe respetarse al emitir el token final tras el flujo OAuth).
- **ADR-005: Centralización de Secretos**: Los secretos se deben inyectar por variables de entorno y no hardcodear en ningún archivo de configuración. (Relevante para los client_id y client_secret de OAuth2).
