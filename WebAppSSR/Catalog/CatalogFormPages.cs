namespace WebAppSSR.Catalog;

internal static class CatalogFormPages
{
    public static IReadOnlyList<CatalogCode>? For(string id) => id.ToLowerInvariant() switch
    {
        "button" => [Page("Pages/Pedido.razor", "/pedido", """
<p class="td-section-title">Variantes</p>
<div class="td-row">
    <TDButton ButtonType="TDButtonType.Button">Agregar al carrito</TDButton>
    <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Ver ficha</TDButton>
    <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Ghost">Cotizar</TDButton>
    <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Danger">Eliminar</TDButton>
    <TDButton ButtonType="TDButtonType.Button" Disabled="true">Agotado</TDButton>
</div>
<p class="td-section-title">Tamaños e íconos</p>
<div class="td-row">
    <TDButton ButtonType="TDButtonType.Button" Size="TDSize.Small">Pequeño</TDButton>
    <TDButton ButtonType="TDButtonType.Button">Mediano</TDButton>
    <TDButton ButtonType="TDButtonType.Button" Size="TDSize.Large">Grande</TDButton>
    <TDButton ButtonType="TDButtonType.Button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
        Con ícono
    </TDButton>
</div>
<p class="td-section-title">Estado de carga</p>
<div class="td-row">
    <TDButton ButtonType="TDButtonType.Button" PendingText="Enviando…" data-td-busy-demo>Enviar</TDButton>
</div>
""")],
        "textbox" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="pedido" OnSubmit="Guardar" Enhance>
    <div class="td-demo-grid">
        <TDTextBox @bind-Value="pedido.Flota" Label="Básico" Placeholder="Escribe aquí…" />
        <TDTextBox @bind-Value="pedido.Solicitud" Label="Contador" MaxLength="40" ShowCounter="true" />
        <TDTextBox @bind-Value="pedido.Clave" Label="Contraseña" InputType="password" ShowSecretText="Mostrar contraseña" HideSecretText="Ocultar contraseña" />
    </div>
</EditForm>
""", Pedido)],
        "textarea" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="solicitud" OnSubmit="Guardar" Enhance>
    <TDTextBox @bind-Value="pedido.Solicitud" Label="Solicitud" Multiline="true" Rows="4" MaxLength="280" ShowCounter="true" Hint="Qué necesitas que hagamos." />
</EditForm>
""", Pedido)],
        "password" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="clave" OnSubmit="Guardar" Enhance>
    <TDTextBox @bind-Value="pedido.Clave" Label="Contraseña de acceso" InputType="password" ShowSecretText="Mostrar contraseña" HideSecretText="Ocultar contraseña" />
</EditForm>
""", Pedido)],
        "form" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="pedido" OnSubmit="Guardar" Enhance>
    <TDTextBox @bind-Value="pedido.Flota" Label="Nombre de la flota" Placeholder="Transportes del Sur" Hint="Nombre con el que aparece en el despacho." />
    <TDTextBox @bind-Value="pedido.Solicitud" Label="Solicitud" Multiline="true" Rows="4" MaxLength="280" ShowCounter="true" Hint="Qué necesitas que hagamos." />
    <TDTextBox @bind-Value="pedido.Clave" Label="Contraseña de acceso" InputType="password" ShowSecretText="Mostrar contraseña" HideSecretText="Ocultar contraseña" />
</EditForm>
""", Pedido)],
        "label" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="etiqueta" OnSubmit="Guardar" Enhance>
    <TDLabel For="part-code" Required="true">Número de parte</TDLabel>
    <TDTextBox @bind-Value="pedido.Flota" Label="" />
    <TDLabel For="ref-interna" Optional="true">Referencia interna</TDLabel>
    <TDTextBox @bind-Value="pedido.Solicitud" Label="" />
</EditForm>
""", Pedido)],
        "checkbox" => [Page("Pages/Pedido.razor", "/pedido", """
