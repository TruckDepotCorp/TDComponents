# Forms — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDTextBox`, `TDSelect`, `TDDatePicker`, `TDMask`, `TDNumeric` y `TDSwitch` aceptan `@bind-Value`. `TDTextBox` hereda `InputBase<string?>`. Los otros cinco publican el nombre del campo en el post: si hay `Name`, gana; si no, el nombre es el de la propiedad enlazada.
2. El resto de los campos no acepta `@bind-Value`. Se rellenan con `Value` (valor inicial) y se envían por `Name` en un `<form>` o `<EditForm>` con post. `TDSelect` en modo `Multiple` sigue usando `Values`, no `@bind-Value`. `TDFileInput` no enlaza el archivo al modelo: el post multipart usa `Field` para el nombre, o `OnChange` en una página interactiva. `TDPhotoButton` tampoco usa `@bind-Value`: el post trae el JPEG ya comprimido.
3. No existe `TDFormField`. El ítem de catálogo FormField es `TDFieldset` más campos adentro.
4. No existe `Menu="true"` en `TDFab`. El menú aparece si hay contenido hijo.
5. `TDSlider` tiene una sola manija. No hay rango de dos valores.
6. `TDNumeric` no tiene formato de moneda. Solo `decimal` con `Min`, `Max` y `Step`.
7. Los textos por defecto de validación de `TDTextBox` están en inglés. En una UI en español hay que reemplazarlos.
8. Un `bool` omitido vale `false`. Un parámetro con default en la tabla usa ese default si se omite.
9. `ChildContent` es el contenido entre las etiquetas, no un atributo.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Texto libre de una línea o varias | `TDTextBox` | `TDMask` si el formato es libre |
| Texto con forma fija (patente, teléfono, RUT, fecha escrita) | `TDMask` | `TDTextBox` con `Pattern` si quieres la máscara visual mientras se escribe |
| Contraseña | `TDTextBox InputType="password"` | un input suelto |
| Número con pasos | `TDNumeric` | `TDTextBox InputType="number"` si quieres los botones − / + |
| Número en arco | `TDKnob` | `TDSlider` si el control debe ser circular |
| Un valor en una barra | `TDSlider` | `TDKnob` |
| Fecha, fecha y hora, o solo hora | `TDDatePicker` | `TDMask` salvo que el usuario deba escribir la fecha a mano |
| Duración (días, horas, minutos) | `TDTimeSpanPicker` | `TDDatePicker` |
| Una opción de una lista larga, con panel cerrado | `TDSelect` | `TDListBox` si la lista debe verse siempre |
| Varias opciones en el mismo desplegable | `TDSelect Multiple="true"` | varias `TDCheckBox` si son pocas y deben verse |
| Lista siempre visible | `TDListBox` | `TDSelect` |
| Pocas opciones, una sola | `TDRadioList` o `TDSelectBar` | `TDSelect` si caben en la pantalla |
| Pocas opciones, varias | `TDCheckBoxList` o `TDSelectBar Multiple="true"` | `TDSelect` si son dos o tres |
| Sí / no inmediato | `TDSwitch` | `TDCheckBox` si el cambio es una preferencia, no un dato del formulario |
| Aceptar un término o un ítem | `TDCheckBox` | `TDSwitch` |
| Árbol de categorías | `TDDropDownTree` | `TDSelect` con grupos si hay padres e hijos |
| Elegir una fila (código, nombre, stock) | `TDDropDownDataGrid` | `TDSelect` si la decisión depende de varias columnas |
| Sugerencias al escribir, el valor es texto libre | `TDAutoComplete` | `TDSelect Searchable="true"` si el valor tiene que ser una opción cerrada |
| Color | `TDColorPicker` | texto libre |
| Archivo que no es una foto, o que no debe recomprimirse | `TDFileInput` | `TDPhotoButton` si es una foto que debe llegar liviana |
| Foto tomada o elegida, ya comprimida para el servidor | `TDPhotoButton` | `TDPhotoCapture` si son varias fotos seguidas |
| Varias fotos seguidas, sin cerrar la cámara | `TDPhotoCapture` | `TDPhotoButton` si es una sola |
| Código de un solo uso | `TDSecurityCode` | `TDTextBox` |
| Firma | `TDSignaturePad` | |
| HTML enriquecido | `TDHtmlEditor` | `TDMarkdown` si la salida debe ser HTML |
| Markdown | `TDMarkdown` | `TDHtmlEditor` si la salida debe ser Markdown |
| Etiquetas que el usuario agrega | `TDChipList` | `TDSelect Multiple` si el conjunto está cerrado |
| Etiqueta visual o filtro | `TDChip` | |
| Agrupar campos | `TDFieldset` | |
| Formulario con título, resumen de errores y aviso al salir | `TDEditForm` | `<EditForm>` si no quieres esa cáscara |
| Aviso junto al campo | `TDMessage` | |
| Acción principal del formulario | `TDButton` con `ButtonType="TDButtonType.Submit"` | `TDButtonType.Button` dentro de un form si debe enviar |
| Acción que no envía el form | `TDButton ButtonType="TDButtonType.Button"` | el default, que es `Submit` |
| Acción principal más alternativas | `TDSplitButton` | varios `TDButton` si una es la acción por defecto |
| Acción flotante | `TDFab` | `TDSpeedDial` si hay varias acciones radiales |
| Dictado | `TDSpeechToTextButton` apuntando al `id` del campo | |
| Editar un valor ya mostrado | `TDInplaceEdit` | `TDInplace` si el editor ya lo armas tú |
| Conversación entre personas | `TDChat` | `TDAIChat` |
| Preguntas sobre un catálogo de repuestos | `TDAIChat` | `TDChat` |

## Alias del catálogo

El id del catálogo no es el tag.

| Id de catálogo | Tag real |
| --- | --- |
| textbox, password, textarea | `TDTextBox` |
| dropdown, select, ddmulti | `TDSelect` |
| ddtree | `TDDropDownTree` |
| ddgrid | `TDDropDownDataGrid` |
| seccode | `TDSecurityCode` |
| splitbtn | `TDSplitButton` |
| fileinput, upload | `TDFileInput` |
| photo | `TDPhotoButton` |
| photocapture | `TDPhotoCapture` |
| fieldset, formfield | `TDFieldset` |
| fab, fabmenu | `TDFab` |
| editform | `TDEditForm` |
| form | `<EditForm>` de ASP.NET, sin la cáscara de `TDEditForm` |
| inplace | `TDInplace` para envolver un editor propio. `TDInplaceEdit` para el editor ya armado |

## Tipos compartidos

Están en el namespace `TDComponents`.

`TDOption` — una opción de lista.

| Campo | Tipo | Default | Para qué |
| --- | --- | --- | --- |
| `Value` | `string` | — | Valor que se envía. Obligatorio en el constructor. |
| `Label` | `string` | — | Texto que ve la persona. |
| `Group` | `string?` | `null` | Encabezado de grupo en `TDSelect`. Se muestra cuando cambia respecto de la opción anterior. |
| `Disabled` | `bool` | `false` | La opción no se puede elegir. |
| `Hint` | `string?` | `null` | Segunda línea. La usan `TDSelect` y `TDRadioList`. |
| `Count` | `int?` | `null` | Reservado en el record. Estos componentes de Forms no lo pintan. |
| `Icon` | `string?` | `null` | Reservado en el record. `TDSelectBar` no lo pinta por sí solo. |

`TDTreeOption` — nodo de `TDDropDownTree`.

| Campo | Tipo | Para qué |
| --- | --- | --- |
| `Value` | `string` | Valor enviado. |
| `Label` | `string` | Texto visible. |
| `Children` | `IReadOnlyList<TDTreeOption>?` | Hijos. `null` si es hoja. |
| `Disabled` | `bool` | No se puede elegir. |

`TDDdRow` — fila de `TDDropDownDataGrid`.

