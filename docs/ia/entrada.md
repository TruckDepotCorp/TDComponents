# Entrada y revisión — contrato de uso para IA

Entrada de mercadería y revisión del producto. No abre la cámara, no reemplaza el teléfono de [mobile.md](mobile.md) y no reemplaza el andén de [operaciones.md](operaciones.md). El mapa está en `TDArchitecture.Entrada`.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. Hay diez componentes. No existe un `TDEntrada` con `Kind`.
2. `TDReceiptLine` publica las unidades recibidas en `Field`. El defecto es `recibidas`. Puede superar lo pedido.
3. `TDAsnMatch` publica los bultos contados en `Field`. El defecto es `bultos`.
4. `TDInspectList` con `Checks` nulo o vacío dice que no hay criterios. Cada criterio publica `Cumple`, `No cumple` o `Pendiente`.
5. El estado siempre va escrito. `TDMobileTone` solo refuerza el color.
6. `TDSealCheck` es el sello de llegada. El sello de salida sigue en `TDDispatchCard`.
7. `TDLabelCheck` y `TDSealCheck` no abren la cámara.
8. Sin lote o sin vencimiento, `TDLotCapture` pide no ingresar a stock.
9. Fuera de rango, `TDTempCheck` pide no ingresar y avisar a calidad.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Orden, proveedor y avance de líneas | `TDReceiptHeader` | `TDDockBoard` si el dato es la puerta, no el documento |
| Pedido contra recibido en una línea | `TDReceiptLine` | `TDCountDiff` si se compara contra la existencia del sistema |
| Bultos del aviso contra el camión | `TDAsnMatch` | `TDReceiptLine` si la unidad es el artículo, no el bulto |
| Sello antes de descargar | `TDSealCheck` | `TDDispatchCard` si el camión está saliendo |
| Lote y vencimiento | `TDLotCapture` | `TDQcHold` si el lote ya está retenido |
| Criterios de la revisión | `TDInspectList` | `TDJobSteps` si son pasos de un flujo, no criterios |
| Qué se dañó y cuánto | `TDDamageNote` | `TDIssueCard` si la incidencia no es daño de producto |
| Temperatura de la carga | `TDTempCheck` | un número suelto |
| Etiqueta contra la orden | `TDLabelCheck` | `TDSlotCheck` si se compara una ubicación |
| Aceptar, devolver o mandar a calidad | `TDDisposition` | `TDConfirmSheet` si no hay una decisión de ingreso |

## Tipos

`TDInspectCheck` — `Id`, `Label`, `Result`, `Note`. Lo usa `TDInspectList`. `Result` es `Cumple`, `No cumple` o `Pendiente`.

## TDReceiptHeader

```razor
<TDReceiptHeader Document="OC-00481" Supplier="Frenos del Pacífico" Dock="Muelle 2 · Bodega Quilicura" ExpectedLines="6" ReceivedLines="4" Status="En recepción" Tone="TDMobileTone.Warning" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Document` | `string` | `""` | Orden o guía. | Siempre. |
| `Supplier` | `string` | `""` | Proveedor. | Siempre. |
| `Dock` | `string` | `""` | Muelle de la descarga. | Ya se asignó. |
| `ExpectedLines` | `int` | `0` | Líneas del documento. | Siempre. |
| `ReceivedLines` | `int` | `0` | Líneas ya recibidas. | Hay avance. |
| `Status` | `string` | `""` | En recepción, Completa o Con diferencias. | Siempre. |
| `Tone` | `TDMobileTone` | `Neutral` | Énfasis. No reemplaza `Status`. | El estado no es neutro. |

## TDReceiptLine

```razor
<TDReceiptLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" Ordered="24" Received="21" Unit="unidades" Field="recibidas" />
```

El número de unidades recibidas abre un diálogo para escribir la cantidad. Sirve cuando son muchas y no conviene sumar de una en una. Una cantidad que no es un entero desde cero no se aplica.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Código de la orden. | Siempre. |
| `Name` | `string` | `""` | Artículo. | Siempre. |
| `Ordered` | `int` | `0` | Unidades pedidas. | Siempre. |
| `Received` | `int` | `0` | Unidades ya recibidas. | Hay un conteo parcial. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |
| `Field` | `string?` | `null` | Campo del post. Vacío usa `recibidas`. | El formulario guarda la línea. |

## TDAsnMatch

