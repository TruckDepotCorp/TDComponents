using TDComponents;

namespace TDComponents.Components;

/// <summary>Etiqueta asociada a un control por su <c>id</c>. Puede marcar el campo como obligatorio, opcional o con error.</summary>
/// <remarks>
/// <para>Úsala cuando el control no trae su propio <c>Label</c>. No la pongas encima de <see cref="TDTextBox"/>: ese componente ya pinta la suya. Si hace falta una etiqueta externa, deja <c>Label</c> vacío en el campo.</para>
/// <para><c>For</c> tiene que ser el <c>id</c> del control, no su <c>Name</c>.</para>
/// </remarks>
public partial class TDLabel { }

/// <summary>Campo de texto de una línea, varias líneas o contraseña. Es el único campo de Forms que acepta <c>@bind-Value</c>.</summary>
/// <remarks>
/// <para>Cubre texto libre, correo, teléfono, URL, búsqueda, notas y contraseña. Hereda de <c>InputBase&lt;string?&gt;</c>, así que participan <c>Value</c>, <c>ValueChanged</c>, <c>ValueExpression</c> y <c>Name</c>.</para>
/// <para>El nombre del post es <c>Name</c> si lo indicas. Si no, es el nombre de la propiedad enlazada.</para>
/// <para>Para una máscara mientras se escribe usa <see cref="TDMask"/>. Para una cantidad con botones usa <see cref="TDNumeric"/>. Los textos de validación salen en inglés: en una interfaz en español hay que reemplazarlos.</para>
/// </remarks>
public partial class TDTextBox { }

/// <summary>Botón o enlace con la misma cara visual.</summary>
/// <remarks>
/// <para>El tipo por defecto es <see cref="TDButtonType.Submit"/>: dentro de un formulario envía los datos. Cualquier botón que no deba enviar lleva <see cref="TDButtonType.Button"/>.</para>
/// <para>Con <c>Href</c> seguro el control se renderiza como enlace. Se rechazan destinos <c>javascript:</c> y <c>data:</c>.</para>
/// </remarks>
public partial class TDButton { }

/// <summary>Botón que permanece presionado. Varios con el mismo <c>Group</c> se comportan como una elección excluyente.</summary>
/// <remarks>Úsalo para un filtro o un modo que se queda activo. Para un sí o no usa <see cref="TDSwitch"/>. Para opciones con texto largo usa <see cref="TDRadioList"/>.</remarks>
public partial class TDToggleButton { }

/// <summary>Una casilla. Puede quedar en tres estados para representar una selección parcial.</summary>
/// <remarks>Úsala para aceptar un término o marcar un ítem. Para una preferencia que se aplica al momento usa <see cref="TDSwitch"/>. Para varias opciones del mismo grupo usa <see cref="TDCheckBoxList"/>.</remarks>
public partial class TDCheckBox { }

/// <summary>Grupo de casillas con el mismo nombre de formulario. Cada opción marcada se envía por separado.</summary>
/// <remarks>Úsala cuando las opciones son pocas y deben verse todas. Si la lista es larga, usa <see cref="TDSelect"/> con <c>Multiple</c>.</remarks>
public partial class TDCheckBoxList { }

/// <summary>Elección de una sola opción entre varias visibles.</summary>
/// <remarks>Úsala con dos a cinco opciones que la persona compara. Con más opciones usa <see cref="TDSelect"/>. Con textos muy cortos y en una sola franja usa <see cref="TDSelectBar"/>.</remarks>
public partial class TDRadioList { }

/// <summary>Interruptor de dos estados. Cuando está activo envía el literal <c>true</c>.</summary>
/// <remarks>Úsalo para una preferencia. Para aceptar términos o marcar un dato del formulario usa <see cref="TDCheckBox"/>.</remarks>
public partial class TDSwitch { }

/// <summary>Desplegable de una o varias opciones, con búsqueda, grupos, chips y tope de selección.</summary>
/// <remarks>
/// <para>Cubre la selección simple y la múltiple. Una opción inicial va en <c>Value</c>. Varias van en <c>Values</c> junto con <c>Multiple</c>. Cada valor elegido se envía en un campo oculto con <c>Name</c>.</para>
/// <para>No tiene <c>ValueChanged</c>: no uses <c>@bind-Value</c>. El dato viaja en el post del formulario.</para>
/// <para>Si las opciones deben verse siempre, usa <see cref="TDListBox"/>. Si el valor puede ser texto libre, usa <see cref="TDAutoComplete"/>. Si hay padres e hijos, usa <see cref="TDDropDownTree"/>. Si la decisión depende de varias columnas, usa <see cref="TDDropDownDataGrid"/>.</para>
/// </remarks>
public partial class TDSelect { }

