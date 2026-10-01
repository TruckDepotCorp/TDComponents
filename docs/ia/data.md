# Data — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. La tabla de objetos es `TDDataGrid`. La tabla de un `System.Data.DataTable` es `TDDataTable`. No son intercambiables.
2. Las columnas de `TDDataGrid` son `TDColumn` dentro de `Columns`. No existe un tag `Template` suelto.
3. No existe `GridFilterMode`, `GridSelection`, `GridEditMode`, `GridExport` ni `Aggregate`. Los enums reales son `TDFilterMode`, `TDSelectionMode` y `TDAggregate`.
4. No existen `AllowColumnResize`, `AllowColumnReorder`, `AllowColumnPicker`, `AllowSorting`, `AllowMultiColumnSorting`, `AllowExport`, `CellContextMenu`, `RowRender`, `CellRender` ni un parámetro `Filters`.
5. `TDDataGrid` no acepta `@bind-Value`. La fila elegida es `SelectedId` junto con `RowId`.
6. No hay `EditMode`. Guardar pasa por `FormName` y `OnSubmit`.
7. `QueryKey` es el prefijo de la URL. Sin él, orden, filtro, página y selección no se pueden compartir por enlace.
8. `TDTreeNode` lo pinta `TDTree`. No lo coloques suelto en una página.
9. `TDSort` y `TDFooterCell` son records internos de la grilla. No se pasan como parámetros.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Filas de un tipo C# | `TDDataGrid` | `TDDataTable` |
| Filas de ADO.NET, un procedimiento o un esquema sin modelo | `TDDataTable` | `TDDataGrid` |
| Páginas como URLs, fuera de una grilla | `TDPager` | la paginación interna de `TDDataGrid` si la tabla ya pagina |
| Categorías con hijos | `TDTree` | `TDDropDownTree` si la persona debe elegir un valor de formulario |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| grid | `TDDataGrid` |
| coltemplate, colresize, colpicker, colreorder, colfooter, colfrozen, colcomposite, colconditional | `TDColumn` dentro de `TDDataGrid` |
| fltsimple | `FilterMode="TDFilterMode.Simple"` |
| fltmenu | `FilterMode="TDFilterMode.Menu"` |
| fltadv | `FilterMode="TDFilterMode.Advanced"` |
| fltcbl | `FilterMode="TDFilterMode.CheckList"` |
| fltmixed | `FilterMode="TDFilterMode.Mixed"`, o `FilterMode` en cada `TDColumn` |
| fltapi | no hay parámetro `Filters`. El estado viaja en la URL con `QueryKey` |
| selsingle | `Selection="TDSelectionMode.Single"` |
| selmulti | `Selection="TDSelectionMode.Multiple"` |
| sortsingle | `MultiSort` en falso, el default |
| sortmulti | `MultiSort="true"` |
| cellmenu | `ContextMenu="true"` |
| inlineedit, incelledit, cascade | no hay modo de edición. El guardado es `FormName` y `OnSubmit` |
| condfmt | `RowClass` |
| exportx | `ExcelHref` |
| datatable | `TDDataTable` |
| pager | `TDPager` |
| tree | `TDTree` |

## Tipos compartidos

Están en el namespace `TDComponents`.

| Enum | Valores | Para qué |
| --- | --- | --- |
| `TDFilterMode` | `Inherit`, `None`, `Simple`, `Menu`, `Advanced`, `CheckList`, `Mixed` | Filtro de la grilla o de una columna. El default de la grilla es `Advanced`. `Inherit` en una columna usa el de la grilla. |
| `TDSelectionMode` | `Multiple`, `Single`, `None` | Cuántas filas se eligen. El default es `Multiple`. |
| `TDFrozenEdge` | `None`, `Left`, `Right` | Columna fija al desplazar en horizontal. |
| `TDAggregate` | `None`, `Count`, `Sum`, `Average` | Total del pie. Solo se ve con `ShowFooter`. |
| `TDColumnKind` | `Text`, `Mono`, `Strong`, `Muted`, `Pill`, `Money`, `Date`, `Number`, `Stock`, `Thumb` | Cara de la celda y tipo de filtro cuando no hay `Template`. |
| `TDColumnAlign` | `Start`, `End` | Texto al inicio. Números e importes al final. |

Operadores que la grilla escribe en la URL: `contains`, `ncontains`, `eq`, `neq`, `starts`, `ends`, `empty`, `nempty`, `lt`, `lte`, `gt`, `gte`. `empty` y `nempty` no llevan valor.