| Campo | Tipo | Para qué |
| --- | --- | --- |
| `Value` | `string` | Valor enviado. |
| `Text` | `string` | Texto que queda en el campo al elegir la fila. |
| `Cells` | `IReadOnlyList<string>` | Celdas, en el mismo orden que `Columns`. |
| `Code` | `string?` | Código extra. Opcional. |

`TDChatMessage` — `(Author, Text, Mine, Time)`. `Mine` alinea la burbuja como mensaje propio.

`TDMenuItem` — lo usa `TDSpeedDial`. Campos que importan aquí: `Text` (etiqueta), `Href` (destino; si falta, el enlace es `#`), `Icon` (SVG). Si `Icon` es null y `Text` es `Llamar`, `WhatsApp`, `Cotizar` o `Rastrear`, el componente pone un ícono propio.

Enums:

| Enum | Valores |
| --- | --- |
| `TDVariant` | `Primary`, `Secondary`, `Ghost`, `Danger` |
| `TDSize` | `Small`, `Medium`, `Large` |
| `TDButtonType` | `Submit`, `Button`, `Reset` |
| `TDDateMode` | `Date`, `DateTime`, `Time` |
| `TDOrientation` | `Vertical`, `Horizontal` |
| `TDLabelPosition` | `End` (etiqueta a la derecha), `Start` (etiqueta a la izquierda) |
| `TDSeverity` | `Info`, `Success`, `Warning`, `Danger`, `Secondary` |

## Patrón de formulario

El ítem TemplateForm no es un componente. Un formulario de alta se arma así. Texto, selección simple, fecha, máscara, número e interruptor usan `@bind-Value`.

```razor
<TDEditForm Model="pedido" FormName="pedido" OnValidSubmit="Guardar" Enhance Title="Alta de flota" SubmitLabel="Guardar flota">
    <TDTextBox @bind-Value="pedido.Flota" Label="Nombre de la flota" Required="true" RequiredText="Obligatorio" />
    <TDSelect @bind-Value="pedido.Marca" Label="Marca" Options="marcas" />
</TDEditForm>
```

`TDEditForm` es un `EditForm`. Si el botón lo armas tú, omite `SubmitLabel` y usa `TDButton` con `ButtonType="TDButtonType.Submit"`. Cualquier otro botón del mismo formulario lleva `ButtonType="TDButtonType.Button"`.

## TDEditForm

Cáscara del formulario. Sirve para un alta o una edición con título, un botón que dice qué se guarda, la lista de lo que falló y un aviso si la persona sale con cambios.

Pasa todos los parámetros de `EditForm`. El contenido son los campos. `Model` y `EditContext` no van juntos. En una página estática hace falta `FormName`.

```razor
<TDEditForm Model="flota" FormName="alta-flota" OnValidSubmit="Guardar" Enhance
            Title="Alta de flota"
            Lead="El nombre queda en el despacho. Si sales sin guardar, lo escrito se pierde."
            SubmitLabel="Guardar flota"
            PendingText="Guardando la flota…"
            HelpHref="/c/fieldset" HelpLabel="Ver cómo agrupar campos"
            ConfirmLeave="true">
    <TDTextBox @bind-Value="flota.Nombre" Label="Nombre de la flota" Required="true" RequiredText="Obligatorio" RequiredMessage="Escribe el nombre de la flota." />
    <TDTextBox @bind-Value="flota.Solicitud" Label="Solicitud" Required="true" RequiredText="Obligatorio" RequiredMessage="Describe qué hay que hacer." Multiline="true" />
</TDEditForm>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Model` | `object?` | `null` | Modelo del `EditForm`. | Alta o edición. No lo combines con `EditContext`. |
| `EditContext` | `EditContext?` | `null` | Contexto ya creado. | Cuando el contexto lo armas tú. No lo combines con `Model`. |
| `OnSubmit` | `EventCallback<EditContext>` | vacío | Corre al enviar, falle o no la validación del modelo. | El post lo manejas siempre. |
| `OnValidSubmit` | `EventCallback<EditContext>` | vacío | Corre solo si la validación del modelo pasa. | Guardar cuando el modelo es válido. |
| `OnInvalidSubmit` | `EventCallback<EditContext>` | vacío | Corre si la validación del modelo falla en el servidor. | Quieres un manejo propio del rechazo. |
| `FormName` | `string?` | `null` | Nombre del formulario estático. | Página sin interactividad. |
| `Enhance` | `bool` | `false` | Post sin recargar toda la página. | El resto de la pantalla debe quedarse. |
| `ChildContent` | campos | — | Campos. Reciben el `EditContext`. | Siempre. |
| `Title` | `string?` | `null` | Título visible. | El formulario es la pantalla. |
| `Lead` | `string?` | `null` | Una frase de qué se guarda. | Hace falta decir qué pasa al salir. |
| `SubmitLabel` | `string?` | `null` | Texto del botón que envía. | El botón dice la acción, por ejemplo «Guardar flota». |
| `PendingText` | `string` | `Guardando. Espera un momento.` | Texto mientras el envío sigue. | Cámbialo si la acción no es guardar. |
| `Actions` | contenido | `null` | Botones a la izquierda del principal. | Hay cancelar u otra acción que no envía. |
| `HelpHref` | `string?` | `null` | Destino de la ayuda. Rechaza `javascript:` y `data:`. | Hay una persona o una página que explica el alta. |
| `HelpLabel` | `string` | `Pedir ayuda` | Texto de ese enlace. | Siempre que haya `HelpHref`. |
| `Enctype` | `string?` | `null` | Codificación del post. | `multipart/form-data` si hay archivo o foto. |
| `Autocomplete` | `string?` | `null` | Autocompletado de todo el formulario. | Quieres `off` o `on`. |
| `ShowSummary` | `bool` | `true` | Lista los campos que fallaron. | Déjalo en true. |
| `UseBrowserValidation` | `bool` | `false` | El navegador muestra su globo y el resumen no sale. | Quieres el aviso nativo del navegador. |
| `ConfirmLeave` | `bool` | `false` | Pregunta antes de salir con cambios. | Lo escrito no está guardado en el servidor. |
| `GuardSubmit` | `bool` | `true` | Ignora un segundo envío. | Déjalo en true. |
| `Autofocus` | `bool` | `false` | Foco en el primer obligatorio vacío. | Esta pantalla es el inicio de la tarea. |
| `Disabled` | `bool` | `false` | Bloquea campos y botón. | El registro no se puede editar. |
| `InvalidTitle` | `string` | `No se pudo guardar` | Título del aviso de error. | La acción no es guardar. |
| `InvalidDetail` | `string` | `Revisa los campos marcados. Lo escrito sigue en el formulario.` | Qué pasó y qué hacer. | Quieres otra frase. |
| `LeaveTitle` | `string` | `Salir sin guardar` | Título del diálogo al salir. | |
| `LeaveDetail` | `string` | `Lo escrito sigue solo en esta pantalla. Si sales, se pierde.` | Qué se pierde. | |
| `LeaveStay` | `string` | `Seguir editando` | Se queda. | |
| `LeaveDiscard` | `string` | `Salir sin guardar` | Descarta y sale. | |

No tiene `OnChange`. Los campos siguen usando `@bind-Value` o `Name` como en el resto de Forms.

---

## TDLabel

Etiqueta asociada a un control por `id`. Úsala cuando el campo no trae su propio `Label`, o cuando hace falta marcar obligatorio, opcional o error fuera del control.

No la dupliques sobre `TDTextBox`: ese componente ya pinta su etiqueta.

