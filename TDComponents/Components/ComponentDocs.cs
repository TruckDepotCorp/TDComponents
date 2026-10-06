using TDComponents;

namespace TDComponents.Components;

/// <summary>Secciones que se pliegan. Con <c>Single</c> solo una queda abierta.</summary>
/// <remarks>Cada sección es un <see cref="TDAccordionItem"/>. Úsalo para agrupar ayuda o filtros secundarios, no para la navegación principal.</remarks>
public partial class TDAccordion { }

/// <summary>Una sección de <see cref="TDAccordion"/>.</summary>
/// <remarks>Úsala para un bloque de ayuda o un filtro secundario. <c>Open</c> solo decide el primer render. <c>Badge</c> es un conteo u otra marca corta, no el título.</remarks>
public partial class TDAccordionItem { }

/// <summary>Anima a sus hijos cuando entran en la vista.</summary>
/// <remarks>No lo uses para contenido que la persona tiene que leer de inmediato: la animación no debe ser la única forma de mostrar el dato.</remarks>
public partial class TDAnimateOnScroll { }

/// <summary>Marca corta de estado junto a un texto o un ícono.</summary>
/// <remarks>El color no es el único dato: el texto del badge tiene que decir el estado.</remarks>
public partial class TDBadge { }

/// <summary>Código de barras pintado en el cliente.</summary>
/// <remarks><c>code128</c> sirve para texto. <c>ean13</c> y <c>ean8</c> solo si el valor es numérico de esa longitud. Cualquier otro <c>Format</c> se pinta como Code 128. <c>Name</c> envía el valor en un formulario.</remarks>
public partial class TDBarcode { }

/// <summary>Ruta de navegación. El último ítem es la página actual.</summary>
/// <remarks>Cada <see cref="TDOption"/> usa <c>Label</c> como texto y <c>Hint</c> como destino. El último no necesita destino.</remarks>
public partial class TDBreadcrumb { }

/// <summary>Tarjeta con título, medio, cuerpo y pie.</summary>
/// <remarks>Para una métrica suelta en un tablero usa <see cref="TDTileLayout"/>. Para un aviso usa <see cref="TDMessage"/>.</remarks>
public partial class TDCard { }

/// <summary>Carrusel de diapositivas. La rotación se pausa al pasar el mouse.</summary>
/// <remarks><c>Interval</c> está en milisegundos. Cero o un valor muy bajo no deja leer la diapositiva.</remarks>
public partial class TDCarousel { }

/// <summary>Gráfico del catálogo. El dibujo lo elige <c>Kind</c>.</summary>
/// <remarks>
/// <para>Valores básicos: <c>chline</c>, <c>chcol</c>, <c>chpie</c>, <c>chscatter</c>, <c>chgauge</c>, <c>chspark</c>, <c>chheat</c>.</para>
/// <para>Valores avanzados: <c>chwf</c>, <c>chfunnel</c>, <c>chpareto</c>, <c>chtree</c>, <c>chradar</c>, <c>chsankey</c>, <c>chbullet</c>, <c>chgantt</c>, <c>chforecast</c>, <c>chvariance</c>, <c>chquadrant</c>, <c>chcohort</c>, <c>chmekko</c>, <c>chslope</c>, <c>chdumbbell</c>, <c>chcontrol</c>.</para>
/// <para>Un valor desconocido se pinta como línea. Sin <c>Series</c> quedan los datos de demostración. Con <c>Series</c> y <c>Categories</c> el gráfico usa las cifras del sistema. Línea, columnas y pie conservan su geometría. Los demás kinds pintan esas series como columnas.</para>
/// </remarks>
public partial class TDChart { }

/// <summary>Columna de una <see cref="TDRow"/>. El ancho se cuenta sobre 12.</summary>
/// <remarks><c>Size</c> es el ancho en móvil y el defecto es 12. <c>SizeMd</c> y <c>SizeLg</c> en 0 conservan el ancho anterior. No la uses fuera de <see cref="TDRow"/>.</remarks>
public partial class TDCol { }

