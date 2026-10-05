namespace TDComponents;

/// <summary>Opción de una lista de formulario: select, radios, casillas, listbox o barra.</summary>
/// <param name="Value">Valor que se envía. No es el texto visible.</param>
/// <param name="Label">Texto que ve la persona.</param>
/// <param name="Group">Encabezado de grupo en <c>TDSelect</c>. Se pinta cuando cambia respecto de la opción anterior.</param>
/// <param name="Disabled">La opción no se puede elegir.</param>
/// <param name="Hint">Segunda línea. La muestran <c>TDSelect</c> y <c>TDRadioList</c>.</param>
/// <param name="Count">Reservado. Los componentes de Forms no lo pintan.</param>
/// <param name="Icon">Reservado. <c>TDSelectBar</c> no lo pinta por sí solo.</param>
public sealed record TDOption(
    string Value,
    string Label,
    string? Group = null,
    bool Disabled = false,
    string? Hint = null,
    int? Count = null,
    string? Icon = null);

/// <summary>Gravedad de un aviso en línea (<c>TDMessage</c>).</summary>
public enum TDSeverity
{
    /// <summary>Información neutra. Rol de estado, no de alerta.</summary>
    Info,

    /// <summary>La operación terminó bien.</summary>
    Success,

    /// <summary>Hay un riesgo o un dato a revisar. Rol de alerta.</summary>
    Warning,

    /// <summary>El paso no puede continuar. Rol de alerta.</summary>
    Danger,

    /// <summary>Aviso de menor énfasis que la información.</summary>
    Secondary
}

/// <summary>Disposición de un grupo de opciones.</summary>
public enum TDOrientation
{
    /// <summary>Una opción debajo de la otra. Valor por defecto.</summary>
    Vertical,

    /// <summary>Opciones en la misma fila. Úsalo cuando son dos o tres y el texto es corto.</summary>
    Horizontal
}

/// <summary>Lado del texto respecto de un <c>TDSwitch</c>.</summary>
public enum TDLabelPosition
{
    /// <summary>El texto queda a la derecha del interruptor. Valor por defecto.</summary>
    End,

    /// <summary>El texto queda a la izquierda del interruptor.</summary>
    Start
}

/// <summary>Relieve de <c>TDCard</c>.</summary>
public enum TDCardVariant
{
    /// <summary>Borde, sin sombra. Es el defecto.</summary>
    Outlined,

    /// <summary>Tarjeta elevada sobre la superficie.</summary>
    Elevated,

    /// <summary>Sin borde ni sombra.</summary>
    Flat
}

/// <summary>Disposición de <c>TDTabs</c>.</summary>
public enum TDTabsVariant
{
    /// <summary>Pestañas con línea inferior. Es el defecto.</summary>
    Underline,

    /// <summary>Pestañas en forma de pastilla.</summary>
    Pills,

    /// <summary>Pestañas apiladas a un lado del contenido.</summary>
    Vertical
}

/// <summary>Énfasis de <c>TDBadge</c>.</summary>
public enum TDBadgeVariant
{
    /// <summary>Neutro. Es el defecto.</summary>
    Neutral,

    /// <summary>Resultado favorable.</summary>
    Success,

    /// <summary>Atención, sin ser un error.</summary>
    Warning,

    /// <summary>Error o estado crítico.</summary>
    Danger,

    /// <summary>Información.</summary>
    Info,

    /// <summary>Acento de la marca.</summary>
    Primary
}

/// <summary>Aviso flotante de <c>TDToast</c>.</summary>
/// <param name="Title">Título corto.</param>
/// <param name="Text">Detalle del aviso.</param>
/// <param name="Severity">Gravedad. El defecto es <see cref="TDSeverity.Info"/>.</param>
public sealed record TDToastItem(string Title, string Text, TDSeverity Severity = TDSeverity.Info);

/// <summary>Nodo de <c>TDDropDownTree</c>.</summary>
/// <param name="Value">Valor que se envía.</param>
/// <param name="Label">Texto visible del nodo.</param>
/// <param name="Children">Hijos. <c>null</c> si es una hoja.</param>
/// <param name="Disabled">El nodo no se puede elegir.</param>
public sealed record TDTreeOption(string Value, string Label, IReadOnlyList<TDTreeOption>? Children = null, bool Disabled = false);

