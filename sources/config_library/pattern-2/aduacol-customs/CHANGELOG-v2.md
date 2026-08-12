# CHANGELOG – Iteración 2: Correcciones Post-Revisión Aduacol

**Fecha:** 2026-08-04 al 2026-08-12
**Responsable:** Sebastian De La Vega (3HTP)
**Modelo:** Amazon Nova 2 Lite → Claude Haiku 4.5

---

## Contexto

El equipo de Aduacol (Javier Ambuila) revisó 56 documentos procesados con el IDP y reportó observaciones en `Control_Ejecucion_IDP_Aduacol.xlsx - Control IDP.csv`. Esta iteración corrige todos los issues reportados.

## Cambios en config.yaml

### 1. Modelo de Extracción
- **Antes:** `us.amazon.nova-2-lite-v1:0` (max_tokens: 51200)
- **Después:** `us.anthropic.claude-haiku-4-5-20251001-v1:0` (max_tokens: 64000)
- **Motivo:** Nova 2 Lite fallaba en facturas de 5+ páginas y alucinaba items. Haiku 4.5 es más rápido en docs cortos (5.2s vs 7.5s), procesa docs largos correctamente, y el costo adicional es ~$2.62/mes.

### 2. Término de Negociación (Fix #1 — afectaba 94% facturas)
- **Antes:** `"Extract only the code without the location"`
- **Después:** `"Extract the FULL incoterm including the delivery place/port"` con ejemplos (FOB Ningbo, CIF Cartagena, etc.)
- **Resultado:** 94% de facturas ahora extraen término completo.

### 3. Condiciones de Pago (Fix #2 — campo nuevo)
- Campo `condiciones_pago` agregado como semi-requerido en Factura Comercial.
- **Resultado:** 58% de facturas lo extraen (las que lo tienen impreso).

### 4. Tipo de Tránsito OTM/DTA (Fix #3 — campo nuevo)
- Campo `tipo_transito` agregado en Bill of Lading.
- Busca frases exactas: "mercancía en continuación de viaje", "mercancía en OTM", "mercancía en tránsito nacional", "mercancía en DTA".
- Retorna: "OTM", "DTA", "CONTINUACION_VIAJE", o null.
- **Resultado:** 9/24 BLs detectados correctamente (solo los que lo mencionan explícitamente).

### 5. Aduana de Llegada (Fix #4 — renombramiento)
- Description de `administracion_aduana` ahora dice "ADUANA DE LLEGADA" explícitamente.
- Referencia al mapeo con códigos DIAN.
- **Resultado:** 100% extraída correctamente.

### 6. Endoso Reforzado (Fix #5)
- Extraction guidelines expandidas con instrucciones detalladas de búsqueda de endoso.
- Schema del campo marcado como CRITICAL.
- Incluye variantes: overlay, segunda página, sellos, formatos abreviados.
- **Resultado:** 3/3 endosos detectados con empresa + NIT.

### 7. Valores Mejorados (Fix #6)
- `valor_total_usd`: description indica GRAND TOTAL incluyendo todos los cargos.
- `valor_fob`: clarificado como valor antes de flete/seguro.
- `otros_gastos`: campo nuevo para THC, handling, gastos origen.
- **Resultado:** 100% de facturas extraen valor total (antes 77%).

### 8. Clasificación Modo Transporte (nuevo)
- `tipo_bl` expandido: MASTER_BL, HOUSE_BL, GUIA_AEREA, CARTA_PORTE.
- Permite determinar si la carga es marítima, aérea o terrestre.

### 9. Contenedores (fix puntual)
- Description mejorada para extraer contenedores que aparecen en texto corrido dentro de "Description of Goods".
- Instrucción de cross-check con conteo indicado (e.g., "40HQ*4" = 4 contenedores).
- **Resultado:** BL APS20260200602 ahora extrae 4/4 contenedores (antes 3/4).

### 10. Anti-Alucinación (guideline #15)
- Instrucciones explícitas de no fabricar items repetidos.
- Self-check: "si estás repitiendo, STOP".
- **Limitación conocida:** No es 100% efectivo en facturas de 7+ páginas con 300+ items (MALAWY). Requiere chunking por página en siguiente iteración.

### 11. Extraction Guidelines
- Expandidas de 11 a 15 reglas.
- Final-instructions actualizadas con verificaciones.

## Archivo Nuevo: incoterms-2020.md
- Base de conocimiento de Incoterms 2020.
- Clasificación por modo de transporte (marítimo vs cualquiera).
- Reglas de validación Incoterm ↔ modo transporte.
- Tabla de responsabilidades (quién paga qué).
- Implicaciones para factura (cuándo debe desglosar flete/seguro).
- Puertos marítimos de Colombia con código DIAN.
- Fuente: LegisComex / ICC.

## Resultados Comparativos

| Métrica | v1 (Jul, Nova) | v2 FINAL (Ago, Haiku) |
|---|---|---|
| Documentos procesados | 56 (2 fallaron) | **60/60** |
| Término completo | 0% | **94%** |
| Condiciones pago | 0% | **58%** |
| Valor total | 77% | **100%** |
| Aduana de llegada | 100% (mal nombre) | **100%** |
| Endosos | 0/4 | **3/3** |
| Tipo tránsito | 0% | **9/24 detectados** |
| Docs largos (5+ págs) | FALLA | **OK** |
| Velocidad mediana | 7.5s | **5.2s** |
| Costo Bedrock/mes | ~$0.18 | ~$2.80 |

## Limitación Conocida

- Factura MALAWY260206-848H (7 páginas, ~300 items de cosméticos): Haiku 4.5 alucina ~836 items repetidos. Afecta 1/60 documentos (1.6%).
- **Solución propuesta:** Lambda de post-procesamiento con chunking por página. Siguiente iteración.

## Stack Desplegado

- Stack: `GenAI-IDP-ADUACOL`
- Cuenta: 183804119221
- Región: us-east-1
- Modelo extracción: Claude Haiku 4.5
- Modelo clasificación: Amazon Nova 2 Lite (sin cambios)