/// <summary>Columna de <see cref="TDDataGrid{TItem}"/>.</summary>
/// <remarks><c>Property</c> enlaza el campo. Sin <c>Template</c>, <c>Kind</c> decide cómo se ve y cómo se filtra. <c>Width</c> en 0 no fija el ancho.</remarks>
public partial class TDColumn<TItem, TValue> { }

/// <summary>Comparador de dos estados de una imagen. Se arrastra la división.</summary>
/// <remarks>Es un medio visual, no el comparador de productos de Ecommerce. Ese es <c>TDEcom</c> con <c>Kind="ecompare"</c>.</remarks>
public partial class TDCompare { }

/// <summary>Región con atajos de teclado visibles.</summary>
/// <remarks>Úsala cuando esa zona de la página escucha combinaciones. En cada <see cref="TDOption"/>, <c>Label</c> es la acción y <c>Value</c> es la tecla. El id de catálogo <c>econtent</c> es este componente.</remarks>
public partial class TDContent { }

/// <summary>Menú de clic derecho alrededor de su contenido.</summary>
/// <remarks>Los ítems son <see cref="TDMenuItem"/>. <c>Href</c> navega; sin destino la acción queda en el cliente.</remarks>
public partial class TDContextMenu { }

/// <summary>Tabla enlazada a objetos. Orden, filtro, página y selección viven en la URL cuando hay <c>QueryKey</c>.</summary>
/// <remarks>
/// <para>Las columnas son <see cref="TDColumn{TItem, TValue}"/> dentro de <c>Columns</c>. No uses <c>@bind-Value</c>: la fila elegida llega por <c>SelectedId</c> y el guardado por <c>OnSubmit</c>.</para>
/// <para>Para un <c>DataTable</c> de ADO.NET usa <see cref="TDDataTable"/>.</para>
/// </remarks>
public partial class TDDataGrid<TItem> { }

/// <summary>Tabla generada desde un <c>System.Data.DataTable</c>, sin modelo tipado.</summary>
/// <remarks>Las columnas salen del esquema. Para objetos tipados usa <see cref="TDDataGrid{TItem}"/>.</remarks>
public partial class TDDataTable { }

/// <summary>Diálogo modal. También puede presentarse como panel lateral.</summary>
/// <remarks>
/// <para>Úsalo para confirmar o para un formulario corto. <c>Id</c> tiene que ser único en la página. Con <c>Drawer</c> el mismo diálogo se presenta de lado.</para>
/// <para>No existen <c>TDAlert</c> ni un modal con otro nombre. El ítem de catálogo Modal es este componente. Si el panel trae su propio botón, usa <see cref="TDDrawer"/>.</para>
/// </remarks>
public partial class TDDialog { }

/// <summary>Panel lateral que se abre con un botón.</summary>
/// <remarks>Úsalo para filtros o un detalle que no tapa toda la página. No tiene un lado configurable: no existe <c>Side</c>. Para un diálogo centrado usa <see cref="TDDialog"/>.</remarks>
public partial class TDDrawer { }

/// <summary>Nodo interno de <see cref="TDDropDownTree"/>. Lo pinta el desplegable.</summary>
/// <remarks>No lo coloques suelto en una página.</remarks>
public partial class TDDropDownTreeNode { }

/// <summary>Tablero de tarjetas que se arrastran entre zonas.</summary>
/// <remarks>Úsalo cuando una tarjeta cambia de columna, por ejemplo de pedido a despacho. Cada zona es un <see cref="TDOption"/> y cada tarjeta un <see cref="TDDropCard"/>. Para métricas que no cambian de zona usa <see cref="TDTileLayout"/>.</remarks>
public partial class TDDropZone { }