```razor
<TDLabel For="part-code" Required="true">Número de parte</TDLabel>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `For` | `string?` | `null` | Valor del atributo `for`. Debe ser el `id` del control. | Siempre que el control tenga `id`. |
| `Required` | `bool` | `false` | Muestra «Obligatorio». | El campo no se puede omitir. |
| `Optional` | `bool` | `false` | Muestra «Opcional». Se ignora si `Required` es true. | Quieres decir que se puede dejar vacío. |
| `Inline` | `bool` | `false` | La etiqueta queda en línea. | Va al lado del control, no arriba. |
| `HasError` | `bool` | `false` | Estilo de error. | El campo ya falló la validación. |
| `ChildContent` | contenido | — | Texto de la etiqueta. | Siempre. |

## TDTextBox

Campo de texto. Cubre el catálogo TextBox, Password y TextArea.

Úsalo para nombre, correo, búsqueda, notas y contraseña. Para una máscara visual usa `TDMask`. Para un entero con botones usa `TDNumeric`.

El nombre del post es `Name` si lo pones; si no, es el nombre de la propiedad enlazada. `TDSelect`, `TDDatePicker`, `TDMask`, `TDNumeric` y `TDSwitch` usan el mismo contrato.

```razor
<TDTextBox @bind-Value="pedido.Flota" Label="Nombre de la flota" Placeholder="Transportes del Sur" Hint="Nombre con el que aparece en el despacho." />

<TDTextBox @bind-Value="pedido.Clave" Label="Contraseña" InputType="password" ShowSecretText="Mostrar contraseña" HideSecretText="Ocultar contraseña" />

<TDTextBox @bind-Value="pedido.Nota" Label="Solicitud" Multiline="true" Rows="4" MaxLength="280" ShowCounter="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Label` | `string` | `""` | Etiqueta visible. Es obligatoria para el compilador (`EditorRequired`). | Siempre. Si otra `TDLabel` ya etiqueta el campo, pasa `Label=""`. |
| `Hint` | `string?` | `null` | Ayuda bajo el campo. | La persona necesita una pista que no cabe en el placeholder. |
| `Placeholder` | `string?` | `null` | Texto de ejemplo dentro del campo vacío. | El formato no es obvio. |
| `InputType` | `string` | `"text"` | `text`, `email`, `password`, `search`, `tel`, `url`, `number`. Cualquier otro valor cae a `text`. | Contraseña, correo, teléfono, URL. |
| `Multiline` | `bool` | `false` | Pinta un `textarea`. Ignora el comportamiento de contraseña. | Más de una línea. |
| `Rows` | `int` | `5` | Filas iniciales del textarea. | Junto con `Multiline`. |
| `Required` | `bool` | `false` | El navegador exige valor y muestra `RequiredText`. | El dato no puede ir vacío. |
| `MinLength` | `int?` | `null` | Largo mínimo. | Hay un mínimo de caracteres. |
| `MaxLength` | `int?` | `null` | Largo máximo. También lo usa el contador. | Hay un tope. |
| `ShowCounter` | `bool` | `false` | Muestra `largo / MaxLength`. Solo si `MaxLength` es mayor que 0. | El usuario debe ver cuánto le queda. |
| `Pattern` | `string?` | `null` | Expresión regular del atributo HTML `pattern`. No formatea mientras se escribe. | Validar forma sin máscara visual. |
| `Autocomplete` | `string?` | `null` | Atributo HTML `autocomplete` (`email`, `current-password`, `off`). | El navegador debe recordar o no el dato. |
| `InputMode` | `string?` | `null` | Teclado móvil (`numeric`, `decimal`, `email`, `tel`). | El dato es numérico o teléfono en el teléfono. |
| `Spellcheck` | `bool?` | `null` | Corrector. Si se omite, queda activo solo en `Multiline`. | Notas sí; códigos y correos no. |
| `RequiredText` | `string` | `"Required"` | Marca junto a la etiqueta. | UI en español: `"Obligatorio"`. |
| `RequiredMessage` | `string` | `""` | Mensaje si falta el valor. | Cuando el default vacío no alcanza. |
| `TypeMessage` | `string` | `""` | Mensaje si el tipo no coincide (correo, URL). | |
| `MinLengthMessage` | `string` | `""` | Mensaje de largo mínimo. | |
| `MaxLengthMessage` | `string` | `""` | Mensaje de largo máximo. | |
| `PatternMessage` | `string` | `""` | Mensaje si no cumple `Pattern`. | |
| `ShowSecretText` | `string` | `"Show password"` | Botón para revelar la contraseña. | Siempre en `InputType="password"`, en el idioma de la UI. |
| `HideSecretText` | `string` | `"Hide password"` | Botón para volver a ocultarla. | Igual que el anterior. |
| `CharactersRemainingText` | `string` | `"{0} characters remaining"` | Texto de varios caracteres restantes. `{0}` es el número. | Si usas el contador accesible en español. |
| `CharacterRemainingText` | `string` | `"{0} character remaining"` | Igual, para un solo carácter. | |

Hereda de `InputBase<string?>`: `@bind-Value`, `Value`, `ValueChanged`, `ValueExpression`, `Name`.

`InputType="password"` muestra el botón de mostrar u ocultar. No lo combines con `Multiline`.

## TDButton

Botón o enlace con la misma cara.

Úsalo para enviar, para una acción secundaria o para un enlace que debe verse como botón. Dentro de un formulario, el default `Submit` envía. Un botón que solo abre algo lleva `ButtonType="Button"`.

```razor
<TDButton>Guardar</TDButton>
<TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Exportar</TDButton>
<TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Danger" Disabled="true">Eliminar</TDButton>
<TDButton Href="/pedidos/nuevo" ButtonType="TDButtonType.Button">Nuevo pedido</TDButton>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Variant` | `TDVariant` | `Primary` | `Primary` acción principal, `Secondary` alternativa, `Ghost` acción terciaria, `Danger` destructiva. | Una sola primaria por zona. |
| `Size` | `TDSize` | `Medium` | `Small`, `Medium`, `Large`. | Barras densas usan `Small`. |
| `ButtonType` | `TDButtonType` | `Submit` | `Submit` envía el form y puede mostrar carga. `Button` no envía. `Reset` limpia el form. | Cualquier botón que no deba enviar el formulario. |
| `Href` | `string?` | `null` | Si es un URL seguro, el control es un `<a>`. Se rechazan `javascript:` y `data:`. | Navegar, no enviar. |
| `Disabled` | `bool` | `false` | No se puede activar. En un enlace también quita el `href`. | La acción no está disponible. |
| `Block` | `bool` | `false` | Ocupa el ancho del contenedor. | Formularios de una columna. |
| `PendingText` | `string` | `"Please wait…"` | Texto durante el envío. Solo se pinta si `ButtonType` es `Submit`. | UI en español: `"Enviando…"`. |
| `ChildContent` | contenido | — | Etiqueta del botón. Puede incluir un svg. | Siempre. |
| `AdditionalAttributes` | diccionario | — | Atributos HTML extra, capturados con `CaptureUnmatchedValues`. | Un `id` o un `data-*` que el componente no declara. |

## TDToggleButton

Botón que queda presionado. Con el mismo `Group`, el comportamiento de grupo exclusivo lo resuelve el cliente.

Úsalo para filtros o modos que se quedan activos. Para sí/no con forma de interruptor usa `TDSwitch`. Para una sola opción entre varias etiquetas largas usa `TDRadioList`.