/// <summary>Desplegable con árbol. Puede limitar la elección a las hojas y permitir varios nodos.</summary>
/// <remarks>Úsalo cuando las opciones tienen padres e hijos. Una lista plana va en <see cref="TDSelect"/>.</remarks>
public partial class TDDropDownTree { }

/// <summary>Desplegable cuyo panel es una tabla con columnas y búsqueda.</summary>
/// <remarks>Úsalo para elegir una fila viendo código, nombre y stock a la vez. <c>Columns</c> y las celdas de cada <see cref="TDDdRow"/> van en el mismo orden. <c>Text</c> es lo que queda en el campo; <c>Value</c> es lo que se envía.</remarks>
public partial class TDDropDownDataGrid { }

/// <summary>Lista siempre visible, de una o varias filas, con filtro opcional.</summary>
/// <remarks>Úsala cuando la persona debe ver las opciones sin abrir un panel. Si el espacio es escaso, usa <see cref="TDSelect"/>.</remarks>
public partial class TDListBox { }

/// <summary>Campo de texto que ofrece sugerencias mientras se escribe. El valor enviado es el texto, no un identificador forzado.</summary>
/// <remarks>Úsalo cuando el texto libre es válido y las sugerencias ayudan. Si el valor tiene que ser una opción de la lista, usa <see cref="TDSelect"/> con <c>Searchable</c>.</remarks>
public partial class TDAutoComplete { }

/// <summary>Campo que inserta una máscara mientras la persona escribe. El valor enviado es el texto ya formateado.</summary>
/// <remarks>
/// <para><c>0</c> es un dígito. <c>X</c> o <c>A</c> es una letra y se guarda en mayúscula. Cualquier otro carácter del patrón se inserta solo.</para>
/// <para>Sirve para patente, teléfono, RUT o una fecha escrita. No sirve para correo ni para texto libre: eso es <see cref="TDTextBox"/>.</para>
/// </remarks>
public partial class TDMask { }

/// <summary>Cantidad decimal con botones de menos y más.</summary>
/// <remarks>El valor es un <c>decimal</c> de un input numérico. No formatea moneda ni miles. Para un porcentaje visual en barra usa <see cref="TDSlider"/>; en círculo, <see cref="TDKnob"/>.</remarks>
public partial class TDNumeric { }

/// <summary>Fecha, fecha y hora, o solo hora, usando el input nativo del navegador.</summary>
/// <remarks><c>Value</c>, <c>Min</c> y <c>Max</c> son texto en el formato del modo: <c>yyyy-MM-dd</c>, <c>yyyy-MM-ddTHH:mm</c> o <c>HH:mm</c>. Para una duración usa <see cref="TDTimeSpanPicker"/>.</remarks>
public partial class TDDatePicker { }

/// <summary>Duración en días, horas y minutos. Envía el valor como <c>TimeSpan</c> en formato <c>d.hh:mm:ss</c>.</summary>
/// <remarks>Úsalo para una ventana o un plazo. Para un instante del calendario usa <see cref="TDDatePicker"/>.</remarks>
public partial class TDTimeSpanPicker { }

/// <summary>Barra de un solo valor.</summary>
/// <remarks>Tiene una manija. Para un mínimo y un máximo hacen falta dos controles. El sufijo se ve en el valor inicial; al arrastrar, el cliente muestra el número del input.</remarks>
public partial class TDSlider { }

/// <summary>Control circular para un número. Se mueve con el arrastre, las flechas, RePág, AvPág, Inicio y Fin.</summary>
/// <remarks>Úsalo cuando el valor se entiende como un nivel o un porcentaje. En un formulario denso se lee mejor <see cref="TDNumeric"/> o <see cref="TDSlider"/>.</remarks>
public partial class TDKnob { }

/// <summary>Calificación con estrellas. Envía un entero.</summary>
/// <remarks>Con <c>ReadOnly</c> solo muestra un valor ya dado.</remarks>
public partial class TDRating { }

/// <summary>Selector de color nativo. El valor es un hexadecimal <c>#RRGGBB</c>.</summary>
public partial class TDColorPicker { }

/// <summary>Elección de un solo archivo. Muestra el nombre elegido.</summary>
/// <remarks>
/// <para>No hay selección múltiple ni un parámetro de tamaño máximo. El límite y el tipo hay que explicarlos en <c>Hint</c> y validarlos en el servidor. <c>Accept</c> solo filtra el diálogo del sistema.</para>
/// <para>El formulario tiene que enviarse como <c>multipart/form-data</c>.</para>
/// </remarks>
public partial class TDFileInput { }

