# Incoterms 2020 — Base de Conocimiento para Validación Aduanera

**Fuente:** Cámara de Comercio Internacional (ICC) / LegisComex
**Última actualización:** 2020 (se actualizan cada ~10 años, próximo cambio ~2030)
**Uso:** Referencia estática para validación de términos de negociación en documentos de comercio exterior.

---

## Clasificación por Modo de Transporte

### Grupo 1: Cualquier modo de transporte (Aéreo, Terrestre, Multimodal)

| Código | Nombre completo | Español | Uso válido con |
|--------|----------------|---------|----------------|
| **EXW** | Ex Works | En fábrica | Guía Aérea, Carta Porte, BL (cualquiera) |
| **FCA** | Free Carrier | Franco transportista | Guía Aérea, Carta Porte, BL (cualquiera) |
| **CPT** | Carriage Paid To | Transporte pagado hasta | Guía Aérea, Carta Porte, BL (cualquiera) |
| **CIP** | Carriage and Insurance Paid To | Transporte y seguro pagados hasta | Guía Aérea, Carta Porte, BL (cualquiera) |
| **DAP** | Delivered at Place | Entregado en punto de destino | Guía Aérea, Carta Porte, BL (cualquiera) |
| **DPU** | Delivered at Place Unloaded | Descargado en lugar de destino | Guía Aérea, Carta Porte, BL (cualquiera) |
| **DDP** | Delivered Duty Paid | Entregado con derechos pagados | Guía Aérea, Carta Porte, BL (cualquiera) |

### Grupo 2: EXCLUSIVAMENTE Transporte Marítimo y Fluvial

| Código | Nombre completo | Español | Uso válido con |
|--------|----------------|---------|----------------|
| **FAS** | Free Alongside Ship | Franco al costado del buque | Solo BL (marítimo) |
| **FOB** | Free on Board | Franco a bordo | Solo BL (marítimo) |
| **CFR** | Cost and Freight | Costo y flete | Solo BL (marítimo) |
| **CIF** | Cost, Insurance and Freight | Costo, seguro y flete | Solo BL (marítimo) |

---

## Reglas de Validación

### Regla 1: Coherencia Incoterm ↔ Modo de Transporte

```
SI documento_transporte = "GUIA_AEREA" (aéreo)
  Y incoterm ∈ {FAS, FOB, CFR, CIF}
  → ERROR: Estos términos son EXCLUSIVAMENTE marítimos

SI documento_transporte = "CARTA_PORTE" (terrestre)
  Y incoterm ∈ {FAS, FOB, CFR, CIF}
  → ERROR: Estos términos son EXCLUSIVAMENTE marítimos

SI documento_transporte = "BL" (marítimo)
  Y incoterm ∈ {EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF}
  → VÁLIDO: Todos los Incoterms son válidos con transporte marítimo
```

**Nota importante:** Los Incoterms del Grupo 1 (cualquier modo) SON válidos con transporte marítimo. Solo los del Grupo 2 están RESTRINGIDOS a marítimo.

### Regla 2: Coherencia Incoterm ↔ Ciudad/Puerto

| Incoterm | La ciudad DEBE ser... | Ejemplo correcto | Ejemplo incorrecto |
|----------|----------------------|------------------|--------------------|
| **EXW** | Ciudad del vendedor/fábrica | EXW Shanghai | EXW Cartagena (si compra desde Colombia) |
| **FCA** | Lugar de entrega al transportista | FCA Ningbo | — |
| **FAS** | Puerto de EMBARQUE (origen) | FAS Ningbo | FAS Cartagena (si se exporta desde China) |
| **FOB** | Puerto de EMBARQUE (origen) | FOB Ningbo, FOB Shenzhen | FOB Cartagena (si importa a Colombia) |
| **CFR** | Puerto de DESTINO (llegada) | CFR Buenaventura, CFR Cartagena | CFR Ningbo (si importa a Colombia) |
| **CIF** | Puerto de DESTINO (llegada) | CIF Cartagena, CIF Buenaventura | CIF Shanghai (si importa a Colombia) |
| **CPT** | Lugar de DESTINO | CPT Bogotá, CPT Medellín | CPT Shanghai (si importa) |
| **CIP** | Lugar de DESTINO | CIP Bogotá | CIP Ningbo (si importa) |
| **DAP** | Lugar de DESTINO final | DAP Bogotá, DAP Cúcuta | DAP Shanghai (si importa) |
| **DPU** | Lugar de DESTINO (descarga) | DPU Zona Franca Bogotá | — |
| **DDP** | Lugar de DESTINO final | DDP Medellín | DDP Shanghai (si importa) |

### Regla 3: Para IMPORTACIONES a Colombia

- **FOB, FAS** → La ciudad debe ser un puerto/lugar en el PAÍS DE ORIGEN (China, Panamá, etc.)
- **CFR, CIF** → La ciudad debe ser un puerto COLOMBIANO (Buenaventura, Cartagena, Barranquilla, Santa Marta)
- **CPT, CIP, DAP, DPU, DDP** → La ciudad puede ser cualquier lugar en COLOMBIA (incluso ciudades interiores)
- **EXW** → La ciudad es donde está la fábrica del vendedor (en el país de origen)
- **FCA** → La ciudad es donde se entrega al primer transportista (usualmente en origen)

