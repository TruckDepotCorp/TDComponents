# Mobile — contrato de uso para IA

Pantallas de un teléfono de bodega, WMS o ERP. No reemplazan la cámara ni el lector: eso sigue en Códigos. Aquí se muestra lo que el sistema ya resolvió y lo que la persona confirma con el pulgar.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. Hay diez componentes. No existe un `TDMobile` con `Kind`.
2. `TDScanCard` no abre la cámara. El lector es `TDScanner` o `TDHidListener`.
3. `TDJobList` con `Jobs` nulo o vacío dice que no hay tareas. No inventa una cola.
4. `TDQtyPad` publica la cantidad en `Name`. El defecto es `cantidad`.
5. `TDPickLine` publica las unidades recogidas en `Field`. El defecto es `recogidas`.
6. `TDConfirmSheet` confirma con el valor `confirmar`. Cancelar solo cierra la hoja.
7. `TDJobSteps` cuenta `Current` desde cero.
8. El estado siempre va escrito. `TDMobileTone` solo refuerza el color.
9. `TDCardCarousel` es el carrusel de tarjetas. El encabezado dice «Tarjeta 2 de 3». `Auto` en verdadero gira solo; el defecto es verdadero. `TDCarousel` sigue siendo el de diapositivas.
10. Los controles del carrusel son `TDButtonIcon`. `Icon` es un nombre de Material Symbols. `Label` es el nombre accesible. La página carga esa fuente e incluye los nombres que usa.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Título de la pantalla, bodega y volver | `TDAppBar` | `TDToolbar` si la persona está en un teléfono de bodega |
| Secciones al alcance del pulgar | `TDBottomNav` | `TDTabs` si son pasos de un mismo trabajo |
| Lo que salió de un escaneo | `TDScanCard` | `TDScanner` si todavía hay que leer el código |
| Cantidad con guantes | `TDQtyPad` | `TDNumeric` si el campo es de escritorio |
| Cola de recibir, guardar o contar | `TDJobList` | `TDDataGrid` si la tarea es una planilla de escritorio |
| Pasillo, rack, nivel y casillero | `TDBinCard` | `TDScanCard` si el dato principal es el código leído |
| Confirmar un movimiento antes de guardarlo | `TDConfirmSheet` | `TDDialog` si el aviso no es el pie de una pantalla de teléfono |
| Quién opera y si hay conexión | `TDShiftBar` | un texto suelto |
| Una línea de picking | `TDPickLine` | `TDQtyPad` si no hay una cantidad pedida por la orden |
| Pasos de una recepción | `TDJobSteps` | `TDSteps` si el proceso es de escritorio |
| Varias tarjetas, una a la vez | `TDCardCarousel` | `TDCarousel` si son diapositivas de un banner |
| Un botón de solo ícono, tamaño de pulgar | `TDButtonIcon` | `TDButton` si la acción lleva texto |

## Tipos

`TDMobileTone` — `Neutral`, `Success`, `Warning`, `Danger`.

`TDMobileDest` — `Id`, `Label`, `Href`, `Count`. Lo usa `TDBottomNav`.

`TDWarehouseJob` — `Id`, `Title`, `Place`, `Kind`, `Status`, `When`, `Tone`, `Href`. Lo usa `TDJobList`. `Status` es el texto: Lista, En curso, Bloqueada o Pendiente. `Href` abre la tarea. Si se omite, la fila no es un enlace.

`TDCarouselCard` — `Title`, `Text`, `Status`, `Tone`, `ActionLabel`, `ActionHref`. Lo usa `TDCardCarousel`.

## Pantalla completa

Una recepción de bodega junta las piezas. La constante es `Pantallas.Telefono`. La clase `td-phone` apila la barra, el contenido y la navegación inferior.

```razor
<div class="td-phone">
    <TDAppBar Title="Recepción" Subtitle="@bodega" BackHref="/tareas" BackLabel="Volver a las tareas" ActionHref="/ayuda" ActionLabel="Ayuda" />
    <TDShiftBar Operator="@operador" Site="@bodega" Role="@puesto" Pending="@pendientes" Online="@enLinea" />
    <TDJobSteps Title="@flujo" Current="@paso" Steps="pasos" />
    <TDScanCard Code="@codigo" Name="@articulo" Location="@ubicacion" Stock="@existencia" Unit="unidades" Status="@estado" ActionLabel="Guardar en la ubicación" ActionHref="/guardar" />
    <TDQtyPad Label="Cantidad a guardar" Value="@cantidad" Unit="unidades" Min="1" Max="@tope" Name="cantidad" />
    <TDConfirmSheet Open="true" Title="Guardar en la ubicación" Detail="Si cierras, la mercadería no se mueve." ConfirmLabel="Guardar en la ubicación" CancelLabel="Seguir revisando" HelpHref="/supervisor" HelpLabel="Pedir ayuda al supervisor" />
    <TDBottomNav Active="tareas" Items="secciones" />
</div>
```

