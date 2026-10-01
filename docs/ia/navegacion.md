# Navegación — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDTabs` no elige el panel por posición. El `Name` de `TDTabPanel` tiene que coincidir con el `Value` de la pestaña y con `Selected`.
2. `TDBreadcrumb` usa `TDOption`: `Label` es el texto y `Hint` es el destino. El último tramo es la página actual.
3. `TDMenuItem.Href` navega. Sin destino, la acción queda en el cliente.
4. `TDLink` con `Button` se ve como botón y sigue siendo un enlace. No envía un formulario. Para enviar usa `TDButton`.
5. El menú de módulos es `TDMenuApp`. El marco con cabecera es `TDMenuAppShell`. No existe `Source="menu.json"` como parámetro: los módulos se pasan en `Modules`.
6. `TDCarousel` recibe `Slides` de tipo `TDSlide`. No es genérico y no tiene `TItem`.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Secciones de ayuda o filtros que se pliegan | `TDAccordion` | `TDTabs` si son vistas distintas de la misma tarea |
| Ruta de la página | `TDBreadcrumb` | TDToc si el índice sigue el scroll de la misma página. |
| Pestañas de una misma página | `TDTabs` | `TDAccordion` |
| Pasos de un proceso | `TDSteps` | `TDTabs` |
| Índice que sigue el scroll | `TDToc` | `TDBreadcrumb` |
| Barra de acciones | `TDToolbar` | `TDMenu` |
| Barra con submenús | `TDMenu` | `TDNavigationMenu` si el panel es ancho |
| Mega menú | `TDNavigationMenu` | `TDMenu` |
| Menú lateral de la aplicación | `TDMenuApp` o `TDMenuAppShell` | `TDPanelMenu` si es el menú de una cuenta |
| Menú de cuenta o configuración | `TDPanelMenu` | `TDProfileMenu` si es la persona autenticada |
| Menú de la persona | `TDProfileMenu` | TDPanelMenu si es la configuración, sin la ficha de la sesión. |
| Clic derecho | `TDContextMenu` | TDMenu si las acciones están en una barra. |
| Enlace | `TDLink` | `TDButton` si la acción envía un formulario |
| Carrusel de diapositivas | `TDCarousel` | TDGallery si son piezas con código, no diapositivas. |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| accordion | `TDAccordion` y `TDAccordionItem` |
| breadcrumb | `TDBreadcrumb` |
| carousel, pcarousel | `TDCarousel` |
| ctxmenu | `TDContextMenu` |
| link | `TDLink` |
| menu | `TDMenu` |
| panelmenu | `TDPanelMenu` |
| profilemenu | `TDProfileMenu` |
| stepsx | `TDSteps` |
| tabsx | `TDTabs` y `TDTabPanel` |
| toc | `TDToc` |
| toolbar | `TDToolbar` |
| navmenu | `TDNavigationMenu` |
| pmenu | `TDMenuApp`. El marco es `TDMenuAppShell` |

## Tipos compartidos

`TDOption` — `Value`, `Label`, `Hint`. En breadcrumb, `Hint` es el href. En pasos, `Label` es el nombre. En pestañas, `Value` es la clave.

`TDMenuItem` — `Text`, `Href`, `Children`, `Disabled`, `Shortcut`, `Icon`.

`TDNavMega` — entrada de `TDNavigationMenu`. `Groups` son `TDNavGroup`. `Panel` por defecto es `columns`.

`TDMenuShellMode` — `Icons` (default) o `Float`.

`TDSlide` — diapositiva: `Eyebrow`, `Title`, `Text`, `Action`, `Background` (`#0A0B0C`), `Accent` (`#ED2A24`).

`TDTabsVariant` — `Underline` (default), `Pills`, `Vertical`.

## TDAccordion

Secciones que se pliegan. Con `Single` solo una queda abierta. Cada sección es un `TDAccordionItem`.

```razor
<TDAccordion Single="true">
    <TDAccordionItem Title="Entrega" Badge="2" Open="true">
        <p>Retiro en bodega o despacho a flota.</p>
    </TDAccordionItem>
    <TDAccordionItem Title="Garantía">12 meses en repuestos de motor.</TDAccordionItem>
</TDAccordion>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Single` | `bool` | `false` | Solo una sección permanece abierta. | Las secciones son alternativas. |
| `ChildContent` | contenido | — | Secciones `TDAccordionItem`. | Siempre. |