/// <summary>Botón de cámara para tomar o elegir una foto. El navegador la comprime a JPEG antes del post.</summary>
/// <remarks>
/// <para>El control visible es un botón de ícono. El diálogo del sistema ofrece la cámara y la galería. No uses <c>capture</c>: en varios teléfonos eso cierra la galería.</para>
/// <para>La compresión es nativa en el navegador, con calidad 0.85. Si el lado largo pasa de 1920 px, se reduce a 1920 sin agrandar fotos más chicas. El archivo que viaja en el post ya es ese JPEG. Para un PDF u otro archivo que no deba recomprimirse, usa <see cref="TDFileInput"/>.</para>
/// <para><c>Size</c> es <see cref="TDSize.Small"/>, <see cref="TDSize.Medium"/> o <see cref="TDSize.Large"/>. El defecto es mediano. Cambia el botón y la miniatura.</para>
/// <para>Al tocar la miniatura se abre el mismo visor que <see cref="TDImage"/>: la foto en grande, con acercar, alejar, girar y cerrar.</para>
/// <para>El formulario tiene que enviarse como <c>multipart/form-data</c>. La página tiene que cargar Material Symbols con el nombre <c>photo_camera</c>.</para>
/// </remarks>
public partial class TDPhotoButton { }

/// <summary>Cámara que se queda abierta para tomar varias fotos seguidas. Cada una entra en una colección lista para el post.</summary>
/// <remarks>
/// <para>No cierra la cámara al disparar. <c>Tomar foto</c> agrega un JPEG con calidad 0.85. El lado largo no pasa de 1920 px. <c>Quitar</c> saca esa foto de la colección antes de guardar. <c>Cerrar cámara</c> apaga el video y deja las fotos en el formulario.</para>
/// <para>El post multipart trae todas con el mismo nombre. En el modelo es <c>IFormFileCollection</c> o <c>List&lt;IFormFile&gt;</c>. Para una sola foto usa <see cref="TDPhotoButton"/>.</para>
/// <para><c>Size</c> cambia el botón que abre la cámara. La página tiene que cargar Material Symbols con <c>photo_camera</c>. El sitio tiene que ser HTTPS o localhost para que el navegador entregue la cámara.</para>
/// </remarks>
public partial class TDPhotoCapture { }

/// <summary>Código de un solo uso en casillas separadas. Avanza sola, retrocede con Retroceso y acepta pegar.</summary>
/// <remarks>El código completo viaja en un campo oculto. <c>Expected</c> queda en el HTML: sirve para una demostración, no para un secreto de producción. La comprobación real va en el servidor.</remarks>
public partial class TDSecurityCode { }

/// <summary>Lienzo de firma con mouse, lápiz o dedo. Envía una data URL PNG.</summary>
/// <remarks>Sin <c>Name</c> la firma no viaja en el formulario.</remarks>
public partial class TDSignaturePad { }

/// <summary>Editor de texto enriquecido. El HTML viaja en un campo oculto.</summary>
/// <remarks>Hay que sanear el HTML en el servidor. <c>Minimal</c> deja negrita, cursiva, subrayado y listas. La barra completa agrega estilo de párrafo, enlace y tres colores. Si la salida debe ser Markdown, usa <see cref="TDMarkdown"/>.</remarks>
public partial class TDHtmlEditor { }

/// <summary>Editor Markdown con barra de formato y vista previa.</summary>
/// <remarks>El post es el Markdown, no HTML. <c>Mode</c> puede ser <c>split</c>, <c>source</c> o <c>preview</c>. Si la salida debe ser HTML, usa <see cref="TDHtmlEditor"/>.</remarks>
public partial class TDMarkdown { }

/// <summary>Etiqueta compacta, filtro seleccionable o etiqueta con botón de quitar.</summary>
/// <remarks>No envía un valor de formulario. Con <c>Selectable</c> es un botón y no se pintan el avatar ni el botón de quitar. Para que la persona cree las etiquetas, usa <see cref="TDChipList"/>.</remarks>
public partial class TDChip { }

/// <summary>Campo de etiquetas. Enter agrega y Retroceso quita la última.</summary>
/// <remarks>Úsalo cuando el vocabulario es abierto. Si las opciones están cerradas, usa <see cref="TDSelect"/> con <c>Multiple</c>.</remarks>
public partial class TDChipList { }

/// <summary>Segmentos para pocas opciones cortas, en selección simple o múltiple.</summary>
/// <remarks>Úsala con dos a cinco textos breves. Con descripciones largas usa <see cref="TDRadioList"/> y <c>Cards</c>.</remarks>
public partial class TDSelectBar { }

/// <summary>Agrupa campos bajo una leyenda y puede empezar plegado.</summary>
/// <remarks>No existe un componente FormField. La etiqueta flotante del catálogo se arma con este grupo y los campos de adentro.</remarks>
public partial class TDFieldset { }

