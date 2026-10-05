namespace WebAppSSR.Catalog;

internal static class CatalogSamplesExtra
{
    public static IReadOnlyList<CatalogCode> For(string id)
    {
        var forms = CatalogFormPages.For(id);
        if (forms is not null)
        {
            return forms;
        }

        var shell = CatalogShellPages.For(id);
        if (shell is not null)
        {
            return shell;
        }

        var views = CatalogViewPages.For(id);
        if (views is not null)
        {
            return views;
        }

        var surface = CatalogSurfacePages.For(id);
        if (surface is not null)
        {
            return surface;
        }

        var maps = CatalogMapPages.For(id);
        if (maps is not null)
        {
            return maps;
        }

        return id.ToLowerInvariant() switch
    {
        "stack" => [R("stack.razor", """
<TDStack Orientation="TDOrientation.Horizontal" Gap="12px"
         Align="TDAlignItems.Center" Justify="TDJustify.Between" Wrap="true">
    <TDButton>Nuevo pedido</TDButton>
    <span>OC-00481</span>
</TDStack>
""")],
        "row" => [R("row.razor", """
<TDRow Gap="16px" Align="TDAlignItems.Stretch">
    <TDCol Size="3">…</TDCol>
    <TDCol Size="6">…</TDCol>
    <TDCol Size="3">…</TDCol>
</TDRow>
""")],
        "column" => [R("column.razor", """
<TDRow>
    <TDCol Size="12" SizeMd="6" SizeLg="4">…</TDCol>
</TDRow>
<TDRow>
    <TDCol Size="12" SizeLg="8" Offset="2">…</TDCol>
</TDRow>
""")],
        "layout" => [R("Shared/MainLayout.razor", """
<TDLayout Title="Panel de flota">
    <TDCol Size="4">Pedidos del día</TDCol>
</TDLayout>
""")],
        "popup" => [R("popup.razor", """
<TDPopup Trigger="Filtrar stock" Placement="TDPlacement.Bottom" AriaLabel="Filtro de stock">
    <TDCheckBoxList Options="_states" />
</TDPopup>
""")],
        "splitter" => [R("splitter.razor", """
<TDSplitter>
    <TDSplitterPane Flex="0 0 30%">Categorías</TDSplitterPane>
    <TDSplitterPane Flex="1 1 45%">Resultados</TDSplitterPane>
    <TDSplitterPane Flex="0 0 25%" ShowHandle="false">Detalle</TDSplitterPane>
</TDSplitter>
""")],
        "dropzone" => [R("dropzone.razor", """
<TDDropZone Zones="_zones" Items="_orders" />
""")],
        "tilelayout" => [R("tilelayout.razor", """
<TDTileLayout Columns="4" Items="_widgets" />
""")],
        "toc" => [R("toc.razor", """
<TDToc Target="#guia" Title="En esta página" ShowProgress="true"
       Items="@(new TDOption[] { new("antes", "Antes de empezar") })">
    <h2 id="antes">Antes de empezar</h2>
</TDToc>
""")],
        "toolbar" => [R("Pages/Pedidos.razor", """
<TDToolbar AriaLabel="Acciones de pedidos">
    <Start>
        <TDButton>Nuevo</TDButton>
        <TDButton Variant="TDVariant.Secondary">Importar</TDButton>
    </Start>
    <Center>…</Center>
    <End><TDSplitButton Label="Exportar">…</TDSplitButton></End>
</TDToolbar>
""")],
        "navmenu" => [R("Shared/MainNav.razor", """
<TDNavigationMenu Items="_nav" />
""")],
        "pmenu" => [
            R("Layout/Iconos.razor", """
<TDMenuAppShell Title="Panel de flota"
                Mode="TDMenuShellMode.Icons"
                ShowSearch="true"
                ShowSearchOnSmall="false"
                Modules="_modules"
                ActivePath="/ventas/pedidos" />
"""),
            R("Layout/IconosSinBusqueda.razor", """
<TDMenuAppShell Title="Panel de flota"
                Mode="TDMenuShellMode.Icons"
                ShowSearch="false"
                Modules="_modules"
                ActivePath="/ventas/pedidos" />
"""),
            R("Layout/Flotante.razor", """
<TDMenuAppShell Title="Panel de flota"
                Mode="TDMenuShellMode.Float"
                ShowSearch="true"
                ShowSearchOnSmall="false"
                Modules="_modules"
                ActivePath="/ventas/pedidos" />
"""),
            R("Layout/FlotanteSinBusqueda.razor", """
<TDMenuAppShell Title="Panel de flota"
                Mode="TDMenuShellMode.Float"
                ShowSearch="false"
                Modules="_modules"
                ActivePath="/ventas/pedidos" />
"""),
            R("Layout/BusquedaEnPequeno.razor", """
<TDMenuAppShell Title="Panel de flota"
                Mode="TDMenuShellMode.Icons"
                ShowSearch="true"
                ShowSearchOnSmall="true"
                Modules="_modules"
                ActivePath="/ventas/pedidos" />
"""),
            R("Shared/MenuApp.razor", """
<TDMenuApp Searchable="true"
           SearchPlaceholder="Buscar opción…"
           Modules="_modules"
           ActivePath="/ventas/pedidos"
           ExpandActive="true"
           RememberExpanded="true"
           Stay="true"
           ShowSource="true" />
"""),
            new("Shared/MenuModules.cs", "c#", """
private TDMenuItem[] _modules =
[
    new("Ventas", Icon: "cart", Children:
    [
        new("Cotizaciones", "/ventas/cotizaciones"),
        new("Pedidos", Children:
        [
            new("Nuevo pedido", "/ventas/pedidos/nuevo"),
            new("Mis pedidos", "/ventas/pedidos", Shortcut: "3"),
            new("Devoluciones", "/ventas/devoluciones")
        ]),
        new("Clientes", Children:
        [
            new("Flotas", "/ventas/clientes/flotas"),
            new("Talleres", "/ventas/clientes/talleres"),
            new("Condiciones comerciales", Children:
            [
                new("Listas de precio", "/ventas/clientes/precios"),
                new("Crédito", "/ventas/clientes/credito")
            ])
        ])
    ]),
    new("Inventario", Icon: "box", Children:
    [
        new("Catálogo de repuestos", "/inventario/catalogo"),
        new("Bodegas", Children:
        [
            new("Quilicura", "/inventario/bodegas/quilicura"),
            new("Concepción", "/inventario/bodegas/concepcion"),
            new("Antofagasta", "/inventario/bodegas/antofagasta")
        ]),
        new("Recepción", "/inventario/recepcion")
    ]),
    new("Despacho", Icon: "truck", Children:
    [
        new("Rutas del día", "/despacho/rutas", Shortcut: "12"),
        new("Etiquetas", "/despacho/etiquetas")
    ]),
    new("Finanzas", Icon: "file", Children:
    [
        new("Facturación", Children:
        [
            new("Emitir factura", "/finanzas/facturas/nueva"),
            new("Notas de crédito", "/finanzas/notas")
        ]),
        new("Cobranza", "/finanzas/cobranza")
    ]),
    new("Configuración", Icon: "gear", Children:
    [
        new("Usuarios y roles", "/config/usuarios"),
        new("Temas", "/config/temas")
    ])
];
""")
        ],
        "econtent" => [R("content.razor", """
<TDContent Shortcuts="@(new TDOption[] { new("Ctrl K", "Buscar") })">
    …
</TDContent>
""")],
        "timespan" => [R("Forms/timespan.razor", """
<TDTimeSpanPicker Name="InstallTime" ShowDays="true" MinutesStep="5"
                  Presets="@(new[] { TimeSpan.FromMinutes(30), TimeSpan.FromHours(1) })" />
""")],
        "knob" => [R("Pages/Tablero.razor", """
<TDKnob Name="presion" Value="4" Min="0" Max="10" Step="0.5" Suffix="bar" Size="140" />
<TDKnob Name="vol" Step="5" ShowButtons="true" />
<TDKnob Value="64" ReadOnly="true" Size="110" />
""")],
        "speech" => [R("Forms/speech.razor", """
<TDTextBox Name="Need" Label="Describe el repuesto que necesitas" Multiline="true" />
<TDSpeechToTextButton Target="Need" Language="es-CL" />
""")],
        "ddmulti" => [R("Forms/Categorias.razor", """
<TDSelect Name="cats" Multiple="true" Chips="true" Searchable="true" SelectAll="true" Options="_cats" />
<TDSelect Name="resumen" Multiple="true" Chips="false" Summary="{0} categorías" Options="_cats" />
<TDSelect Name="tope" Multiple="true" MaxSelected="3" Options="_cats" />
<TDSelect Name="mas" Multiple="true" MaxChips="2" Options="_cats" />
<TDSelect Name="grupo" Multiple="true" GroupSelect="true" Options="_parts" />
""")],
        "chip" => [R("chip.razor", """
<TDChip Selectable="true" On="true">En stock</TDChip>
<TDChip Removable="true" Avatar="VO">Volvo</TDChip>
<TDChip Size="TDSize.Large">Grande</TDChip>
""")],
        "selectbar" => [R("selectbar.razor", """
<TDSelectBar Name="vehiculo" Selected="@(new[] { "camion" })" Options="_vehicles" />
<TDSelectBar Name="cats" Multiple="true" Options="_cats" />
<TDSelectBar Name="tipo" Size="TDSize.Small" Options="_icons" />
""")],
        "seccode" => [R("Forms/Otp.razor", """
<TDSecurityCode Name="otp" Length="6" Expected="246810"
                Label="Ingresa el código que enviamos al +56 9 •••• 4567" />
""")],
        "listbox" => [R("listbox.razor", """
<TDListBox Name="marca" Options="_brands" />
<TDListBox Name="cats" Multiple="true" AllowFiltering="true" FilterPlaceholder="Filtrar categorías…" Options="_cats" />
""")],
        "splitbtn" => [R("split.razor", """
<TDSplitButton Label="Cotizar">
    <button type="button">Descargar cotización PDF</button>
    <button type="button">Enviar por correo</button>
</TDSplitButton>
<TDSplitButton Label="Exportar" Variant="TDVariant.Secondary">
    <button type="button">Excel</button>
    <button type="button">CSV</button>
</TDSplitButton>
""")],
        "fab" => [R("fab.razor", """
<TDFab Href="/cotizar" AriaLabel="Nueva cotización" />
<TDFab Size="TDSize.Small" AriaLabel="Agregar" />
<TDFab Extended="true" Dark="true" Label="Rastrear pedido" />
""")],
        "fabmenu" => [R("fabmenu.razor", """
<TDFab AriaLabel="Acciones rápidas">
    <button type="button">Nueva cotización</button>
    <button type="button">Pedido rápido</button>
    <button type="button">Llamar a un asesor</button>
</TDFab>
""")],
        "speeddial" => [R("speeddial.razor", """
<TDSpeedDial Type="linear" Items="_actions" />
<TDSpeedDial Type="right" Items="_actions" />
<TDSpeedDial Type="circle" Items="_actions" />
<TDSpeedDial Type="semi" Items="_actions" />
<TDSpeedDial Type="quarter" Items="_actions" />
<TDSpeedDial Type="mask" Mask="true" Items="_actions" />
""")],
        "inplace" => [R("inplace.razor", """
<TDInplace>
    <Trigger>Ver datos del cliente</Trigger>
    <ChildContent><strong>Transportes del Sur</strong></ChildContent>
</TDInplace>
<TDInplaceEdit Name="cliente" Value="Transportes del Sur" />
<TDInplaceEdit Name="pedidos" Value="128 pedidos" AutoCommit="true" />
<TDInplaceEdit Name="notas" Multiline="true" AutoCommit="true" Value="Juego de 4." />
""")],
        "markdown" => [R("markdown.razor", """
<TDMarkdown Name="Description" Mode="split" Toolbar="true" />
""")],
        "chat" => [R("Forms/chat.razor", """
<TDChat Messages="@_messages" CurrentUser="Tú" ShowTyping="true" />
""")],
        "aichat" => [R("Forms/aichat.razor", """
<TDAIChat Placeholder="Pregunta por un repuesto…"
          Suggestions="@(new[] { "Pastillas para Volvo", "¿Qué está agotado?" })" />
""")],
        "chline" => [R("Pages/Ventas.razor", """
<TDChart Kind="chline" />
""")],
        "chcol" => [R("Pages/Ventas.razor", """
<TDChart Kind="chcol" />
""")],
        "chpie" => [R("Pages/Stock.razor", """
<TDChart Kind="chpie" />
""")],
        "chscatter" => [R("Pages/Pedidos.razor", """
<TDChart Kind="chscatter" />
""")],
        "chgauge" => [R("Pages/Meta.razor", """
<TDChart Kind="chgauge" />
""")],
        "chspark" => [R("Pages/Kpi.razor", """
<TDChart Kind="chspark" />
""")],
        "chheat" => [R("Pages/Demanda.razor", """
<TDChart Kind="chheat" />
""")],
        "chwf" => [R("Pages/Margen.razor", """
<TDChart Kind="chwf" />
""")],
        "chfunnel" => [R("Pages/Conversion.razor", """
<TDChart Kind="chfunnel" />
""")],
        "chpareto" => [R("Pages/Abc.razor", """
<TDChart Kind="chpareto" />
""")],
        "chtree" => [R("Pages/Categorias.razor", """
<TDChart Kind="chtree" />
""")],
        "chradar" => [R("Pages/Proveedores.razor", """
<TDChart Kind="chradar" />
""")],
        "chsankey" => [R("Pages/Despachos.razor", """
<TDChart Kind="chsankey" />
""")],
        "chbullet" => [R("Pages/Kpi.razor", """
<TDChart Kind="chbullet" />
""")],
        "chgantt" => [R("Pages/Programa.razor", """
<TDChart Kind="chgantt" />
""")],
        "chforecast" => [R("Pages/Pronostico.razor", """
<TDChart Kind="chforecast" />
""")],
        "chvariance" => [R("Pages/Presupuesto.razor", """
<TDChart Kind="chvariance" />
""")],
        "chquadrant" => [R("Pages/Portafolio.razor", """
<TDChart Kind="chquadrant" />
""")],
        "chcohort" => [R("Pages/Retencion.razor", """
<TDChart Kind="chcohort" />
""")],
        "chmekko" => [R("Pages/Mezcla.razor", """
<TDChart Kind="chmekko" />
""")],
        "chslope" => [R("Pages/Sucursales.razor", """
<TDChart Kind="chslope" />
""")],
        "chdumbbell" => [R("Pages/Entrega.razor", """
<TDChart Kind="chdumbbell" />
""")],
        "chcontrol" => [R("Pages/Control.razor", """
<TDChart Kind="chcontrol" />
""")],
        "aos" => [R("Pages/Inicio.razor", """
<TDAnimateOnScroll Enter="fade-up" Duration="400" Once="true" Threshold="0.25">
    <div>Despacho en 24 h</div>
</TDAnimateOnScroll>
<TDAnimateOnScroll Enter="slide-left" Once="false">…</TDAnimateOnScroll>
""")],
        "terminal" => [R("Pages/Consola.razor", """
<TDTerminal Prompt="td@taller:~$" Welcome="Escribe help"
            PartsJson="@_partsJson" />
""")],
        "orgchart" => [R("Pages/Equipo.razor", """
@page "/equipo"

<TDOrganizationChart Root="_root" SelectedId="@Persona" />

@code {
    [SupplyParameterFromQuery(Name = "persona")]
    public string? Persona { get; set; }

    private readonly TDOrgNode _root = new(
        "gg", "María Reyes", "Gerente general", "MR",
        [
            new("op", "Jorge Soto", "Operaciones", "JS",
            [
                new("bq", "Paula Lagos", "Bodega Quilicura", "PL", Href: "/equipo?persona=bq", Email: "paula.lagos@truckdepot.cl"),
                new("de", "Raúl Vera", "Despacho", "RV", Href: "/equipo?persona=de", Email: "raul.vera@truckdepot.cl")
            ],
            Href: "/equipo?persona=op", Email: "jorge.soto@truckdepot.cl")
        ],
        Href: "/equipo?persona=gg",
        Email: "maria.reyes@truckdepot.cl");
}
""")],
        "ecard" => Shop("ecard"),
        "edetail" => Shop("edetail"),
        "ecart" => Shop("ecart"),
        "echeckout" => Shop("echeckout"),
        "efacets" => Shop("efacets"),
        "esearch" => Shop("esearch"),
        "ecompare" => Shop("ecompare"),
        "eflash" => Shop("eflash"),
        "ereviews" => Shop("ereviews"),
        "efinder" => Shop("efinder"),
        "equote" => Shop("equote"),
        "ebulk" => Shop("ebulk"),
        "erecent" => Shop("erecent"),
        "estock" => Shop("estock"),
        "ewishmulti" => Shop("ewishmulti"),
        "etrack" => Shop("etrack"),
        "efbt" => Shop("efbt"),
        "elocator" => Shop("elocator"),
        "ecredit" => Shop("ecredit"),
        "ereturns" => Shop("ereturns"),
        "date" => [R("Forms/Fecha.razor", """
<TDDatePicker Name="despacho" Label="Fecha de despacho"
              Min="@DateTime.Today.ToString("yyyy-MM-dd")" />
<TDDatePicker Mode="TDDateMode.DateTime" Name="cita" Label="Fecha y hora de la cita"
              Min="@DateTime.Today.ToString("yyyy-MM-ddTHH:mm")" />
<TDDatePicker Mode="TDDateMode.Time" Name="retiro" Label="Hora de retiro" />
""")],
        "tokens" => [R("Pages/Themes.razor", """
<TDThemePicker />
""")],
        "qrcode" => [
            R("Pages/Etiqueta.razor", """
@page "/etiqueta"
@attribute [StreamRendering]

<form method="post" data-enhance @formname="save-label" @onsubmit="SaveLabel">
    <TDQrCode Value="@_text" Ecc="M" Module="6" Color="#0A0B0C" QuietZone="true" Name="QrPng" />
    <button type="submit">Guardar etiqueta</button>
</form>

@if (!string.IsNullOrEmpty(_png))
{
    <img src="@_png" alt="QR del repuesto" width="240" height="240" />
}

@code {
    private string _text = "https://truckdepot.cl/p/BR-4521-AD";
    private string? _png;

    // El componente escribe el PNG en un input hidden. Llega en el POST.
    [SupplyParameterFromForm(FormName = "save-label")]
    public string? QrPng { get; set; }   // "data:image/png;base64,…"

    private void SaveLabel() => _png = QrPng;
}
"""),
            new("wwwroot/ts/td-qr-code.ts", "ts", """
import { encodeQr } from "./td-codes";

// UTF-8, versiones 1 a 4, corrección L, M, Q o H. quiet = 4 deja el margen en blanco.
const qr = encodeQr("https://truckdepot.cl/p/BR-4521-AD", "M", 6, "#0A0B0C", 4);

qr.svg;       // marcado del código
qr.version;   // "3"
qr.modules;   // lado de la matriz
qr.bytes;     // bytes codificados

// TDQrCode con Name="QrPng" deja el mismo dibujo como data:image/png;base64,…
"""),
        ],
        "barcode" => [
            R("Pages/Etiqueta.razor", """
@page "/etiqueta"
@attribute [StreamRendering]

<form method="post" data-enhance @formname="save-label" @onsubmit="SaveLabel">
    <TDBarcode Value="@_code" Format="code128" BarWidth="2" Height="80" ShowText="true"
               Color="#0A0B0C" Name="BarcodePng" />
    <button type="submit">Guardar etiqueta</button>
</form>

<TDBarcode Value="7804621001843" Format="ean13" />
<TDBarcode Value="78012345" Format="ean8" ShowText="true" />

@if (!string.IsNullOrEmpty(_png))
{
    <img src="@_png" alt="Código de @_code" />
}

@code {
    private string _code = "BR-4521-AD";
    private string? _png;

    // EAN-13 y EAN-8 calculan el dígito verificador. El PNG llega en el POST.
    [SupplyParameterFromForm(FormName = "save-label")]
    public string? BarcodePng { get; set; }

    private void SaveLabel() => _png = BarcodePng;
}
"""),
            new("wwwroot/ts/td-barcode.ts", "ts", """
import { encodeBarcode } from "./td-codes";

// format: "code128" | "ean13" | "ean8"
const code = encodeBarcode("code128", "BR-4521-AD", 2, 80, "#0A0B0C", true);

code.svg;
code.modules;   // "1101001…"
code.value;     // valor con dígito verificador en EAN
code.error;     // presente si el valor no se puede codificar
"""),
        ],
        "labeldesigner" => [
            R("Pages/Etiquetas.razor", """"
@page "/etiquetas"

<TDLabelDesigner Width="62" Height="40" Dpi="203" Copies="1"
                 Template="@_template" Record="@_part" />

@code {
    private readonly TDLabelRecord _part = new(
        "BR-4521-AD",
        "Pastilla de freno delantera",
        "Volvo",
        "$ 189.990",
        "42",
        "https://truckdepot.cl/p/BR-4521-AD");

    private const string _template = """
        {
          "size": { "width": 62, "height": 40, "dpi": 203 },
          "elements": [
            { "type": "text", "x": 3, "y": 3, "w": 56, "h": 4.2, "text": "{name}", "size": 3.4, "bold": true, "align": "left" },
            { "type": "text", "x": 3, "y": 7.6, "w": 56, "h": 3.2, "text": "{brand} · {code}", "size": 2.5, "align": "left" },
            { "type": "text", "x": 3, "y": 11.2, "w": 40, "h": 6, "text": "{price}", "size": 5.2, "bold": true, "align": "left" },
            { "type": "line", "x": 3, "y": 18.6, "w": 56, "h": 0.4, "thick": 0.4 },
            { "type": "barcode", "x": 3, "y": 20.5, "w": 38, "h": 16, "text": "{code}", "format": "c128", "showText": true },
            { "type": "qr", "x": 45, "y": 21, "w": 14, "h": 14, "text": "{url}" },
            { "type": "box", "x": 44, "y": 11, "w": 15, "h": 6.2, "thick": 0.35 },
            { "type": "text", "x": 44, "y": 12.4, "w": 15, "h": 3.4, "text": "STOCK {stock}", "size": 2.3, "bold": true, "align": "center" }
          ]
        }
        """;
}
""""),
        ],
        "reportdesigner" => [
            R("Pages/Facturas.razor", """
@page "/facturas"

<TDReportDesigner Report="factura" Rows="8"
                  Numero="F-000481" Cliente="Transportes del Sur SpA"
                  Rut="76.543.210-K" Fecha="2026-09-23" Vendedor="Camila Rojas" />
"""),
        ],
        "printers" => [
            R("Pages/Impresoras.razor", """
@page "/impresoras"

<TDPrinterConnect Devices="@_printers" />

@code {
    private readonly TDPrinterDevice[] _printers =
    [
        new("zd421", "Zebra ZD421", "ZD421d · 203 dpi", "wifi", "192.168.1.40:9100", "ZPL", 203, 104, true, true),
        new("ql820", "Brother QL-820NWB", "QL-820NWB · 300 dpi", "wifi", "192.168.1.52:9100", "ESC/P", 300, 62, false, false, true),
        new("zq520", "Zebra ZQ520", "ZQ520 móvil · 203 dpi", "bt", "AC:3F:A4:12:9B:07", "CPCL", 203, 104, false)
    ];
}
"""),
            new("wwwroot/ts/td-printer.ts", "ts", """
// Bluetooth en el navegador (Chrome / Edge / Android).
const device = await navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
});

// Wi‑Fi: la página muestra la dirección TCP 9100 del equipo elegido.
// La impresión de prueba se registra en la consola del estudio.
"""),
        ],
        "ehid" => [
            R("Pages/Recepcion.razor", """
@page "/recepcion"

@* No necesita estar dentro de un input: escucha el documento completo. *@
<TDHidListener MinLength="4" GapMs="60"
               IgnoreWhenTyping="false"
               InitialCode="BR-4521-AD" />
"""),
            new("wwwroot/js/td-hid-listener.js", "js", """
// Un solo listener en document. El lector escribe rápido y cierra con Enter.
let buffer = "";
let lastKeyAt = 0;

document.addEventListener("keydown", (e) => {
  const now = performance.now();
  if (now - lastKeyAt > gapMs) buffer = "";   // un lector es más rápido que una persona
  lastKeyAt = now;
  if (e.key === "Enter") {
    if (buffer.length >= minLength) onReading(buffer);
    buffer = "";
    return;
  }
  if (e.key.length === 1) buffer += e.key;
});
"""),
        ],
        "scanner" => [
            R("Pages/Recepcion.razor", """
@page "/recepcion"

<TDScanner Mode="continuous" KeyboardWedge="true" InitialValue="BR-4521-AD" />

@* Modo 1 a 1: la cámara queda abierta y la lectura se pausa hasta confirmar. *@
<TDScanner Mode="single" KeyboardWedge="true" />
"""),
            new("wwwroot/ts/td-scanner.ts", "ts", """
// Motor: BarcodeDetector nativo (Chrome, Edge, Android).
// Sin detector, la página acepta el lector USB, el código escrito o Simular.
const detector = new BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13"] });
const codes = await detector.detect(video);
const value = codes[0]?.rawValue;

// El lector USB / Bluetooth llega como teclado y cierra con Enter.
"""),
        ],
        "scheduler" => [Page("Pages/Agenda.razor", "/agenda", """
<TDScheduler />
""")],
        "mphone" => [Page("Pages/Recepcion.razor", "/recepcion", """
<div class="td-phone">
    <TDAppBar Title="Recepción" Subtitle="Bodega Quilicura · turno mañana" BackHref="/c/mjobs" BackLabel="Volver a las tareas" ActionHref="/c/mshift" ActionLabel="Ayuda" />
    <TDShiftBar Operator="María Soto" Site="Bodega Quilicura" Role="Operadora de recepción" Pending="3" Online="false" />
    <TDJobSteps Title="Recepción del pallet 18" Current="1" Steps="pasos" />
    <TDScanCard Code="BR-4521-AD" Name="Pastilla de freno delantera" Location="Pasillo A · rack 12 · nivel 2" Stock="24" Unit="unidades" Status="Ubicación confirmada" Tone="TDMobileTone.Success" ActionLabel="Guardar 24 unidades en A-12" ActionHref="/c/msheet" />
    <TDQtyPad Label="Cantidad a guardar" Value="4" Unit="unidades" Min="1" Max="48" Name="cantidad" />
    <TDConfirmSheet Open="true" Title="Guardar 24 unidades en A-12" Detail="El pallet sigue en el muelle hasta que confirmes. Si cierras, no se mueve nada." ConfirmLabel="Guardar en A-12" CancelLabel="Seguir revisando" HelpHref="/c/mshift" HelpLabel="Pedir ayuda al supervisor" />
    <TDBottomNav Active="tareas" Items="secciones" />
</div>
""", """
    private readonly string[] pasos = ["Identificar el pallet", "Contar bultos", "Asignar ubicación", "Confirmar guardado"];

    private readonly TDMobileDest[] secciones =
    [
        new("inicio", "Inicio", "/c/mappbar"),
        new("tareas", "Tareas", "/c/mjobs", 3),
        new("escanear", "Escanear", "/c/mscan"),
        new("ubicacion", "Ubicación", "/c/mbin"),
        new("mas", "Más", "/c/mshift")
    ];
""")],
        "mappbar" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDAppBar Title="Recepción" Subtitle="Bodega Quilicura · turno mañana" BackHref="/c/mjobs" BackLabel="Volver a las tareas" ActionHref="/c/mshift" ActionLabel="Ayuda" />
""")],
        "mbottom" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDBottomNav Active="tareas" Items="secciones" />
""", """
    private readonly TDMobileDest[] secciones =
    [
        new("inicio", "Inicio", "/c/mappbar"),
        new("tareas", "Tareas", "/c/mjobs", 3),
        new("escanear", "Escanear", "/c/mscan"),
        new("ubicacion", "Ubicación", "/c/mbin"),
        new("mas", "Más", "/c/mshift")
    ];
""")],
        "mscan" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDScanCard Code="BR-4521-AD" Name="Pastilla de freno delantera" Location="Pasillo A · rack 12 · nivel 2" Stock="24" Unit="unidades" Status="Ubicación confirmada" Tone="TDMobileTone.Success" ActionLabel="Guardar 24 unidades en A-12" ActionHref="/c/msheet" />
""")],
        "mqty" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDQtyPad Label="Cantidad a guardar" Value="4" Unit="unidades" Min="1" Max="48" Name="cantidad" />
""")],
        "mjobs" => [Page("Pages/Tareas.razor", "/tareas", """
<TDJobList Jobs="tareas" />
""", """
    private readonly TDWarehouseJob[] tareas =
    [
        new("t1", "Recibir pallet 18", "Muelle 2", "Recibir", "En curso", "Llega en 10 minutos", TDMobileTone.Warning, "/c/msteps"),
        new("t2", "Guardar pastillas BR-4521-AD", "Pasillo A · rack 12", "Guardar", "Lista", "Antes de las 11:30", TDMobileTone.Success, "/c/mscan"),
        new("t3", "Contar casillero B-04-1-02", "Pasillo B · rack 4", "Contar", "Bloqueada", "Falta el conteo anterior", TDMobileTone.Danger, "/c/mbin")
    ];
""")],
        "mbin" => [Page("Pages/Ubicacion.razor", "/ubicacion", """
<TDBinCard Aisle="A" Rack="12" Level="2" Bin="04" Sku="BR-4521-AD" SkuName="Pastilla de freno delantera" Quantity="24" Unit="unidades" />
""")],
        "msheet" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDConfirmSheet Open="true" Title="Guardar 24 unidades en A-12" Detail="El pallet sigue en el muelle hasta que confirmes. Si cierras, no se mueve nada." ConfirmLabel="Guardar en A-12" CancelLabel="Seguir revisando" HelpHref="/c/mshift" HelpLabel="Pedir ayuda al supervisor" />