/// <summary>Pieza de <c>TDGallery</c>.</summary>
/// <param name="Title">Nombre visible.</param>
/// <param name="Code">Código o referencia.</param>
/// <param name="Background">Color o fondo de la miniatura.</param>
public sealed record TDGalleryItem(string Title, string Code, string Background);

/// <summary>Acción de <c>TDSpeedDial</c>. En ese control se usan <paramref name="Text"/>, <paramref name="Href"/> e <paramref name="Icon"/>.</summary>
/// <param name="Text">Etiqueta visible y nombre accesible.</param>
/// <param name="Href">Destino. Si se omite, el enlace queda en <c>#</c>.</param>
/// <param name="Children">Subítems. <c>TDSpeedDial</c> no los despliega.</param>
/// <param name="Disabled">Reservado para menús. <c>TDSpeedDial</c> no lo aplica.</param>
/// <param name="Shortcut">Atajo de teclado visible en menús. <c>TDSpeedDial</c> no lo muestra.</param>
/// <param name="Icon">Marcado SVG. Si es null y <paramref name="Text"/> es Llamar, WhatsApp, Cotizar o Rastrear, el componente pone un ícono propio.</param>
public sealed record TDMenuItem(string Text, string? Href = null, IReadOnlyList<TDMenuItem>? Children = null, bool Disabled = false, string? Shortcut = null, string? Icon = null);

/// <summary>Persona de <c>TDOrganizationChart</c>.</summary>
/// <param name="Id">Identificador estable. Sirve para la ficha y para <c>SelectedId</c>.</param>
/// <param name="Name">Nombre visible. Si hay <paramref name="Href"/>, el nombre es el enlace a la ficha.</param>
/// <param name="Role">Cargo bajo el nombre.</param>
/// <param name="Initials">Iniciales del avatar.</param>
/// <param name="Children">Personas que reportan a este nodo.</param>
/// <param name="Href">Destino del nombre. En el catálogo es la ficha de la persona.</param>
/// <param name="Email">Correo. El componente muestra un enlace «Correo» con este destino.</param>
public sealed record TDOrgNode(
    string Id,
    string Name,
    string Role,
    string Initials,
    IReadOnlyList<TDOrgNode>? Children = null,
    string? Href = null,
    string? Email = null);

/// <summary>Diapositiva de <c>TDCarousel</c>.</summary>
/// <param name="Eyebrow">Línea pequeña sobre el título.</param>
/// <param name="Title">Título de la diapositiva.</param>
/// <param name="Text">Texto de apoyo.</param>
/// <param name="Action">Etiqueta de la acción.</param>
/// <param name="Background">Fondo. El defecto es negro.</param>
/// <param name="Accent">Color de acento. El defecto es el rojo de la marca.</param>
public sealed record TDSlide(
    string Eyebrow,
    string Title,
    string Text,
    string Action,
    string Background = "#0A0B0C",
    string Accent = "#ED2A24");

/// <summary>Alineación cruzada de <c>TDStack</c> y <c>TDRow</c>.</summary>
public enum TDAlignItems
{
    /// <summary>Los hijos ocupan el eje cruzado. Es el defecto.</summary>
    Stretch,

    /// <summary>Los hijos se alinean al inicio.</summary>
    Start,

    /// <summary>Los hijos se centran.</summary>
    Center,

    /// <summary>Los hijos se alinean al final.</summary>
    End
}

/// <summary>Reparto de <c>TDStack</c> en el eje principal.</summary>
public enum TDJustify
{
    /// <summary>Juntos al inicio. Es el defecto.</summary>
    Start,

    /// <summary>Juntos al centro.</summary>
    Center,

    /// <summary>Juntos al final.</summary>
    End,

    /// <summary>El primer hijo al inicio y el último al final.</summary>
    Between
}

/// <summary>Lado en el que se abre <c>TDPopup</c> respecto del disparador.</summary>
public enum TDPlacement
{
    /// <summary>Debajo. Es el defecto.</summary>
    Bottom,