`TDAccordionItem`: `Title` (`""`), `Badge` (`string?`), `Open` (`false`), `ChildContent`.

## TDBreadcrumb

Ruta de navegación. El último ítem es la página actual y no necesita destino.

```razor
<TDBreadcrumb Items="@(new TDOption[] { new("ini", "Inicio", Hint: "/"), new("ped", "Pedidos", Hint: "/pedidos"), new("hoy", "Hoy") })" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IReadOnlyList<TDOption>` | vacío | `Label` es el texto y `Hint` el destino. | Siempre. |
| `ShowHome` | `bool` | `true` | Muestra el enlace de inicio. | En falso si el primer ítem ya es el inicio. |

## TDCarousel

Carrusel de diapositivas. La rotación se pausa al pasar el mouse. `Interval` está en milisegundos.

```razor
<TDCarousel AriaLabel="Promociones" Interval="5000" Slides="slides" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Destacados"` | Nombre accesible. | Siempre, con el nombre real. |
| `Interval` | `int` | `5000` | Milisegundos entre diapositivas. | Un valor muy bajo no deja leer. |
| `Slides` | `IReadOnlyList<TDSlide>` | vacío | Diapositivas. | Siempre. |

## TDContextMenu

Menú de clic derecho alrededor de su contenido.

```razor
<TDContextMenu Items="acciones">
    <p>Fila del pedido 1042</p>
</TDContextMenu>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IReadOnlyList<TDMenuItem>` | vacío | `Text` es la etiqueta, `Href` el destino y `Shortcut` el atajo visible. | Siempre. |
| `ChildContent` | contenido | — | Zona que abre el menú. | Siempre. |

## TDLink

Enlace de texto. Con `Button` se ve como botón y no envía formularios.

```razor
<TDLink Href="/pedidos/1042">Ver pedido</TDLink>
<TDLink Href="https://ejemplo.cl/guia" External="true">Guía</TDLink>
<TDLink Href="/pedidos/nuevo" Button="true">Nuevo pedido</TDLink>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Href` | `string` | `"#"` | Destino. | Siempre un URL real. |
| `External` | `bool` | `false` | Abre en otra pestaña y lo anuncia. | El destino sale del sitio. |
| `Quiet` | `bool` | `false` | Sin el énfasis del enlace normal. | Dentro de un párrafo. |
| `Button` | `bool` | `false` | Se dibuja como botón. | La acción navega y debe verse como botón. |
| `Disabled` | `bool` | `false` | No se puede activar y sale del tabulador. | El destino existe pero la acción no está disponible. |
| `ChildContent` | contenido | — | Texto del enlace. | Siempre. |

## TDMenu

Barra de menú con submenús. `Children` de cada `TDMenuItem` son el submenú.

```razor
<TDMenu AriaLabel="Principal" Items="entradas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IReadOnlyList<TDMenuItem>` | vacío | Entradas de primer nivel. | Siempre. |
| `Dark` | `bool` | `true` | Barra oscura. | En falso para barra clara. |
| `AriaLabel` | `string` | `"Menú principal"` | Nombre accesible. | Hay más de una barra, o el nombre por defecto no aplica. |

## TDMenuApp

Menú de módulos, con búsqueda y grupos que recuerdan si estaban abiertos. `ActivePath` se compara con `Href`.

```razor
<TDMenuApp Modules="modulos" ActivePath="/ventas/pedidos" Searchable="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Searchable` | `bool` | `true` | Muestra el buscador. | En falso si hay pocas opciones. |
| `SearchPlaceholder` | `string` | `"Buscar opción…"` | Texto del buscador vacío. | El buscador debe nombrar qué se busca. |
| `ActivePath` | `string?` | `null` | Ruta de la opción actual. | Siempre que haya una página actual. |
| `ExpandActive` | `bool` | `true` | Abre el grupo de la ruta actual. | En falso si el grupo de la ruta actual debe quedar cerrado. |
| `RememberExpanded` | `bool` | `true` | Recuerda qué grupos quedaron abiertos. | En falso si cada visita empieza con los grupos en su estado inicial. |
| `Stay` | `bool` | `false` | El menú permanece visible. | El menú no debe ocultarse al elegir. |
| `ShowSource` | `bool` | `false` | Muestra el origen de cada opción. | Hace falta ver de dónde sale cada opción. |
| `Modules` | `IReadOnlyList<TDMenuItem>` | vacío | Árbol. `Children` son las opciones internas. | Siempre. |

