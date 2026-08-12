# ADUACOL Customs – IDP Configuration

Configuración del pipeline de extracción inteligente de documentos (IDP) para operaciones de comercio exterior de ADUACOL.

## Qué hace

Extrae datos estructurados de Facturas Comerciales y Bills of Lading usando IA generativa (Amazon Bedrock). El sistema transaccional de ADUACOL consume los JSONs de salida y ejecuta la validación cruzada contra sus registros.

```
PDF → S3 Input → Textract OCR → Clasificación → Extracción → JSON → S3 Output
                                  (Nova 2 Lite)   (Haiku 4.5)
```

## Arquitectura

- **Patrón:** GenAI IDP Accelerator Pattern 2 (Bedrock LLM)
- **Stack:** `GenAI-IDP-ADUACOL` (backend-only, sin frontend)
- **Cuenta:** 183804119221 | **Región:** us-east-1
- **Modelo clasificación:** Amazon Nova 2 Lite
- **Modelo extracción:** Claude Haiku 4.5 (`us.anthropic.claude-haiku-4-5-20251001-v1:0`)

## Documentos Soportados

| Tipo | Operaciones | Campos Clave |
|------|-------------|--------------|
| **FACTURA_COMERCIAL** | IMPO, EXPO, DTA | numero_factura, termino_negociacion (con ciudad), importador/exportador_nombre, valor_total_usd, valor_fob, condiciones_pago, items[] |
| **BILL_OF_LADING** | IMPO, DTA | bl_number, consignee_nombre, administracion_aduana (Aduana de Llegada), tipo_transito (OTM/DTA/CONTINUACION_VIAJE), endoso, contenedores[], tipo_bl |

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `config.yaml` | Schema de extracción, prompts, configuración de modelos. **El archivo principal.** |
| `aduanas.csv` | Tabla de equivalencia Aduana ↔ Código DIAN (27 aduanas) |
| `incoterms-2020.md` | Base de conocimiento de Incoterms: clasificación por modo transporte, reglas de validación, responsabilidades |
| `CHANGELOG-v2.md` | Historial de cambios de la iteración 2 (ago 2026) |

## Integración

1. Sistema transaccional sube PDF a `s3://<INPUT_BUCKET>/`
2. EventBridge detecta upload → SQS → Step Functions
3. Pipeline: OCR (Textract) → Clasificación (Nova 2 Lite) → Extracción (Haiku 4.5)
4. JSON resultado en `s3://<OUTPUT_BUCKET>/<key>/sections/1/result.json`
5. Sistema transaccional consume JSON y compara contra sus registros

**El IDP solo extrae. La validación la hace el sistema transaccional.**

## Campos Nuevos (v2 – ago 2026)

Campos agregados tras revisión del equipo de Aduacol:

| Campo | Tipo Doc | Descripción |
|-------|----------|-------------|
| `condiciones_pago` | Factura | Payment terms (30 days, T/T, L/C, etc.) |
| `tipo_transito` | BL | OTM / DTA / CONTINUACION_VIAJE o null |
| `otros_gastos` | Factura | Gastos origen, THC, handling |
| `tipo_bl` (expandido) | BL | MASTER_BL, HOUSE_BL, GUIA_AEREA, CARTA_PORTE |

## Performance

| Métrica | Valor |
|---------|-------|
| Docs 1 página (mediana) | **5.2s** |
| Docs 5 páginas | ~60s |
| Docs 7 páginas | ~190s |
| Tasa de éxito | 60/60 (100%) |
| Costo Bedrock (~500 docs/mes) | ~$2.80/mes |

## Deploy

```bash
cd samples/sample-bedrock
npx tsc
npx cdk deploy GenAI-IDP-ADUACOL --profile 3htp-col --region us-east-1 --require-approval never
```

**Requisitos:** Node.js 18+, Docker Desktop corriendo, CDK Bootstrap en la cuenta.

## Limitaciones Conocidas

1. **Facturas 7+ páginas con 300+ items:** Posible repetición de items (alucinación). Afecta 1/60 docs. Solución pendiente: chunking por página.
2. **Término de negociación:** Si la factura no imprime Incoterm con ciudad, el modelo solo extrae el código (2/60 docs).
3. **Condiciones de pago:** Solo se extrae si está impreso en la factura (~58% lo tienen).

## Historial

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-06-19 | v1.0 | Config inicial: Nova 2 Lite, 2 doc types, schema base |
| 2026-08-12 | v2.0 | Haiku 4.5, 6 correcciones de schema, campos nuevos, anti-alucinación |