<div class="td-demo-grid">
    <div class="td-demo-block">
        <p class="td-section-title">Simple</p>
        <TDCheckBox Name="terminos" Label="Acepto los términos de despacho" Checked="true" />
        <TDCheckBox Name="factura" Label="Emitir factura electrónica" Disabled="true" />
    </div>
    <div class="td-demo-block">
        <p class="td-section-title">Tres estados</p>
        <TDCheckBox Name="todas" Label="Todas las bodegas" TriState="true" Indeterminate="true" />
        <TDCheckBox Name="santiago" Label="Santiago" Checked="true" />
        <TDCheckBox Name="conce" Label="Concepción" />
    </div>
</div>
""")],
        "checkboxlist" => [Page("Pages/Pedido.razor", "/pedido", """
<TDCheckBoxList Name="sistemas"
                ShowSelectAll="true"
                Selected="@(new[] { "frenos" })"
                Options="@(new TDOption[] { new("frenos", "Frenos"), new("suspension", "Suspensión"), new("motor", "Motor") })" />
""")],
        "switch" => [Page("Pages/Pedido.razor", "/pedido", """
<TDSwitch Name="stock" Label="Avisarme cuando vuelva el stock" Checked="true" />
<TDSwitch Name="whatsapp" Label="Seguimiento por WhatsApp" LabelPosition="TDLabelPosition.Start" />
<TDSwitch Name="sms" Label="Alertas por SMS" Size="TDSize.Small" Disabled="true" />
""")],
        "radiolist" => [Page("Pages/Pedido.razor", "/pedido", """
<TDRadioList Name="entrega" Label="Entrega" Cards="true" Selected="retiro"
             Options="@(new TDOption[] {
                 new("retiro", "Retiro en bodega", Hint: "Hoy, sin costo"),
                 new("santiago", "Despacho Santiago", Hint: "24 horas hábiles"),
                 new("region", "Despacho a regiones", Hint: "2 a 5 días", Disabled: true)
             })" />
""")],
        "dropdown" or "select" => [Page("Pages/Pedido.razor", "/pedido", """
<div class="td-demo-grid">
    <TDSelect Name="basica" Label="Básica" Value="volvo" Options="marcas" />
    <TDSelect Name="busca" Label="Con búsqueda" Searchable="true" Value="scania" Options="marcas" />
    <TDSelect Name="grupo" Label="Agrupada" Value="pastilla" Options="repuestos" />
    <TDSelect Name="plantilla" Label="Con plantilla" Value="retiro" Options="entregas" />
    <TDSelect Name="borrar" Label="Con borrar" Clearable="true" Value="mercedes" Options="marcas" />
    <TDSelect Name="off" Label="Opciones deshabilitadas" Value="volvo" Options="marcasOff" />
    <TDSelect Name="propio" Label="Valor propio" Value="FH-460" Options="marcas" Placeholder="Escribe o elige" />
    <TDSelect Name="virtual" Label="Lista larga" Searchable="true" Value="p01" Options="largos" />
    <TDSelect Name="disabled" Label="Deshabilitada" Disabled="true" Value="volvo" Options="marcas" />
</div>
""", """
    private readonly TDOption[] marcas = [new("volvo", "Volvo"), new("scania", "Scania"), new("mercedes", "Mercedes-Benz"), new("man", "MAN")];
    private readonly TDOption[] marcasOff = [new("volvo", "Volvo"), new("scania", "Scania", Disabled: true), new("mercedes", "Mercedes-Benz")];
    private readonly TDOption[] repuestos = [new("pastilla", "Pastilla delantera", Group: "Frenos"), new("disco", "Disco ventilado", Group: "Frenos"), new("filtro", "Filtro de aceite", Group: "Motor"), new("correa", "Correa auxiliar", Group: "Motor")];
    private readonly TDOption[] entregas = [new("retiro", "Retiro en bodega", Hint: "Hoy, sin costo"), new("santiago", "Despacho Santiago", Hint: "24 horas hábiles"), new("region", "Despacho a regiones", Hint: "2 a 5 días")];
    private readonly TDOption[] largos = Enumerable.Range(1, 48).Select(i => new TDOption($"p{i:00}", $"Repuesto {i:00} · lote {200 + i}")).ToArray();