## TDMenuAppShell

Marco que combina cabecera y `TDMenuApp`.

```razor
<TDMenuAppShell Title="Panel de flota" Modules="modulos" ActivePath="/ventas/pedidos" Mode="TDMenuShellMode.Icons">
    <p>Contenido de la página</p>
</TDMenuAppShell>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `"Panel de flota"` | Título de la cabecera. | Siempre el nombre real de la aplicación. |
| `Eyebrow` | `string` | `"Truck Depot"` | Línea pequeña sobre el título. | Hay una marca o un área sobre el título. Si no, cámbialo: el defecto es de demostración. |
| `ActivePath` | `string?` | `"/ventas/pedidos"` | Ruta marcada en el menú. | Cámbialo por la ruta real. |
| `NoticeCount` | `int` | `3` | Cantidad del aviso de la cabecera. | La cabecera muestra un conteo de avisos distinto de 3. |
| `ShowSearch` | `bool` | `true` | Búsqueda de la cabecera. | En falso si la cabecera no busca. |
| `ShowSearchOnSmall` | `bool` | `false` | Mantiene la búsqueda en anchos estrechos. | La búsqueda también debe verse en anchos estrechos. |
| `Mode` | `TDMenuShellMode` | `Icons` | `Icons` o `Float`. | Float si el menú no es una barra de íconos. |
| `Modules` | `IReadOnlyList<TDMenuItem>` | vacío | Árbol del menú interno. | Siempre. |
| `ChildContent` | contenido | — | Contenido de la página. | Siempre. |

## TDNavigationMenu

Menú horizontal con paneles anchos. Cada entrada es un `TDNavMega`.

```razor
<TDNavigationMenu AriaLabel="Catálogo" Items="entradas" Delay="120" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Navegación"` | Nombre accesible. | Nombra el menú real. |
| `Delay` | `int` | `120` | Milisegundos antes de abrir un panel. | El panel se abre demasiado pronto o demasiado tarde. |
| `Items` | `IReadOnlyList<TDNavMega>` | vacío | Entradas de primer nivel. | Siempre. |

En cada `TDNavGroup`, `Label` de `TDOption` es el texto y `Hint` puede ser el destino.

## TDPanelMenu

Menú vertical de una cuenta o una configuración.

```razor
<TDPanelMenu Sections="secciones" Active="/cuenta" AriaLabel="Cuenta" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sections` | `IReadOnlyList<TDMenuItem>` | vacío | `Children` son las entradas de cada sección. | Siempre. |
| `Active` | `string?` | `null` | Texto o destino de la entrada actual. | Hay una entrada actual, por texto o por destino. |
| `Open` | `string?` | `null` | Sección que empieza abierta. | Una sección debe empezar abierta. |
| `Collapsed` | `bool` | `false` | Empieza con las secciones cerradas. | Todas las secciones empiezan cerradas. |
| `Multiple` | `bool` | `false` | Varias secciones abiertas a la vez. | La persona compara dos secciones a la vez. |
| `AriaLabel` | `string` | `"Menú de cuenta"` | Nombre accesible. | El menú no es el de la cuenta. |

## TDProfileMenu

Menú de la persona autenticada.

```razor
<TDProfileMenu Name="Ana Soto" Role="Compras" Email="ana.soto@truckdepot.cl" Initials="AS" Items="acciones" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"Ana Soto"` | Nombre. | Siempre el de la sesión. |
| `Role` | `string` | `"Compras"` | Cargo o área. | Siempre el cargo o el área de la sesión. |
| `Email` | `string` | `"ana.soto@truckdepot.cl"` | Correo. | Siempre el correo de la sesión. |
| `Initials` | `string` | `"AS"` | Iniciales del avatar. | Siempre las iniciales de la persona, no las de demostración. |
| `Items` | `IReadOnlyList<TDMenuItem>` | cuenta, preferencias y cerrar sesión | Acciones. Un `Text` de `"-"` separa. | Reemplaza el default de demostración. |

