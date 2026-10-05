namespace TDComponents.Architecture;

/// <summary>
/// Mapa para que una IA traduzca un pedido en lenguaje natural a un componente TD real.
/// No pinta nada. No es un control de la página.
/// </summary>
/// <remarks>
/// <para>Léelo antes de escribir un tag <c>TD*</c>. El valor de cada constante es el marcado. El resumen son las frases de la persona. Las observaciones son la regla que no se puede saltar.</para>
        /// <para>Procedimiento: 1) si el pedido es una pantalla con datos del sistema (alta, listado, ficha, carrito, tablero, foto, agenda, gráfico, tienda, teléfono de bodega), usa <see cref="Pantallas"/>. 2) si es un control suelto, elige la constante cuya frase coincida; si hay dos, usa la más específica. 3) copia el valor. 4) abre el XML de ese componente y usa solo parámetros que existan ahí. 5) si el pedido nombra un tag que no está en este mapa, no lo inventes. 6) si ninguna frase encaja, no crees un componente nuevo.</para>
/// <para><c>TDChart</c> recibe las cifras en <c>Series</c>. <c>TDEcom</c> recibe los productos en <c>Products</c>. Sin esos parámetros quedan las vistas del catálogo. <c>TDScheduler</c> recibe las citas en <c>Appointments</c>. <c>TDTextBox</c>, <c>TDSelect</c>, <c>TDDatePicker</c>, <c>TDMask</c>, <c>TDNumeric</c> y <c>TDSwitch</c> aceptan <c>@bind-Value</c>. <c>TDFileInput</c> entrega el archivo con <c>Field</c> o <c>OnChange</c>. <c>TDTerminal</c> no es una consola del sistema. Una pantalla de teléfono para bodega, WMS o ERP usa <see cref="Mobile"/>. El mapa de la flota es <c>TDMaps</c> con <c>Units</c>. La ubicación de quien inició sesión es <c>TDMapUser</c>. El andén, el conteo, la incidencia, la ruta, el pallet, el relevo, la reposición, la ubicación sugerida, la calidad y el despacho usan <see cref="Operaciones"/>. La entrada de mercadería y la revisión del producto usan <see cref="Entrada"/>.</para>
/// <para>Reglas de toda la biblioteca: el namespace de los tags es <c>TDComponents.Components</c>. Los enums y los records están en <c>TDComponents</c>. <c>TDTextBox</c>, <c>TDSelect</c>, <c>TDDatePicker</c>, <c>TDMask</c>, <c>TDNumeric</c> y <c>TDSwitch</c> aceptan <c>@bind-Value</c>. <c>TDFileInput</c> usa <c>Field</c> o <c>OnChange</c>. Una selección múltiple usa <c>Values</c>. <c>ChildContent</c> es el contenido entre etiquetas. Un bool omitido vale false.</para>
/// <para>No existen <c>TDFormField</c>, <c>TDProductCard</c>, <c>TDCartDrawer</c>, <c>TDLineSeries</c>, <c>TDBarChart</c>, <c>TDAlert</c>, <c>TDNotificationHost</c>, <c>TDProgressBar</c> ni <c>TDCardGroup</c>. No existe <c>Menu="true"</c> en <c>TDFab</c>.</para>
/// </remarks>
public static partial class TDArchitecture
{
    /// <summary>Formularios, campos, botones y chat.</summary>
    public static class Forms
    {
        /// <summary>Texto, nombre, correo, teléfono libre, URL, búsqueda, una línea.</summary>
        /// <remarks>Único campo con <c>@bind-Value</c>. La máscara visual es <see cref="Mascara"/>.</remarks>
        public const string Texto = "TDTextBox";

        /// <summary>Contraseña, clave, password.</summary>
        /// <remarks><c>InputType="password"</c>. Traduce los textos Show password y Hide password al idioma de la UI.</remarks>
        public const string Contrasena = """<TDTextBox InputType="password" />""";

        /// <summary>Notas, comentario, observaciones, textarea, varias líneas.</summary>
        /// <remarks><c>Multiline="true"</c>. No lo combines con contraseña.</remarks>
        public const string Notas = """<TDTextBox Multiline="true" />""";

        /// <summary>Patente, RUT, teléfono con forma fija, fecha escrita a mano, máscara.</summary>
        /// <remarks>Formatea mientras se escribe. No uses <c>Pattern</c> de <c>TDTextBox</c> si la máscara debe verse.</remarks>
        public const string Mascara = "TDMask";

        /// <summary>Cantidad, número con más y menos, entero o decimal con paso.</summary>
        /// <remarks>No tiene formato de moneda. No uses <c>InputType="number"</c> si quieres los botones.</remarks>
        public const string Numero = "TDNumeric";