""")],
        "ddmulti" => [Page("Pages/Pedido.razor", "/pedido", """
<div class="td-demo-grid">
    <TDSelect Name="cats" Label="Chips, todas y filtro" Multiple="true" Searchable="true" SelectAll="true" Clearable="true"
              Values="@(new[] { "frenos", "motor" })" Options="sistemas" Placeholder="Elige categorías" />
    <TDSelect Name="resumen" Label="Texto resumen" Multiple="true" Chips="false" Summary="{0} categorías" Clearable="true"
              Values="@(new[] { "frenos", "filtros" })" Options="sistemas" />
    <TDSelect Name="tope" Label="Límite de 3" Multiple="true" MaxSelected="3" Clearable="true"
              Values="@(new[] { "frenos" })" Options="sistemas" />
    <TDSelect Name="mas" Label="Chips con desborde" Multiple="true" MaxChips="2" Clearable="true"
              Values="@(new[] { "frenos", "motor", "filtros", "cabina" })" Options="sistemas" />
    <TDSelect Name="grupo" Label="Agrupado" Multiple="true" GroupSelect="true" Searchable="true" Clearable="true"
              Values="@(new[] { "pastilla" })" Options="repuestos" />
</div>
""", """
    private readonly TDOption[] sistemas = [new("frenos", "Frenos"), new("motor", "Motor"), new("electrico", "Eléctrico"), new("suspension", "Suspensión"), new("filtros", "Filtros"), new("cabina", "Cabina")];
    private readonly TDOption[] repuestos = [new("pastilla", "Pastilla delantera", Group: "Frenos"), new("disco", "Disco ventilado", Group: "Frenos"), new("filtro", "Filtro de aceite", Group: "Motor"), new("correa", "Correa auxiliar", Group: "Motor")];
""")],
        "ddtree" => [Page("Pages/Pedido.razor", "/pedido", """
<div class="td-demo-grid">
    <TDDropDownTree Name="cat" Label="Categoría" Selected="@(new[] { "pastillas" })" Options="arbol" />
    <TDDropDownTree Name="hoja" Label="Solo hojas" LeavesOnly="true" Selected="@(new[] { "aceite" })" Options="arbol" Hint="Los nodos padre no se eligen." />
    <TDDropDownTree Name="multi" Label="Múltiple" Multiple="true" Selected="@(new[] { "pastillas", "discos" })" Options="arbol" />
</div>
""", """
    private readonly TDTreeOption[] arbol =
    [
        new("frenos", "Frenos", [new("pastillas", "Pastillas"), new("discos", "Discos"), new("liquido", "Líquido", Disabled: true)]),
        new("motor", "Motor", [new("aceite", "Filtro de aceite"), new("aire", "Filtro de aire")])
    ];
""")],
        "ddgrid" => [Page("Pages/Pedido.razor", "/pedido", """
<TDDropDownDataGrid Name="PartId" Label="Repuesto" AllowFiltering="true" Clearable="true"
                    Value="1"
                    Columns="@(new[] { "Código", "Repuesto", "Marca", "Stock", "Precio" })"
                    Rows="filas" />
""", """
    private readonly TDDdRow[] filas =
    [
        new("1", "Pastilla de freno delantera", ["BR-4521-AD", "Pastilla de freno delantera", "Volvo", "42", "$189990"]),
        new("2", "Amortiguador de cabina", ["SU-1180-KT", "Amortiguador de cabina", "Scania", "8", "$246500"]),
        new("3", "Filtro de aceite", ["MT-7702-FL", "Filtro de aceite", "Mercedes-Benz", "120", "$24990"])
    ];
""")],
        "htmleditor" => [Page("Pages/Nota.razor", "/nota", """
<TDHtmlEditor Name="nota" Label="Barra completa" MaxLength="480" Value="@nota" />
<TDHtmlEditor Name="min" Label="Barra mínima" Minimal="true" Value="<p>Retiro hoy en <b>Santiago centro</b>.</p>" />
""", """
    private const string nota = "<h2>Nota de despacho</h2><p>Retiro en bodega <b>Santiago centro</b> antes de las 14 h. Pedido <a href=\"/c/grid\">OC-00481</a>.</p><ul><li>Pastilla BR-4521-AD</li><li>Disco ventilado 45 mm</li></ul>";
