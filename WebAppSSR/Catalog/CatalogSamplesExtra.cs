namespace WebAppSSR.Catalog;

internal static class CatalogSamplesExtra
{
    public static IReadOnlyList<CatalogCode> For(string id) => id.ToLowerInvariant() switch
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
        "scheduler" => [R("Pages/Agenda.razor", """
<TDScheduler />
""")],
        "ddgrid" => [R("Forms/ddgrid.razor", """
<TDDropDownDataGrid Name="PartId" AllowFiltering="true"
                    Columns="@(new[] { "Código", "Repuesto", "Marca", "Stock" })"
                    Rows="_rows" />
""")],
        _ => []
    };

    private static CatalogCode R(string file, string source) => new(file, "razor", source);

    private static CatalogCode[] Shop(string kind) =>
    [
        R("Components/TDEcom.razor", $"<TDEcom Kind=\"{kind}\" />")
    ];
}