```razor
<TDToggleButton Name="vista" Value="grilla" Group="vista" Pressed="true">Grilla</TDToggleButton>
<TDToggleButton Name="vista" Value="lista" Group="vista">Lista</TDToggleButton>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. Si está presionado, también se escribe un hidden con ese nombre. | El estado debe enviarse. |
| `Value` | `string` | `"on"` | Valor enviado. | Siempre que haya `Name`. |
| `Group` | `string?` | `null` | Id de grupo. Botones con el mismo grupo se tratan como excluyentes. | Solo uno puede quedar activo. |
| `Pressed` | `bool` | `false` | Empieza presionado. | El valor inicial. |
| `Variant` | `TDVariant` | `Secondary` | Cara del botón. | Si debe parecer la acción principal, `Primary`. |
| `ChildContent` | contenido | — | Texto del botón. | Siempre. |

## TDCheckBox

Una casilla. `TriState` sirve para «seleccionar todo» cuando los hijos están mezclados.

```razor
<TDCheckBox Name="terminos" Label="Acepto los términos de despacho" Checked="true" />
<TDCheckBox Name="todas" Label="Todas las bodegas" TriState="true" Indeterminate="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. | Debe viajar en el formulario. |
| `Value` | `string` | `"true"` | Valor enviado cuando está marcada. | El servidor espera otro literal. |
| `Label` | `string` | `""` | Texto al lado de la casilla. | Siempre. |
| `Checked` | `bool` | `false` | Empieza marcada. | Valor inicial. |
| `Disabled` | `bool` | `false` | No se puede cambiar. | Condición bloqueada. |
| `TriState` | `bool` | `false` | Permite el estado mixto. | Casilla padre de un grupo. |
| `Indeterminate` | `bool?` | `null` | `true` pinta el guion (mixto) y `aria-checked="mixed"`. | Junto con `TriState`, cuando la selección hija es parcial. |
| `AdditionalAttributes` | diccionario | — | Atributos extra del input. | |

## TDCheckBoxList

Varias casillas con el mismo `Name`. Cada opción marcada se envía como un valor.

Úsala cuando las opciones son pocas y deben verse todas. Si son muchas, `TDSelect Multiple="true"`.

```razor
<TDCheckBoxList Name="bodegas" Label="Bodegas" ShowSelectAll="true" Options="bodegas" Selected="@(new[] { "scl" })" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"opciones"` | Nombre repetido en cada casilla. | Siempre cámbialo. |
| `Label` | `string?` | `null` | Título del grupo. | El grupo necesita nombre. |
| `Options` | `IReadOnlyList<TDOption>` | vacío | Opciones. `Disabled` desactiva una. | Siempre. |
| `Selected` | `IReadOnlyList<string>` | vacío | Valores iniciales. Se comparan con `TDOption.Value`. | Hay una selección previa. |
| `ShowSelectAll` | `bool` | `false` | Agrega una casilla para marcar todas. | Son más de tres y marcar todas es una tarea real. |
| `Orientation` | `TDOrientation` | `Vertical` | `Horizontal` las pone en fila. | Caben en una línea. |

## TDRadioList

Una sola opción. El `Name` es el grupo de radios.

Úsala para 2 a 5 opciones que la persona debe comparar. Más opciones: `TDSelect`.

```razor
<TDRadioList Name="despacho" Label="Despacho" Cards="true" Selected="retiro" Options="entregas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"opcion"` | Nombre del grupo. Una sola opción llega al post. | Siempre cámbialo. |
| `Label` | `string?` | `null` | Título del grupo. También es `aria-label`. | Siempre. |
| `Options` | `IReadOnlyList<TDOption>` | vacío | `Label`, `Value`, `Hint`, `Disabled`. | Siempre. |
| `Selected` | `string?` | `null` | `Value` de la opción inicial. | Hay un default. |
| `Cards` | `bool` | `false` | Cada opción es una tarjeta. | El `Hint` importa para decidir. |
| `Orientation` | `TDOrientation` | `Vertical` | `Horizontal` las pone en fila. | Son dos o tres y caben. |

## TDSwitch

Interruptor de dos estados. Acepta `@bind-Value`. Si solo se indica `Checked`, ese es el estado inicial. Activo envía `true` e inactivo envía `false`.

Úsalo para una preferencia que se aplica al momento. Para aceptar términos usa `TDCheckBox`.

```razor
<TDSwitch Name="stock" Label="Avisarme cuando vuelva el stock" Checked="true" />
<TDSwitch Name="whatsapp" Label="Seguimiento por WhatsApp" LabelPosition="TDLabelPosition.Start" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. | Debe enviarse. |
| `Label` | `string` | `""` | Texto del interruptor. | Siempre. El interruptor solo no dice qué cambia. |
| `Checked` | `bool` | `false` | Empieza activo cuando no hay `@bind-Value`. | Valor inicial suelto. |
| `Value` | `bool` | `false` | Estado enlazado. Acepta `@bind-Value`. | El interruptor pertenece al modelo. |
| `ValueChanged` | `EventCallback<bool>` | | El formulario devuelve el estado. | Lo escribe `@bind-Value`. |
| `ValueExpression` | `Expression<Func<bool>>?` | `null` | Campo del modelo para la validación. | Lo escribe `@bind-Value`. |
| `Disabled` | `bool` | `false` | No se puede cambiar. | |
| `Size` | `TDSize` | `Medium` | `Small`, `Medium`, `Large`. | Densidad de la barra. |
| `LabelPosition` | `TDLabelPosition` | `End` | `End` texto a la derecha. `Start` texto a la izquierda. | El texto precede al control. |

## TDSelect

Desplegable. Cubre DropDown, DropDown simple y DropDown múltiple.

Una opción: `@bind-Value`. Varias: `Multiple="true"` y `Values`. Cada valor elegido viaja en el post. Si hay `@bind-Value` y no hay `Name`, el nombre es el del modelo y el error de validación queda bajo el campo.

`TDOption.Group` agrupa. `TDOption.Hint` es la segunda línea. `TDOption.Disabled` bloquea esa opción.

```razor
<TDSelect @bind-Value="pedido.Marca" Label="Marca" Options="marcas" />
<TDSelect Name="marca" Label="Marca" Searchable="true" Clearable="true" Options="marcas" />
<TDSelect Name="sistemas" Label="Sistemas" Multiple="true" Chips="true" MaxSelected="3" MaxChips="2" Values="@(new[] { "frenos" })" Options="sistemas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre de cada valor enviado. Si se omite y hay `@bind-Value`, usa el nombre del modelo. Sin enlace, el post usa `valor`. | |
| `Label` | `string?` | `null` | Etiqueta. | Siempre en un formulario. |
| `Hint` | `string?` | `null` | Ayuda bajo el control. | |
| `Placeholder` | `string` | `"Elegir"` | Texto si no hay selección. | El default no describe el dato. |
| `Options` | `IReadOnlyList<TDOption>` | vacío | Opciones. | Siempre. |
| `Value` | `string?` | `null` | Selección simple. Acepta `@bind-Value`. Se ignora como selección visible si `Multiple` es true. | Una sola opción. |
| `ValueChanged` | `EventCallback<string?>` | | El formulario devuelve la opción. | Lo escribe `@bind-Value`. |
| `ValueExpression` | `Expression<Func<string?>>?` | `null` | Campo del modelo para la validación. | Lo escribe `@bind-Value`. |
| `Values` | `IReadOnlyList<string>` | vacío | Selección múltiple inicial. | Junto con `Multiple`. |
| `Multiple` | `bool` | `false` | Permite varias. | Más de un valor. |
| `Searchable` | `bool` | `false` | Caja de búsqueda dentro del panel. | Hay más de ~8 opciones. |
| `Required` | `bool` | `false` | Marca la etiqueta como obligatoria. | |
| `Disabled` | `bool` | `false` | No se abre. | |
| `MaxChips` | `int` | `8` | Cuántos chips se ven. El resto se resume como `+N`. | Muchas selecciones y poco ancho. |
| `MaxSelected` | `int` | `0` | Tope de selecciones. `0` o menos significa sin tope. | Hay un máximo de negocio. |
| `Clearable` | `bool` | `false` | Botón para vaciar la selección. | La selección puede quedar vacía. |
| `Chips` | `bool` | `true` | En múltiple, muestra chips. En `false`, muestra el texto de `Summary`. | Prefieres «3 seleccionadas» en vez de chips. |
| `SelectAll` | `bool` | `false` | Botones Todas y Ninguna. Solo tienen efecto si `Multiple` es true. | Marcar todo es una tarea real. |
| `GroupSelect` | `bool` | `false` | El encabezado de grupo se puede pulsar para elegir el grupo. | Los grupos de `TDOption.Group` son seleccionables. |
| `Summary` | `string?` | `null` | Texto del modo múltiple sin chips. `{0}` es la cantidad. Si se omite: `"{0} seleccionadas"`. | `Chips="false"`. |