""")],
        "signature" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDSignaturePad Name="firma" Label="Firma del receptor" />
""")],
        "numeric" => [Page("Pages/Pedido.razor", "/pedido", """
<TDNumeric Name="unidades" Label="Unidades a despachar" Value="4" Min="1" Max="48" Hint="Mínimo 1 · máximo 48" />
""")],
        "slider" => [Page("Pages/Pedido.razor", "/pedido", """
<TDSlider Name="precio" Label="Precio máximo" Value="180000" Min="0" Max="500000" Step="10000" Suffix="CLP" />
""")],
        "colorpicker" => [Page("Pages/Etiqueta.razor", "/etiqueta", """
<TDColorPicker Name="acento" Label="Color de etiqueta" Value="#ED2A24" />
""")],
        "date" => [Page("Pages/Despacho.razor", "/despacho", """
<p class="td-section-title">Fecha</p>
<TDDatePicker Name="despacho" Label="Fecha de despacho" Hint="No se pueden elegir fechas pasadas." Min="@DateTime.Today.ToString("yyyy-MM-dd")" />
<p class="td-section-title">Fecha y hora</p>
<TDDatePicker Mode="TDDateMode.DateTime" Name="cita" Label="Fecha y hora de la cita" Hint="Elige el día y la hora. Las fechas pasadas quedan fuera." Min="@DateTime.Today.ToString("yyyy-MM-ddTHH:mm")" />
<p class="td-section-title">Solo hora</p>
<TDDatePicker Mode="TDDateMode.Time" Name="retiro" Label="Hora de retiro" Hint="Solo la hora, en formato de 24 horas." />
""")],
        "mask" => [Page("Pages/Pedido.razor", "/pedido", """
<TDMask Name="patente" Label="Patente" Pattern="XXXX-00" Placeholder="ABCD-12" Hint="Formato chileno de patente." />
<TDMask Name="telefono" Label="Teléfono" Pattern="00 0000 0000" Placeholder="09 1234 5678" InputMode="tel" />
""")],
        "rating" => [Page("Pages/Pedido.razor", "/pedido", """
<TDRating Name="calidad" Label="Calidad del repuesto" Value="4" />
<TDRating Name="lectura" Label="Promedio de reseñas" Value="5" ReadOnly="true" />
""")],
        "chip" => [Page("Pages/Catalogo.razor", "/catalogo", """
<p class="td-section-title">Filtro (alternable)</p>
<div class="td-chip-row">
    <TDChip Selectable="true" On="true">En stock</TDChip>
    <TDChip Selectable="true">Originales</TDChip>
    <TDChip Selectable="true">Despacho 24 h</TDChip>
    <TDChip Selectable="true">Ofertas</TDChip>
</div>
<p class="td-section-title">Removibles</p>
<div class="td-chip-row">
    <div class="td-chip-row" data-td-chip-box>
        <TDChip Removable="true" Avatar="VO">Volvo</TDChip>
        <TDChip Removable="true" Avatar="SC">Scania</TDChip>
        <TDChip Removable="true" Avatar="F">Frenos</TDChip>
    </div>
    <button type="button" class="td-btn td-btn--ghost" data-td-chip-reset>Restablecer</button>
</div>
<p class="td-section-title">Tamaños</p>
<div class="td-chip-row">
    <TDChip Size="TDSize.Small">Pequeño</TDChip>
    <TDChip Size="TDSize.Medium">Mediano</TDChip>
    <TDChip Size="TDSize.Large">Grande</TDChip>
</div>
""")],
        "chiplist" => [Page("Pages/Pedido.razor", "/pedido", """
<TDChipList Name="tags" Label="Etiquetas" Values="@(new[] { "Volvo", "Frenos" })" Suggestions="@(new[] { "Scania", "Motor", "En stock" })" />
""")],
        "selectbar" => [Page("Pages/Pedido.razor", "/pedido", """
<TDSelectBar Name="vehiculo" Label="Selección simple" Selected="@(new[] { "camion" })"
             Options="@(new TDOption[] { new("camion", "Camión"), new("bus", "Bus"), new("remolque", "Remolque") })" />
<TDSelectBar Name="cats" Label="Selección múltiple" Multiple="true" Selected="@(new[] { "frenos", "motor" })" Options="sistemas" />
<TDSelectBar Name="tipo" Label="Con íconos · pequeño" Size="TDSize.Small" Selected="@(new[] { "camion" })" Options="iconos" />
""", """
    private readonly TDOption[] sistemas = [new("frenos", "Frenos"), new("motor", "Motor"), new("electrico", "Eléctrico"), new("suspension", "Suspensión"), new("filtros", "Filtros"), new("cabina", "Cabina")];
    private readonly TDOption[] iconos =
    [
        new("camion", "Camión", Icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 7h11v8H3z\"/><path d=\"M14 10h4l3 3v2h-7z\"/><circle cx=\"7\" cy=\"17\" r=\"2\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/></svg>"),
        new("bus", "Bus", Icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"4\" y=\"3\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M4 11h16M8 19v2M16 19v2\"/></svg>"),
        new("remolque", "Remolque", Icon: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M2 8h13v7H2zM15 11h5l2 3v1h-7z\"/><circle cx=\"6\" cy=\"18\" r=\"2\"/><circle cx=\"18\" cy=\"18\" r=\"2\"/></svg>")
    ];
""")],
        "togglebutton" => [Page("Pages/Catalogo.razor", "/catalogo", """
<div class="td-row">
    <TDToggleButton Name="vista" Value="grilla" Group="vista" Pressed="true">Grilla</TDToggleButton>
    <TDToggleButton Name="vista" Value="lista" Group="vista">Lista</TDToggleButton>
</div>
""")],
        "message" => [Page("Pages/Pedido.razor", "/pedido", """
<TDMessage Severity="TDSeverity.Success" Title="Pedido recibido" Closable="true">Guardamos OC-00481. Te avisamos cuando salga de bodega.</TDMessage>
<TDMessage Severity="TDSeverity.Warning" Title="Stock bajo">Quedan 3 pastillas BR-4521-AD.</TDMessage>
<TDMessage Severity="TDSeverity.Danger" Title="No pudimos emitir la guía">El servidor de facturación no respondió.</TDMessage>
""")],
        "seccode" => [Page("Pages/Acceso.razor", "/acceso", """
<TDSecurityCode Name="otp" Label="Ingresa el código que enviamos al +56 9 •••• 4567" Hint="Prueba 246810 · admite pegar el código completo" Expected="246810" />
""")],
        "fileinput" or "upload" => [Page("Pages/Despacho.razor", "/despacho", """
<TDFileInput Name="guia" Label="Guía de despacho" Accept="image/*,.pdf" Hint="PDF o foto de la guía firmada." />
""")],
        "fieldset" or "formfield" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="flota" OnSubmit="Guardar" Enhance>
    <TDFieldset Legend="Datos de la flota">
        <TDTextBox @bind-Value="pedido.Flota" Label="Nombre de la flota" />
        <TDMask Name="patente-flota" Label="Patente principal" Pattern="XXXX-00" Placeholder="ABCD-12" />
    </TDFieldset>