    /// <summary>Encima.</summary>
    Top,

    /// <summary>Al inicio, a la izquierda en una interfaz de izquierda a derecha.</summary>
    Start,

    /// <summary>Al final, a la derecha en una interfaz de izquierda a derecha.</summary>
    End
}

/// <summary>Qué parte de la fecha captura <c>TDDatePicker</c>.</summary>
public enum TDDateMode
{
    /// <summary>Solo fecha. El valor usa el formato <c>yyyy-MM-dd</c>.</summary>
    Date,

    /// <summary>Fecha y hora. El valor usa <c>yyyy-MM-ddTHH:mm</c>.</summary>
    DateTime,

    /// <summary>Solo hora. El valor usa <c>HH:mm</c>.</summary>
    Time
}

/// <summary>Mensaje inicial de <c>TDChat</c>.</summary>
/// <param name="Author">Nombre de quien escribió. El componente pinta <paramref name="Text"/> y <paramref name="Time"/>; el autor queda en el dato.</param>
/// <param name="Text">Contenido de la burbuja.</param>
/// <param name="Mine"><c>true</c> si la burbuja es de la persona actual y se alinea como salida.</param>
/// <param name="Time">Hora visible bajo el texto. Es un texto, no un <c>DateTime</c>.</param>
public sealed record TDChatMessage(string Author, string Text, bool Mine, string Time);

/// <summary>Tarjeta que se arrastra en <c>TDDropZone</c>.</summary>
/// <param name="Id">Identificador estable de la tarjeta.</param>
/// <param name="Title">Título visible.</param>
/// <param name="Meta">Dato secundario, por ejemplo un código.</param>
/// <param name="Zone">Valor de la zona donde empieza.</param>
public sealed record TDDropCard(string Id, string Title, string Meta, string Zone);

/// <summary>Baldosa de <c>TDTileLayout</c>.</summary>
/// <param name="Id">Identificador estable.</param>
/// <param name="Title">Nombre de la métrica.</param>
/// <param name="Value">Cifra principal.</param>
/// <param name="Hint">Aclaración bajo la cifra.</param>
/// <param name="Span">Columnas que ocupa. El defecto es 1.</param>
public sealed record TDTileItem(string Id, string Title, string Value, string Hint, int Span = 1);

/// <summary>Columna de enlaces dentro de un panel de <c>TDNavigationMenu</c>.</summary>
/// <param name="Title">Título de la columna.</param>
/// <param name="Links">Enlaces. <c>Label</c> es el texto y <c>Hint</c> puede ser el destino.</param>
public sealed record TDNavGroup(string Title, IReadOnlyList<TDOption> Links);

/// <summary>Entrada de primer nivel de <c>TDNavigationMenu</c>.</summary>
/// <param name="Text">Texto del ítem.</param>
/// <param name="Href">Destino directo. Si hay <paramref name="Groups"/>, el ítem abre un panel.</param>
/// <param name="Groups">Columnas del panel.</param>
/// <param name="Featured">Texto del bloque destacado.</param>
/// <param name="Panel">Forma del panel. El defecto es <c>columns</c>.</param>
/// <param name="FeaturedEyebrow">Línea pequeña del bloque destacado.</param>
/// <param name="FeaturedTitle">Título del bloque destacado.</param>
public sealed record TDNavMega(string Text, string? Href = null, IReadOnlyList<TDNavGroup>? Groups = null, string? Featured = null, string Panel = "columns", string? FeaturedEyebrow = null, string? FeaturedTitle = null);

/// <summary>Modo del marco de <c>TDMenuAppShell</c>.</summary>
public enum TDMenuShellMode
{
    /// <summary>Barra de íconos. Es el defecto.</summary>
    Icons,

    /// <summary>Menú flotante.</summary>
    Float
}

/// <summary>Fila de <c>TDDropDownDataGrid</c>.</summary>
/// <param name="Value">Valor que se envía al elegir la fila.</param>
/// <param name="Text">Texto que queda escrito en el campo cerrado.</param>
/// <param name="Cells">Celdas, en el mismo orden que <c>Columns</c>.</param>
/// <param name="Code">Código adicional. Opcional.</param>
public sealed record TDDdRow(string Value, string Text, IReadOnlyList<string> Cells, string? Code = null);