Teclado del panel: flechas, Enter, Esc, Retroceso.

## TDDropDownTree

Desplegable jerárquico. Los valores elegidos van en `Selected`.

`LeavesOnly` impide elegir padres. `Multiple` permite varias hojas o nodos.

```razor
<TDDropDownTree Name="categoria" Label="Categoría" LeavesOnly="true" Options="arbol" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"nodo"` | Nombre del post. | Siempre cámbialo. |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string?` | `null` | Ayuda. | |
| `Placeholder` | `string` | `"Elegir categoría"` | Texto vacío. | |
| `Options` | `IReadOnlyList<TDTreeOption>` | vacío | Árbol. | Siempre. |
| `Selected` | `IReadOnlyList<string>` | vacío | Valores iniciales. | |
| `Multiple` | `bool` | `false` | Varios nodos, con casillas. | |
| `LeavesOnly` | `bool` | `false` | Solo se eligen nodos sin hijos. | El padre es solo carpeta. |
| `Required` | `bool` | `false` | Marca de obligatorio. | |

## TDDropDownDataGrid

Desplegable cuyo panel es una tabla. Sirve para elegir un repuesto viendo código, nombre y stock a la vez.

`Columns` y `TDDdRow.Cells` van en el mismo orden. `Text` es lo que queda escrito en el campo. `Value` es lo que se envía.

```razor
<TDDropDownDataGrid Name="PartId" Label="Repuesto" AllowFiltering="true" Clearable="true"
    Columns="@(new[] { "Código", "Repuesto", "Stock" })"
    Rows="filas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"part"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Placeholder` | `string` | `"Selecciona un repuesto…"` | Texto vacío. | |
| `Value` | `string?` | `null` | `TDDdRow.Value` inicial. | |
| `AllowFiltering` | `bool` | `true` | Búsqueda en el panel. | Déjalo en true salvo listas diminutas. |
| `Clearable` | `bool` | `false` | Permite borrar la fila elegida. | |
| `PageSize` | `int` | `8` | Filas por página del panel. | |
| `Columns` | `IReadOnlyList<string>` | vacío | Títulos de columna. | Siempre. |
| `Rows` | `IReadOnlyList<TDDdRow>` | vacío | Filas. | Siempre. |

## TDListBox

Lista siempre visible, simple o múltiple. A diferencia de `TDSelect`, no hay que abrir un panel.

```razor
<TDListBox Name="marca" Label="Marca" Selected="@(new[] { "volvo" })" Options="marcas" />
<TDListBox Name="cats" Label="Categorías" Multiple="true" AllowFiltering="true" FilterPlaceholder="Filtrar…" Options="sistemas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"lista"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `FilterPlaceholder` | `string` | `"Filtrar…"` | Placeholder del filtro. | Junto con `AllowFiltering`. |
| `Options` | `IReadOnlyList<TDOption>` | vacío | Opciones. | |
| `Selected` | `IReadOnlyList<string>` | vacío | Valores iniciales. También en selección simple: un solo elemento. | |
| `Multiple` | `bool` | `false` | Varias filas. | |
| `AllowFiltering` | `bool` | `false` | Muestra el filtro. | Más de ~8 filas. |

## TDAutoComplete

El usuario escribe y elige una sugerencia. El valor enviado es texto (`Value` / lo que quede en el input), no un id forzado.

Úsalo cuando el texto libre es válido y las sugerencias ayudan. Si el valor tiene que ser una de la lista, usa `TDSelect Searchable="true"`.

```razor
<TDAutoComplete Name="repuesto" Label="Repuesto" Placeholder="Escribe para buscar…" Options="sugerencias" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Value` | `string?` | `null` | Texto inicial. | |
| `Placeholder` | `string` | `"Escribe para buscar…"` | | |
| `Options` | `IReadOnlyList<TDOption>` | vacío | Sugerencias. Se filtran por `Label`. Al elegir, el input recibe `Value` de la opción. | |

## TDMask

Formatea mientras se escribe. El valor enviado es el texto ya enmascarado.

Tokens del patrón:

| Token | Acepta |
| --- | --- |
| `0` | Un dígito. |
| `X` o `A` | Una letra. Se guarda en mayúscula. |
| Cualquier otro carácter | Se inserta solo (guion, punto, espacio). |

Letras y dígitos que no coinciden con el token se saltan. No uses esto para un correo ni para texto libre.

```razor
<TDMask Name="patente" Label="Patente" Pattern="XXXX-00" Placeholder="ABCD-12" />
<TDMask Name="telefono" Label="Teléfono" Pattern="+56 0 0000 0000" InputMode="tel" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. Si se omite y hay `@bind-Value`, usa el nombre del modelo. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string?` | `null` | Ayuda. | |
| `Value` | `string?` | `null` | Valor, ya con la forma del patrón. Acepta `@bind-Value`. | |
| `Placeholder` | `string` | `""` | Ejemplo vacío. | Muestra la forma (`ABCD-12`). |
| `Pattern` | `string` | `"XXXX-00"` | Máscara. | Siempre define la forma real. |
| `InputMode` | `string?` | `null` | Teclado móvil. | Teléfono o solo números. |
| `Autocomplete` | `string?` | `null` | Atributo HTML. | |
| `Required` | `bool` | `false` | Obligatorio. | |

## TDNumeric

Cantidad decimal con botones − y +. No formatea moneda: el valor es un `decimal` de un input `type="number"`.

```razor
<TDNumeric Name="cantidad" Label="Cantidad" Value="1" Min="1" Max="99" Step="1" Required="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. Si se omite y hay `@bind-Value`, usa el nombre del modelo. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string?` | `null` | Ayuda. | Unidades, no el número en sí. |
| `Value` | `decimal` | `0` | Cantidad. Acepta `@bind-Value`. | |
| `Min` | `decimal` | `0` | Mínimo. | |
| `Max` | `decimal` | `9999` | Máximo. | |
| `Step` | `decimal` | `1` | Incremento de los botones y del input. | Decimales: `0.5` o `0.01`. |
| `Required` | `bool` | `false` | Obligatorio. | |
| `Disabled` | `bool` | `false` | Bloquea input y botones. | |

## TDDatePicker

Fecha, fecha y hora, o solo hora, según `Mode`. `Value`, `Min` y `Max` son strings del input nativo (`yyyy-MM-dd`, `yyyy-MM-ddTHH:mm`, `HH:mm`).

```razor
<TDDatePicker Name="entrega" Label="Fecha de entrega" Mode="TDDateMode.Date" Min="2026-09-30" Required="true" />
<TDDatePicker Name="cita" Label="Cita" Mode="TDDateMode.DateTime" />
<TDDatePicker Name="hora" Label="Hora" Mode="TDDateMode.Time" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. Si se omite y hay `@bind-Value`, usa el nombre del modelo. | |
| `Mode` | `TDDateMode` | `Date` | `Date`, `DateTime` o `Time`. | El dato incluye hora o no. |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string?` | `null` | Ayuda. | |
| `Value` | `string?` | `null` | Fecha en el formato del modo. Acepta `@bind-Value`. | |
| `Min` | `string?` | `null` | Mínimo, mismo formato que `Value`. | No permitir días pasados. |
| `Max` | `string?` | `null` | Máximo. | |
| `Required` | `bool` | `false` | Obligatorio. | |
| `Disabled` | `bool` | `false` | | |

## TDTimeSpanPicker

Duración. Envía el `TimeSpan` como texto ISO `d.hh:mm:ss` en el campo `Name`.

`ShowDays="false"` oculta los días. `MinutesStep` es el salto de los minutos. `Presets` son atajos.