/// <summary>Tienda. Un solo componente pinta las veinte variantes según <c>Kind</c>.</summary>
/// <remarks>Sin <c>Products</c> queda el catálogo de demostración. Con productos, la variante usa esa lista. Una lista vacía no muestra productos. No existen <c>TDProductCard</c> ni <c>TDCartDrawer</c>. Los valores de <c>Kind</c> son <c>ecard</c>, <c>edetail</c>, <c>ecart</c>, <c>echeckout</c>, <c>efacets</c>, <c>esearch</c>, <c>ecompare</c>, <c>eflash</c>, <c>ereviews</c>, <c>efinder</c>, <c>equote</c>, <c>ebulk</c>, <c>erecent</c>, <c>estock</c>, <c>ewishmulti</c>, <c>etrack</c>, <c>efbt</c>, <c>elocator</c>, <c>ecredit</c> y <c>ereturns</c>. Un valor desconocido pinta las tarjetas.</remarks>
public partial class TDEcom { }

/// <summary>Rejilla de piezas con título y código.</summary>
/// <remarks>Cada pieza es un <see cref="TDGalleryItem"/>: título, código y fondo. No recibe archivos ni una URL de imagen. Para una sola figura usa <see cref="TDImage"/>.</remarks>
public partial class TDGallery { }

/// <summary>Lector de códigos que llegan como teclado, típico de una pistola USB.</summary>
/// <remarks>Ignora pulsaciones lentas. <c>MinLength</c> es el largo mínimo aceptado y <c>GapMs</c> es la pausa que vacía el búfer. Si <c>IgnoreWhenTyping</c> es verdadero, no lee mientras el foco está en un campo.</remarks>
public partial class TDHidListener { }

/// <summary>Imagen con pie, vista previa y descarga.</summary>
/// <remarks><c>Src</c> es la dirección de la imagen de la aplicación. Sin ella, el catálogo pinta <c>Alt</c> sobre <c>Background</c>. <c>Alt</c> describe la imagen y no debe repetir el pie. Se rechazan destinos <c>javascript:</c> y <c>data:</c>.</remarks>
public partial class TDImage { }

/// <summary>Diseñador de etiquetas de repuesto, en milímetros y puntos por pulgada.</summary>
/// <remarks>Úsalo para una etiqueta térmica. <c>Record</c> es un <see cref="TDLabelRecord"/> con los datos ya formateados. Para un informe de varias bandas usa <see cref="TDReportDesigner"/>.</remarks>
public partial class TDLabelDesigner { }

/// <summary>Marco de aplicación con cabecera, barra lateral, cuerpo y pie.</summary>
/// <remarks><c>Side</c> vale <c>start</c> o <c>end</c>. En cada ítem, <c>Value</c> es la clave, <c>Label</c> el texto y <c>Hint</c> el destino.</remarks>
public partial class TDLayout { }

/// <summary>Enlace de texto. Con <c>Button</c> se ve como botón, pero sigue siendo un enlace.</summary>
/// <remarks>Para una acción que envía un formulario usa <see cref="TDButton"/>.</remarks>
public partial class TDLink { }

/// <summary>Indicador de espera con un texto.</summary>
/// <remarks>El texto tiene que decir qué se está cargando. Un spinner solo no alcanza.</remarks>
public partial class TDLoader { }

/// <summary>Barra de menú con submenús.</summary>
/// <remarks>Úsala en la cabecera de un sitio. Los hijos de cada <see cref="TDMenuItem"/> son el submenú. Para paneles anchos usa <see cref="TDNavigationMenu"/>. Para el menú de módulos de una aplicación usa <see cref="TDMenuApp"/>.</remarks>
public partial class TDMenu { }

/// <summary>Menú de módulos de una aplicación, con búsqueda y grupos que recuerdan si estaban abiertos.</summary>
/// <remarks>Los módulos se pasan en <c>Modules</c>. No existe un parámetro <c>Source</c> para un JSON. <c>ActivePath</c> se compara con <c>Href</c>. Si también hace falta la cabecera, usa <see cref="TDMenuAppShell"/>.</remarks>
public partial class TDMenuApp { }

