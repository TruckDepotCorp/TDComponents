# Layout — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. No existe `TDCardGroup`. Varias tarjetas van en `TDRow`, `TDStack` o `TDTileLayout`.
2. `TDRow` es una fila de 12. Los hijos son `TDCol`. `Size` va de 1 a 12.
3. `TDDialog` centrado y el panel lateral del mismo componente se eligen con `Drawer`. El panel con botón propio es `TDDrawer`. `TDDrawer` no tiene `Side`.
4. `TDLayout.Side` es el texto `start` o `end`. En cada ítem, `Value` es la clave, `Label` el texto y `Hint` el destino.
5. `TDContent` es la región de atajos. El id de catálogo `econtent` no es otro componente.
6. Los fragmentos con nombre (`HeaderContent`, `Footer`, `Actions`, `Start`) se escriben como etiquetas hijas, no como atributos.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Marco de aplicación | `TDLayout` o `TDMenuAppShell` | `TDPanel` si es toda la app |
| Apilar en fila o columna | `TDStack` | `TDRow` si no necesitas la grilla de 12 |
| Grilla de 12 columnas | `TDRow` y `TDCol` | TDStack si solo quieres apilar, sin anchos que sumen 12. |
| Tarjeta de contenido | `TDCard` | `TDTileLayout` para una métrica de tablero |
| Métricas en rejilla | `TDTileLayout` | `TDCard` repetida si solo hay cifra y pista |
| Diálogo centrado | `TDDialog` | `TDDrawer` |
| Panel lateral con su botón | `TDDrawer` | `TDDialog Drawer="true"` si ya tienes el disparador |
| Bloque con título | `TDPanel` | `TDCard` |
| Contenido anclado a un botón | `TDPopup` | `TDTooltip` si solo es una frase de ayuda |
| Paneles redimensionables | `TDSplitter` | TDStack si los paneles no se arrastran. |
| Tablero de tarjetas que se arrastran | `TDDropZone` | `TDTileLayout` si no cambian de zona |
| Atajos de teclado en una zona | `TDContent` | Un div si la zona no publica atajos. |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| layout | `TDLayout` |
| stack | `TDStack` |
| row | `TDRow` |
| column | `TDCol` |
| card | `TDCard` |
| cardgroup | no existe. Varias `TDCard` |
| dialog, modal | `TDDialog` |
| drawer | `TDDrawer` |
| dropzone | `TDDropZone` |
| panel | `TDPanel` |
| popup | `TDPopup` |
| splitter | `TDSplitter` y `TDSplitterPane` |
| tilelayout | `TDTileLayout` |
| econtent | `TDContent` |

## Tipos compartidos

`TDCardVariant` — `Outlined` (default), `Elevated`, `Flat`.

`TDAlignItems` — `Stretch` (default), `Start`, `Center`, `End`.

`TDJustify` — `Start` (default), `Center`, `End`, `Between`.

`TDOrientation` — `Vertical`, `Horizontal`. En `TDStack` el default es `Vertical`. En `TDSplitter` el default es `Horizontal`.

`TDPlacement` — `Bottom` (default), `Top`, `Start`, `End`.

`TDOption` — en `TDLayout`, `Value` es la clave, `Label` el texto y `Hint` el destino. En `TDDropZone`, `Value` es la clave de la zona y `Label` el título.

`TDDropCard` — `Id`, `Title`, `Meta`, `Zone`.

`TDTileItem` — `Id`, `Title`, `Value`, `Hint`, `Span` (default 1).

## TDLayout

Marco con cabecera, barra lateral, cuerpo y pie.

```razor
<TDLayout Title="Panel de flota" BodyTitle="Pedidos del día" Side="start" Active="pe" Items="items">
    <p>Listado del día</p>
</TDLayout>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `"Panel de flota"` | Nombre de la aplicación en la cabecera. | Siempre el nombre real de la aplicación. |
| `BodyTitle` | `string` | `"Pedidos del día"` | Título del área principal. | Siempre el título real del área principal. |
| `Side` | `string` | `"start"` | Lado de la barra: `start` o `end`. | end si la barra va al otro lado. start es el defecto. |
| `Active` | `string` | `"pe"` | `Value` del ítem actual. | Cámbialo por la clave real. |
| `Items` | `IReadOnlyList<TDOption>` | Pedidos, Bodega, Flota, Ayuda | Entradas de la barra. | Reemplaza el default de demostración. |
| `ChildContent` | contenido | — | Área principal. | Siempre. |

## TDStack

Apila hijos en columna o en fila.

```razor
<TDStack Orientation="TDOrientation.Horizontal" Gap="12px" Align="TDAlignItems.Center" Justify="TDJustify.Between">
    <span>Pedidos</span>
    <TDButton ButtonType="TDButtonType.Button">Nuevo</TDButton>