Con `QueryKey="g"` la URL usa `gq`, `gsort`, `gdir`, `gsize`, `gf`, `gpage`, `gsel`, `gcat`, `gtipo`, y por columna `gv-{clave}` y `gop-{clave}`. La grilla los escribe. Para armar el texto de `gf` usa `TDGridRequest.FormatFilters` con `TDColumnFilter`. Para leerlo, `TDGridRequest.ParseFilters`. `TDGridRequest.OperatorLabel` devuelve la etiqueta en español del operador.

`TDSort` y `TDFooterCell` los calcula la grilla. No se pasan como parámetros. `ITDGridColumn<TItem>` es el contrato que ya implementa `TDColumn`: no lo implementes en la página.

## TDDataGrid

Tabla de objetos. Orden, filtro, página y selección viven en la URL cuando hay `QueryKey`.

Úsalo para un listado de repuestos, pedidos o cualquier `IEnumerable<TItem>`. Para un `DataTable` de ADO.NET usa `TDDataTable`.

```razor
<TDDataGrid TItem="Part" Data="parts" QueryKey="g" RowId="p => p.Id"
            AriaLabel="Repuestos" PageSize="10" FilterMode="TDFilterMode.Advanced"
            Selection="TDSelectionMode.Single" SelectedId="elegido" ShowFooter="true">
    <Columns>
        <TDColumn TItem="Part" TValue="string" Property="p => p.Code" Title="Código" Kind="TDColumnKind.Mono" Searchable="true" Frozen="TDFrozenEdge.Left" />
        <TDColumn TItem="Part" TValue="int" Property="p => p.Stock" Title="Stock" Kind="TDColumnKind.Stock" Align="TDColumnAlign.End" Aggregate="TDAggregate.Sum" />
    </Columns>
</TDDataGrid>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Data` | `IEnumerable<TItem>?` | `null` | Filas. Puede ser una lista o una consulta. | Siempre que haya datos. |
| `Columns` | `RenderFragment?` | `null` | Columnas `TDColumn`. | Siempre. |
| `QueryKey` | `string?` | `null` | Prefijo de los parámetros de la URL. | El estado se comparte por enlace o hay más de una grilla en la página. |
| `PageSize` | `int` | `10` | Filas por página. | El default 10 no alcanza. |
| `PageSizeOptions` | `IReadOnlyList<int>` | `5, 10, 20` | Tamaños que la persona puede elegir. | La persona cambia cuántas filas ve. |
| `SearchPlaceholder` | `string` | `"Buscar…"` | Texto de la caja de búsqueda vacía. | El texto vacío debe nombrar qué se busca. |
| `AriaLabel` | `string` | `"Tabla"` | Nombre accesible de la tabla. | Siempre, con el nombre real de los datos. |
| `FormName` | `string?` | `null` | Nombre del formulario de guardado. | Hay una acción de guardar. |
| `OnSubmit` | `EventCallback` | — | Se invoca al guardar las ediciones. | Junto con `FormName`. |
| `RowId` | `Func<TItem, int>?` | `null` | Identificador entero de cada fila. | Seleccionar o editar. |
| `CategoryProperty` | `Expression<Func<TItem, string?>>?` | `null` | Campo de categoría. | Filtrar por ese eje. |
| `GroupProperty` | `Expression<Func<TItem, string?>>?` | `null` | Campo que agrupa filas. | Las filas se agrupan por un campo, además de la categoría. |
| `ShowQuery` | `bool` | `false` | Muestra la consulta aplicada. | La persona debe ver el filtro activo como texto. |
| `QueryRoot` | `string` | `"source"` | Nombre de la raíz de esa consulta. | Junto con `ShowQuery`. |
| `SavedCount` | `int` | `0` | Cantidad que se anuncia después de guardar. | Después de un guardado exitoso. |
| `ShowSearch` | `bool` | `true` | Muestra la búsqueda general. | En falso si la búsqueda estorba. |
| `ShowTools` | `bool` | `true` | Muestra las herramientas de la grilla. | En falso si la barra de herramientas estorba en un listado de solo lectura. |
| `FilterMode` | `TDFilterMode` | `Advanced` | Modo de las columnas que no declaran el suyo. | Ver la tabla de `TDFilterMode`. |
| `Selection` | `TDSelectionMode` | `Multiple` | Cuántas filas se eligen. | `None` si la tabla solo se lee. |
| `MultiSort` | `bool` | `false` | Ordena por varias columnas a la vez. | El orden depende de más de un campo. |
| `InitialSort` | `string?` | `null` | Clave de la columna del orden inicial. Un signo menos delante la ordena descendente. | Hay un orden de entrada. |
| `ShowFooter` | `bool` | `false` | Muestra el pie con los `Aggregate` de las columnas. | Hay totales. |
| `AllowResize` | `bool` | `false` | Arrastrar el borde del encabezado. El ancho no baja de `MinWidth`. | La persona ajusta anchos. Respeta MinWidth de cada columna. |
| `AllowReorder` | `bool` | `false` | Arrastrar encabezados para cambiar el orden. | La persona cambia el orden de las columnas. |
| `ContextMenu` | `bool` | `false` | Menú de clic derecho en la celda. | El clic derecho de la celda ofrece copiar, filtrar u ordenar. |
| `SelectedId` | `int?` | `null` | Identificador de la fila seleccionada. | Junto con `RowId`. |
| `ExcelHref` | `string?` | `null` | Destino de la exportación a Excel. | Hay un endpoint de Excel. Sin él no hay enlace. |
| `RowClass` | `Func<TItem, string?>?` | `null` | Clase CSS de cada fila. | Formato condicional, por ejemplo stock agotado. |
| `SaveHint` | `string?` | `null` | Ayuda junto a la acción de guardar. | Junto a guardar hace falta una frase de ayuda. |
| `ExportLimit` | `int` | `500` | Máximo de filas exportadas. | El tope de 500 filas no coincide con el volumen del listado. |
| `EmptyTitle` | `string` | `"Ningún resultado coincide con los filtros"` | Título cuando no hay filas visibles. | El título por defecto no describe el listado. |
| `EmptyDetail` | `string` | `"Ajusta la búsqueda o limpia los filtros."` | Detalle de ese estado vacío. | La pista del estado vacío debe decir qué hacer. |