### Regla 4: Para EXPORTACIONES desde Colombia

- **FOB, FAS** → La ciudad debe ser un puerto COLOMBIANO (Buenaventura, Cartagena, etc.)
- **CFR, CIF** → La ciudad debe ser un puerto en el PAÍS DE DESTINO
- **EXW** → La ciudad es donde está la fábrica del vendedor colombiano

---

## Transferencia de Responsabilidades

### ¿Quién paga qué?

| Incoterm | Flete interno (origen) | Despacho export | Flete internacional | Seguro internacional | Despacho import | Flete interno (destino) |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| **EXW** | COMPRADOR | COMPRADOR | COMPRADOR | COMPRADOR | COMPRADOR | COMPRADOR |
| **FCA** | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR | COMPRADOR | COMPRADOR |
| **FAS** | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR | COMPRADOR | COMPRADOR |
| **FOB** | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR | COMPRADOR | COMPRADOR |
| **CFR** | VENDEDOR | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR | COMPRADOR |
| **CPT** | VENDEDOR | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR | COMPRADOR |
| **CIF** | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR |
| **CIP** | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR | COMPRADOR | COMPRADOR |
| **DAP** | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR | COMPRADOR | VENDEDOR |
| **DPU** | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR | COMPRADOR | VENDEDOR |
| **DDP** | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR | VENDEDOR |

### Implicaciones para la Factura Comercial

| Incoterm | ¿La factura DEBE mostrar flete? | ¿La factura DEBE mostrar seguro? |
|----------|:---:|:---:|
| **EXW** | NO (comprador lo paga aparte) | NO |
| **FCA** | NO | NO |
| **FAS** | NO | NO |
| **FOB** | NO (valor = solo mercancía) | NO |
| **CFR** | SÍ (flete incluido en precio) | NO |
| **CPT** | SÍ (flete incluido en precio) | NO |
| **CIF** | SÍ (flete incluido) | SÍ (seguro incluido) |
| **CIP** | SÍ (flete incluido) | SÍ (seguro incluido) |
| **DAP** | SÍ (todo incluido hasta destino) | SÍ |
| **DPU** | SÍ | SÍ |
| **DDP** | SÍ (todo incluido + impuestos) | SÍ |

**Regla de validación crítica (mencionada por Javi Ambuila):**
> Si la factura dice "CIF Buenaventura" pero NO desglosa el flete NI el seguro → la factura está INCOMPLETA o el término es INCORRECTO. Un CIF SIEMPRE debe mostrar: valor mercancía + flete + seguro = total.

---

## Puertos Marítimos de Colombia (válidos para FOB/CFR/CIF en exportaciones y CFR/CIF en importaciones)

| Puerto | Aduana DIAN | Código |
|--------|------------|--------|
| Buenaventura | Aduana de Buenaventura | 35 |
| Cartagena | Aduana de Cartagena | 48 |
| Barranquilla | Aduana de Barranquilla | 87 |
| Santa Marta | Aduana de Santa Marta | 19 |
| Tumaco | Aduana de Tumaco | 40 |
| Urabá (Turbo) | Aduana de Urabá | 41 |

---

## Errores Comunes Detectados en ADUACOL

| Error | Por qué está mal | Ejemplo |
|-------|-----------------|---------|
| FOB + ciudad de destino colombiana | FOB = responsabilidad hasta puerto de ORIGEN | "FOB Cartagena" en una importación desde China |
| CFR + ciudad de origen extranjera | CFR = responsabilidad hasta puerto de DESTINO | "CFR Ningbo" en una importación a Colombia |
| CIF sin desglose de flete y seguro | CIF incluye costo + seguro + flete, DEBEN estar en la factura | "CIF Cartagena" pero factura solo muestra total |
| FAS/FOB/CFR/CIF con transporte terrestre | Estos 4 son EXCLUSIVAMENTE marítimos | "FOB Cúcuta" para transporte terrestre |
| Incoterm sin ciudad | SIEMPRE debe ir acompañado de un lugar | Solo "FOB" sin indicar puerto |
| CIF + ciudad interior | CIF es marítimo, el puerto no puede ser una ciudad sin mar | "CIF Bogotá" |

---

## Resumen Rápido para el Agente

```
MARÍTIMOS EXCLUSIVOS: FAS, FOB, CFR, CIF
  → Solo válidos con Bill of Lading
  → FOB/FAS: ciudad = puerto de EMBARQUE (origen)
  → CFR/CIF: ciudad = puerto de DESTINO (llegada)
  → CIF: factura DEBE desglosar flete + seguro

CUALQUIER TRANSPORTE: EXW, FCA, CPT, CIP, DAP, DPU, DDP
  → Válidos con BL, Guía Aérea, o Carta Porte
  → La ciudad depende del punto de transferencia de riesgos

SIEMPRE: Incoterm + Ciudad (nunca solo el código)
```