/// <summary>Marco que combina cabecera y <see cref="TDMenuApp"/>.</summary>
/// <remarks><c>Mode</c> es <see cref="TDMenuShellMode.Icons"/> o <see cref="TDMenuShellMode.Float"/>. El contenido de la página va entre las etiquetas. Para una barra lateral simple, sin módulos anidados, usa <see cref="TDLayout"/>.</remarks>
public partial class TDMenuAppShell { }

/// <summary>Menú horizontal con paneles anchos.</summary>
/// <remarks>Cada entrada es un <see cref="TDNavMega"/>.</remarks>
public partial class TDNavigationMenu { }

/// <summary>Organigrama. El nombre abre la ficha y «Correo» abre el mailto.</summary>
/// <remarks>La raíz es un <see cref="TDOrgNode"/>. <c>SelectedId</c> marca la persona activa.</remarks>
public partial class TDOrganizationChart { }

/// <summary>Paginación con enlaces. Cada página es una URL.</summary>
/// <remarks>Sin <c>HrefForPage</c> los controles de página no navegan. El cambio de tamaño de página usa <c>SizeFieldName</c> dentro de <c>SizeFormId</c>.</remarks>
public partial class TDPager { }

/// <summary>Bloque con título, acciones, cuerpo y pie. Puede plegarse.</summary>
/// <remarks>Úsalo para agrupar una sección de una página. Las acciones van en <c>Actions</c>, no en el título. Para una ficha con medio y acento usa <see cref="TDCard"/>.</remarks>
public partial class TDPanel { }

/// <summary>Menú vertical de una cuenta o una configuración, con secciones que se pliegan.</summary>
/// <remarks>Úsalo dentro de una cuenta o de ajustes. Para la persona autenticada, con nombre y correo, usa <see cref="TDProfileMenu"/>. Para los módulos de toda la aplicación usa <see cref="TDMenuApp"/>.</remarks>
public partial class TDPanelMenu { }

/// <summary>Contenido flotante anclado a un disparador.</summary>
/// <remarks>Úsalo cuando el contenido es un bloque: una lista, un formulario corto o un detalle. Para una sola frase de ayuda usa <see cref="TDTooltip"/>. <c>Placement</c> elige el lado.</remarks>
public partial class TDPopup { }

/// <summary>Listado de impresoras y su estado de conexión.</summary>
/// <remarks>Si <c>Devices</c> es nulo, el componente muestra el juego de demostración.</remarks>
public partial class TDPrinterConnect { }

/// <summary>Menú de la persona autenticada: nombre, cargo y acciones.</summary>
/// <remarks>Reemplaza el nombre, el cargo, el correo y las iniciales de demostración. Un <see cref="TDMenuItem"/> con texto <c>-</c> separa grupos. Para secciones de configuración usa <see cref="TDPanelMenu"/>.</remarks>
public partial class TDProfileMenu { }

/// <summary>Barra de avance entre cero y <c>Max</c>.</summary>
/// <remarks>Si el avance es indeterminado, no uses este componente: no tiene un modo sin valor.</remarks>
public partial class TDProgress { }

/// <summary>Código QR pintado en el cliente.</summary>
/// <remarks><c>Ecc</c> es el nivel de corrección: <c>L</c>, <c>M</c>, <c>Q</c> o <c>H</c>. El defecto es <c>M</c>.</remarks>
public partial class TDQrCode { }

/// <summary>Diseñador de un informe. <c>Report</c> elige la plantilla de demostración.</summary>
/// <remarks>Úsalo para un documento por bandas, como una factura o un corte de inventario. El defecto de <c>Report</c> es <c>factura</c>. Para una etiqueta térmica usa <see cref="TDLabelDesigner"/>.</remarks>
public partial class TDReportDesigner { }

/// <summary>Fila de doce columnas. Los hijos son <see cref="TDCol"/>.</summary>
public partial class TDRow { }

/// <summary>Lector de códigos por cámara o por teclado.</summary>
/// <remarks><c>Mode</c> vale <c>continuous</c> para seguir leyendo, o <c>single</c> para pausar hasta confirmar. <c>KeyboardWedge</c> acepta la pistola USB.</remarks>
public partial class TDScanner { }