/// <summary>Formulario de alta o edición. Envuelve <c>EditForm</c> y agrega título, resumen de errores, aviso al salir y bloqueo de un segundo envío.</summary>
/// <remarks>
/// <para>Acepta los parámetros de <c>EditForm</c>: <c>Model</c> o <c>EditContext</c>, <c>OnSubmit</c>, <c>OnValidSubmit</c>, <c>OnInvalidSubmit</c>, <c>FormName</c> y <c>Enhance</c>. No pongas <c>Model</c> y <c>EditContext</c> a la vez. En una página estática hace falta <c>FormName</c>.</para>
/// <para><c>SubmitLabel</c> pinta el botón que envía. Si lo omites, el botón va en el contenido o en <c>Actions</c>, con <see cref="TDButtonType.Submit"/>. <c>Enctype</c> en <c>multipart/form-data</c> cuando hay archivos o fotos.</para>
/// <para>Al enviar, el navegador lista los campos que fallaron, dice que lo escrito sigue en el formulario y lleva el foco al primero. Con <c>ConfirmLeave</c>, salir con cambios abre un diálogo. Con <c>GuardSubmit</c>, un segundo clic no vuelve a enviar.</para>
/// </remarks>
public partial class TDEditForm { }

/// <summary>Aviso en línea junto al contenido. No es un toast.</summary>
/// <remarks><see cref="TDSeverity.Danger"/> y <see cref="TDSeverity.Warning"/> usan rol de alerta. El resto usa rol de estado.</remarks>
public partial class TDMessage { }

/// <summary>Acción principal con un menú de alternativas.</summary>
/// <remarks>El botón principal no envía el formulario. Las alternativas son botones <c>type="button"</c> puestos como contenido hijo.</remarks>
public partial class TDSplitButton { }

/// <summary>Botón de acción flotante. Si tiene contenido hijo, ese contenido es el menú.</summary>
/// <remarks>No existe un parámetro <c>Menu</c>. La presencia de contenido hijo abre el menú y, en ese caso, <c>Href</c> no se usa. <c>AriaLabel</c> es el nombre accesible cuando no hay texto visible.</remarks>
public partial class TDFab { }

/// <summary>Botón flotante que despliega varias acciones en línea, hacia un lado o en arco.</summary>
/// <remarks><c>Type</c> acepta <c>linear</c> (hacia arriba), <c>right</c>, <c>circle</c>, <c>semi</c> y <c>quarter</c>. Enter abre, las flechas recorren y Esc cierra devolviendo el foco. Para un solo destino usa <see cref="TDFab"/>.</remarks>
public partial class TDSpeedDial { }

/// <summary>Botón de dictado. Escribe en el elemento cuyo <c>id</c> es <c>Target</c>.</summary>
/// <remarks>No busca el campo por <c>Name</c>. <see cref="TDTextBox"/> genera su <c>id</c> y no lo expone, así que el destino tiene que ser un control cuyo <c>id</c> controles tú.</remarks>
public partial class TDSpeechToTextButton { }

/// <summary>Muestra un disparador y, al pulsarlo, el editor que tú pongas en el contenido.</summary>
/// <remarks>No guarda solo. Si el editor es texto, número o una lista cerrada, usa <see cref="TDInplaceEdit"/>.</remarks>
public partial class TDInplace { }

/// <summary>Valor visible que se edita en el mismo lugar y se envía en un campo oculto.</summary>
/// <remarks>Sin <c>AutoCommit</c>, un clic abre el editor y hay que confirmar o cancelar. Con <c>AutoCommit</c>, el doble clic abre y se guarda al salir. Si <c>Options</c> tiene elementos, el editor es una lista y se ignoran <c>Multiline</c> y <c>Numeric</c>.</remarks>
public partial class TDInplaceEdit { }

/// <summary>Conversación entre dos partes, con burbujas, hora e indicador de escritura.</summary>
/// <remarks>No es un campo de formulario. <c>Messages</c> es el historial inicial. Para preguntas sobre un catálogo de repuestos usa <see cref="TDAIChat"/>.</remarks>
public partial class TDChat { }

/// <summary>Asistente que responde solo con el recorte de catálogo que le pasas. No llama a un modelo ni usa SignalR.</summary>
/// <remarks><c>Catalog</c> es texto: una línea por repuesto y columnas separadas por <c>|</c> en el orden código, nombre, marca, modelo, stock y precio. Hacen falta al menos cuatro columnas. Si la pregunta contiene «agotado», lista las filas cuyo stock es menor o igual a cero.</remarks>
public partial class TDAIChat { }