```razor
<TDTimeSpanPicker Name="duracion" Label="Ventana de despacho" Value="TimeSpan.FromHours(2)" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"duracion"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `ShowDays` | `bool` | `true` | Muestra el campo de días. | La duración puede pasar de 24 h. En false, solo horas y minutos. |
| `MinutesStep` | `int` | `5` | Paso de los minutos. | |
| `Value` | `TimeSpan` | `30` minutos | Valor inicial. | |
| `Presets` | `IReadOnlyList<TimeSpan>` | 30 min, 1 h, 2 h | Atajos visibles. | Los atajos de negocio son otros. |

## TDSlider

Una manija. El número mostrado usa `Suffix` en el servidor; al moverla, el cliente escribe el valor crudo del input.

No hay segunda manija. Para un mínimo y un máximo hacen falta dos sliders o dos numéricos.

```razor
<TDSlider Name="descuento" Label="Descuento" Value="10" Min="0" Max="40" Step="1" Suffix="%" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"rango"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Value` | `double` | `0` | Valor inicial. | |
| `Min` | `double` | `0` | Mínimo. | |
| `Max` | `double` | `100` | Máximo. | |
| `Step` | `double` | `1` | Paso. | |
| `Suffix` | `string?` | `null` | Texto junto al valor inicial (`%`, `km`). | La unidad no cabe en el `Label`. |
| `Disabled` | `bool` | `false` | | |

## TDKnob

Dial circular para un número. Arrastrar, flechas, RePág/AvPág, Inicio y Fin.

Úsalo para un porcentaje o un nivel que se entiende mejor en círculo. En un formulario denso, `TDNumeric` o `TDSlider` se leen más rápido.

```razor
<TDKnob Name="brillo" Label="Brillo" Value="40" Suffix="%" ShowButtons="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"knob"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Value` | `double` | `0` | Valor inicial. | |
| `Min` | `double` | `0` | Mínimo. | |
| `Max` | `double` | `100` | Máximo. | |
| `Step` | `double` | `1` | Paso de teclado y botones. | |
| `Suffix` | `string` | `""` | Unidad pintada en el centro. | |
| `Size` | `int` | `140` | Diámetro en píxeles. | |
| `ShowButtons` | `bool` | `false` | Botones − y +. | Quieres ajuste fino además del arrastre. |
| `ReadOnly` | `bool` | `false` | Se ve y no se edita. | |
| `Disabled` | `bool` | `false` | | |

## TDRating

Estrellas. El valor enviado es el entero en `Name`.

```razor
<TDRating Name="nota" Label="Calidad del repuesto" Value="4" />
<TDRating Name="nota" Value="5" ReadOnly="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"nota"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Value` | `int` | `0` | Estrellas iniciales. | |
| `Max` | `int` | `5` | Cantidad de estrellas. | Otra escala. |
| `ReadOnly` | `bool` | `false` | Solo muestra el valor. | Una reseña ya publicada. |

## TDColorPicker

Input nativo de color más el hex visible. `Value` es `#RRGGBB`.

```razor
<TDColorPicker Name="color" Label="Color de la etiqueta" Value="#ED2A24" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"color"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Value` | `string` | `"#ED2A24"` | Color inicial. | |

## TDFileInput

Un archivo. Cubre FileInput y Upload. Muestra el nombre elegido. No hay parámetro de tamaño máximo ni de selección múltiple: un solo archivo, filtrado con `Accept`.

```razor
<TDFileInput Name="guia" Label="Guía de despacho" Accept="image/*,.pdf" Hint="PDF o foto de la guía firmada." />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post del archivo. Si se omite y hay `Field`, usa el nombre del modelo. | |
| `Field` | `Expression<Func<IFormFile?>>?` | `null` | Propiedad del modelo que recibe el archivo en el post. | El archivo pertenece al formulario. |
| `OnChange` | `EventCallback<InputFileChangeEventArgs>` | | Entrega el archivo en una página interactiva. | La página no espera al post. |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string?` | `null` | Tipos y límite que la persona debe conocer. | Siempre que `Accept` no sea obvio. |
| `Accept` | `string` | `""` | Atributo HTML `accept` (`image/*`, `.pdf`). | Restringe el diálogo del sistema. No reemplaza la validación del servidor. |
| `Placeholder` | `string` | `"Ningún archivo elegido"` | Texto antes de elegir. | |

El formulario que lo contiene tiene que poder enviar archivos (`enctype` multipart).

## TDPhotoButton

Botón de cámara. La persona toma una foto o elige una de la galería. Antes del post, el navegador la convierte a JPEG con calidad 0.85. Si el lado largo pasa de 1920 px, lo baja a 1920. Una foto más chica no se agranda. El archivo del formulario ya es ese JPEG.

La página tiene que cargar Material Symbols e incluir `photo_camera` en `icon_names`. Si el nombre no está en la fuente, el botón muestra la palabra en lugar del ícono.

```razor
@page "/repuesto"
@using TDComponents
@using TDComponents.Components

<EditForm Model="parte" FormName="foto-repuesto" OnSubmit="Guardar" enctype="multipart/form-data">
    <TDPhotoButton Name="fotoChica" Label="Foto pequeña" Size="TDSize.Small" Hint="Toca la cámara. Luego toca la imagen para verla en grande." />
    <TDPhotoButton Name="foto" Label="Foto mediana" Hint="Toca la cámara. Luego toca la imagen para verla en grande." />
    <TDPhotoButton Name="fotoGrande" Label="Foto grande" Size="TDSize.Large" Hint="Toca la cámara. Luego toca la imagen para verla en grande." />
    <TDButton ButtonType="TDButtonType.Submit">Guardar fotos</TDButton>
</EditForm>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post del JPEG. Si se omite y hay `Field`, usa el nombre del modelo. Sin los dos, el post usa `foto`. | |
| `Field` | `Expression<Func<IFormFile?>>?` | `null` | Propiedad del modelo que recibe el JPEG comprimido. | El archivo pertenece al formulario. |
| `Label` | `string?` | `null` | Texto visible y nombre accesible del botón. | Siempre. Sin esto el botón solo se entiende por el ícono. |
| `Hint` | `string` | `"Toca la cámara para tomar una foto o elegir una de la galería. Se comprime antes de enviarla."` | Qué va a pasar, antes de elegir. | Cuando la frase por defecto no alcanza. |
| `Size` | `TDSize` | `Medium` | Tamaño del botón y de la miniatura: `Small`, `Medium` o `Large`. | Una barra densa usa `Small`. Una foto principal usa `Large`. |

No tiene `OnChange`. El archivo listo es el que viaja en el post multipart. No hay parámetro de calidad: es 0.85. Después de elegirla, tocar la miniatura abre el visor de `TDImage`: la foto en grande, con acercar, alejar, girar y cerrar. Para un PDF o un archivo que no deba recomprimirse, usa `TDFileInput`. Para varias fotos seguidas, usa `TDPhotoCapture`.

## TDPhotoCapture

Varias fotos con la cámara del dispositivo. La cámara no se cierra entre tomas. Cada disparo se comprime a JPEG 0.85, entra en la colección y se puede quitar antes de guardar. Al enviar el formulario, viajan todas juntas.

```razor
@page "/repuesto"
@using TDComponents
@using TDComponents.Components

<EditForm Model="parte" FormName="fotos-repuesto" OnSubmit="Guardar" enctype="multipart/form-data">
    <TDPhotoCapture Name="fotos" Label="Fotos del repuesto" Hint="Abre la cámara. Cada toque agrega una foto sin cerrarla. Quita las que no quieras." />
    <TDButton ButtonType="TDButtonType.Submit">Guardar la colección</TDButton>