/// <summary>Agenda de trabajos por día, semana, mes, lista o recurso.</summary>
/// <remarks>Sin <c>Appointments</c> muestra la semana de demostración del catálogo. Con citas y <c>Resources</c> muestra los datos de la aplicación. <c>Name</c> publica un JSON de las citas en el post cuando la persona guarda, mueve o elimina. <c>ReadOnly</c> deja cambiar el día y la vista, no los trabajos. El horario visible va de 07:00 a 20:00.</remarks>
public partial class TDScheduler { }

/// <summary>Bloque de carga con el tamaño del contenido que va a aparecer.</summary>
/// <remarks><c>Width</c> y <c>Height</c> son CSS. <c>Circle</c> lo vuelve redondo, para un avatar.</remarks>
public partial class TDSkeleton { }

/// <summary>Divide el espacio entre paneles que la persona puede redimensionar.</summary>
/// <remarks>Los hijos son <see cref="TDSplitterPane"/>.</remarks>
public partial class TDSplitter { }

/// <summary>Panel de un <see cref="TDSplitter"/>.</summary>
/// <remarks>No lo coloques fuera de <see cref="TDSplitter"/>. <c>Flex</c> y <c>Min</c> son CSS. <c>ShowHandle</c> muestra el asa para arrastrar.</remarks>
public partial class TDSplitterPane { }

/// <summary>Apila hijos en columna o en fila, con separación y alineación.</summary>
/// <remarks>Úsalo para agrupar controles sin una grilla de 12. El defecto es vertical. Para columnas que suman 12 usa <see cref="TDRow"/>.</remarks>
public partial class TDStack { }

/// <summary>Pasos de un proceso. <c>Current</c> es el índice del paso activo, desde cero.</summary>
/// <remarks>Cada <see cref="TDOption"/> es un paso: <c>Label</c> es el nombre.</remarks>
public partial class TDSteps { }

/// <summary>Contenido de una pestaña de <see cref="TDTabs"/>.</summary>
/// <remarks><c>Name</c> tiene que coincidir con el <c>Value</c> de la pestaña.</remarks>
public partial class TDTabPanel { }

/// <summary>Pestañas. El panel activo es el <see cref="TDTabPanel"/> cuyo <c>Name</c> coincide con <c>Selected</c>.</summary>
/// <remarks>Úsalas para vistas de la misma tarea. <c>Value</c> de cada <see cref="TDOption"/> es la clave, no el texto. Para un proceso con orden usa <see cref="TDSteps"/>. Para ayuda que se pliega usa <see cref="TDAccordion"/>.</remarks>
public partial class TDTabs { }

/// <summary>Terminal de demostración. <c>PartsJson</c> es un arreglo JSON de repuestos que los comandos pueden consultar.</summary>
/// <remarks>Úsala para una consola de ejemplo. <c>PartsJson</c> en <c>[]</c> deja los comandos de catálogo sin datos. No es un terminal del sistema operativo.</remarks>
public partial class TDTerminal { }

/// <summary>Selector de los temas incluidos: Modern, Material, Material Expressive y Fluent, en claro y oscuro.</summary>
/// <remarks>No tiene parámetros. Cambiar de tema redefine las variables <c>--td-*</c>; los componentes no cambian de marca. La elección queda en las cookies <c>td-theme</c> y <c>td-theme-family</c>, con una duración de un año.</remarks>
public partial class TDThemePicker { }

/// <summary>Rejilla de métricas.</summary>
/// <remarks>Úsalo para cifras de un tablero. Cada baldosa es un <see cref="TDTileItem"/> y <c>Span</c> dice cuántas columnas ocupa. Para una ficha con cuerpo y pie usa <see cref="TDCard"/>. No existe <c>TDCardGroup</c>.</remarks>
public partial class TDTileLayout { }