</EditForm>
""", Pedido)],
        "listbox" => [Page("Pages/Pedido.razor", "/pedido", """
<div class="td-demo-grid">
    <TDListBox Name="marca" Label="Simple" Selected="@(new[] { "volvo" })" Options="marcas" />
    <TDListBox Name="cats" Label="Múltiple con búsqueda" Multiple="true" AllowFiltering="true"
               FilterPlaceholder="Filtrar categorías…"
               Selected="@(new[] { "frenos", "filtros" })" Options="sistemas" />
</div>
""", """
    private readonly TDOption[] marcas = [new("volvo", "Volvo"), new("scania", "Scania"), new("mercedes", "Mercedes-Benz"), new("man", "MAN")];
    private readonly TDOption[] sistemas = [new("frenos", "Frenos"), new("motor", "Motor"), new("electrico", "Eléctrico"), new("suspension", "Suspensión"), new("filtros", "Filtros"), new("cabina", "Cabina")];
""")],
        "autocomplete" => [Page("Pages/Pedido.razor", "/pedido", """
<TDAutoComplete Name="part" Label="Repuesto" Placeholder="Escribe pastilla o filtro…"
                Options="@(new TDOption[] {
                    new("br", "Pastilla de freno delantera"),
                    new("at", "Pastilla de freno trasera"),
                    new("fi", "Filtro de aceite"),
                    new("am", "Amortiguador de cabina")
                })" />