## TDAppBar

```razor
<TDAppBar Title="Recepción" Subtitle="Bodega Quilicura · turno mañana" BackHref="/tareas" BackLabel="Volver a las tareas" ActionHref="/ayuda" ActionLabel="Ayuda" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `Pantalla` | Nombre de la pantalla. | Siempre. |
| `Subtitle` | `string?` | `null` | Bodega, turno o documento. | Hay contexto debajo del título. |
| `BackHref` | `string?` | `null` | A dónde vuelve. | La pantalla no es la raíz. |
| `BackLabel` | `string` | `Volver` | Texto del regreso. Dice el destino. | Hay `BackHref`. |
| `ActionHref` | `string?` | `null` | Destino de la acción secundaria. | Hay ayuda u otra salida. |
| `ActionLabel` | `string?` | `null` | Texto de esa acción. | Hay `ActionHref`. |

## TDBottomNav

```razor
<TDBottomNav Active="tareas" Items="secciones" />
```

`secciones` es `TDMobileDest[]`. `Active` compara con `Id`.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IReadOnlyList<TDMobileDest>?` | `null` | Secciones. | Siempre. |
| `Active` | `string?` | `null` | `Id` de la sección actual. | Una está abierta. |

## TDScanCard

```razor
<TDScanCard Code="BR-4521-AD" Name="Pastilla de freno delantera" Location="Pasillo A · rack 12 · nivel 2" Stock="24" Unit="unidades" Status="Ubicación confirmada" Tone="TDMobileTone.Success" ActionLabel="Guardar 24 unidades en A-12" ActionHref="/guardar" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Code` | `string` | `""` | Código leído. | Siempre. |
| `Name` | `string` | `""` | Artículo resuelto. | Siempre. |
| `Location` | `string` | `""` | Ubicación en palabras. | Ya se conoce. |
| `Stock` | `int` | `0` | Existencia en esa ubicación. | Hay cifra. |
| `Unit` | `string` | `unidades` | Unidad de la existencia. | Siempre que hay `Stock`. |
| `Status` | `string` | `""` | Estado escrito. | Siempre. |
| `Tone` | `TDMobileTone` | `Success` | Énfasis. No reemplaza `Status`. | El estado no es neutro. |
| `ActionHref` | `string?` | `null` | Destino de la acción. | Hay un paso siguiente. |
| `ActionLabel` | `string?` | `null` | Texto con la consecuencia. | Hay `ActionHref`. |

## TDQtyPad

```razor
<TDQtyPad Label="Cantidad a guardar" Value="4" Unit="unidades" Min="1" Max="48" Name="cantidad" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Label` | `string` | `Cantidad` | Qué se está contando. | Siempre. |
| `Value` | `int` | `0` | Cantidad inicial. | Hay un valor de partida. |
| `Unit` | `string` | `unidades` | Unidad visible. | Siempre. |
| `Min` | `int` | `0` | Mínimo. | El cero no sirve. |
| `Max` | `int` | `999` | Máximo de la ubicación o de la orden. | Hay tope. |
| `Name` | `string?` | `null` | Campo del post. Vacío usa `cantidad`. | El formulario guarda la cifra. |

## TDJobList

```razor
<TDJobList Jobs="tareas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Jobs` | `IReadOnlyList<TDWarehouseJob>?` | `null` | Tareas del turno. Cada una puede llevar `Href`. | Siempre. Vacío muestra que no hay trabajo. Sin `Href`, la fila no navega. |

## TDBinCard

```razor
<TDBinCard Aisle="A" Rack="12" Level="2" Bin="04" Sku="BR-4521-AD" SkuName="Pastilla de freno delantera" Quantity="24" Unit="unidades" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Aisle` | `string` | `""` | Pasillo. | Siempre. |
| `Rack` | `string` | `""` | Rack. | Siempre. |
| `Level` | `string` | `""` | Nivel. | Siempre. |
| `Bin` | `string` | `""` | Casillero. | Siempre. |
| `Sku` | `string` | `""` | Código del artículo. | Hay artículo. |
| `SkuName` | `string` | `""` | Nombre del artículo. | Hay artículo. |
| `Quantity` | `int` | `0` | Existencia. | Siempre. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |

## TDConfirmSheet

```razor
<TDConfirmSheet Open="true" Title="Guardar 24 unidades en A-12" Detail="El pallet sigue en el muelle hasta que confirmes. Si cierras, no se mueve nada." ConfirmLabel="Guardar en A-12" CancelLabel="Seguir revisando" HelpHref="/supervisor" HelpLabel="Pedir ayuda al supervisor" Name="decision" />
```