## TDSteps

Pasos de un proceso. `Current` es el índice del paso activo, desde cero.

```razor
<TDSteps AriaLabel="Checkout" Steps="pasos" Current="1" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Pasos"` | Nombre accesible del proceso. | Nombra el proceso, por ejemplo Checkout. |
| `Steps` | `IReadOnlyList<TDOption>` | vacío | `Label` es el nombre de cada paso. | Siempre. |
| `Current` | `int` | `0` | Índice del paso activo, desde cero. | El paso activo no es el primero. El índice empieza en cero. |
| `Vertical` | `bool` | `false` | Los apila en columna. | El seguimiento es una línea de tiempo. |

## TDTabs

Pestañas. El panel activo es el `TDTabPanel` cuyo `Name` coincide con `Selected`.

```razor
<TDTabs AriaLabel="Ficha" Tabs="pestanas" Selected="stock" Variant="TDTabsVariant.Underline">
    <TDTabPanel Name="stock">12 unidades en bodega central.</TDTabPanel>
    <TDTabPanel Name="compat">Apto para FH 2020.</TDTabPanel>
</TDTabs>
```

`pestanas` es una lista de `TDOption` cuyo `Value` es `stock` o `compat` y cuyo `Label` es el texto de la pestaña.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Pestañas"` | Nombre accesible. | Nombra el grupo, por ejemplo Ficha del repuesto. |
| `Tabs` | `IReadOnlyList<TDOption>` | vacío | `Value` es la clave y `Label` el texto. | Siempre. |
| `Selected` | `string?` | `null` | `Value` de la pestaña activa. | Siempre. |
| `Variant` | `TDTabsVariant` | `Underline` | `Underline`, `Pills` o `Vertical`. | Pills para pocos segmentos. Vertical si el contenido queda al lado. |
| `Closable` | `bool` | `false` | Cada pestaña se puede cerrar. | La persona cierra pestañas que ella abrió. |
| `AllowAdd` | `bool` | `false` | Control para agregar una pestaña. | La persona agrega una pestaña. |
| `ChildContent` | contenido | — | Paneles `TDTabPanel`. | Siempre. |

`TDTabPanel`: `Name` (tiene que coincidir con el `Value`), `Active` (marca el primer render; después manda `Selected`), `ChildContent`.

## TDToc

Índice que marca la sección visible. `Target` es el `id` del contenedor. En `Items`, `Value` es el id del ancla y `Label` el texto.

```razor
<TDToc Target="guia" Title="En esta página" Items="indice" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Target` | `string` | `"guia"` | Id del contenedor cuyos encabezados se siguen. | Cámbialo por el id real. |
| `Title` | `string` | `"En esta página"` | Título del índice. | El índice tiene otro título. |
| `ShowProgress` | `bool` | `true` | Muestra el avance de lectura. | En falso si la barra de avance de lectura estorba. |
| `Items` | `IReadOnlyList<TDOption>` | vacío | `Value` es el id del destino y `Label` el texto. | Siempre. |
| `ChildContent` | contenido | — | Contenido extra bajo el índice. | Hay una nota bajo la lista de anclas. |

## TDToolbar

Barra de acciones con tres zonas. En Razor se entregan como `<Start>`, `<Center>` y `<End>`.

```razor
<TDToolbar AriaLabel="Pedidos">
    <Start><TDButton ButtonType="TDButtonType.Button">Nuevo</TDButton></Start>
    <End><TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Exportar</TDButton></End>
</TDToolbar>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Acciones"` | Nombre accesible. | Nombra la barra, por ejemplo Pedidos. |
| `Dark` | `bool` | `false` | Barra oscura. | La barra va sobre un fondo oscuro. |
| `Start` | contenido | — | Acciones del inicio. | Acciones alineadas al inicio, como Nuevo. |
| `Center` | contenido | — | Contenido del centro. | Hay un título o una búsqueda en el centro. |
| `End` | contenido | — | Acciones del final. | Acciones alineadas al final, como Exportar. |
