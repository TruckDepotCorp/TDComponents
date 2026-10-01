# Códigos — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDQrCode` y `TDBarcode` se pintan en el cliente. `Name` envía el valor en un formulario. No hay un parámetro de imagen de salida.
2. `Ecc` de `TDQrCode` es el texto `L`, `M`, `Q` o `H`. El default es `M`.
3. `Format` de `TDBarcode` es un texto. El default es `code128`.
4. `TDHidListener` lee una pistola que escribe como teclado. `TDScanner` lee cámara o teclado. No los intercambies si el puesto no tiene cámara.
5. `TDLabelDesigner` trabaja en milímetros y puntos por pulgada. Los datos de ejemplo son un `TDLabelRecord`.
6. `TDReportDesigner` elige una plantilla de demostración con `Report`. El default es `factura`.
7. `TDPrinterConnect` con `Devices` nulo muestra el juego de demostración.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Un código QR | `TDQrCode` | `TDBarcode` |
| Barras Code 128 u otro formato del generador | `TDBarcode` | `TDQrCode` |
| Etiqueta térmica | `TDLabelDesigner` | `TDReportDesigner` |
| Informe por bandas | `TDReportDesigner` | `TDLabelDesigner` |
| Impresoras y su conexión | `TDPrinterConnect` | Hay equipos reales que mostrar. Con Devices nulo sale el juego de demostración. |
| Pistola USB sin exigir foco en un campo | `TDHidListener` | `TDScanner` si no hay cámara |
| Cámara o lector tipo teclado, con confirmación | `TDScanner` | `TDHidListener` |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| qrcode | `TDQrCode` |
| barcode | `TDBarcode` |
| labeldesigner | `TDLabelDesigner` |
| reportdesigner | `TDReportDesigner` |
| printers | `TDPrinterConnect` |
| ehid | `TDHidListener` |
| scanner | `TDScanner` |

## Tipos compartidos

`TDLabelRecord` — `Code`, `Name`, `Brand`, `Price`, `Stock`, `Url`. Los importes van ya formateados.

`TDPrinterDevice` — `Id`, `Name`, `Model`, `Connection`, `Address`, `Protocol`, `Dpi`, `WidthMm`, `Connected`, `IsDefault`, `Unreachable`.

## TDQrCode

```razor
<TDQrCode Value="https://truckdepot.cl/p/BR-4521-AD" Ecc="M" Module="6" QuietZone="true" Name="QrPng" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Value` | `string` | una URL de demostración | Dato codificado. | Siempre el dato real. |
| `Ecc` | `string` | `"M"` | Corrección: `L`, `M`, `Q` o `H`. | La etiqueta se puede manchar: sube a `Q` o `H`. |
| `Module` | `int` | `6` | Tamaño de cada módulo, en píxeles. | El código se imprime pequeño: bájalo. En pantalla puede subir. |
| `Color` | `string` | `"#0A0B0C"` | Color de los módulos oscuros. | La marca pide otro color. Mantén contraste con el fondo. |
| `QuietZone` | `bool` | `true` | Margen en blanco. | Déjalo en verdadero para que el lector lea. |
| `Name` | `string?` | `null` | Nombre del campo si el valor viaja en un formulario. | El valor del QR se envía con el formulario. |

## TDBarcode

```razor
<TDBarcode Value="BR-4521-AD" Format="code128" ShowText="true" Name="Codigo" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Value` | `string` | `"BR-4521-AD"` | Dato codificado. | Siempre el código real. |
| `Format` | `string` | `"code128"` | Simbología. | code128 para texto. ean13 o ean8 solo si el valor es numérico de esa longitud. |
| `BarWidth` | `int` | `2` | Ancho de cada barra, en píxeles. | El lector no distingue las barras: súbelo. En una etiqueta pequeña, déjalo. |
| `Height` | `int` | `80` | Alto, en píxeles. | La etiqueta es más baja o el código debe leerse de lejos. |
| `ShowText` | `bool` | `true` | Muestra el valor bajo las barras. | En falso si el número ya está impreso al lado. |
| `Color` | `string` | `"#0A0B0C"` | Color de las barras. | La marca pide otro color. Mantén contraste con el fondo. |
| `Name` | `string?` | `null` | Nombre del campo en un formulario. | El código se envía con el formulario. |