Va dentro del `EditForm` que recibe el movimiento. Confirmar envía `decision=confirmar`.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `Confirmar` | Qué se va a hacer. | Siempre. |
| `Detail` | `string` | `""` | Qué pasa al confirmar y qué queda igual al cancelar. | Siempre. |
| `ConfirmLabel` | `string` | `Confirmar` | Botón que envía. | Siempre. |
| `CancelLabel` | `string` | `Cancelar` | Cierra la hoja sin enviar. | Siempre. |
| `HelpHref` | `string?` | `null` | Destino de ayuda. | Hay un supervisor. |
| `HelpLabel` | `string?` | `null` | Texto de esa ayuda. | Hay `HelpHref`. |
| `Open` | `bool` | `false` | Empieza visible. | La persona ya llegó al paso. |
| `Name` | `string?` | `null` | Campo del post. Vacío usa `decision`. | El servidor distingue la confirmación. |

## TDShiftBar

```razor
<TDShiftBar Operator="María Soto" Site="Bodega Quilicura" Role="Operadora de recepción" Pending="3" Online="false" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Operator` | `string` | `""` | Nombre de quien opera. | Siempre. |
| `Site` | `string` | `""` | Bodega. | Siempre. |
| `Role` | `string` | `""` | Puesto. | Se conoce. |
| `Pending` | `int` | `0` | Movimientos que aún no llegaron al servidor. | Hay trabajo local. |
| `Online` | `bool` | `true` | Hay enlace. Falso explica que el teléfono guarda el trabajo. | Siempre. |

## TDPickLine

```razor
<TDPickLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" From="Pasillo A · rack 12 · nivel 2" Quantity="6" Picked="2" Unit="unidades" Field="recogidas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Código. | Siempre. |
| `Name` | `string` | `""` | Artículo. | Siempre. |
| `From` | `string` | `""` | De dónde se retira. | Siempre. |
| `Quantity` | `int` | `0` | Unidades pedidas. | Siempre. |
| `Picked` | `int` | `0` | Unidades ya recogidas. | Hay avance. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |
| `Field` | `string?` | `null` | Campo del post. Vacío usa `recogidas`. | El formulario guarda el avance. |

## TDJobSteps

```razor
<TDJobSteps Title="Recepción del pallet 18" Current="1" Steps="pasos" />
```

`pasos` es `string[]` en orden. `Current="1"` es el segundo paso.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `Flujo` | Nombre del flujo. | Siempre. |
| `Steps` | `IReadOnlyList<string>?` | `null` | Nombres, en orden. | Siempre. Vacío dice que no hay pasos. |
| `Current` | `int` | `0` | Índice del paso activo, desde cero. | El flujo ya empezó. |

## TDCardCarousel

```razor
<TDCardCarousel AriaLabel="Tareas del turno" Auto="true" Interval="5000" Cards="tarjetas" />
```

`tarjetas` es `TDCarouselCard[]`: `Title`, `Text`, `Status`, `Tone`, `ActionLabel`, `ActionHref`. El encabezado de la tarjeta dice cuál es y cuántas hay, por ejemplo «Tarjeta 2 de 3», y lleva los `TDButtonIcon` de anterior, pausa y siguiente. La acción de la tarjeta también es un `TDButtonIcon`. `Auto="false"` deja el giro quieto. La rotación, cuando está encendida, se pausa al pasar el mouse o al enfocar un control.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `Tarjetas` | Nombre accesible del carrusel. | Siempre. |
| `Interval` | `int` | `5000` | Milisegundos entre tarjetas. | `Auto` es verdadero y hay más de una. |
| `Auto` | `bool` | `true` | Gira solo. En falso, solo avanzan los botones y no hay pausa. | Siempre que quieras decidir el giro. |
| `Cards` | `IReadOnlyList<TDCarouselCard>?` | `null` | Tarjetas. Vacío dice que no hay. | Siempre. |

## TDButtonIcon

```razor
<TDButtonIcon Icon="arrow_back" Label="Tarjeta anterior" />
<TDButtonIcon Icon="pause" Label="Pausar" />
<TDButtonIcon Icon="arrow_forward" Label="Tarjeta siguiente" />
```

`Icon` es el nombre del glifo en Material Symbols. La página incluye la fuente y los nombres:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0&icon_names=arrow_back,arrow_forward,pause,play_arrow,open_in_new&display=swap" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Icon` | `string` | `""` | Nombre del glifo. | Siempre. |
| `Label` | `string` | `""` | Nombre accesible. El botón no pinta texto. | Siempre. |
| `ButtonType` | `TDButtonType` | `Button` | `Button` no envía el formulario. | Dentro de un formulario, si no debe enviarlo. |
| `Href` | `string?` | `null` | Si hay un URL seguro, es un enlace. | La acción navega. |
| `Disabled` | `bool` | `false` | Impide activarlo. | La acción no está disponible. |
