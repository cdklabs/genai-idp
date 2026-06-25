# ADUACOL Customs – IDP Configuration

**Version:** 2.0 (Sesión 4 – 2026-06-19)

## Scope

Extracción de datos de documentos de comercio exterior para el sistema transaccional de ADUACOL.

- **2 tipos de documentos**: Factura Comercial, Bill of Lading
- **3 tipos de operación**: IMPO, EXPO, DTA
- **Solo extracción**: El IDP no compara contra el sistema transaccional
- **Sin HITL**: No hay revisión humana en la Web UI del IDP
- **Sin rule_validation**: La lógica de comparación la ejecuta ADUACOL

## Document Types

| Type | Operations | Required Fields |
|------|-----------|----------------|
| FACTURA_COMERCIAL | IMPO, EXPO, DTA | numero_factura, termino_negociacion, importador/exportador_nombre, valor_total_usd, valor_fob |
| BILL_OF_LADING | IMPO, DTA only | bl_number, consignee_nombre, administracion_aduana, endoso |

## Integration

1. ADUACOL sube PDF a S3 bucket
2. EventBridge trigger → Pipeline se ejecuta
3. JSON resultado se deposita en S3 output
4. Sistema transaccional consume JSON y compara contra sus registros

## Pending

- [x] CSV tabla de equivalencia Aduana ↔ Puerto (Javi) → `aduanas.csv`
- [x] Ejemplos de endoso para testing (Javi) → 3 PDFs en `samples/Documentos BL - Facturas/ENDOSOS/`
- [ ] Usuario IAM con acceso a bucket S3 pruebas (Gabo)
- [ ] Redespliegue limpio del stack (`cdk destroy` + `cdk deploy`) para activar config depurada

## Deploy

```bash
cd samples/sample-bedrock
npx cdk deploy GenAI-IDP-ADUACOL --profile 3htp-col
```

Stack: `GenAI-IDP-ADUACOL` | Cuenta: `183804119221` | Región: `us-east-1`