## TDLabelDesigner

```razor
<TDLabelDesigner Width="62" Height="40" Dpi="203" Copies="1" Record="repuesto" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Width` | `int` | `62` | Ancho en milímetros. | La etiqueta física tiene otro ancho, en milímetros. |
| `Height` | `int` | `40` | Alto en milímetros. | La etiqueta física tiene otro alto, en milímetros. |
| `Dpi` | `int` | `203` | Resolución de impresión. | La impresora no es de 203 puntos por pulgada. |
| `Copies` | `int` | `1` | Copias. | Hay que imprimir más de una etiqueta igual. |
| `Template` | `string?` | `null` | Nombre de la plantilla inicial. | Quieres abrir una plantilla guardada, no el lienzo vacío. |
| `Record` | `TDLabelRecord?` | `null` | Datos que la etiqueta puede insertar. | La etiqueta inserta código, nombre, precio o stock de un repuesto. |

## TDReportDesigner

```razor
<TDReportDesigner Report="factura" Numero="1042" Cliente="Transportes del Sur" Fecha="2026-10-01" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Report` | `string` | `"factura"` | Plantilla de demostración. | La demostración no es una factura. |
| `Rows` | `int` | `8` | Filas de detalle del ejemplo. | El ejemplo debe mostrar otra cantidad de líneas. |
| `Numero` | `string?` | `null` | Número del documento. | El documento tiene folio. |
| `Cliente` | `string?` | `null` | Nombre del cliente. | El documento lleva el nombre del cliente. |
| `Rut` | `string?` | `null` | RUT del cliente. | El documento lleva el RUT. |
| `Fecha` | `string?` | `null` | Fecha del documento. | El documento lleva fecha. |
| `Vendedor` | `string?` | `null` | Nombre del vendedor. | El documento lleva vendedor. |
| `Bodega` | `string?` | `null` | Bodega del documento. | El documento sale de una bodega. |
| `FechaCorte` | `string?` | `null` | Fecha de corte, para inventario. | El informe es un corte de inventario. |
| `Responsable` | `string?` | `null` | Persona responsable del informe. | Alguien firma el informe. |

## TDPrinterConnect

```razor
<TDPrinterConnect Devices="impresoras" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Devices` | `IReadOnlyList<TDPrinterDevice>?` | `null` | Impresoras. Nulo muestra el juego de demostración. | Siempre que la lista sea real. |

## TDHidListener

Lector de códigos que llegan como teclado. Ignora pulsaciones lentas. `GapMs` es la pausa que vacía el búfer.

```razor
<TDHidListener MinLength="4" GapMs="60" IgnoreWhenTyping="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `MinLength` | `int` | `4` | Largo mínimo aceptado. | El código real es más largo. |
| `GapMs` | `int` | `60` | Pausa, en milisegundos, que vacía el búfer. | La pistola es más lenta o el búfer se corta a medias. |
| `IgnoreWhenTyping` | `bool` | `false` | No captura teclas con el foco en un campo. | La página también tiene inputs. |
| `InitialCode` | `string?` | `null` | Código que se muestra al abrir. | Solo en un ejemplo. |

## TDScanner

Lector por cámara o por teclado. `Mode` vale `continuous` para seguir leyendo, o `single` para pausar hasta confirmar.

```razor
<TDScanner Mode="continuous" KeyboardWedge="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Mode` | `string` | `"continuous"` | `continuous` o `single`. | Una lectura y confirmar: `single`. |
| `KeyboardWedge` | `bool` | `true` | Acepta el lector USB. | En falso si solo hay cámara. |
| `InitialValue` | `string?` | `null` | Código que se muestra al abrir. | Solo en un ejemplo. |