`Searchable` en la columna decide si la búsqueda general la incluye. `Visible="false"` no pinta la columna. `Pickable="false"` la deja fuera del selector.

## TDColumn

Columna de `TDDataGrid`. Va dentro de `Columns`.

`Property` enlaza el campo. Sin `Template`, `Kind` decide cómo se ve y cómo se filtra. `Width` en 0 no fija el ancho.

```razor
<TDColumn TItem="Part" TValue="string" Property="p => p.Name" Title="Nombre" Searchable="true" />
<TDColumn TItem="Part" TValue="string" Title="Acciones" Sortable="false" Filterable="false" Pickable="false">
    <Template Context="p">
        <TDLink Href="@($"/partes/{p.Id}")">Ficha</TDLink>
    </Template>
</TDColumn>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Property` | `Expression<Func<TItem, TValue>>?` | `null` | Campo que la columna lee, ordena y filtra. | Siempre que la celda salga del modelo. |
| `KeyName` | `string?` | `null` | Clave estable. Si se omite, se usa el nombre de `Property` o `Title`. | La clave de la URL debe ser fija. |
| `Title` | `string` | `""` | Texto del encabezado. | Siempre. |
| `Kind` | `TDColumnKind` | `Text` | Presentación y tipo de filtro cuando no hay `Template`. | Códigos, importes, fechas, stock, miniaturas. |
| `Align` | `TDColumnAlign` | `Start` | `Start` para texto y `End` para números. | Números e importes van en End. El texto se queda en Start. |
| `Sortable` | `bool` | `true` | La columna se puede ordenar. | En falso en columnas de acciones. |
| `Filterable` | `bool` | `true` | La columna se puede filtrar. | En falso en columnas de acciones. |
| `Searchable` | `bool` | `false` | La búsqueda general incluye esta columna. | Nombre, código, cliente. |
| `Visible` | `bool` | `true` | La columna se pinta. En falso no llega a la tabla. | Columna según el rol. |
| `Pickable` | `bool` | `true` | La persona puede mostrarla u ocultarla. | En falso si debe quedar siempre. |
| `Width` | `int` | `0` | Ancho fijo en píxeles. 0 no fija el ancho. | La columna necesita un ancho fijo. 0 la deja flexible. |
| `MinWidth` | `int` | `72` | Ancho mínimo al redimensionar. | Junto con `AllowResize` de la grilla. |
| `Frozen` | `TDFrozenEdge` | `None` | `Left` o `Right` la dejan fija al desplazar. | La primera columna de identificación. |
| `Aggregate` | `TDAggregate` | `None` | Total del pie. | Junto con `ShowFooter`. |
| `GroupTitle` | `string?` | `null` | Encabezado que agrupa esta columna con las siguientes que repiten el mismo texto. | Columnas compuestas. |
| `FilterMode` | `TDFilterMode` | `Inherit` | Modo de filtro de esta columna. | Una columna con un modo distinto al de la grilla. |
| `Thumb` | `Func<TItem, string?>?` | `null` | Dirección de la miniatura cuando `Kind` es `Thumb`. | Kind es Thumb y la miniatura sale de un campo. |
| `Template` | `RenderFragment<TItem>?` | `null` | Celda libre. Reemplaza la presentación de `Kind`. | Botones, barras, estado con texto. |