/// <summary>Avisos flotantes. No ocupan un lugar fijo del formulario.</summary>
/// <remarks>Para un aviso que debe quedarse junto al campo usa <see cref="TDMessage"/>.</remarks>
public partial class TDToast { }

/// <summary>Índice de la página que marca la sección visible.</summary>
/// <remarks><c>Target</c> es el <c>id</c> del contenedor cuyos encabezados se siguen. <c>Items</c> usa <c>Value</c> como ancla y <c>Label</c> como texto.</remarks>
public partial class TDToc { }

/// <summary>Barra de acciones con tres zonas: inicio, centro y fin.</summary>
/// <remarks>Úsala para las acciones de una página: nuevo, buscar, exportar. Las zonas se entregan como <c>Start</c>, <c>Center</c> y <c>End</c>. Para navegar el sitio usa <see cref="TDMenu"/>.</remarks>
public partial class TDToolbar { }

/// <summary>Ayuda breve que aparece sobre su contenido.</summary>
/// <remarks>No pongas en el tooltip la única explicación de una acción. El texto también tiene que existir en un lugar visible.</remarks>
public partial class TDTooltip { }

/// <summary>Árbol de datos tipados.</summary>
/// <remarks><c>Text</c> es obligatorio. <c>Children</c> devuelve los hijos de un nodo. <c>Href</c> convierte el nodo en enlace.</remarks>
public partial class TDTree<TItem> { }

/// <summary>Nodo interno de <see cref="TDTree{TItem}"/>. Lo pinta el árbol.</summary>
/// <remarks>No lo coloques suelto en una página.</remarks>
public partial class TDTreeNode<TItem> { }

/// <summary>Barra superior de una pantalla de teléfono.</summary>
/// <remarks>Úsala en una app de bodega. <c>BackLabel</c> dice a dónde se vuelve. La cámara no vive aquí.</remarks>
public partial class TDAppBar { }

/// <summary>Navegación inferior para el pulgar.</summary>
/// <remarks><c>Items</c> son <see cref="TDMobileDest"/>. <c>Active</c> es el <c>Id</c> de la sección actual. El contador solo aparece si <c>Count</c> es mayor que cero.</remarks>
public partial class TDBottomNav { }

/// <summary>Tarjeta con lo que el sistema resolvió después de un escaneo.</summary>
/// <remarks>No abre la cámara. El lector es <see cref="TDScanner"/> o <see cref="TDHidListener"/>. Aquí van el código, el artículo, la ubicación y la acción que sigue.</remarks>
public partial class TDScanCard { }

/// <summary>Teclado de cantidad para una pantalla de teléfono.</summary>
/// <remarks>El valor viaja en el post con <c>Name</c>. <c>Min</c> y <c>Max</c> lo contienen. Úsalo cuando la persona opera con guantes.</remarks>
public partial class TDQtyPad { }

/// <summary>Cola de tareas de bodega.</summary>
/// <remarks><c>Jobs</c> son <see cref="TDWarehouseJob"/>. Vacío o nulo dice que no hay tareas. No inventa una cola de demostración. <c>Href</c> abre esa tarea; si falta, la fila se lee y no se navega.</remarks>
public partial class TDJobList { }

/// <summary>Ficha de una ubicación de bodega.</summary>
/// <remarks>El código visible junta pasillo, rack, nivel y casillero. La existencia lleva su unidad.</remarks>
public partial class TDBinCard { }

/// <summary>Hoja de confirmación al pie de la pantalla.</summary>
/// <remarks><c>Open</c> la muestra. Cancelar la oculta sin enviar. Confirmar manda el valor <c>confirmar</c> en el campo <c>Name</c>. El detalle dice qué queda sin mover si se cancela.</remarks>
public partial class TDConfirmSheet { }

/// <summary>Turno de quien opera el teléfono.</summary>
/// <remarks><c>Online</c> en falso explica que los movimientos quedan en el teléfono. <c>Pending</c> en cero dice que todo está sincronizado.</remarks>
public partial class TDShiftBar { }

