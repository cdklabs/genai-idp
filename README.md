# ADUACOL IDP – Extracción Inteligente de Documentos Aduaneros

Pipeline de extracción automática de datos de **Facturas Comerciales** y **Bills of Lading** para el sistema transaccional de ADUACOL, usando Amazon Bedrock (Claude Haiku 4.5).

> **Programa:** AWS Bridge | **Cliente:** ADUACOL | **SA:** Homero (AWS) | **Implementación:** 3HTP

---

## Qué hace

Recibe PDFs de documentos de comercio exterior, extrae campos estructurados con IA, y entrega un JSON para que el sistema transaccional valide contra sus registros.

```
┌─────────────────────────────────────────────────────────────┐
│  Sistema Transaccional ADUACOL                               │
│       │                                                      │
│       ├── Sube PDF ──→ S3 Input                             │
│       │                    │                                 │
│       │              OCR (Textract)                          │
│       │                    │                                 │
│       │              Clasificación (Nova 2 Lite)             │
│       │                    │                                 │
│       │              Extracción (Claude Haiku 4.5)           │
│       │                    │                                 │
│       └── Lee JSON ◄── S3 Output                            │
└─────────────────────────────────────────────────────────────┘
```

**El IDP solo extrae. La validación cruzada la hace el sistema transaccional.**

---

## Estructura del Repositorio

```
.
├── README.md                          ← Este archivo
├── sources/config_library/pattern-2/
│   └── aduacol-customs/               ← ⭐ CONFIGURACIÓN ESPECÍFICA DE ADUACOL
│       ├── config.yaml                 ← Schema, prompts, modelos
│       ├── aduanas.csv                 ← Tabla Aduana ↔ Código DIAN
│       ├── incoterms-2020.md           ← Base de conocimiento Incoterms
│       ├── CHANGELOG-v2.md             ← Historial de cambios
│       └── README.md                   ← Documentación detallada del config
├── samples/sample-bedrock/             ← Stack CDK (despliega la infra)
│   └── src/
│       └── main.ts                     ← Entry point del stack
├── packages/@cdklabs/                  ← Constructs del accelerator (no tocar)
├── sources/                            ← Código fuente Lambdas del pipeline
└── docs/                               ← Documentación del accelerator upstream
```

**Para trabajar en la extracción de ADUACOL, el archivo principal es:**
`sources/config_library/pattern-2/aduacol-customs/config.yaml`

---

## Quick Start

### Requisitos
- Node.js 18+ (usar `nvm use`)
- Docker Desktop corriendo
- AWS CLI con perfil `3htp-col` (cuenta 183804119221)
- CDK Bootstrap presente en la cuenta

### Desplegar

```bash
cd samples/sample-bedrock
npx tsc
npx cdk deploy GenAI-IDP-ADUACOL --profile 3htp-col --region us-east-1 --require-approval never
```

### Probar un documento

```bash
# Subir
aws s3 cp factura.pdf s3://<INPUT_BUCKET>/test/factura.pdf --profile 3htp-col

# Esperar ~15-20s y leer resultado
aws s3 cp s3://<OUTPUT_BUCKET>/test/factura.pdf/sections/1/result.json - --profile 3htp-col
```

### Destruir

```bash
cd samples/sample-bedrock
npx cdk destroy GenAI-IDP-ADUACOL --profile 3htp-col --region us-east-1 --force
```

---

## Operaciones Soportadas

| Operación | Documentos | Notas |
|-----------|-----------|-------|
| **IMPO** (Importación) | Factura + BL | Ambos se procesan |
| **EXPO** (Exportación) | Solo Factura | No requiere BL |
| **DTA** (Tránsito Aduanero) | Factura + BL | Usa "consignatario" en BL |
| **ENDOSO** | BL con endoso | Detecta empresa + NIT destino |

---

## Modelo y Costos

| Componente | Modelo/Servicio | Costo estimado (500 docs/mes) |
|------------|----------------|-------------------------------|
| OCR | Amazon Textract (LAYOUT) | ~$15 |
| Clasificación | Amazon Nova 2 Lite | <$1 |
| Extracción | Claude Haiku 4.5 | ~$2.80 |
| Infraestructura | VPC, Lambda, SQS, DynamoDB, etc. | ~$95 (VPC Endpoints) |
| **Total** | | **~$136/mes** |

---

## Estado Actual (v2 – ago 2026)

| Métrica | Resultado |
|---------|-----------|
| Documentos procesados | 60/60 (100%) |
| Término negociación completo | 94% |
| Valor total extraído | 100% |
| Endosos detectados | 3/3 |
| Velocidad (docs 1 pág) | 5.2s mediana |
| Limitación | 1 factura de 7 págs con alucinación de items |

Ver detalles completos en [`CHANGELOG-v2.md`](sources/config_library/pattern-2/aduacol-customs/CHANGELOG-v2.md)

---

## Base: GenAI IDP Accelerator

Este repositorio es un fork/customización del [GenAI IDP Accelerator de AWS](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws) (v0.5.9). La documentación del framework base está en la carpeta `docs/` y en el [sitio oficial](https://aws-solutions-library-samples.github.io/accelerated-intelligent-document-processing-on-aws/).

**No modificar** los packages en `packages/@cdklabs/` ni el código fuente en `sources/src/` a menos que sea estrictamente necesario. Los cambios de ADUACOL van en `config.yaml`.