/// <summary>Datos de ejemplo que <c>TDLabelDesigner</c> puede volcar en la etiqueta.</summary>
/// <param name="Code">Código del repuesto.</param>
/// <param name="Name">Nombre del repuesto.</param>
/// <param name="Brand">Marca.</param>
/// <param name="Price">Precio ya formateado.</param>
/// <param name="Stock">Stock ya formateado.</param>
/// <param name="Url">Dirección que puede ir en el código QR.</param>
public sealed record TDLabelRecord(string Code, string Name, string Brand, string Price, string Stock, string Url);

/// <summary>Bahía, persona o equipo de <c>TDScheduler</c>.</summary>
/// <param name="Id">Identificador estable. Las citas lo usan en <c>ResourceId</c>.</param>
/// <param name="Name">Nombre visible, por ejemplo la bahía.</param>
/// <param name="Person">Persona a cargo. Opcional.</param>
/// <param name="Color">Color CSS de la cita. Si se omite, el calendario asigna uno.</param>
public sealed record TDScheduleResource(string Id, string Name, string? Person = null, string? Color = null);

/// <summary>Trabajo que muestra <c>TDScheduler</c>.</summary>
/// <param name="Id">Identificador estable. El componente lo conserva al guardar.</param>
/// <param name="Title">Texto visible.</param>
/// <param name="Date">Día, con formato <c>yyyy-MM-dd</c>.</param>
/// <param name="Start">Hora de inicio, <c>HH:mm</c>. El calendario visible va de 07:00 a 20:00.</param>
/// <param name="End">Hora de término, <c>HH:mm</c>. Tiene que ser posterior al inicio.</param>
/// <param name="ResourceId"><c>Id</c> de un <see cref="TDScheduleResource"/>.</param>
/// <param name="Note">Nota opcional.</param>
public sealed record TDAppointment(string Id, string Title, string Date, string Start, string End, string ResourceId, string? Note = null);

/// <summary>Serie de <c>TDChart</c>. Los valores siguen el orden de las categorías.</summary>
/// <param name="Name">Nombre de la serie, visible en la leyenda.</param>
/// <param name="Values">Un número por categoría. Si hay menos números que categorías, el resto queda en cero.</param>
public sealed record TDChartSeries(string Name, IReadOnlyList<decimal> Values);

/// <summary>Producto que muestra <c>TDEcom</c>.</summary>
/// <param name="Id">Identificador numérico estable. El carrito y la comparación lo usan.</param>
/// <param name="Code">Código visible.</param>
/// <param name="Name">Nombre del producto.</param>
/// <param name="Brand">Marca.</param>
/// <param name="Price">Precio en pesos, sin formato.</param>
/// <param name="Stock">Unidades. Cero se muestra como agotado.</param>
/// <param name="Category">Categoría, por ejemplo Frenos. Opcional.</param>
/// <param name="Fit">Aplicación o vehículo, por ejemplo Volvo FH 460. Opcional.</param>
public sealed record TDProduct(int Id, string Code, string Name, string Brand, decimal Price, int Stock = 0, string? Category = null, string? Fit = null);

/// <summary>Tono de un estado en un componente móvil. El texto del estado va aparte: el tono no es el único aviso.</summary>
public enum TDMobileTone
{
    /// <summary>Información neutra.</summary>
    Neutral,

    /// <summary>El paso puede continuar.</summary>
    Success,

    /// <summary>Hay algo que revisar antes de seguir.</summary>
    Warning,

    /// <summary>El paso está bloqueado.</summary>
    Danger
}

/// <summary>Destino de <c>TDBottomNav</c>.</summary>
/// <param name="Id">Identificador estable. <c>Active</c> lo compara con este valor.</param>
/// <param name="Label">Texto visible. Es el nombre de la sección, no un ícono suelto.</param>
/// <param name="Href">Dirección de la sección.</param>
/// <param name="Count">Pendientes. Cero no muestra contador.</param>
public sealed record TDMobileDest(string Id, string Label, string Href, int Count = 0);