""")],
        "splitbtn" => [Page("Pages/Pedido.razor", "/pedido", """
<TDSplitButton Label="Cotizar">
    <button type="button">Descargar cotización PDF</button>
    <button type="button">Enviar por correo</button>
    <button type="button">Duplicar pedido anterior</button>
</TDSplitButton>
<TDSplitButton Label="Exportar" Variant="TDVariant.Secondary">
    <button type="button">Excel</button>
    <button type="button">CSV</button>
    <button type="button">PDF</button>
</TDSplitButton>
""")],
        "fab" => [Page("Pages/Catalogo.razor", "/catalogo", """
<p class="td-section-title">Catálogo · 24 repuestos</p>
<TDFab Href="/c/quote" AriaLabel="Nueva cotización">
    <Icon>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
    </Icon>
</TDFab>
<TDFab Size="TDSize.Small" AriaLabel="Agregar">
    <Icon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
    </Icon>
</TDFab>
<TDFab Extended="true" Dark="true" Label="Rastrear pedido" AriaLabel="Rastrear pedido">
    <Icon>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h11v8H3z"></path><path d="M14 10h4l3 3v2h-7z"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>
    </Icon>
</TDFab>
""")],
        "fabmenu" => [Page("Pages/Catalogo.razor", "/catalogo", """
<TDFab AriaLabel="Acciones rápidas">
    <Icon>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>
    </Icon>
    <ChildContent>
        <button type="button">Nueva cotización</button>
        <button type="button">Pedido rápido</button>
        <button type="button">Llamar a un asesor</button>
    </ChildContent>
</TDFab>
""")],
        "speeddial" => [Page("Pages/Catalogo.razor", "/catalogo", """
<TDSpeedDial Type="linear" AriaLabel="Acciones rápidas" Items="acciones" />
<TDSpeedDial Type="right" AriaLabel="Acciones hacia la derecha" Items="acciones" />
<TDSpeedDial Type="circle" AriaLabel="Acciones en círculo" Items="acciones" />
<TDSpeedDial Type="semi" AriaLabel="Acciones en semicírculo" Items="acciones" />
<TDSpeedDial Type="quarter" AriaLabel="Acciones en cuarto" Items="acciones" />
<TDSpeedDial Type="mask" Mask="true" AriaLabel="Acciones con máscara" Items="acciones" />
""", """
    private readonly TDMenuItem[] acciones =
    [
        new("Llamar", "tel:+56912345678"),
        new("WhatsApp", "https://wa.me/56912345678"),
        new("Cotizar", "/c/splitbtn"),
        new("Rastrear", "/c/etrack")
    ];
""")],
        "inplace" => [Page("Pages/Ficha.razor", "/ficha", """
<TDInplace>
    <Trigger>Ver datos del cliente</Trigger>
    <ChildContent>
        <strong>Transportes del Sur</strong>
        <span class="td-home__note">RUT 76.482.190-3 · Flota 42</span>
        <span class="td-home__note">Crédito a 30 días · 128 pedidos</span>
    </ChildContent>
