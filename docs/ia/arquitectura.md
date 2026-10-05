# Arquitectura — cómo interpreta una IA un pedido

Este es el primer documento. Traduce lo que la persona dice a un tag real. El detalle de cada parámetro está en la guía del módulo y en el XML del componente.

El mismo mapa viaja en el NuGet como el tipo `TDComponents.Architecture.TDArchitecture`. No pinta nada. El valor de cada constante es el marcado. El resumen son las frases de la persona.

```razor
@using TDComponents
@using TDComponents.Components
```

## Procedimiento

1. Si el pedido es una pantalla con datos del sistema (alta, listado, ficha, carrito, tablero, foto, agenda, gráfico, tienda), usa [produccion.md](produccion.md) y `TDArchitecture.Pantallas`.
2. Si es un control suelto, elige la constante cuya frase coincida. Si hay dos, usa la más específica.
3. Copia el valor. Ese es el marcado.
4. Abre el XML de ese componente, o la guía del módulo, y usa solo parámetros que existan ahí.
5. Si el pedido nombra un tag que no está en el mapa, no lo inventes.
6. Si ninguna frase encaja, no crees un componente nuevo.

`Charts` y `Ecommerce` son vistas del catálogo. No llevan las series, los productos ni los precios de la aplicación.

## Reglas de toda la biblioteca

1. Namespace de los tags: `TDComponents.Components`. Enums y records: `TDComponents`.
2. `TDTextBox`, `TDSelect`, `TDDatePicker`, `TDMask`, `TDNumeric` y `TDSwitch` aceptan `@bind-Value`. El resto de los campos viaja por `Name` en el post. `TDFileInput` usa `Field` o `OnChange`. `TDPhotoButton` envía la foto ya comprimida a JPEG 0.85.
3. `ChildContent` es el contenido entre etiquetas, no un atributo.
4. Un `bool` omitido vale `false`.
5. No existen `TDFormField`, `TDProductCard`, `TDCartDrawer`, `TDLineSeries`, `TDBarChart`, `TDAlert`, `TDNotificationHost`, `TDProgressBar` ni `TDCardGroup`.
6. No existe `Menu="true"` en `TDFab`. `TDChart` recibe las cifras en `Series`. `TDEcom` recibe los productos en `Products`. `TDImage` usa `Src` para la foto real. `TDScheduler` recibe las citas en `Appointments`. `TDSelect`, `TDDatePicker`, `TDMask`, `TDNumeric` y `TDSwitch` aceptan `@bind-Value`. `TDDrawer` no tiene `Side`.

## Ejemplos de interpretación

Pedido: «un formulario para crear un pedido, con el nombre de la flota, la marca y guardar».

`TDEditForm`, que es el `EditForm`. El nombre es `TDTextBox` con `@bind-Value`. La marca es `TDSelect` con `@bind-Value`. Guardar es `SubmitLabel` en el mismo formulario.

Pedido: «un gráfico de embudo de las ventas».

`TDChart Kind="chfunnel"`. No existe `TDFunnelSeries` y no se le pasan datos.

Pedido: «el carrito lateral de la tienda».

`TDEcom Kind="ecart"`. No existe `TDCartDrawer`.

Pedido: «comparar el disco usado con el nuevo».

`TDCompare`. Comparar productos de la tienda es `TDEcom Kind="ecompare"`.

Pedido: «una tabla de repuestos que se pueda filtrar y compartir por enlace».

`TDDataGrid` con `QueryKey` y columnas `TDColumn`. No uses `@bind-Value`. La fila elegida es `SelectedId` junto con `RowId`.

Pedido: «la pantalla del teléfono para confirmar lo que se acaba de escanear en la bodega».

`Pantallas.Telefono` si es la pantalla completa. Una sola tarjeta de resultado es `TDScanCard`. La cámara sigue siendo `TDScanner`.

Pedido: «la diferencia entre lo que dice el sistema y lo que se contó en el pasillo».

`TDCountDiff`. El teclado de cantidad del teléfono sigue siendo `TDQtyPad`. El andén, la incidencia, la ruta, el pallet, el relevo, la reposición, la ubicación sugerida, la calidad y el despacho están en `Operaciones`.

Pedido: «ver en el mapa a los pilotos, la ruta que ya hicieron y las paradas».

`Pantallas.Mapa`. Cada persona es un `TDMapUnit` en `Units`. `Route` es la lista de coordenadas por donde pasó y el mapa la reconstruye por calles. La ruta con entregas entre dos puntos es `Pantallas.Ruta`. La posición de quien inició sesión es `Pantallas.Ubicacion`, no una latitud enviada por el servidor. Un botón que solo toma el punto actual, sin mapa, es `Pantallas.Punto`.

Pedido: «recibir la orden y revisar si el producto se puede ingresar».

`TDReceiptHeader` para el documento y `TDReceiptLine` para cada línea. La revisión de criterios es `TDInspectList`. La decisión de aceptar, devolver o mandar a calidad es `TDDisposition`. El lote, el sello de llegada, los bultos del aviso, el daño, la temperatura y la etiqueta están en `Entrada`.

Pedido: «un botón de cancelar dentro del formulario».

`TDButton ButtonType="TDButtonType.Button"`. Sin ese tipo, el botón envía el formulario.

## Dónde está cada grupo

| Grupo en `TDArchitecture` | Guía |
| --- | --- |
| `Forms` | [forms.md](forms.md) |
| `Data`, `Navegacion` | [data.md](data.md), [navegacion.md](navegacion.md) |
| `Layout`, `Media`, `Feedback` | [layout.md](layout.md), [media.md](media.md), [feedback.md](feedback.md) |
| `Charts`, `Codigos`, `Ecommerce`, `Utilidades` | [charts.md](charts.md), [codigos.md](codigos.md), [ecommerce.md](ecommerce.md), [utilidades.md](utilidades.md) |
| `Mobile` | [mobile.md](mobile.md) |
| `Operaciones` | [operaciones.md](operaciones.md) |
| `Entrada` | [entrada.md](entrada.md) |
| Mapas, `Pantallas.Mapa`, `Pantallas.Ubicacion` y `Pantallas.Punto` | [mapas.md](mapas.md) |

Las frases exactas están en el XML de `TDArchitecture`, una constante por intención. Esta página no las duplica para que el mapa tenga una sola fuente.
