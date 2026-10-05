namespace WebAppSSR.Catalog;

public sealed record CatalogCode(string File, string Lang, string Source);

public sealed record CatalogItem(
    string Id,
    string Group,
    string Title,
    string Tag,
    string Description,
    string Summary)
{
    public string Href => $"/c/{Id}";

    public IReadOnlyList<CatalogCode> Samples => CatalogSamples.For(Id);

    public CatalogCode Code => CatalogSamples.Primary(Id)
        ?? new(
            $"Pages/{Id}.razor",
            "razor",
            Tag.Contains('<') ? Tag : $"<{Tag}>");
}

public static class ComponentCatalog
{
    public static IReadOnlyList<CatalogItem> All { get; } =
    [
        I("tokens", "Fundamentos", "Themes", "<TDThemePicker>", "Cuatro temas incluidos, cada uno en claro y oscuro: Modern, Material, Material Expressive y Fluent 3. Todos redefinen el mismo esquema --td-*; los componentes no cambian.", "Temas incluidos"),
        I("grid", "Data", "DataGrid", "<TDDataGrid TItem=\"Part\">", "Enlazado a IQueryable: ordena, filtra y pagina en la base de datos vía EF Core, sin código extra. Edita stock en lote y guarda con un solo POST.", "IQueryable · orden · filtros · paginación"),
        I("coltemplate", "DataGrid · Columnas", "Templates de columna", "<Template Context=\"p\">", "Cualquier celda puede ser un RenderFragment: miniatura con nombre, estado con color e ícono, barra de nivel o botones de acción.", "Templates, ancho, orden, totales, fijas…"),
        I("colresize", "DataGrid · Columnas", "Redimensionar columnas", "AllowColumnResize=\"true\"", "Arrastra el borde del encabezado para cambiar el ancho. Respeta MinWidth y se puede guardar por usuario.", "Arrastra el borde del encabezado"),
        I("colpicker", "DataGrid · Columnas", "Selector de columnas", "AllowColumnPicker=\"true\"", "El usuario elige qué columnas ver. Ya estaba incluido en DataGrid y DataTable; aquí se documenta con Pickable y Visible.", "Elige columnas visibles"),
        I("colreorder", "DataGrid · Columnas", "Reordenar columnas", "AllowColumnReorder=\"true\"", "Arrastra encabezados para cambiar el orden, o usa Alt + flechas con el teclado.", "Arrastra encabezados"),
        I("colfooter", "DataGrid · Columnas", "Totales en el pie", "Aggregate=\"Aggregate.Sum\"", "Suma, promedio y conteo por columna en un tfoot que se recalcula con las filas visibles.", "Suma, promedio y conteo"),
        I("colfrozen", "DataGrid · Columnas", "Columnas fijas", "Frozen=\"true\"", "Fija columnas a la izquierda o derecha con position: sticky mientras la tabla se desplaza en horizontal.", "Columnas sticky"),
        I("colcomposite", "DataGrid · Columnas", "Columnas compuestas", "<TDColumn Title=\"Inventario\">", "Agrupa columnas bajo un encabezado común con varias filas de cabecera.", "Encabezados agrupados"),
        I("colconditional", "DataGrid · Columnas", "Columnas condicionales", "@if (…) { <TDColumn … /> }", "Renderiza columnas según el rol del usuario u otra condición del servidor. Las columnas ocultas no llegan al HTML.", "Columnas por rol"),
        I("fltsimple", "DataGrid · Filtering", "Filtro simple", "FilterMode=\"GridFilterMode.Simple\"", "Una fila de filtros bajo los encabezados. Escribes y la tabla filtra al instante con el operador por defecto de cada columna.", "Simple, menú, avanzado, lista, API"),
        I("fltmenu", "DataGrid · Filtering", "Filtro simple con menú", "FilterMode=\"GridFilterMode.SimpleWithMenu\"", "La fila de filtros suma un botón de operador por columna: contiene, empieza con, mayor que, es nulo y más.", "Operador por columna"),
        I("fltadv", "DataGrid · Filtering", "Filtro avanzado", "FilterMode=\"GridFilterMode.Advanced\"", "Embudo en el encabezado con dos condiciones por columna combinadas con Y / O, y botones Aplicar y Limpiar.", "Dos condiciones por columna"),
        I("fltcbl", "DataGrid · Filtering", "Filtro por lista de valores", "FilterMode=\"GridFilterMode.CheckBoxList\"", "Lista de valores distintos con conteo y búsqueda. Marca los que quieres ver, como en una planilla.", "Lista con conteo"),
        I("fltmixed", "DataGrid · Filtering", "Filtro mixto", "<TDColumn FilterMode=\"…\">", "Cada columna define su propio modo de filtro y conviven en la misma tabla.", "Un modo por columna"),
        I("fltapi", "DataGrid · Filtering", "API de filtros", "Filters=\"@_filters\" · grid.setFilter()", "Aplica filtros desde fuera de la tabla: desde el servidor con FilterDescriptors o desde el navegador con la API del custom element.", "Filtros externos"),
        I("selsingle", "DataGrid · Selection", "Selección simple", "SelectionMode=\"GridSelection.Single\"", "Una fila a la vez con @bind-Value. Muestra el detalle del repuesto elegido y funciona con teclado.", "Simple y múltiple, con teclado"),
        I("selmulti", "DataGrid · Selection", "Selección múltiple", "SelectionMode=\"GridSelection.Multiple\"", "Casillas por fila, seleccionar todo con estado parcial, rangos con Shift y barra de acciones en lote.", "Casillas y rangos"),
        I("sortsingle", "DataGrid · Sorting", "Orden simple", "AllowSorting=\"true\"", "Ordena por una columna a la vez. Cada clic alterna ascendente, descendente y sin orden; las columnas pueden excluirse.", "Una o varias columnas con prioridad"),
        I("sortmulti", "DataGrid · Sorting", "Orden múltiple", "AllowMultiColumnSorting=\"true\"", "Ordena por varias columnas con prioridad visible en el encabezado y un orden inicial definido por código.", "Prioridad visible"),
        I("cellmenu", "Data · DataGrid", "Menú contextual de celda", "CellContextMenu=\"OnCellContextMenu\"", "Clic derecho en una celda para copiar, filtrar por ese valor, ordenar o abrir la ficha. Accesible con Shift + F10 y navegación por celdas.", "Acciones con clic derecho en la celda"),
        I("inlineedit", "DataGrid · Edición", "Edición en línea", "EditMode=\"GridEditMode.Single\"", "Edita una fila completa con validación por campo. Agrega y elimina filas; cada guardado es un POST con data-enhance.", "En línea, en celda y en cascada"),
        I("incelledit", "DataGrid · Edición", "Edición en celda", "EditMode=\"GridEditMode.InCell\"", "Clic en una celda para editarla como en una planilla, y una variante fluida tipo Excel: la celda seleccionada ya acepta escritura directa.", "Edición tipo planilla"),
        I("cascade", "DataGrid · Edición", "Dropdowns en cascada", "<TDSelect DependsOn=\"…\">", "Marca → Modelo → Sistema: cada lista depende de la anterior y se reinicia al cambiarla.", "Marca, modelo y sistema"),
        I("condfmt", "Data · DataGrid", "Formato condicional", "RowRender · CellRender", "Aplica estilos a filas y celdas según reglas: agotados, pocas unidades, repuestos premium o datos antiguos.", "Estilos por reglas de negocio"),
        I("exportx", "Data · DataGrid", "Exportar a Excel y CSV", "AllowExport=\"GridExport.Excel | GridExport.Csv\"", "Exporta respetando filtros, orden y columnas visibles. Excel se genera en el servidor; CSV puede salir del navegador.", "Excel y CSV con filtros"),
        I("datatable", "Data", "DataGrid · DataTable", "<TDDataTable Data=\"@_table\">", "Enlaza un System.Data.DataTable y genera columnas y filas desde su esquema: ideal para resultados ADO.NET, procedimientos almacenados o datos legados sin modelo tipado.", "Columnas desde ADO.NET"),
        I("pager", "Data", "Pager", "<TDPager>", "Paginación con enlaces SSR: cada página es una URL navegable con enhanced navigation.", "Paginación con URLs SSR"),
        I("tree", "Data", "Tree", "<TDTree TItem=\"Category\">", "Navegación jerárquica de categorías con conteo por nodo.", "Jerarquía de categorías"),
        I("aichat", "Forms", "AI Chat", "<TDAIChat>", "Asistente conversacional sobre el catálogo con sugerencias rápidas y respuestas en streaming.", ""),
        I("chat", "Forms", "Chat", "<TDChat>", "Conversación entre cliente y asesor con indicador de escritura, burbujas y hora.", ""),
        I("label", "Forms", "Label", "<TDLabel For=\"…\">", "Etiquetas asociadas a su campo, con obligatorio, opcional, error y disposición en línea.", ""),
        I("autocomplete", "Forms", "AutoComplete", "<TDAutoComplete>", "Sugerencias mientras escribes con coincidencia resaltada y navegación con flechas.", ""),
        I("button", "Forms", "Button", "<TDButton>", "Primario, secundario, texto, peligro y deshabilitado; tamaños, íconos y estado de carga.", ""),
        I("togglebutton", "Forms", "ToggleButton", "<TDToggleButton>", "Botones que mantienen estado presionado, solos o como grupo exclusivo.", ""),
        I("checkbox", "Forms", "CheckBox", "<TDCheckBox>", "Casilla simple, deshabilitada y de tres estados para seleccionar todo.", ""),
        I("checkboxlist", "Forms", "CheckBoxList", "<TDCheckBoxList>", "Lista de casillas vertical u horizontal con seleccionar todo y opciones deshabilitadas.", ""),
        I("colorpicker", "Forms", "ColorPicker", "<TDColorPicker>", "Selector de color con tono, luminosidad, paleta y valor hexadecimal.", ""),
        I("date", "Forms", "DatePicker", "<TDDatePicker>", "Tres modos: fecha, fecha y hora, o solo hora. La fecha puede bloquear días anteriores.", ""),
        I("dropdown", "Forms", "DropDown", "<TDSelect>", "Nueve variantes de selección simple: básica, con búsqueda, agrupada, con plantilla, con borrar, con opciones deshabilitadas, con valor propio, virtualizada y deshabilitada.", ""),
        I("ddmulti", "Forms", "DropDown Múltiple", "<TDSelect Multiple=\"true\">", "Selección múltiple con chips, texto resumen, límite de selección, chips con desborde \"+N\" y grupos seleccionables.", ""),
        I("ddtree", "Forms", "DropDown Tree", "<TDDropDownTree>", "Desplegable con árbol jerárquico: selección simple, solo hojas o múltiple con casillas de tres estados. La búsqueda expande las coincidencias.", ""),
        I("htmleditor", "Forms", "HtmlEditor", "<TDHtmlEditor>", "Editor de texto enriquecido con barra completa o mínima, enlaces, colores, vista de código HTML, límite de caracteres y salida saneada.", ""),
        I("select", "Forms", "DropDown", "<TDSelect>", "Combobox con búsqueda local, selección simple o múltiple y navegación por teclado (↑ ↓ Enter Esc ⌫).", ""),
        I("ddgrid", "Forms", "DropDownDataGrid", "<TDDropDownDataGrid>", "Desplegable cuyo panel es una tabla con columnas y búsqueda: ideal para elegir repuestos.", ""),
        I("fab", "Forms", "FAB", "<TDFab>", "Botón de acción flotante: principal, pequeño y extendido con texto.", ""),
        I("fabmenu", "Forms", "FAB Menu", "<TDFab Menu=\"true\">", "Botón flotante que despliega acciones secundarias con etiqueta.", ""),
        I("fieldset", "Forms", "Fieldset", "<TDFieldset>", "Agrupa campos relacionados bajo una leyenda; se puede plegar.", ""),
        I("fileinput", "Forms", "FileInput", "<TDFileInput>", "Un archivo con nombre, tamaño y vista previa de imagen.", ""),
        I("photo", "Forms", "Foto", "<TDPhotoButton>", "Botón de cámara en tres tamaños. Toma o elige una foto, la comprime y permite verla en grande.", "Cámara"),
        I("photocapture", "Forms", "Varias fotos", "<TDPhotoCapture>", "Cámara que no se cierra. Cada toma entra en una colección y se puede quitar antes de enviarla.", "Ráfaga"),
        I("formfield", "Forms", "FormField", "<TDFormField>", "Etiqueta flotante con prefijo, sufijo y ayuda, en variantes outline, filled y flat.", ""),
        I("listbox", "Forms", "ListBox", "<TDListBox>", "Lista siempre visible con selección simple o múltiple, búsqueda y teclado.", ""),
        I("mask", "Forms", "Mask", "<TDMask>", "Formatea mientras escribes: patente, teléfono, RUT y fecha.", ""),
        I("numeric", "Forms", "Numeric", "<TDNumeric>", "Número con botones, mínimo, máximo, paso y formato de moneda.", ""),
        I("password", "Forms", "Password", "<TDTextBox InputType=\"password\">", "Mostrar u ocultar, medidor de seguridad y reglas en vivo.", ""),
        I("radiolist", "Forms", "RadioButtonList", "<TDRadioList>", "Opción única en tarjetas o en línea, con opciones deshabilitadas.", ""),
        I("rating", "Forms", "Rating", "<TDRating>", "Calificación con estrellas, vista previa al pasar el mouse y modo solo lectura.", ""),
        I("seccode", "Forms", "SecurityCode", "<TDSecurityCode>", "Código de un solo uso en casillas: avanza solo, retrocede con ⌫ y admite pegar.", ""),
        I("signature", "Forms", "SignaturePad", "<TDSignaturePad>", "Captura de firma con mouse, lápiz o dedo; exporta PNG.", ""),
        I("chip", "Forms", "Chip", "<TDChip>", "Etiquetas compactas: de filtro, removibles con avatar y en tres tamaños.", ""),
        I("chiplist", "Forms", "ChipList", "<TDChipList>", "Campo de etiquetas: agrega con Enter, quita con ⌫ y usa sugerencias.", ""),
        I("selectbar", "Forms", "SelectBar", "<TDSelectBar>", "Segmentos para pocas opciones: simple, múltiple y con íconos.", ""),
        I("slider", "Forms", "Slider", "<TDSlider>", "Valor único con marcas o rango con dos manijas.", ""),
        I("speech", "Forms", "SpeechToTextButton", "<TDSpeechToTextButton>", "Dicta en lugar de escribir usando el reconocimiento de voz del navegador.", ""),
        I("splitbtn", "Forms", "SplitButton", "<TDSplitButton>", "Acción principal con alternativas en un menú, en variante primaria o secundaria.", ""),
        I("switch", "Forms", "Switch", "<TDSwitch>", "Interruptor binario en tres tamaños, con etiqueta a la izquierda o deshabilitado.", ""),
        I("editform", "Forms", "EditForm", "<TDEditForm>", "Formulario con título, resumen de lo que falló, aviso si sales sin guardar y un solo envío a la vez.", "Alta"),
        I("form", "Forms", "TemplateForm", "<EditForm Enhance>", "Valida con regex mientras escribes. Al enviar, los errores del servidor vuelven mapeados al campo correcto.", ""),
        I("textarea", "Forms", "TextArea", "<TDTextBox Multiline=\"true\">", "Texto multilínea que crece con el contenido y contador de caracteres.", ""),
        I("textbox", "Forms", "TextBox", "<TDTextBox>", "Campo de texto básico, con ícono, botones de ícono al inicio y al final, borrar, contador, deshabilitado y solo lectura.", ""),
        I("timespan", "Forms", "TimeSpanPicker", "<TDTimeSpanPicker>", "Duraciones en días, horas y minutos con atajos; entrega TimeSpan e ISO 8601.", ""),
        I("upload", "Forms", "Upload", "<TDFileInput>", "Arrastra o selecciona archivos; valida tipo y tamaño antes de enviarlos.", ""),
        I("markdown", "Forms", "Markdown", "<TDMarkdown>", "Editor Markdown con barra de formato y vista previa en vivo: dividido, solo fuente o solo vista. La salida se sanea.", ""),
        I("accordion", "Navegación", "Accordion", "<TDAccordion>", "Secciones plegables, una a la vez o varias abiertas, con ícono, contador y elementos deshabilitados.", "Secciones plegables"),
        I("breadcrumb", "Navegación", "Breadcrumb", "<TDBreadcrumb>", "Ruta de navegación con separador chevron o barra, ícono de inicio y colapso de rutas largas.", "Ruta y acción dividida"),
        I("carousel", "Navegación", "Carousel", "<TDCarousel>", "Banner con rotación automática que se pausa al pasar el mouse, y carrusel de tarjetas de 3 por vista.", "Rotación automática"),
        I("ctxmenu", "Navegación", "ContextMenu", "<TDContextMenu>", "Menú de clic derecho con íconos, atajos, separadores, submenú y acciones deshabilitadas.", "Clic derecho"),
        I("link", "Navegación", "Link", "<TDLink>", "Enlaces estándar, con ícono, externos, discretos, deshabilitados, dentro de texto y con estilo de botón.", "Enlaces"),
        I("menu", "Navegación", "Menu", "<TDMenu>", "Barra de menú con submenús desplegables en variante oscura y clara, navegable con flechas.", "Barra de menú"),
        I("panelmenu", "Navegación", "PanelMenu", "<TDPanelMenu>", "Menú lateral por secciones con contadores, elemento activo y modo colapsado de solo íconos.", "Menú lateral"),
        I("profilemenu", "Navegación", "ProfileMenu", "<TDProfileMenu>", "Menú de usuario con avatar, datos de la cuenta, accesos, preferencias y cierre de sesión.", "Menú de usuario"),
        I("stepsx", "Navegación", "Steps", "<TDSteps>", "Pasos horizontales con navegación, seguimiento vertical del pedido e indicador compacto.", "Proceso por pasos"),
        I("tabsx", "Navegación", "Tabs", "<TDTabs>", "Pestañas subrayadas, en píldoras, verticales y con cierre, con teclado ← → y un solo tab stop.", "Pestañas con teclado"),
        I("toc", "Navegación", "TOC", "<TDToc>", "Tabla de contenidos que resalta la sección visible y desplaza al hacer clic, con barra de progreso.", "En esta página"),
        I("layout", "Layout", "Layout", "<TDLayout>", "Estructura de aplicación: header, sidebar, body y footer. El sidebar se colapsa y cambia de lado.", "Estructura de app"),
        I("stack", "Layout", "Stack", "<TDStack>", "Apila elementos en vertical u horizontal con gap, alineación, justificación, wrap y orden inverso.", "Apilado"),
        I("row", "Layout", "Row", "<TDRow>", "Grilla de 12 columnas con gap y alineación configurables.", "Fila de 12"),
        I("column", "Layout", "Column", "<TDCol Size=\"…\">", "Columnas con tamaño por breakpoint, offset y order. Cambia el ancho del contenedor para verlas responder.", "Columnas responsivas"),
        I("card", "Layout", "Card", "<TDCard>", "Tarjetas de producto, con header y footer, de indicador, enlace y horizontal, en variantes outlined, elevated y flat.", "Tarjetas"),
        I("cardgroup", "Layout", "CardGroup", "<TDCardGroup>", "Grupo de tarjetas unidas o separadas, con columnas automáticas o fijas.", "Grupo de tarjetas"),
        I("dialog", "Layout", "Dialog", "<TDDialog>", "Diálogos de confirmación, formulario con validación, panel lateral y modal obligatorio. Atrapa el foco y lo devuelve al cerrar.", "Diálogo"),
        I("dropzone", "Layout", "DropZone", "<TDDropZone>", "Arrastrar y soltar entre zonas, con alternativa completa por teclado.", "Arrastrar y soltar"),
        I("panel", "Layout", "Panel", "<TDPanel>", "Contenedor con encabezado, acciones y footer; plegable o fijo.", "Panel"),
        I("popup", "Layout", "Popup", "<TDPopup>", "Contenido flotante anclado a un elemento, en cuatro posiciones. Cierra con clic fuera o Esc.", "Popup"),
        I("splitter", "Layout", "Splitter", "<TDSplitter>", "Paneles redimensionables en horizontal y vertical, con mouse, táctil o teclado.", "Paneles"),
        I("tilelayout", "Layout", "TileLayout", "<TDTileLayout>", "Tablero de tarjetas que se reordenan arrastrando y cambian de ancho.", "Tablero"),
        I("qrcode", "Códigos", "QRCode", "<TDQrCode>", "Generador QR nativo: UTF-8, corrección L, M, Q y H, color, zona en blanco y descarga PNG o SVG.", "Código QR"),
        I("barcode", "Códigos", "Barcode", "<TDBarcode>", "Código de barras Code 128, EAN-13 y EAN-8 con dígito verificador, color y descarga PNG o SVG.", "Código de barras"),
        I("labeldesigner", "Códigos", "LabelDesigner", "<TDLabelDesigner>", "Diseña etiquetas térmicas en milímetros, inserta variables del catálogo, genera ZPL y envía copias o un lote JSON.", "Etiquetas térmicas"),
        I("reportdesigner", "Códigos", "ReportDesigner", "<TDReportDesigner>", "Diseñador de reportes por bandas: encabezado, detalle y pie. Define parámetros, guarda la plantilla .uxr y previsualiza la impresión.", "Reportes"),
        I("printers", "Códigos", "PrinterConnect", "<TDPrinterConnect>", "Busca impresoras Bluetooth, agrega equipos por Wi‑Fi y deja una como predeterminada, con prueba de impresión y consola.", "Impresoras"),
        I("econtent", "Layout", "TDContent", "<TDContent>", "Como un div, pero pensado para escuchar atajos y combinaciones de teclado dentro de su área.", "Atajos de teclado"),
        I("ehid", "Códigos", "HidListener", "<TDHidListener>", "Escucha el teclado que emite un lector USB o Bluetooth, sin exigir foco en un campo, y marca si el código está en el catálogo.", "Lector HID"),
        I("scanner", "Códigos", "Scanner", "<TDScanner>", "Lee códigos con la cámara o con un lector tipo teclado, confirma la coincidencia en el catálogo y exporta el registro.", "Escáner"),
        I("inplace", "Forms", "Inplace", "<TDInplace>", "Muestra un valor y lo cambia por su editor en el mismo lugar.", ""),
        I("chline", "Charts", "Línea y área", "<TDChart> · <TDLineSeries>", "Series de tiempo en línea, área o escalón, suavizadas o rectas, con marcadores, leyenda que oculta series y lectura por punto.", "Línea y área"),
        I("chcol", "Charts", "Columnas y barras", "<TDColumnSeries>", "Agrupadas, apiladas o al 100 %, verticales u horizontales, con línea de meta combinada.", "Columnas"),
        I("chpie", "Charts", "Pie y donut", "<TDPieSeries>", "Participación por segmento con porcentajes, total al centro y segmento resaltado al pasar el mouse.", "Pie"),
        I("chscatter", "Charts", "Dispersión y burbujas", "<TDScatterSeries>", "Relación entre dos variables con tamaño por una tercera, color por categoría y línea de tendencia.", "Dispersión"),
        I("chgauge", "Charts", "Gauges", "<TDRadialGauge>", "Indicador radial con rangos y aguja, y arco de progreso contra meta.", "Gauges"),
        I("chspark", "Charts", "Sparklines y KPI", "<TDSparkline>", "Tarjetas de indicador con valor, variación y mini gráfico de tendencia.", "KPI"),
        I("chheat", "Charts", "Heatmap", "<TDHeatmap>", "Matriz de intensidad: pedidos por día y hora, con escala de color y lectura por celda.", "Heatmap"),
        I("chwf", "Charts", "Waterfall", "<TDWaterfallSeries>", "Puente de valor: cómo se llega de las ventas al margen, sumando y restando cada componente.", "Waterfall"),
        I("chfunnel", "Charts", "Funnel", "<TDFunnelSeries>", "Embudo de conversión con porcentaje de paso entre etapas y pérdida acumulada.", "Funnel"),
        I("chpareto", "Charts", "Pareto · ABC", "<TDParetoChart>", "Barras ordenadas con curva acumulada y clasificación ABC para priorizar inventario.", "Pareto"),
        I("chtree", "Charts", "Treemap", "<TDTreemap>", "Jerarquía por área: categoría y subcategoría proporcionales al valor.", "Treemap"),
        I("chradar", "Charts", "Radar", "<TDRadarSeries>", "Comparación multicriterio de proveedores en seis ejes.", "Radar"),
        I("chsankey", "Charts", "Sankey", "<TDSankey>", "Flujos entre nodos: despachos de cada bodega a cada región.", "Sankey"),
        I("chbullet", "Charts", "Bullet", "<TDBulletChart>", "KPI contra meta con bandas de desempeño en poco espacio.", "Bullet"),
        I("chgantt", "Charts", "Gantt", "<TDGantt>", "Planificación de despachos por día con avance y marca de hoy.", "Gantt"),
        I("chforecast", "Charts · Gerencia", "Pronóstico", "<TDForecastChart>", "Real vs pronóstico con intervalo de confianza del 80 % y 95 %, y la brecha contra el presupuesto.", "Pronóstico"),
        I("chvariance", "Charts · Gerencia", "Presupuesto vs real", "<TDVarianceChart>", "Desviación por área contra presupuesto, ordenada por impacto, con semáforo y total.", "Varianza"),
        I("chquadrant", "Charts · Gerencia", "Matriz de portafolio", "<TDQuadrantChart>", "Cuadrante crecimiento vs margen con tamaño por venta: dónde invertir, mantener o salir.", "Portafolio"),
        I("chcohort", "Charts · Gerencia", "Cohortes de retención", "<TDCohortChart>", "Retención mensual de clientes por mes de alta: qué tan bien se quedan las flotas nuevas.", "Cohortes"),
        I("chmekko", "Charts · Gerencia", "Marimekko", "<TDMarimekko>", "Participación en dos dimensiones: ancho por región y alto por categoría.", "Marimekko"),
        I("chslope", "Charts · Gerencia", "Slope · ranking", "<TDSlopeChart>", "Cambio de posición y valor entre dos periodos por sucursal.", "Slope"),
        I("chdumbbell", "Charts · Gerencia", "Dumbbell · antes y después", "<TDDumbbellChart>", "Brecha entre dos valores por fila: tiempo de entrega antes y después del plan de mejora.", "Dumbbell"),
        I("chcontrol", "Charts · Gerencia", "Control estadístico", "<TDControlChart>", "Gráfico de control (SPC) con media y límites de 3σ; marca los puntos fuera de control.", "SPC"),
        I("toolbar", "Navegación", "Toolbar", "<TDToolbar>", "Barra de acciones con zonas Start, Center y End: botones, separadores, búsqueda y selector de vista.", "Barra de acciones"),
        I("navmenu", "Navegación", "NavigationMenu", "<TDNavigationMenu>", "Menú de navegación con paneles amplios (mega menú): columnas de enlaces, destacado y descripciones.", "Mega menú"),
        I("pmenu", "Navegación", "MenuApp", "<TDMenuApp Source=\"menu.json\">", "Menú lateral de una app empresarial. Cada variante trae su ejemplo y su código: iconos, flotante, con o sin búsqueda, y búsqueda también en pantalla pequeña.", "Este mismo menú"),
        I("message", "Forms", "Message", "<TDMessage>", "Mensajes en línea por severidad: éxito, info, advertencia, error, secundario y contraste.", ""),
        I("knob", "Forms", "Knob", "<TDKnob>", "Control circular para valores numéricos: arrastrar, flechas, RePág/AvPág, Inicio/Fin.", ""),
        I("speeddial", "Forms", "SpeedDial", "<TDSpeedDial>", "Botón flotante que despliega acciones en línea, hacia la derecha, círculo, semicírculo, cuarto de círculo o con máscara.", ""),
        I("aos", "Utilidades", "AnimateOnScroll", "<TDAnimateOnScroll>", "Anima elementos al entrar en pantalla con IntersectionObserver: aparecer, deslizar, acercar o girar.", "Animación al scroll"),
        I("terminal", "Utilidades", "Terminal", "<TDTerminal>", "Consola de comandos con historial (↑ ↓), autocompletar (Tab) y comandos propios conectados a C#.", "Consola"),
        I("orgchart", "Utilidades", "OrganizationChart", "<TDOrganizationChart>", "Organigrama con líneas entre cada colaborador, ficha y correo en la tarjeta, y equipos que se pliegan.", "Organigrama"),
        I("pcarousel", "Media", "Carousel", "<TDCarousel TItem>", "Carrusel de datos con elementos visibles y paso configurables, modo circular y reproducción automática.", "Carrusel de datos"),
        I("compare", "Media", "Compare", "<TDCompare>", "Compara dos imágenes superpuestas con un divisor que se arrastra, se mueve con las flechas o sigue al mouse.", "Antes y después"),
        I("gallery", "Media", "Gallery", "<TDGallery>", "Visor con miniaturas, navegación, contador y pantalla completa con zoom.", "Galería"),
        I("ecard", "Ecommerce", "ProductCard", "<TDProductCard>", "Tarjeta de producto con badges, calificación, stock, precio con descuento, favoritos, agregar rápido y comparar.", "Tarjeta de producto"),
        I("edetail", "Ecommerce", "ProductDetail", "<TDProductDetail>", "Ficha de producto: galería, variantes, cantidad, precio por volumen, disponibilidad por bodega y compra.", "Ficha"),
        I("ecart", "Ecommerce", "CartDrawer", "<TDCartDrawer>", "Carrito lateral con cantidades, cupón, barra de envío gratis, resumen y productos sugeridos.", "Carrito"),
        I("echeckout", "Ecommerce", "Checkout", "<TDCheckout>", "Checkout en 4 pasos con validación: datos, despacho, pago y confirmación.", "Checkout"),
        I("efacets", "Ecommerce", "FacetedSearch", "<TDFacetedSearch>", "Búsqueda por facetas: marca, categoría, rango de precio y stock, con contadores y filtros activos.", "Facetas"),
        I("esearch", "Ecommerce", "SearchSuggest", "<TDSearchSuggest>", "Buscador instantáneo con sugerencias, categorías, productos con precio y búsquedas recientes.", "Sugerencias"),
        I("ecompare", "Ecommerce", "CompareProducts", "<TDCompareProducts>", "Comparador de hasta 4 productos con resaltado de diferencias y mejor valor por fila.", "Comparar"),
        I("eflash", "Ecommerce", "FlashSale", "<TDFlashSale>", "Oferta relámpago con cuenta regresiva, barra de unidades vendidas y precio tachado.", "Oferta"),
        I("ereviews", "Ecommerce", "Reviews", "<TDReviews>", "Reseñas con resumen, histograma por estrellas, filtros, orden, votos útiles y formulario.", "Reseñas"),
        I("efinder", "Ecommerce", "PartFinder", "<TDPartFinder>", "Buscador por vehículo: marca, modelo, año y sistema, o por patente, con repuestos compatibles.", "Por vehículo"),
        I("scheduler", "Media", "Scheduler", "<TDScheduler>", "Agenda de trabajos con vistas Día, Semana, Mes, Agenda y Recursos. Arrastra para mover o cambiar de día y recurso.", "Agenda"),
        I("equote", "Ecommerce", "QuoteRequest", "<TDQuoteRequest>", "Cotizador para pedidos grandes: agrega productos con cantidad, deja notas y envía la solicitud a un asesor.", "Cotizar"),
        I("ebulk", "Ecommerce", "BulkOrder", "<TDBulkOrder>", "Carga masiva por código y cantidad (pegado o CSV), valida cada línea contra el catálogo.", "Pedido masivo"),
        I("erecent", "Ecommerce", "RecentlyViewed", "<TDRecentlyViewed>", "Historial de productos vistos recientemente, con acceso rápido para volver a revisarlos.", "Vistos"),
        I("estock", "Ecommerce", "StockAlert", "<TDStockAlert>", "Aviso de reingreso: suscríbete a un producto agotado y recibe un correo cuando vuelva a haber stock.", "Alerta de stock"),
        I("ewishmulti", "Ecommerce", "Wishlists", "<TDWishlists>", "Listas de favoritos organizadas por proyecto o vehículo, para mover y compartir productos entre listas.", "Favoritos"),
        I("etrack", "Ecommerce", "OrderTracking", "<TDOrderTracking>", "Seguimiento de pedido con línea de tiempo de estados, número de guía y ETA de despacho.", "Seguimiento"),
        I("efbt", "Ecommerce", "FrequentlyBought", "<TDFrequentlyBought>", "Combos sugeridos: productos que se compran juntos, con casillas para incluir cada uno y precio combinado.", "Comprados juntos"),
        I("elocator", "Ecommerce", "StoreLocator", "<TDStoreLocator>", "Buscador de sucursales y bodegas con horario, stock disponible del producto y cómo llegar.", "Sucursales"),
        I("ecredit", "Ecommerce", "CreditDashboard", "<TDCreditDashboard>", "Panel de crédito de flota: línea disponible, facturas por vencer y pagos.", "Crédito"),
        I("ereturns", "Ecommerce", "ReturnsRMA", "<TDReturnsRMA>", "Asistente de devolución en pasos: elegir pedido y producto, motivo, y método de reembolso o cambio.", "Devoluciones"),
        I("imageview", "Media", "Image", "<TDImage Preview Download>", "Imagen con vista previa: clic para agrandar, zoom con rueda o botones, arrastre, giro y descarga.", "Imagen"),
        I("maps", "Mapas", "Pilotos", "<TDMaps>", "Uno o varios pilotos o vehículos en un mapa abierto. La ficha aparece sobre la marca y la posición se mueve cuando llegan nuevas coordenadas. La lista de coordenadas de cada piloto se reconstruye por calles.", "Flota en el mapa"),
        I("maptrace", "Mapas", "Recorrido", "<TDMaps MatchRoute=\"true\">", "Reconstruye por calles la ruta ya recorrida a partir de la lista de coordenadas por donde pasó el piloto.", "Ruta ya recorrida"),
        I("mapuser", "Mapas", "Mi ubicación", "<TDMapUser>", "Sigue la geolocalización del equipo de quien tiene la sesión abierta y dibuja el recorrido de esta visita.", "Dónde estoy"),
        I("locate", "Mapas", "Ubicación actual", "<TDLocate>", "Un botón que, al hacer clic, lee la ubicación actual de este equipo y deja latitud, longitud y precisión listas para el formulario.", "Obtener mi ubicación"),
        I("maproute", "Mapas", "Ruta de entregas", "<TDMapRoute>", "Calcula el camino por calles desde la salida hasta la llegada, pasando por las entregas en el orden indicado.", "De A a B con entregas"),
        I("modal", "Overlays", "Modal", "<TDDialog>", "Se abre sin ida y vuelta al servidor. Atrapa el foco, cierra con Esc y envía su formulario interno por SSR.", "Diálogo con foco atrapado"),
        I("drawer", "Overlays", "Drawer", "<TDDrawer Side=\"Right\">", "Panel lateral con transición CSS para filtros y navegación. El conteo se recalcula localmente.", "Panel lateral"),
        I("tip", "Overlays", "Tooltip", "<TDTooltip>", "Ayuda contextual con hover o foco de teclado; Esc la oculta.", "Ayuda contextual"),
        I("alert", "Feedback", "Alert", "<TDAlert>", "Mensajes en línea con color, ícono y texto. Nunca solo color.", "Mensajes en línea"),
        I("badge", "Feedback", "Badge", "<TDBadge>", "Estados de stock, etiquetas y contadores.", "Estados y contadores"),
        I("toast", "Feedback", "Notification", "<TDNotificationHost>", "Notificaciones apiladas con aria-live; se cierran solas a los 4 s.", "Avisos apilados"),
        I("progress", "Feedback", "Progress y Loader", "<TDProgressBar>", "Progreso determinado y carga indeterminada con las barras de velocidad.", "Barra y loader"),
        I("skel", "Feedback", "Skeleton", "<TDSkeleton>", "Placeholder con el mismo alto que el componente hidratado: sin FOUC ni saltos de layout.", "Placeholder sin FOUC"),
        I("chart", "Charts", "Barras CSS", "<TDBarChart>", "Gráfico de barras en CSS puro, sin librerías de charting.", "Barras en CSS"),
        I("mphone", "Mobile", "Pantalla de recepción", "<TDAppBar>", "Teléfono de bodega armado: barra, turno, pasos, escaneo, cantidad, confirmación y navegación inferior.", "Flujo completo"),
        I("mappbar", "Mobile", "Barra de pantalla", "<TDAppBar>", "Barra superior de un teléfono de bodega: título, turno y volver a las tareas.", "Título y volver"),
        I("mbottom", "Mobile", "Navegación inferior", "<TDBottomNav>", "Secciones al alcance del pulgar, con la actual marcada y el conteo de pendientes.", "Pulgar"),
        I("mscan", "Mobile", "Resultado de escaneo", "<TDScanCard>", "Lo que el sistema resolvió después de leer un código: artículo, ubicación, existencia y la acción que sigue.", "Después del lector"),
        I("mqty", "Mobile", "Teclado de cantidad", "<TDQtyPad>", "Cantidad grande para guantes, con mínimo, máximo y el valor que viaja en el post.", "Unidades"),
        I("mjobs", "Mobile", "Cola de tareas", "<TDJobList>", "Trabajos del turno: recibir, guardar o contar, con lugar, estado y plazo.", "Recibir, guardar, contar"),
        I("mbin", "Mobile", "Ficha de ubicación", "<TDBinCard>", "Pasillo, rack, nivel y casillero, con el artículo y cuánto hay ahí.", "Pasillo y casillero"),
        I("msheet", "Mobile", "Confirmación", "<TDConfirmSheet>", "Hoja al pie antes de mover mercadería: qué va a pasar, cancelar o pedir ayuda.", "Antes de guardar"),
        I("mshift", "Mobile", "Turno del operador", "<TDShiftBar>", "Quién opera, en qué bodega, si hay conexión y cuántos movimientos esperan sincronizarse.", "Conexión y sincronía"),
        I("mpick", "Mobile", "Línea de picking", "<TDPickLine>", "Desde dónde retirar, cuánto pide la orden y cuánto ya se tomó.", "Retiro"),
        I("msteps", "Mobile", "Pasos del flujo", "<TDJobSteps>", "Recepción o almacenaje en pasos: el actual se nombra y los demás dicen si están hechos o pendientes.", "Recepción"),
        I("mcards", "Mobile", "Carrusel de tarjetas", "<TDCardCarousel>", "Tarjetas que rotan. El encabezado dice cuál es y cuántas hay. Auto enciende o apaga el giro.", "Tarjeta 1 de N"),
        I("micon", "Mobile", "Botón de ícono", "<TDButtonIcon>", "Botón cuadrado de pulgar con un ícono de Material Symbols y un nombre accesible.", "Ícono"),
        I("omuelle", "Mobile", "Tablero de muelles", "<TDDockBoard>", "Puertas del andén: transportista, estado y cuándo sale. Una lista vacía no inventa un muelle.", "Andén"),
        I("oconteo", "Mobile", "Diferencia de conteo", "<TDCountDiff>", "Existencia del sistema contra lo contado. El aviso dice si falta, sobra o coincide.", "Esperado y contado"),
        I("oincidencia", "Mobile", "Incidencia", "<TDIssueCard>", "Qué pasó, qué hacer ahora y a quién pedir ayuda. El color no es el único aviso.", "Qué pasó"),
        I("oruta", "Mobile", "Parada de ruta", "<TDRouteStop>", "Cliente, ventana, bultos y si la parada va en ruta, entregada o demorada.", "Entrega"),
        I("opallet", "Mobile", "Armado de pallet", "<TDPalletBuild>", "Capas y peso contra el máximo. Si mezcla artículos o se pasa de peso, lo dice.", "Capas y peso"),
        I("orelevo", "Mobile", "Nota de relevo", "<TDShiftNote>", "Lo que dejó el turno anterior y cuántas tareas siguen abiertas.", "Cambio de turno"),
        I("oreponer", "Mobile", "Reposición", "<TDReplenLine>", "De la reserva al picking: cuánto hay que mover y cuánto ya se movió.", "Reserva a picking"),
        I("oubicacion", "Mobile", "Ubicación sugerida", "<TDSlotCheck>", "Compara la ubicación del sistema con la escaneada y dice si se puede dejar el artículo.", "Sugerida y leída"),
        I("ocalidad", "Mobile", "Lote en calidad", "<TDQcHold>", "Lote retenido, cuántas unidades y quién puede liberarlo.", "Retención"),
        I("odespacho", "Mobile", "Cierre de despacho", "<TDDispatchCard>", "Orden, andén, salida y sello. La acción dice qué se cierra.", "Salida"),
        I("recibo", "Mobile", "Entrada de mercadería", "<TDReceiptHeader>", "Orden, proveedor y muelle, con las líneas pedidas y las ya recibidas.", "Documento"),
        I("rlinea", "Mobile", "Línea recibida", "<TDReceiptLine>", "Unidades pedidas contra unidades recibidas. El aviso dice si falta o sobra.", "Pedido y recibido"),
        I("aviso", "Mobile", "Aviso de despacho", "<TDAsnMatch>", "Bultos que declara el aviso contra los contados en el camión.", "Bultos"),
        I("rsello", "Mobile", "Sello de llegada", "<TDSealCheck>", "Sello del aviso contra el leído en la puerta, y si está intacto.", "Antes de descargar"),
        I("rlote", "Mobile", "Lote y vencimiento", "<TDLotCapture>", "Lote, vencimiento y unidades. Sin lote o sin fecha no entra a stock.", "Trazabilidad"),
        I("revision", "Mobile", "Revisión del producto", "<TDInspectList>", "Criterios con resultado escrito: cumple, no cumple o pendiente.", "Criterios"),
        I("dano", "Mobile", "Unidades dañadas", "<TDDamageNote>", "Qué se vio, cuántas unidades y qué hacer con ellas.", "Daño"),
        I("rtemp", "Mobile", "Temperatura", "<TDTempCheck>", "Lectura contra el rango. Fuera de rango no se ingresa.", "Cadena de frío"),
        I("etiqueta", "Mobile", "Etiqueta del producto", "<TDLabelCheck>", "Código de la orden contra el impreso, y si la etiqueta se lee.", "Código impreso"),
        I("decision", "Mobile", "Decisión de ingreso", "<TDDisposition>", "Aceptar a stock, devolver al proveedor o mandar a calidad, con la consecuencia.", "Qué pasa"),
    ];

