# Excepciones de métricas para el Reviewer

Guía corta para el Reviewer sobre cuándo es válido ignorar métricas CRAP/mutation testing que exceden umbrales:

1. **Archivos generados automáticamente** — migraciones de DB, código generado por herramientas, archivos de config auto-generados. No tiene sentido medir complejidad de algo que nadie escribió a mano.

2. **Archivos de configuración** — archivos de setup, constants, enums puros. Son declarativos por naturaleza y el CRAP puede inflar por tamaño sin complejidad real.

3. **Código legacy tocado incidentalmente** — si la feature solo modifica 3 líneas de un archivo legacy de 500 líneas con CRAP alto, no se castiga. El CRAP del archivo no es responsabilidad de esta feature.

4. **Wrappers y adaptadores thin** — código que solo delega a otra librería sin lógica propia. Mutation testing puede dar falsos negativos porque no hay lógica que mutar.

5. **Regla general:** si el exceso de métrica NO se debe a complejidad añadida por la feature actual, documentar la excepción en el review report y no rechazar.