```razor
<TDAsnMatch Notice="ASN-18" ExpectedPackages="12" CountedPackages="10" Field="bultos" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Notice` | `string` | `""` | Número del aviso. | Siempre. |
| `ExpectedPackages` | `int` | `0` | Bultos que declara el aviso. | Siempre. |
| `CountedPackages` | `int` | `0` | Bultos contados en el camión. | Hay un conteo. |
| `Field` | `string?` | `null` | Campo del post. Vacío usa `bultos`. | El formulario guarda el conteo. |

## TDSealCheck

```razor
<TDSealCheck Expected="SL-88421" Read="SL-88419" Intact="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Expected` | `string` | `""` | Sello del aviso. | Siempre. |
| `Read` | `string` | `""` | Sello leído. Vacío: todavía no hay lectura. | Después del lector. |
| `Intact` | `bool` | `true` | El sello físico está intacto. | Siempre que ya se vio. |

## TDLotCapture

```razor
<TDLotCapture Sku="BR-4521-AD" Lot="L-904" Expires="Marzo 2028" Quantity="24" Unit="unidades" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Artículo. | Siempre. |
| `Lot` | `string` | `""` | Lote. Vacío bloquea el ingreso. | Siempre. |
| `Expires` | `string` | `""` | Vencimiento en palabras. Vacío bloquea el ingreso. | El producto vence. |
| `Quantity` | `int` | `0` | Unidades de este lote. | Siempre. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |

## TDInspectList

```razor
<TDInspectList Product="Pastilla de freno delantera" Checks="criterios" FieldPrefix="revision" />
```

`criterios` es `TDInspectCheck[]`.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Product` | `string` | `""` | Producto revisado. | Siempre. |
| `Checks` | `IReadOnlyList<TDInspectCheck>?` | `null` | Criterios. Vacío dice que no hay. | Siempre. |
| `FieldPrefix` | `string?` | `null` | Prefijo del post. Vacío usa `revision`. El campo es `{prefijo}_{Id}`. | El formulario guarda la revisión. |

## TDDamageNote

```razor
<TDDamageNote Sku="BR-4521-AD" What="La caja llegó húmeda y dos pastillas están oxidadas." Affected="2" Unit="unidades" Next="Separa las 2 unidades. El resto puede seguir a revisión." Tone="TDMobileTone.Warning" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Artículo dañado. | Siempre. |
| `What` | `string` | `""` | Qué se vio. | Siempre. |
| `Affected` | `int` | `0` | Unidades afectadas. Cero: no hay daño. | Siempre. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |
| `Next` | `string?` | `null` | Qué hacer. Vacío y con daño: separarlas. | Hay una instrucción. |
| `Tone` | `TDMobileTone` | `Warning` | Énfasis. No reemplaza el texto. | El caso no es neutro. |

## TDTempCheck

```razor
<TDTempCheck Product="Líquido de frenos" Reading="11" Min="2" Max="8" Unit="°C" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Product` | `string` | `""` | Carga medida. | Siempre. |
| `Reading` | `decimal` | `0` | Lectura. | Siempre. |
| `Min` | `decimal` | `0` | Mínimo aceptado. | Hay rango. |
| `Max` | `decimal` | `0` | Máximo aceptado. | Hay rango. |
| `Unit` | `string` | `°C` | Unidad de la lectura. | Siempre. |

## TDLabelCheck

```razor
<TDLabelCheck Expected="BR-4521-AD" Printed="BR-4521-AD" Readable="false" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Expected` | `string` | `""` | Código que pide la orden. | Siempre. |
| `Printed` | `string` | `""` | Código impreso. Vacío: sin lectura. | Después del lector. |
| `Readable` | `bool` | `true` | La etiqueta se puede leer. | Ya se vio. |

## TDDisposition

```razor
<TDDisposition Product="Pastilla de freno delantera" Decision="Mandar a calidad" Consequence="Las 24 unidades quedan detenidas. No entran a la ubicación de picking." Tone="TDMobileTone.Danger" ActionHref="/calidad" ActionLabel="Mandar 24 unidades a calidad" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Product` | `string` | `""` | Producto decidido. | Siempre. |
| `Decision` | `string` | `""` | Aceptar a stock, Devolver al proveedor o Mandar a calidad. | Siempre. |
| `Consequence` | `string` | `""` | Qué entra, qué se devuelve o qué queda detenido. | Siempre. |
| `Tone` | `TDMobileTone` | `Neutral` | Énfasis. No reemplaza `Decision`. | El caso no es neutro. |
| `ActionHref` | `string?` | `null` | Destino de la confirmación. | Hay un paso. |
| `ActionLabel` | `string?` | `null` | Consecuencia en el botón. | Hay `ActionHref`. |