    public static IReadOnlyList<IGrouping<string, CatalogItem>> Groups =>
        All.GroupBy(item => item.Group).ToArray();

    public static int Count => All.Count;

    public static CatalogItem? Find(string? id) =>
        All.FirstOrDefault(item => string.Equals(item.Id, id, StringComparison.OrdinalIgnoreCase));

    public static IReadOnlyList<string> HomeCardGroups { get; } =
        ["Fundamentos", "Data", "Navegación", "Overlays", "Feedback", "Charts"];

    public static IReadOnlyList<CatalogItem> HomeCards(string group) => group switch
    {
        "Fundamentos" => All.Where(i => i.Group == "Fundamentos").ToArray(),
        "Data" => All.Where(i => i.Id is "grid" or "coltemplate" or "fltsimple" or "selsingle"
            or "sortsingle" or "cellmenu" or "inlineedit" or "condfmt" or "exportx"
            or "datatable" or "pager" or "tree").ToArray(),
        "Navegación" => All.Where(i => i.Id is "tabsx" or "breadcrumb" or "stepsx" or "accordion").ToArray(),
        "Overlays" => All.Where(i => i.Group == "Overlays").ToArray(),
        "Feedback" => All.Where(i => i.Group == "Feedback").ToArray(),
        "Charts" => All.Where(i => i.Id == "chart").ToArray(),
        _ => [],
    };

    public static IReadOnlyList<CatalogItem> Forms =>
        All.Where(i => i.Group == "Forms").ToArray();

    public static IReadOnlyList<CatalogCode> InstallCodes { get; } =
    [
        new("Terminal", "bash", "dotnet add package TDComponents"),
        new("Program.cs", "c#", """
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddRazorComponents();
            builder.Services.AddTDComponents();

            var app = builder.Build();
            app.UseAntiforgery();
            app.MapStaticAssets();
            app.MapRazorComponents<App>();
            app.Run();
            """),
        new("App.razor", "razor", """
            <!DOCTYPE html>
            <html lang="es" data-td-theme="modern" data-theme="light">
            <head>
                <link rel="stylesheet" href="_content/TDComponents/css/td.css" />
                <HeadOutlet />
            </head>
            <body>
                <Routes />
                <script src="_framework/blazor.web.js"></script>
                <script type="module" src="_content/TDComponents/js/td.js"></script>
            </body>
            </html>
            """),
        new("_Imports.razor", "razor", """
            @using TDComponents
            @using TDComponents.Components
            """),
    ];

    private static CatalogItem I(string id, string group, string title, string tag, string description, string summary) =>
        new(id, group, title, tag, description, summary);
}