</TDStack>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Orientation` | `TDOrientation` | `Vertical` | `Vertical` apila. `Horizontal` pone en fila. | Horizontal cuando los hijos van en la misma fila. |
| `Gap` | `string` | `"12px"` | Separación CSS. | La separación por defecto no coincide con el ritmo de la página. |
| `Align` | `TDAlignItems` | `Stretch` | Alineación en el eje cruzado. | Los hijos no deben estirarse: Start, Center o End. |
| `Justify` | `TDJustify` | `Start` | Reparto en el eje principal. | Hay que repartir el eje principal, por ejemplo Between para separar título y acción. |
| `Wrap` | `bool` | `false` | Los hijos pasan a la línea siguiente. | Los hijos pueden no caber en una sola línea. |
| `Reverse` | `bool` | `false` | Invierte el orden visual. | El orden visual es el inverso del marcado. |
| `ChildContent` | contenido | — | Elementos apilados. | Siempre. |

## TDRow y TDCol

`TDRow` es la fila de doce columnas. `TDCol.Size` es el ancho en móvil. `SizeMd` y `SizeLg` en 0 conservan el ancho anterior.

```razor
<TDRow Gap="16px">
    <TDCol Size="12" SizeMd="6"><TDCard Title="Stock">128</TDCard></TDCol>
    <TDCol Size="12" SizeMd="6"><TDCard Title="Pedidos">14</TDCard></TDCol>
</TDRow>
```

`TDRow`: `Gap` (`"16px"`), `Align` (`Stretch`), `ChildContent`.

`TDCol`: `Size` (`12`), `SizeMd` (`0`), `SizeLg` (`0`), `Offset` (`0`), `Order` (`0`), `ChildContent`.

## TDCard

Tarjeta con título, medio, cuerpo y pie. Para una métrica suelta de tablero usa `TDTileLayout`. Para un aviso usa `TDMessage`.

```razor
<TDCard Variant="TDCardVariant.Outlined" Eyebrow="Filtro" Title="Disco de freno" Accent="true">
    <p>BR-4521-AD</p>
    <Footer><TDLink Href="/p/BR-4521-AD">Ver ficha</TDLink></Footer>
</TDCard>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Variant` | `TDCardVariant` | `Outlined` | `Outlined`, `Elevated` o `Flat`. | Elevated para destacarla. Flat si ya está sobre una superficie con borde. |
| `Media` | `string?` | `null` | Texto o fondo del bloque superior. | La tarjeta tiene un bloque superior de imagen o color. |
| `Header` | `string?` | `null` | Título de la cabecera, como texto plano. | La cabecera es un texto plano. |
| `HeaderContent` | contenido | — | Cabecera libre. Tiene prioridad sobre `Header`. | La cabecera lleva botones u otro marcado. Tiene prioridad sobre Header. |
| `Eyebrow` | `string?` | `null` | Línea pequeña sobre el título. | Hace falta una línea pequeña sobre el título. |
| `Title` | `string?` | `null` | Título de la tarjeta. | La tarjeta tiene un título propio. |
| `Horizontal` | `bool` | `false` | El medio queda al lado del texto. | El medio va al lado del texto, no arriba. |
| `Accent` | `bool` | `false` | Marca la tarjeta con el color de acento. | Esta tarjeta es la destacada del grupo. |
| `ChildContent` | contenido | — | Cuerpo. | Siempre que haya texto o controles dentro. |
| `Footer` | contenido | — | Pie. Se entrega con `<Footer>`. | Hay una acción o un dato al pie. |

## TDDialog

Diálogo modal. Con `Drawer` se presenta como panel lateral. `Id` tiene que ser único en la página.

```razor
<TDDialog Id="borrar-pedido" Title="Eliminar pedido" ConfirmText="Eliminar" CancelText="Cancelar">
    <p>El pedido 1042 sale del listado.</p>
</TDDialog>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Id` | `string` | `"td-dialog"` | Identificador. | Cámbialo si hay más de uno. |
| `Title` | `string` | `""` | Título. | Siempre. |
| `CancelText` | `string` | `"Cancelar"` | Cierra sin confirmar. | La UI no dice Cancelar. |
| `ConfirmText` | `string` | `"Confirmar"` | Acción de confirmación. | La acción real no es Confirmar: di qué ocurre, por ejemplo Eliminar. |
| `Closable` | `bool` | `true` | Cierra con la equis y al pulsar fuera. | En falso si el paso es obligatorio. |
| `Drawer` | `bool` | `false` | Panel lateral en lugar de diálogo centrado. | El mismo diálogo debe verse como panel lateral. |
| `ChildContent` | contenido | — | Cuerpo. | El mensaje o el formulario del diálogo. |
| `Footer` | contenido | — | Pie libre. Reemplaza los botones por defecto. | Los botones por defecto no alcanzan. |

## TDDrawer

Panel lateral que se abre con un botón. No tiene lado configurable.

```razor
<TDDrawer Id="filtros" Trigger="Filtros" Title="Filtros" ConfirmText="Aplicar" CancelText="Limpiar">
    <p>Marca y bodega</p>