</TDInplace>
<TDInplaceEdit Name="cliente" Field="Cliente" Label="Cliente" Value="Transportes del Sur" />
<TDInplaceEdit Name="pedidos" Field="Pedidos" Label="Pedidos" Value="128 pedidos" AutoCommit="true" />
<TDInplaceEdit Name="titulo" Field="Título" Label="Título" Value="Pastilla de freno delantera" AutoCommit="true" />
<TDInplaceEdit Name="marca" Field="Marca" Label="Marca" Value="Volvo" AutoCommit="true" Options="marcas" />
<TDInplaceEdit Name="precio" Field="Precio" Label="Precio" Value="42990" Numeric="true" AutoCommit="true" />
<TDInplaceEdit Name="notas" Field="Notas" Label="Notas" Value="Juego de 4. Retiro en Santiago." Multiline="true" AutoCommit="true" />
""", """
    private readonly TDOption[] marcas = [new("volvo", "Volvo"), new("scania", "Scania"), new("mercedes", "Mercedes-Benz"), new("man", "MAN")];
""")],
        "timespan" => [Page("Pages/Taller.razor", "/taller", """
<TDTimeSpanPicker Name="InstallTime" Label="Tiempo de instalación" />
""")],
        "knob" => [Page("Pages/Tablero.razor", "/tablero", """
<TDKnob Name="presion" Label="Presión" Value="4" Min="0" Max="10" Step="0.5" Suffix="bar" />
<TDKnob Name="temp" Label="Temperatura" Value="88" Min="60" Max="110" Suffix="°C" />
<TDKnob Name="vol" Label="Volumen" Value="40" Step="5" ShowButtons="true" Size="110" />
<TDKnob Name="ro" Label="Solo lectura" Value="64" ReadOnly="true" Size="110" />
<TDKnob Name="off" Label="Deshabilitado" Value="30" Disabled="true" Size="110" />
""")],
        "speech" => [Page("Pages/Pedido.razor", "/pedido", """
<EditForm Model="pedido" FormName="dictado" OnSubmit="Guardar" Enhance>
    <TDTextBox @bind-Value="pedido.Text" name="Need" Label="Describe el repuesto que necesitas" Multiline="true" Rows="4" Placeholder="Pastilla delantera para Volvo FH…" />
    <TDSpeechToTextButton Target="Need" />
</EditForm>
""", """
    private Pedido pedido = new();
    private void Guardar() { }
    private sealed class Pedido { public string? Text { get; set; } }
""")],
        "markdown" => [Page("Pages/Ficha.razor", "/ficha", """
<TDMarkdown Name="Description" Label="Descripción técnica" Value="@descripcion" />
""", """
    private const string descripcion = "# Pastilla delantera\n\nJuego de **4** para Volvo FH.\n\n- Material cerámico\n- Retiro hoy en Santiago\n";
""")],
        "chat" => [Page("Pages/Asesor.razor", "/asesor", """
<TDChat Messages="mensajes" ShowTyping="true" />
""", """
    private readonly TDChatMessage[] mensajes =
    [
        new("Camila", "¿Tienen pastillas para Volvo FH 460?", false, "10:12"),
        new("Tú", "Sí. BR-4521-AD, 18 unidades en Santiago. ¿Las reservo?", true, "10:13")
    ];
""")],
        "aichat" => [Page("Pages/Asesor.razor", "/asesor", """
<TDAIChat Catalog="@catalogo" />
""", """
    private const string catalogo = "BR-4521-AD|Pastilla de freno delantera|Volvo|Volvo FH 460|42|$189990\nSU-1180-KT|Amortiguador de cabina|Scania|Scania R450|8|$246500\nMT-7702-FL|Filtro de aceite|Mercedes-Benz|Mercedes-Benz Actros 2651|120|$24990";
""")],
        _ => null
    };

    private const string Pedido = """
    private Pedido pedido = new() { Flota = "Transportes del Sur" };
    private void Guardar() { }
    private sealed class Pedido
    {
        public string? Flota { get; set; }
        public string? Solicitud { get; set; }
        public string? Clave { get; set; }
    }
""";

    private static CatalogCode Page(string file, string route, string markup, string? code = null)
    {
        var linq = (markup + code).Contains("Enumerable.") ? "@using System.Linq\n" : "";
        var block = string.IsNullOrWhiteSpace(code) ? "" : $"\n\n@code {{\n{code}\n}}";
        return new(file, "razor", $"""
@page "{route}"
@using TDComponents
@using TDComponents.Components
{linq}
{markup}{block}
""");
    }
}
