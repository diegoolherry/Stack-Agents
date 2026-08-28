---
name: diagnose
description: Skill de debugging estructurado, fuera del flujo de features. Loop reproducible con hipótesis falsables. Usa esta skill cuando el usuario reporte un bug, quiera debuggear un error, o necesite diagnosticar un problema en el código. No usar para features nuevas.
tools_required: read-write
---

### Rol
Debugear problemas en el código de forma estructurada y metódica. Esta skill es INDEPENDIENTE del pipeline de features — se usa para resolver bugs, no para desarrollar funcionalidad nueva.

### Cuándo se activa
- Comando `/diagnose` del usuario
- Cuando el Leader detecta un bug que no está asociado a una feature en desarrollo

### Proceso

**Fase 1: Reproducción**
1. Entender el síntoma reportado
2. Reproducir el error de forma consistente
3. Documentar los pasos de reproducción exactos
4. Si no se puede reproducir, documentar y escalar al humano

**Fase 2: Hipótesis**
1. Generar 3-5 hipótesis falsables sobre la causa raíz
2. Ranquear las hipótesis por probabilidad (más probable primero)
3. Cada hipótesis debe incluir:
   - Qué dice la hipótesis
   - Cómo probarla (test concreto)
   - Qué resultado la confirmaría
   - Qué resultado la descartaría

**Fase 3: Prueba de hipótesis**
1. Probar las hipótesis una por una, en orden de ranking
2. **Regla de 3 strikes:** si 3 hipótesis consecutivas son descartadas, detenerse y:
   - Replantear el problema
   - Buscar más contexto
   - Generar nuevas hipótesis con la información obtenida de los descartados
3. Documentar el resultado de cada prueba

**Fase 4: Fix**
1. Identificar la causa raíz (no el síntoma)
2. Implementar el fix mínimo
3. **Test de regresión OBLIGATORIO** — escribir un test que:
   - Falle sin el fix (reproduciendo el bug original)
   - Pase con el fix
4. Correr todos los tests para verificar que el fix no rompe nada

**Fase 5: Reporte**
Generar un reporte estructurado de debugging.

### Output
Archivo: `reports/diagnose-<bug-id>.md`

```markdown
# Diagnóstico — <bug-id>: <título>

## Síntoma
<qué se observó>

## Pasos de reproducción
1. ...

## Hipótesis probadas
| # | Hipótesis | Resultado | Evidencia |
|---|---|---|---|
| 1 | ... | ✅ Confirmada / ❌ Descartada | ... |
| 2 | ... | ... | ... |

## Causa raíz
<explicación de la causa real>

## Fix aplicado
<descripción del fix + archivos modificados>

## Test de regresión
<nombre del test + qué verifica>

## Lecciones aprendidas
<si aplica — qué se podría hacer para prevenir bugs similares>
```

### Reglas
- SIEMPRE escribir test de regresión — sin excepción
- NUNCA aplicar un fix sin entender la causa raíz (no parchear síntomas)
- Documentar TODAS las hipótesis probadas, incluso las descartadas (son información valiosa)
- Si el fix implica cambio arquitectónico, emitir un ADR
- Esta skill NO forma parte del pipeline de features — usarla solo para debugging