## TDDataTable

Tabla generada desde un `System.Data.DataTable`. Las columnas salen del esquema. No declara `TDColumn`.

```razor
<TDDataTable Data="tabla" QueryKey="dt" PageSize="8" AriaLabel="Resultado del procedimiento" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Data` | `DataTable?` | `null` | Tabla ADO.NET. | Siempre. |
| `QueryKey` | `string` | `"dt"` | Prefijo de la paginación y la búsqueda en la URL. | Hay otra tabla en la misma página: cambia el prefijo. |
| `PageSize` | `int` | `8` | Filas por página. | Ocho filas no alcanzan para el resultado. |
| `PageSizeOptions` | `IReadOnlyList<int>` | `8, 15, 30` | Tamaños que la persona puede elegir. | La persona cambia el tamaño de esta tabla. |
| `SearchPlaceholder` | `string` | `"Buscar en la tabla…"` | Texto de la búsqueda vacía. | El texto vacío debe nombrar el resultado. |
| `AriaLabel` | `string` | `"DataTable"` | Nombre accesible. | Siempre, con el nombre real. |

## TDPager

Paginación con enlaces. Cada página es una URL. Sin `HrefForPage` los controles de página no navegan.

Úsalo cuando la página no es una `TDDataGrid`. La grilla ya trae su propia paginación.

```razor
<TDPager Count="total" Page="pagina" PageSize="10"
         HrefForPage="n => $"/pedidos?page={n}""
         ItemText="pedido" ItemsText="pedidos" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Count` | `int` | `0` | Cantidad total de ítems, no de páginas. | Siempre. |
| `Page` | `int` | `1` | Página actual, desde 1. | La página actual no es la primera. Se cuenta desde 1. |
| `PageSize` | `int` | `10` | Ítems por página. | Diez ítems por página no coinciden con el listado. |
| `PageSizeOptions` | `IReadOnlyList<int>?` | `null` | Tamaños elegibles. Nulo oculta el selector. | La persona cambia el tamaño. |
| `HrefForPage` | `Func<int, string>?` | `null` | URL de una página. | Siempre que los controles deban navegar. |
| `SizeFieldName` | `string?` | `"size"` | Nombre del campo de tamaño de página. | El campo del formulario no se llama size. |
| `SizeFormId` | `string?` | `null` | Id del formulario al que pertenece ese campo. | El selector de tamaño pertenece a un formulario concreto. |
| `ItemText` | `string` | `"ítem"` | Nombre de un solo ítem en el resumen. | El resumen debe decir el nombre real de un solo ítem. |
| `ItemsText` | `string` | `"ítems"` | Nombre de varios ítems. | El resumen debe decir el nombre real de varios ítems. |
| `RowsText` | `string` | `"Filas"` | Etiqueta del selector de tamaño. | La etiqueta del selector no es Filas. |

## TDTree

Árbol de datos tipados. `Text` es obligatorio.

Úsalo para categorías que se recorren. Para elegir un nodo dentro de un formulario usa `TDDropDownTree`.

```razor
<TDTree TItem="Category" Items="raices" Text="c => c.Name" Children="c => c.Hijos" Count="c => c.Total" Href="c => $"/c/{c.Id}"" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IEnumerable<TItem>?` | `null` | Nodos de primer nivel. | Siempre. |
| `Text` | `Func<TItem, string>` | obligatorio | Texto de cada nodo. | Siempre. |
| `Children` | `Func<TItem, IEnumerable<TItem>?>?` | `null` | Hijos. Nulo o vacío es una hoja. | Hay jerarquía. |
| `Count` | `Func<TItem, int?>?` | `null` | Conteo junto al nodo. | Cada nodo muestra cuántos elementos contiene. |
| `Href` | `Func<TItem, string?>?` | `null` | Destino. Si devuelve un valor, el nodo es un enlace. | El nodo navega. |
| `Expanded` | `Func<TItem, bool>?` | `null` | El nodo empieza abierto. | Algunos nodos deben empezar abiertos. |
| `Active` | `Func<TItem, bool>?` | `null` | El nodo es el actual. | Hay un nodo que es la página actual. |

`TDTreeNode` es el nodo interno. No lo coloques suelto.