        /// <summary>Número en arco, perilla, knob.</summary>
        /// <remarks>Si la persona pide una barra, usa <see cref="Slider"/>.</remarks>
        public const string Knob = "TDKnob";

        /// <summary>Barra de un valor, slider, control deslizante.</summary>
        /// <remarks>Una sola manija. No hay rango de dos valores.</remarks>
        public const string Slider = "TDSlider";

        /// <summary>Fecha, fecha y hora, hora del día, calendario.</summary>
        /// <remarks><c>TDDateMode</c>: Date, DateTime o Time. La duración no es una fecha: usa <see cref="Duracion"/>.</remarks>
        public const string Fecha = "TDDatePicker";

        /// <summary>Duración, días horas y minutos, timespan, plazo.</summary>
        public const string Duracion = "TDTimeSpanPicker";

        /// <summary>Elegir una de una lista larga, desplegable, combo, dropdown, select.</summary>
        /// <remarks>Acepta <c>@bind-Value</c>. La selección múltiple usa <c>Values</c> y <c>Name</c>.</remarks>
        public const string UnaOpcion = """<TDSelect @bind-Value="pedido.Marca" Label="Marca" Options="marcas" />""";

        /// <summary>Elegir varias en un desplegable, selección múltiple, chips de opciones cerradas.</summary>
        /// <remarks><c>Multiple="true"</c> y <c>Values</c>. Si la persona puede inventar etiquetas, usa <see cref="EtiquetasUsuario"/>.</remarks>
        public const string VariasOpciones = """<TDSelect Multiple="true" />""";

        /// <summary>Lista siempre visible, listbox.</summary>
        public const string ListaVisible = "TDListBox";

        /// <summary>Dos a cinco opciones, una sola, radios, segmentos.</summary>
        /// <remarks><c>TDRadioList</c> si hay texto. <c>TDSelectBar</c> si caben en una franja.</remarks>
        public const string PocasUna = "TDRadioList";

        /// <summary>Pocas opciones y varias a la vez, casillas en grupo.</summary>
        public const string PocasVarias = "TDCheckBoxList";

        /// <summary>Sí o no inmediato, interruptor, preferencia, switch.</summary>
        /// <remarks>Para aceptar un término usa <see cref="Terminos"/>.</remarks>
        public const string SiNo = "TDSwitch";

        /// <summary>Aceptar términos, marcar un ítem, casilla, checkbox.</summary>
        public const string Terminos = "TDCheckBox";

        /// <summary>Categorías con padres e hijos, árbol en un desplegable.</summary>
        public const string Arbol = "TDDropDownTree";

        /// <summary>Elegir un repuesto viendo código, nombre y stock, fila de una tabla.</summary>
        public const string FilaRepuesto = "TDDropDownDataGrid";

        /// <summary>Sugerencias al escribir, el valor puede ser texto libre, autocomplete.</summary>
        /// <remarks>Si el valor tiene que ser una opción cerrada, usa <c>TDSelect</c> con <c>Searchable="true"</c>.</remarks>
        public const string Sugerencias = "TDAutoComplete";

        /// <summary>Color, hexadecimal, paleta.</summary>
        public const string Color = "TDColorPicker";

        /// <summary>Archivo, adjunto, subir, upload.</summary>
        /// <remarks>Para una foto que debe llegar liviana, usa <see cref="Foto"/>.</remarks>
        public const string Archivo = "TDFileInput";

        /// <summary>Foto, cámara, tomar o subir una imagen ya comprimida.</summary>
        /// <remarks>El navegador entrega un JPEG con calidad 0.85. El lado largo queda en 1920 px como máximo. El post multipart lleva ese archivo, no la foto original. <c>Size</c> es <c>TDSize.Small</c>, <c>TDSize.Medium</c> o <c>TDSize.Large</c>; si se omite, es mediano. Tocar la miniatura la abre en grande, como <c>TDImage</c>.</remarks>
        public const string Foto = """<TDPhotoButton Name="foto" Label="Foto del repuesto" />""";

        /// <summary>Varias fotos seguidas, ráfaga, colección de fotos, cámara que no se cierra.</summary>
        /// <remarks>La cámara sigue abierta entre tomas. Cada foto es un JPEG 0.85 y se puede quitar antes del post. El modelo recibe <c>IFormFileCollection</c>. Para una sola foto usa <see cref="Foto"/>.</remarks>
        public const string Rafaga = """<TDPhotoCapture Name="fotos" Label="Fotos del repuesto" />""";

        /// <summary>Código de un solo uso, OTP, PIN en casillas.</summary>
        public const string CodigoUnico = "TDSecurityCode";

        /// <summary>Firma, signature.</summary>
        public const string Firma = "TDSignaturePad";