</EditForm>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post de todas las fotos. Si se omite y hay `Field`, usa el nombre del modelo. Sin los dos, el post usa `fotos`. | |
| `Field` | `Expression<Func<IFormFileCollection?>>?` | `null` | Propiedad del modelo que recibe la colección. | El formulario enlaza `IFormFileCollection` o `List<IFormFile>`. |
| `Label` | `string?` | `null` | Texto visible y nombre accesible del botón que abre la cámara. | Siempre. |
| `Hint` | `string` | `"Abre la cámara y toma las fotos seguidas. Cada una entra en la colección y puedes quitar las que no quieras."` | Qué va a pasar, antes de abrir. | Cuando la frase por defecto no alcanza. |
| `Size` | `TDSize` | `Medium` | Tamaño del botón que abre la cámara. | La misma escala que `TDPhotoButton`. |

No cierra la cámara al tomar. `Cerrar cámara` apaga el video y deja la colección. El formulario tiene que ser `multipart/form-data`. El sitio tiene que ser HTTPS o localhost. Para una sola foto, usa `TDPhotoButton`.

## TDSecurityCode

Casillas de un código de un solo uso. Avanza sola, retrocede con Retroceso y acepta pegar. El valor completo viaja en un hidden `Name`.

`Expected` es el código contra el que el cliente compara. No lo uses como secreto de producción en HTML: queda en el marcado.

```razor
<TDSecurityCode Name="otp" Label="Código de verificación" Length="6" Required="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"codigo"` | Nombre del hidden. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string?` | `null` | Ayuda («Te lo enviamos por SMS»). | |
| `Value` | `string?` | `null` | Dígitos iniciales. | |
| `Expected` | `string?` | `null` | Código esperado, atributo `data-expected`. | Solo una demo. En producción valida el servidor. |
| `Length` | `int` | `6` | Cantidad de casillas. | El código no es de 6. |
| `Required` | `bool` | `false` | Marca de obligatorio. | |

## TDSignaturePad

Lienzo de firma. Al enviar, `Name` lleva una data URL PNG.

```razor
<TDSignaturePad Name="firma" Label="Firma de recepción" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del hidden. Sin `Name` la firma no viaja. | Siempre. |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Hint` | `string` | `"Firma con mouse, lápiz o dedo. Se envía como data URL."` | Ayuda. | Cámbiala si el texto default no corresponde. |

## TDHtmlEditor

Texto enriquecido. El HTML viaja en un hidden `Name`. La barra completa incluye párrafo, enlace y tres colores. `Minimal` deja negrita, cursiva, subrayado y listas.

El valor que llega al servidor hay que sanearlo. El componente no lo sanea solo.

```razor
<TDHtmlEditor Name="nota" Label="Nota interna" Minimal="true" MaxLength="500" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del hidden con el HTML. | Siempre que se envíe. |
| `Label` | `string?` | `null` | Título del editor. | |
| `Value` | `string?` | `null` | HTML inicial. Se pinta como marcado. | |
| `Minimal` | `bool` | `false` | Barra corta. | Un comentario, no un documento. |
| `MaxLength` | `int?` | `null` | Muestra el contador `0 / n` si es mayor que 0. | Hay un tope. |

## TDMarkdown

Editor Markdown con vista previa. `Mode` inicial: `split` (los dos), `source` (solo texto), `preview` (solo vista). La persona puede cambiarlo en la barra.

El post es el Markdown, no HTML.

```razor
<TDMarkdown Name="cuerpo" Label="Descripción" Mode="split" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"markdown"` | Nombre del textarea. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Value` | `string` | `""` | Markdown inicial. | |
| `Mode` | `string` | `"split"` | `split`, `source` o `preview`. | |
| `Toolbar` | `bool` | `true` | Muestra negrita, cursiva, título, lista, código y el cambio de vista. | `false` si el usuario ya escribe Markdown y no quieres barra. |

## TDChip

Etiqueta compacta. No envía un valor de formulario por sí misma.

`Selectable` la vuelve un botón con `aria-pressed`. En ese modo no se pintan `Avatar` ni el botón de quitar. `Removable` muestra la ×.

```razor
<TDChip>Frenos</TDChip>
<TDChip Removable="true" Avatar="V">Volvo</TDChip>
<TDChip Selectable="true" On="true">En stock</TDChip>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Size` | `TDSize` | `Medium` | `Small`, `Medium`, `Large`. | |
| `Removable` | `bool` | `false` | Botón quitar. | La persona puede sacar la etiqueta. |
| `Selectable` | `bool` | `false` | Es un filtro que queda presionado. | |
| `On` | `bool` | `false` | Estado activo inicial. | |
| `Avatar` | `string?` | `null` | Iniciales dentro del chip. Se ignora si `Selectable`. | |
| `ChildContent` | contenido | — | Texto. | Siempre. |

## TDChipList

Campo donde la persona agrega etiquetas con Enter y quita la última con Retroceso. Las sugerencias son textos, no `TDOption`.

Los valores viajan asociados a `Name`.

```razor
<TDChipList Name="tags" Label="Etiquetas" Placeholder="Agrega y pulsa Enter" Values="@(new[] { "volvo" })" Suggestions="@(new[] { "frenos", "filtros" })" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string?` | `null` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Placeholder` | `string` | `"Agrega y pulsa Enter"` | | |
| `Values` | `IReadOnlyList<string>` | vacío | Etiquetas iniciales. | |
| `Suggestions` | `IReadOnlyList<string>` | vacío | Sugerencias para agregar. | Hay un vocabulario conocido y también texto libre. |

## TDSelectBar

Segmentos para pocas opciones. Simple o múltiple. Cada opción usa `TDOption.Label` y `Value`.

Úsala con 2 a 5 opciones cortas. Textos largos: `TDRadioList` con `Cards`.

```razor
<TDSelectBar Name="turno" Label="Turno" Options="turnos" Selected="@(new[] { "am" })" />
<TDSelectBar Name="canales" Multiple="true" Options="canales" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"barra"` | Nombre del post. | |
| `Label` | `string?` | `null` | Etiqueta. | |
| `Options` | `IReadOnlyList<TDOption>` | vacío | Segmentos. | |
| `Selected` | `IReadOnlyList<string>` | vacío | Valores iniciales. | |
| `Multiple` | `bool` | `false` | Varios segmentos a la vez. | |
| `Size` | `TDSize` | `Medium` | | |

## TDFieldset

Agrupa campos bajo una leyenda. Se puede plegar. Es el componente del catálogo Fieldset y también el de FormField.

```razor
<TDFieldset Legend="Datos de la flota">
    <TDTextBox @bind-Value="pedido.Flota" Label="Nombre de la flota" />
    <TDMask Name="patente" Label="Patente principal" Pattern="XXXX-00" />
</TDFieldset>

<TDFieldset Legend="Avanzado" Collapsed="true">
    <TDTextBox @bind-Value="pedido.Nota" Label="Nota" />
</TDFieldset>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Legend` | `string` | `""` | Título del grupo. Es el control para plegar. | Siempre. Un grupo sin nombre no se entiende. |
| `Collapsed` | `bool` | `false` | Empieza cerrado. | El bloque es secundario. |
| `ChildContent` | contenido | — | Los campos. | Siempre. |

## TDMessage

Aviso en línea, no un toast. `Danger` y `Warning` usan `role="alert"`. El resto usa `role="status"`.

```razor
<TDMessage Severity="TDSeverity.Success" Title="Pedido recibido">El número es OC-2026-00481.</TDMessage>
<TDMessage Severity="TDSeverity.Danger" Closable="true">Revisa el RUT.</TDMessage>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Severity` | `TDSeverity` | `Info` | `Info`, `Success`, `Warning`, `Danger`, `Secondary`. | Según la consecuencia, no según el color que prefieras. |
| `Title` | `string?` | `null` | Primera línea corta. | El cuerpo necesita un resumen. |
| `Closable` | `bool` | `false` | Botón cerrar. | El aviso no bloquea el siguiente paso. |
| `ChildContent` | contenido | — | Cuerpo. | Siempre. |

## TDSplitButton

Una acción principal y un menú de alternativas. El botón principal no envía el formulario (`ButtonType` interno es `Button`). Las alternativas son `<button type="button">` hijos.