""")],
        "mshift" => [Page("Pages/Turno.razor", "/turno", """
<TDShiftBar Operator="María Soto" Site="Bodega Quilicura" Role="Operadora de recepción" Pending="3" Online="false" />
""")],
        "mpick" => [Page("Pages/Picking.razor", "/picking", """
<TDPickLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" From="Pasillo A · rack 12 · nivel 2" Quantity="6" Picked="2" Unit="unidades" Field="recogidas" />
""")],
        "msteps" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDJobSteps Title="Recepción del pallet 18" Current="1" Steps="pasos" />
""", """
    private readonly string[] pasos = ["Identificar el pallet", "Contar bultos", "Asignar ubicación", "Confirmar guardado"];
""")],
        "mcards" => [Page("Pages/Tareas.razor", "/tareas", """
<TDCardCarousel AriaLabel="Tareas del turno" Auto="true" Interval="5000" Cards="tarjetas" />
""", """
    private readonly TDCarouselCard[] tarjetas =
    [
        new("Recibir pallet 18", "Muelle 2. Llega en 10 minutos.", "En curso", TDMobileTone.Warning, "Abrir recepción", "/c/msteps"),
        new("Guardar pastillas BR-4521-AD", "Pasillo A · rack 12. Antes de las 11:30.", "Lista", TDMobileTone.Success, "Abrir guardado", "/c/mscan"),
        new("Contar casillero B-04-1-02", "Pasillo B · rack 4. Falta el conteo anterior.", "Bloqueada", TDMobileTone.Danger, "Ver ubicación", "/c/mbin")
    ];
""")],
        "micon" => [Page("Pages/Tareas.razor", "/tareas", """
<div class="td-ccarousel__nav">
    <TDButtonIcon Icon="arrow_back" Label="Tarjeta anterior" />
    <TDButtonIcon Icon="pause" Label="Pausar" />
    <TDButtonIcon Icon="arrow_forward" Label="Tarjeta siguiente" />
</div>
""")],
        "omuelle" => [Page("Pages/Anden.razor", "/anden", """
<TDDockBoard Doors="muelles" />
""", """
    private readonly TDDockDoor[] muelles =
    [
        new("m2", "Muelle 2", "Transportes del Sur", "Descargando", "Sale a las 16:40", TDMobileTone.Warning, "/c/odespacho"),
        new("m4", "Muelle 4", "Libre", "Libre", "El próximo camión llega a las 18:00", TDMobileTone.Success),
        new("m6", "Muelle 6", "Andes Cargo", "Bloqueada", "Falta el sello del despacho anterior", TDMobileTone.Danger, "/c/ocalidad")
    ];
""")],
        "oconteo" => [Page("Pages/Conteo.razor", "/conteo", """
<TDCountDiff Sku="BR-4521-AD" Location="Pasillo A · rack 12 · nivel 2" Expected="24" Counted="21" Unit="unidades" Name="contado" />
""")],
        "oincidencia" => [Page("Pages/Incidencia.razor", "/incidencia", """
<TDIssueCard Title="Faltan 3 pastillas" What="El conteo quedó abierto. La mercadería no se movió." Next="Vuelve a contar el casillero o deja la incidencia para el supervisor." Tone="TDMobileTone.Warning" HelpHref="/c/orelevo" HelpLabel="Pedir ayuda al supervisor de turno" />
""")],
        "oruta" => [Page("Pages/Ruta.razor", "/ruta", """
<TDRouteStop Sequence="2" Customer="Taller Los Andes" Address="Av. Vicuña Mackenna 4200, La Florida" Window="Entre 14:00 y 16:00" Packages="8" Status="En ruta" Tone="TDMobileTone.Success" />
""")],
        "opallet" => [Page("Pages/Pallet.razor", "/pallet", """
<TDPalletBuild Code="PLT-1842" Title="Pastillas de freno delanteras" Layers="3" LayerTarget="4" WeightKg="820" MaxWeightKg="900" Mixed="true" />
""")],
        "orelevo" => [Page("Pages/Relevo.razor", "/relevo", """
<TDShiftNote From="María Soto" At="Hoy a las 14:00, bodega Quilicura" Note="El muelle 2 sigue descargando el camión de Transportes del Sur. El lote L-904 está en calidad y no se mueve." OpenTasks="2" />
""")],
        "oreponer" => [Page("Pages/Reposicion.razor", "/reposicion", """
<TDReplenLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" From="Reserva · pasillo C · rack 3" To="Picking · pasillo A · rack 12" Needed="12" Moved="4" Unit="unidades" Field="movidas" />
""")],
        "oubicacion" => [Page("Pages/Ubicacion.razor", "/ubicacion", """
<TDSlotCheck Sku="BR-4521-AD" Suggested="A-12-2-04" Scanned="B-04-1-02" />
""")],
        "ocalidad" => [Page("Pages/Calidad.razor", "/calidad", """
<TDQcHold Lot="L-904" Reason="El empaque llegó abierto. Calidad tiene que revisarlo." Quantity="48" Unit="unidades" Owner="Camila Ríos, calidad" Tone="TDMobileTone.Danger" />
""")],
        "odespacho" => [Page("Pages/Despacho.razor", "/despacho", """
<TDDispatchCard Order="OC-00481" Door="Muelle 4" Departs="Hoy a las 17:10" Seal="" Status="Falta el sello" Tone="TDMobileTone.Warning" ActionHref="/c/omuelle" ActionLabel="Cerrar despacho OC-00481" />
""")],
        "recibo" => [Page("Pages/Entrada.razor", "/entrada", """
<TDReceiptHeader Document="OC-00481" Supplier="Frenos del Pacífico" Dock="Muelle 2 · Bodega Quilicura" ExpectedLines="6" ReceivedLines="4" Status="En recepción" Tone="TDMobileTone.Warning" />
""")],
        "rlinea" => [Page("Pages/Entrada.razor", "/entrada", """
<TDReceiptLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" Ordered="24" Received="21" Unit="unidades" Field="recibidas" />
""")],
        "aviso" => [Page("Pages/Entrada.razor", "/entrada", """
<TDAsnMatch Notice="ASN-18" ExpectedPackages="12" CountedPackages="10" Field="bultos" />
""")],
        "rsello" => [Page("Pages/Entrada.razor", "/entrada", """
<TDSealCheck Expected="SL-88421" Read="SL-88419" Intact="true" />
""")],
        "rlote" => [Page("Pages/Entrada.razor", "/entrada", """
<TDLotCapture Sku="BR-4521-AD" Lot="L-904" Expires="Marzo 2028" Quantity="24" Unit="unidades" />
""")],
        "revision" => [Page("Pages/Revision.razor", "/revision", """
<TDInspectList Product="Pastilla de freno delantera" Checks="criterios" FieldPrefix="revision" />
""", """
    private readonly TDInspectCheck[] criterios =
    [
        new("empaque", "Empaque cerrado", "Cumple", "La caja sellada no está abierta."),
        new("etiqueta", "Etiqueta legible", "No cumple", "El código se ve cortado."),
        new("cantidad", "Cantidad de la línea", "Pendiente")
    ];
""")],
        "dano" => [Page("Pages/Revision.razor", "/revision", """
<TDDamageNote Sku="BR-4521-AD" What="La caja llegó húmeda y dos pastillas están oxidadas." Affected="2" Unit="unidades" Next="Separa las 2 unidades. El resto puede seguir a revisión." Tone="TDMobileTone.Warning" />
""")],
        "rtemp" => [Page("Pages/Revision.razor", "/revision", """
<TDTempCheck Product="Líquido de frenos" Reading="11" Min="2" Max="8" Unit="°C" />
""")],
        "etiqueta" => [Page("Pages/Revision.razor", "/revision", """
<TDLabelCheck Expected="BR-4521-AD" Printed="BR-4521-AD" Readable="false" />
""")],
        "decision" => [Page("Pages/Revision.razor", "/revision", """
<TDDisposition Product="Pastilla de freno delantera" Decision="Mandar a calidad" Consequence="Las 24 unidades quedan detenidas. No entran a la ubicación de picking." Tone="TDMobileTone.Danger" ActionHref="/c/revision" ActionLabel="Mandar 24 unidades a calidad" />
""")],
        "editform" => [Page("Pages/Flota.razor", "/flota", """
<TDEditForm Model="flota" FormName="alta-flota" OnValidSubmit="Guardar" Enhance
            Title="Alta de flota"
            Lead="El nombre queda en el despacho. Si sales sin guardar, lo escrito se pierde."
            SubmitLabel="Guardar flota"
            PendingText="Guardando la flota…"
            HelpHref="/c/fieldset" HelpLabel="Ver cómo agrupar campos"
            ConfirmLeave="true">
    <TDTextBox @bind-Value="flota.Nombre" Label="Nombre de la flota" Required="true" RequiredText="Obligatorio" RequiredMessage="Escribe el nombre de la flota." Placeholder="Transportes del Sur" Hint="Nombre con el que aparece en el despacho." />
    <TDTextBox @bind-Value="flota.Solicitud" Label="Solicitud" Required="true" RequiredText="Obligatorio" RequiredMessage="Describe qué hay que hacer." Multiline="true" Rows="4" Hint="Qué necesitas que hagamos." />
</TDEditForm>
""", """
    private Flota flota = new() { Nombre = "Transportes del Sur" };

    private void Guardar()
    {
    }

    private sealed class Flota
    {
        public string? Nombre { get; set; }
        public string? Solicitud { get; set; }
    }
""")],
        "photocapture" => [R("Pages/Repuesto.razor", """
@page "/repuesto"
@using TDComponents
@using TDComponents.Components

<EditForm Model="parte" FormName="fotos-repuesto" OnSubmit="Guardar" enctype="multipart/form-data">
    <TDPhotoCapture Name="fotos" Label="Fotos del repuesto" Hint="Abre la cámara. Cada toque agrega una foto sin cerrarla. Quita las que no quieras." />
    <TDButton ButtonType="TDButtonType.Submit">Guardar la colección</TDButton>
</EditForm>

@code {
    private Parte parte = new();

    private void Guardar()
    {
    }

    private sealed class Parte;
}
""")],
        "photo" => [R("Pages/Repuesto.razor", """
@page "/repuesto"
@using TDComponents
@using TDComponents.Components

<EditForm Model="parte" FormName="foto-repuesto" OnSubmit="Guardar" enctype="multipart/form-data">
    <TDPhotoButton Name="fotoChica" Label="Foto pequeña" Size="TDSize.Small" Hint="Toca la cámara. Luego toca la imagen para verla en grande." />
    <TDPhotoButton Name="foto" Label="Foto mediana" Hint="Toca la cámara. Luego toca la imagen para verla en grande." />
    <TDPhotoButton Name="fotoGrande" Label="Foto grande" Size="TDSize.Large" Hint="Toca la cámara. Luego toca la imagen para verla en grande." />
    <TDButton ButtonType="TDButtonType.Submit">Guardar fotos</TDButton>
</EditForm>

@code {
    private Parte parte = new();

    private void Guardar()
    {
    }

    private sealed class Parte;
}
""")],
        "ddgrid" => [R("Forms/ddgrid.razor", """
<TDDropDownDataGrid Name="PartId" AllowFiltering="true"
                    Columns="@(new[] { "Código", "Repuesto", "Marca", "Stock" })"
                    Rows="_rows" />
""")],
        _ => []
        };
    }

    private static CatalogCode R(string file, string source) => new(file, "razor", source);

    private static CatalogCode Page(string file, string route, string markup, string? code = null)
    {
        var block = string.IsNullOrWhiteSpace(code) ? "" : $"\n\n@code {{\n{code}\n}}";
        return R(file, $"""
@page "{route}"
@using TDComponents
@using TDComponents.Components

{markup}{block}
""");
    }

    private static CatalogCode[] Shop(string kind) =>
    [
        R("Components/TDEcom.razor", $"<TDEcom Kind=\"{kind}\" />")
    ];
}