/// <summary>Tarjeta de <c>TDCardCarousel</c>.</summary>
/// <param name="Title">Título de la tarjeta.</param>
/// <param name="Text">Texto de apoyo.</param>
/// <param name="Status">Estado escrito. El color no lo reemplaza.</param>
/// <param name="Tone">Énfasis del estado.</param>
/// <param name="ActionLabel">Texto de la acción. Dice la consecuencia.</param>
/// <param name="ActionHref">Destino de la acción. Sin él, la tarjeta no navega.</param>
public sealed record TDCarouselCard(string Title, string Text, string Status = "", TDMobileTone Tone = TDMobileTone.Neutral, string? ActionLabel = null, string? ActionHref = null);

/// <summary>Tarea de bodega que muestra <c>TDJobList</c>.</summary>
/// <param name="Id">Identificador estable.</param>
/// <param name="Title">Qué hay que hacer, en una frase.</param>
/// <param name="Place">Dónde, con pasillo y ubicación.</param>
/// <param name="Kind">Tipo de trabajo: recibir, recoger, guardar o contar.</param>
/// <param name="Status">Estado en palabras: Lista, En curso, Bloqueada o Pendiente.</param>
/// <param name="When">Cuándo, en lenguaje claro.</param>
/// <param name="Tone">Énfasis visual. El estado también va escrito en <paramref name="Status"/>.</param>
/// <param name="Href">Destino al abrir la tarea. Si se omite, la fila no es un enlace.</param>
public sealed record TDWarehouseJob(string Id, string Title, string Place, string Kind, string Status, string When, TDMobileTone Tone = TDMobileTone.Neutral, string? Href = null);

/// <summary>Puerta de andén que muestra <c>TDDockBoard</c>.</summary>
/// <param name="Id">Identificador estable.</param>
/// <param name="Door">Nombre de la puerta, por ejemplo Muelle 2.</param>
/// <param name="Carrier">Transportista o vehículo.</param>
/// <param name="Status">Estado en palabras: Libre, Descargando, Cargando o Bloqueada.</param>
/// <param name="When">Cuándo, en lenguaje claro.</param>
/// <param name="Tone">Énfasis. El estado también va escrito en <paramref name="Status"/>.</param>
/// <param name="Href">Destino al abrir la puerta. Si se omite, la fila no es un enlace.</param>
public sealed record TDDockDoor(string Id, string Door, string Carrier, string Status, string When, TDMobileTone Tone = TDMobileTone.Neutral, string? Href = null);

/// <summary>Criterio de una revisión de producto en <c>TDInspectList</c>.</summary>
/// <param name="Id">Identificador estable. Forma el campo del post.</param>
/// <param name="Label">Qué se revisa, en palabras.</param>
/// <param name="Result">Cumple, No cumple o Pendiente. El color no reemplaza este texto.</param>
/// <param name="Note">Detalle de lo observado. Puede omitirse.</param>
public sealed record TDInspectCheck(string Id, string Label, string Result, string? Note = null);

/// <summary>Impresora que muestra <c>TDPrinterConnect</c>.</summary>
/// <param name="Id">Identificador estable.</param>
/// <param name="Name">Nombre visible.</param>
/// <param name="Model">Modelo.</param>
/// <param name="Connection">Tipo de conexión, por ejemplo USB o red.</param>
/// <param name="Address">Dirección o puerto.</param>
/// <param name="Protocol">Protocolo de impresión.</param>
/// <param name="Dpi">Resolución.</param>
/// <param name="WidthMm">Ancho útil en milímetros.</param>
/// <param name="Connected">Está disponible ahora.</param>
/// <param name="IsDefault">Es la impresora predeterminada.</param>
/// <param name="Unreachable">Se intentó y no respondió.</param>
public sealed record TDPrinterDevice(
    string Id,
    string Name,
    string Model,
    string Connection,
    string Address,
    string Protocol,
    int Dpi,
    int WidthMm,
    bool Connected,
    bool IsDefault = false,
    bool Unreachable = false);