        /// <summary>Texto enriquecido, HTML, negritas y enlaces.</summary>
        /// <remarks>Si la salida debe ser Markdown, usa <see cref="Markdown"/>.</remarks>
        public const string Html = "TDHtmlEditor";

        /// <summary>Markdown, vista previa de marcado.</summary>
        public const string Markdown = "TDMarkdown";

        /// <summary>Etiquetas que la persona escribe y agrega, tags libres.</summary>
        public const string EtiquetasUsuario = "TDChipList";

        /// <summary>Etiqueta visual, filtro ya elegido, chip de estado.</summary>
        /// <remarks>No es un campo. Para un estado de stock usa el badge de Feedback.</remarks>
        public const string Chip = "TDChip";

        /// <summary>Agrupar campos, fieldset, sección del formulario.</summary>
        /// <remarks>No existe <c>TDFormField</c>. El formulario es <c>TDEditForm</c>.</remarks>
        public const string Agrupar = "TDFieldset";

        /// <summary>Aviso que se queda junto al campo, éxito, error, advertencia del formulario.</summary>
        /// <remarks>El aviso flotante que no ocupa el formulario es <c>TDToast</c>.</remarks>
        public const string Aviso = "TDMessage";

        /// <summary>Guardar, enviar el formulario, botón principal.</summary>
        /// <remarks>El tipo por defecto ya es Submit. No lo cambies si debe enviar.</remarks>
        public const string BotonEnviar = "TDButton";

        /// <summary>Botón que no envía, cancelar dentro del form, acción secundaria.</summary>
        /// <remarks><c>ButtonType="TDButtonType.Button"</c>. Sin eso, el botón envía el formulario.</remarks>
        public const string BotonNoEnvia = """<TDButton ButtonType="TDButtonType.Button" />""";

        /// <summary>Ir a otra página con cara de botón.</summary>
        /// <remarks><c>TDButton</c> con <c>Href</c>, o <c>TDLink Button="true"</c>. Sigue siendo navegación, no un post.</remarks>
        public const string BotonEnlace = """<TDButton Href="/ruta" ButtonType="TDButtonType.Button" />""";

        /// <summary>Acción principal y alternativas, split button.</summary>
        public const string DividirAccion = "TDSplitButton";

        /// <summary>Botón flotante, una acción, FAB.</summary>
        /// <remarks>No existe <c>Menu="true"</c>. El menú aparece si hay contenido hijo. Varias acciones radiales son <see cref="FlotanteVarias"/>.</remarks>
        public const string Flotante = "TDFab";

        /// <summary>Varias acciones flotantes, speed dial, abanico.</summary>
        public const string FlotanteVarias = "TDSpeedDial";

        /// <summary>Dictar, voz a texto, speech.</summary>
        /// <remarks><c>Target</c> es el id del campo, no su <c>Name</c>. <c>TDTextBox</c> no publica ese id: no es un buen destino.</remarks>
        public const string Dictado = "TDSpeechToTextButton";

        /// <summary>Editar un valor ya mostrado, inplace ya armado.</summary>
        public const string EditarEnSitio = "TDInplaceEdit";

        /// <summary>Mostrar un valor y reemplazarlo por un editor que yo armo.</summary>
        public const string EditorPropio = "TDInplace";

        /// <summary>Conversación entre personas, chat de asesor.</summary>
        public const string Chat = "TDChat";

        /// <summary>Preguntas sobre el catálogo de repuestos, asistente, chat de IA.</summary>
        /// <remarks>No es <see cref="Chat"/>.</remarks>
        public const string ChatCatalogo = "TDAIChat";

        /// <summary>Etiqueta suelta asociada a un control por id.</summary>
        /// <remarks>No la dupliques sobre <c>TDTextBox</c>: ese campo ya pinta su <c>Label</c>.</remarks>
        public const string Etiqueta = "TDLabel";

        /// <summary>Formulario, alta, editar y guardar un modelo.</summary>
        /// <remarks>Es un <c>EditForm</c>: acepta <c>Model</c> o <c>EditContext</c>, <c>OnSubmit</c>, <c>OnValidSubmit</c>, <c>OnInvalidSubmit</c>, <c>FormName</c> y <c>Enhance</c>. Suma título, resumen de errores, aviso al salir y un solo envío a la vez. Texto, selección simple, fecha, máscara, número e interruptor usan <c>@bind-Value</c>. El archivo usa <c>Field</c> o <c>OnChange</c>.</remarks>
        public const string Formulario = """<TDEditForm Model="pedido" FormName="pedido" OnValidSubmit="Guardar" Enhance Title="Alta de flota" SubmitLabel="Guardar flota" />""";
    }
}