/// <summary>Una línea de picking.</summary>
/// <remarks><c>Field</c> publica las unidades recogidas. Recoger y devolver no pasan de cero ni de <c>Quantity</c>.</remarks>
public partial class TDPickLine { }

/// <summary>Pasos de una recepción o un almacenaje.</summary>
/// <remarks><c>Current</c> es el índice del paso activo, desde cero. Cada paso dice Hecho, Ahora o Pendiente.</remarks>
public partial class TDJobSteps { }

/// <summary>Carrusel de tarjetas para el teléfono.</summary>
/// <remarks><c>Cards</c> son <see cref="TDCarouselCard"/>. Vacío dice que no hay tarjetas. El encabezado de cada tarjeta dice cuál es y cuántas hay. <c>Auto</c> en verdadero gira solo; en falso solo avanzan los botones. Los controles son <see cref="TDButtonIcon"/>. No reemplaza a <see cref="TDCarousel"/>.</remarks>
public partial class TDCardCarousel { }

/// <summary>Botón que muestra un ícono de Material Symbols y un nombre accesible.</summary>
/// <remarks><c>Icon</c> es el nombre del glifo, por ejemplo <c>arrow_back</c>. <c>Label</c> es lo que se oye: el botón no pinta texto. La página carga la fuente con los nombres que usa. El defecto de <c>ButtonType</c> no envía el formulario.</remarks>
public partial class TDButtonIcon { }

/// <summary>Tablero de puertas del andén.</summary>
/// <remarks><c>Doors</c> son <see cref="TDDockDoor"/>. Vacío o nulo dice que no hay puertas asignadas. No inventa un muelle de demostración.</remarks>
public partial class TDDockBoard { }

/// <summary>Diferencia entre la existencia del sistema y lo contado.</summary>
/// <remarks><c>Name</c> publica las unidades contadas. El aviso dice si coincide, falta o sobra.</remarks>
public partial class TDCountDiff { }

/// <summary>Incidencia de piso: qué pasó, qué hacer y a quién pedir ayuda.</summary>
/// <remarks>El color no reemplaza el texto. <c>HelpLabel</c> nombra a quien ayuda.</remarks>
public partial class TDIssueCard { }

/// <summary>Una parada de una ruta de entrega.</summary>
/// <remarks>El estado va escrito. El número grande son los bultos de esa parada.</remarks>
public partial class TDRouteStop { }

/// <summary>Armado de un pallet: capas, peso y mezcla.</summary>
/// <remarks>Si el peso supera el máximo, pide quitar bultos. <c>Mixed</c> avisa que hay más de un artículo.</remarks>
public partial class TDPalletBuild { }

/// <summary>Nota que deja un turno al siguiente.</summary>
/// <remarks>No es la barra de conexión. <c>OpenTasks</c> en cero dice que el turno anterior cerró su cola.</remarks>
public partial class TDShiftNote { }

/// <summary>Línea de reposición, de la reserva al picking.</summary>
/// <remarks><c>Field</c> publica las unidades movidas. Mover y devolver no pasan de cero ni de <c>Needed</c>.</remarks>
public partial class TDReplenLine { }

/// <summary>Comparación entre la ubicación sugerida y la escaneada.</summary>
/// <remarks>Si no coinciden, dice que no se deje el artículo. No abre la cámara.</remarks>
public partial class TDSlotCheck { }

/// <summary>Lote retenido por calidad.</summary>
/// <remarks>Sin <c>Owner</c>, nadie del piso puede mover el lote.</remarks>
public partial class TDQcHold { }

/// <summary>Cierre de un despacho: andén, salida y sello.</summary>
/// <remarks><c>ActionLabel</c> dice la consecuencia. Un sello vacío se lee como sin sello.</remarks>
public partial class TDDispatchCard { }

/// <summary>Cabecera de una entrada de mercadería.</summary>
/// <remarks>El número grande son las líneas ya recibidas. El estado va escrito.</remarks>
public partial class TDReceiptHeader { }