</TDDrawer>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Id` | `string` | `"td-drawer"` | Identificador único. | Cámbialo si hay más de uno. |
| `Trigger` | `string` | `"Abrir panel"` | Texto del botón que abre. | El botón debe decir qué abre, por ejemplo Filtros. |
| `Title` | `string` | `"Filtros"` | Título del panel. | El panel no es de filtros. |
| `ConfirmText` | `string` | `"Aplicar"` | Acción principal. | La acción principal tiene otro verbo. |
| `CancelText` | `string` | `"Limpiar"` | Acción secundaria. | La acción secundaria tiene otro verbo. |
| `ChildContent` | contenido | — | Contenido del panel. | Los filtros o el detalle. |

## TDPanel

Bloque con título, acciones, cuerpo y pie. Puede plegarse.

```razor
<TDPanel Title="Despacho" Collapsible="true">
    <Actions><TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Ghost">Editar</TDButton></Actions>
    <p>Sale mañana de bodega central.</p>
</TDPanel>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string?` | `null` | Título. | El bloque necesita un título visible. |
| `Collapsible` | `bool` | `false` | Permite plegar el cuerpo. | La persona puede ocultar el cuerpo. |
| `Actions` | contenido | — | Acciones de la cabecera. | Hay botones en la cabecera, a la derecha del título. |
| `ChildContent` | contenido | — | Cuerpo. | El contenido del bloque. |
| `Footer` | contenido | — | Pie. | Hay un dato o una acción al pie del bloque. |

## TDPopup

Contenido flotante anclado a un disparador. Cierra con clic fuera o Escape.

```razor
<TDPopup Trigger="Detalle" Placement="TDPlacement.Bottom" AriaLabel="Disponibilidad">
    <p>8 unidades en Santiago.</p>
</TDPopup>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Trigger` | `string` | `"Abrir"` | Texto del botón. | El botón debe decir qué abre. |
| `AriaLabel` | `string` | `"Popup"` | Nombre accesible. | Siempre un nombre que diga qué contiene. |
| `Placement` | `TDPlacement` | `Bottom` | `Bottom`, `Top`, `Start` o `End`. | No cabe debajo del disparador: Top, Start o End. |
| `ChildContent` | contenido | — | Contenido. | El bloque que aparece. |

## TDSplitter

Divide el espacio entre paneles. Los hijos son `TDSplitterPane`.

```razor
<TDSplitter Orientation="TDOrientation.Horizontal">
    <TDSplitterPane Flex="1 1 30%" Min="12%">Lista</TDSplitterPane>
    <TDSplitterPane Flex="1 1 70%">Detalle</TDSplitterPane>
</TDSplitter>
```

`TDSplitter`: `Orientation` (`Horizontal`), `ChildContent`.

`TDSplitterPane`: `Flex` (`"1 1 33%"`), `Min` (`"12%"`), `ShowHandle` (`true`), `ChildContent`.

## TDTileLayout

Rejilla de métricas. `Columns` es la cantidad de columnas. `Span` de cada `TDTileItem` indica cuántas ocupa.

```razor
<TDTileLayout Columns="4" Items="metricas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Columns` | `int` | `4` | Columnas de la rejilla. | El tablero no es de cuatro columnas. |
| `Items` | `IReadOnlyList<TDTileItem>` | vacío | Métricas. | Siempre. |

## TDDropZone

Tablero de tarjetas que se arrastran entre zonas.

```razor
<TDDropZone Zones="zonas" Items="tarjetas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Zones` | `IReadOnlyList<TDOption>` | vacío | `Value` es la clave y `Label` el título. | Siempre. |
| `Items` | `IReadOnlyList<TDDropCard>` | vacío | `Zone` indica la columna inicial. | Siempre. |

## TDContent

Región con atajos de teclado visibles. `Label` de cada `TDOption` es la acción y `Value` la tecla.

```razor
<TDContent AriaLabel="Pedidos" Shortcuts="atajos">
    <p>Listado</p>
</TDContent>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Área con atajos"` | Nombre accesible. | Nombra la zona real, por ejemplo Pedidos. |
| `Shortcuts` | `IReadOnlyList<TDOption>` | vacío | Atajos visibles. | Quieres mostrar las combinaciones de esa zona. |
| `ChildContent` | contenido | — | Contenido de la región. | Lo que queda dentro del área de atajos. |