```razor
<TDSplitButton Label="Cotizar">
    <button type="button">Descargar cotización PDF</button>
    <button type="button">Enviar por correo</button>
</TDSplitButton>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Label` | `string` | `"Acción"` | Texto de la acción principal. | |
| `Variant` | `TDVariant` | `Primary` | Cara de la barra. | La acción no es la primaria de la página: `Secondary`. |
| `ChildContent` | contenido | — | Botones del menú. | Siempre, si no el menú queda vacío. |

## TDFab

Botón flotante. Si tiene contenido hijo, ese contenido es el menú. No pongas `Menu`: ese parámetro no existe. `Href` solo se usa cuando no hay menú; si hay hijos, el control es un botón.

```razor
<TDFab AriaLabel="Nuevo pedido" Href="/pedidos/nuevo" />

<TDFab AriaLabel="Crear" Extended="true" Label="Nuevo">
    <button type="button">Pedido</button>
    <button type="button">Cotización</button>
</TDFab>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Acción principal"` | Nombre accesible. Obligatorio de verdad si no hay texto visible. | Siempre. |
| `Label` | `string?` | `null` | Texto visible. Solo se ve si `Extended` es true. | |
| `Href` | `string?` | `null` | Destino. Se ignora si hay `ChildContent`. | Un solo destino, sin menú. |
| `Extended` | `bool` | `false` | Muestra `Label` al lado del ícono. | La acción no se entiende con el ícono solo. |
| `Dark` | `bool` | `false` | Variante oscura. | El fondo de la página es claro y el FAB debe contrastar al revés. |
| `Size` | `TDSize` | `Medium` | `Small` reduce el botón. `Large` no cambia el tamaño respecto de `Medium`. | Un FAB secundario. |
| `Icon` | contenido | — | Ícono. | Siempre que no baste el texto extendido. |
| `ChildContent` | contenido | — | Acciones del menú. Su presencia abre el modo menú. | Hay más de un destino. |

## TDSpeedDial

Otro botón flotante, con acciones que se abren en línea, a la derecha, en círculo, semicírculo o cuarto de círculo. Las acciones salen de `Items`, no de contenido hijo.

`Type`: `linear` (hacia arriba, default), `right`, `circle`, `semi`, `quarter`.

```razor
<TDSpeedDial AriaLabel="Contacto" Type="linear" Mask="true" Items="acciones" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `AriaLabel` | `string` | `"Acciones rápidas"` | Nombre del botón. | |
| `Type` | `string` | `"linear"` | Disposición. Valores: `linear`, `right`, `circle`, `semi`, `quarter`. | El espacio alrededor del botón. |
| `Mask` | `bool` | `false` | Oscurece el resto de la página mientras está abierto. | Las acciones deben tapar la página. |
| `Items` | `IReadOnlyList<TDMenuItem>` | vacío | Acciones. `Text`, `Href`, `Icon`. | Siempre. |

Enter abre. Flechas recorren. Esc cierra y devuelve el foco.

## TDSpeechToTextButton

Dictado con el reconocimiento del navegador. Escribe en el elemento cuyo `id` es `Target`. No elige el campo por `Name`.

Ponle un `id` explícito al input destino. `TDTextBox` genera su `id` solo y no lo expone: no lo uses como destino salvo que el `id` esté bajo tu control.

```razor
<input id="nota" name="nota" />
<TDSpeechToTextButton Target="nota" Language="es-CL" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Target` | `string` | `""` | `id` del campo que recibe el texto. | Siempre. Vacío no dicta en ningún lado. |
| `Language` | `string` | `"es-CL"` | Idioma del reconocimiento. | Otro idioma. |
| `Continuous` | `bool` | `false` | Sigue escuchando. | Un dictado largo. En false, una frase. |

## TDInplace

Muestra un disparador y, al pulsarlo, un panel con el editor que tú pongas. No sabe guardar: el editor hijo es tuyo.

Para texto, número o una lista ya resueltos, usa `TDInplaceEdit`.

```razor
<TDInplace>
    <Trigger>12 unidades</Trigger>
    <ChildContent>
        <TDNumeric Name="cantidad" Value="12" />
    </ChildContent>
</TDInplace>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Trigger` | contenido | — | Lo que se ve antes de editar. | Siempre. |
| `ChildContent` | contenido | — | El editor. | Siempre. |

## TDInplaceEdit

Valor visible que se cambia en el mismo lugar. Escribe el resultado en un hidden `Name`.

Sin `AutoCommit`, un clic abre el editor y hay que confirmar o cancelar. Con `AutoCommit`, se edita con doble clic y se guarda al salir.

Si `Options` tiene elementos, el editor es un `select` y se ignoran `Multiline` y `Numeric`.

```razor
<TDInplaceEdit Name="bodega" Field="bodega" Label="Bodega" Value="Santiago" />
<TDInplaceEdit Name="nota" Label="Nota" Value="Llamar antes" Multiline="true" />
<TDInplaceEdit Name="estado" Label="Estado" Value="ok" Options="estados" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Name` | `string` | `"valor"` | Nombre del hidden. | |
| `Field` | `string` | `"Campo"` | Identificador en `data-field`. No es la etiqueta visible. | El script o el servidor distinguen varios inplace. |
| `Label` | `string` | `"Valor"` | Nombre accesible («Bodega: Santiago»). | Siempre uno claro. |
| `Value` | `string` | `""` | Texto inicial. | |
| `AutoCommit` | `bool` | `false` | Doble clic y guardado al salir, sin botones de confirmar. | Ediciones cortas y frecuentes. |
| `Multiline` | `bool` | `false` | Textarea. | Notas. |
| `Numeric` | `bool` | `false` | `inputmode="decimal"`. | Cantidades. |
| `Options` | `IReadOnlyList<TDOption>?` | `null` | Si tiene ítems, el editor es un desplegable. | El valor pertenece a una lista cerrada. |

## TDChat

Conversación entre dos partes. No es un campo de formulario. Los mensajes nuevos los agrega el cliente al enviar el composer; `Messages` es el historial inicial.

```razor
<TDChat Title="Camila Rojas" Avatar="CR" Status="En línea" CurrentUser="Tú" Messages="mensajes" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `"Camila Rojas"` | Nombre de la otra persona. | |
| `Avatar` | `string` | `"CR"` | Iniciales. | |
| `Status` | `string` | `"En línea · responde en minutos"` | Bajada del encabezado. | |
| `CurrentUser` | `string` | `"Tú"` | Nombre de quien escribe, atributo `data-user`. | |
| `Placeholder` | `string` | `"Escribe un mensaje…"` | Composer. | |
| `ShowTyping` | `bool` | `false` | Sustituye `Status` por «escribiendo…». | La otra parte está escribiendo. |
| `Messages` | `IReadOnlyList<TDChatMessage>` | vacío | Historial. `Mine` true es la burbuja propia. | |

## TDAIChat

Asistente que responde solo con un recorte de catálogo que tú le pasas. No llama a un modelo. No usa SignalR.

`Catalog` es texto. Una línea por repuesto, columnas separadas por `|`:

```text
código|nombre|marca|modelo|stock|precio
```

Hacen falta al menos 4 columnas. El stock es la quinta (índice 4). Si la pregunta contiene «agotado», lista las filas con stock menor o igual a 0.

```razor
<TDAIChat Catalog="@catalogo" Placeholder="Pregunta por un repuesto…" Suggestions="@(new[] { "Pastillas para Volvo", "¿Qué está agotado?" })" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Placeholder` | `string` | `"Pregunta por un repuesto…"` | Caja de pregunta. | |
| `Suggestions` | `IReadOnlyList<string>` | dos frases de ejemplo | Botones que rellenan la pregunta. | |
| `Catalog` | `string` | `""` | Líneas `código\|nombre\|marca\|modelo\|stock\|precio`. | Siempre. Vacío no tiene con qué responder. |