/// <summary>Una línea de la orden que se está recibiendo.</summary>
/// <remarks><c>Field</c> publica las unidades recibidas. Puede superar lo pedido; el aviso lo dice. El número abre un diálogo para escribir la cantidad.</remarks>
public partial class TDReceiptLine { }

/// <summary>Bultos del aviso de despacho contra los contados en el camión.</summary>
/// <remarks><c>Field</c> publica los bultos contados. No cierra la entrada si faltan o sobran.</remarks>
public partial class TDAsnMatch { }

/// <summary>Sello del camión al llegar.</summary>
/// <remarks>Si no coincide o está violado, pide detener la descarga. No es el sello de salida.</remarks>
public partial class TDSealCheck { }

/// <summary>Lote y vencimiento de lo que entra.</summary>
/// <remarks>Sin lote o sin vencimiento, el texto pide no ingresarlo a stock.</remarks>
public partial class TDLotCapture { }

/// <summary>Criterios de revisión de un producto.</summary>
/// <remarks><c>Checks</c> son <see cref="TDInspectCheck"/>. Vacío dice que no hay criterios. Cada criterio publica Cumple, No cumple o Pendiente.</remarks>
public partial class TDInspectList { }

/// <summary>Unidades dañadas vistas en la revisión.</summary>
/// <remarks>Cero afectadas dice que no hay daño. Si hay daño y no hay <c>Next</c>, pide separarlas.</remarks>
public partial class TDDamageNote { }

/// <summary>Lectura de temperatura contra el rango permitido.</summary>
/// <remarks>Fuera de rango pide no ingresar el producto y avisar a calidad.</remarks>
public partial class TDTempCheck { }

/// <summary>Etiqueta del producto contra el código de la orden.</summary>
/// <remarks>No abre la cámara. Si no coincide o no se lee, pide no guardarlo.</remarks>
public partial class TDLabelCheck { }

/// <summary>Decisión final de la revisión.</summary>
/// <remarks><c>Decision</c> va escrita. <c>ActionLabel</c> dice la consecuencia.</remarks>
public partial class TDDisposition { }

/// <summary>Mapa de uno o varios pilotos o vehículos, con la ruta recorrida y las paradas.</summary>
/// <remarks>Sin <c>Units</c> muestra la flota de demostración. Una lista vacía deja el mapa sin marcas. Cada <see cref="TDMapUnit"/> trae la posición actual, el texto de la ficha y, si existen, <c>Route</c> y <c>Stops</c>. <c>Route</c> es la lista de coordenadas por donde pasó el piloto. Con <c>MatchRoute</c> en true, el mapa reconstruye ese recorrido por calles. En false une los puntos en línea recta. Volver a pintar el componente con nuevas coordenadas mueve la misma marca. El mapa usa teselas de OpenStreetMap. <c>TileUrl</c> acepta otra plantilla <c>{z}/{x}/{y}</c> en http o https. <c>RouterUrl</c> en producción debe ser el servidor propio.</remarks>
public partial class TDMaps { }

/// <summary>Mapa de la persona que tiene la sesión abierta en este equipo.</summary>
/// <remarks>La posición sale del navegador, no del servidor. <c>Name</c> y <c>Role</c> identifican a quien inició sesión. <c>Follow</c> mantiene el mapa centrado. <c>ShowTrail</c> dibuja el recorrido de esta visita. Si el equipo niega el permiso, el mapa explica qué pasó y ofrece reintentar.</remarks>
/// <summary>Ruta por calles desde un punto A hasta un punto B, con las entregas del camino.</summary>
/// <remarks>Sin <c>Origin</c> ni <c>Destination</c> calcula la ruta de demostración. <c>Deliveries</c> se visitan en el orden de la lista, entre la salida y la llegada. Una lista vacía es el camino directo. El trazado sale de un servidor OSRM. <c>RouterUrl</c> en producción debe ser el servidor propio. <c>Profile</c> es <c>driving</c>, <c>walking</c> o <c>cycling</c>.</remarks>
public partial class TDMapRoute { }
