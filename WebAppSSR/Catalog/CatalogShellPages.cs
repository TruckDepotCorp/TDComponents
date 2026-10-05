namespace WebAppSSR.Catalog;

internal static class CatalogShellPages
{
    public static IReadOnlyList<CatalogCode>? For(string id) => id.ToLowerInvariant() switch
    {
        "accordion" => [Page("Pages/Ficha.razor", "/ficha", """
<TDAccordion Single="true">
    <TDAccordionItem Title="Despacho y retiro" Badge="3" Open="true">Retiro en bodega el mismo día. Despacho Santiago en 24 horas hábiles.</TDAccordionItem>
    <TDAccordionItem Title="Garantía" Badge="12 meses">Garantía de fábrica de 12 meses contra defectos.</TDAccordionItem>
    <TDAccordionItem Title="Devoluciones">30 días con guía y embalaje original.</TDAccordionItem>
</TDAccordion>
""")],
        "breadcrumb" => [Page("Pages/Ficha.razor", "/ficha", """
<TDBreadcrumb Items="@(new TDOption[] { new("/", "Inicio"), new("/c/grid", "Repuestos"), new("", "Pastilla de freno delantera") })" />
""")],
        "carousel" => [Page("Pages/Inicio.razor", "/inicio", """
<TDCarousel Slides="@(new TDSlide[] {
    new("Oferta de flota", "Pastillas Volvo FH", "Juego de 4, retiro hoy en Santiago. Precio de convenio.", "Ver ficha", "#0A0B0C", "#ED2A24"),
    new("Despacho", "Llega mañana a regiones", "Pedidos antes de las 14 h salen el mismo día.", "Armar pedido", "#14171A", "#F2B04A"),
    new("Bodega", "Stock en tres sucursales", "Santiago, Concepción y Temuco con reserva inmediata.", "Ver stock", "#1F2327", "#4CC47F")
})" />
""")],
        "ctxmenu" => [Page("Pages/Ficha.razor", "/ficha", """
<TDContextMenu Items="acciones">
    <p class="td-section-title">Clic derecho en esta zona</p>
    <p>Pastilla de freno delantera BR-4521-AD · Volvo FH 460</p>
</TDContextMenu>
""", """
    private readonly TDMenuItem[] acciones =
    [
        new("Abrir ficha", "/c/grid"),
        new("Copiar código", Shortcut: "Ctrl C"),
        new("Filtrar por este valor"),
        new("-"),
        new("Reservar stock", Disabled: true),
        new("Agregar al pedido", "/c/toast")
    ];
""")],
        "link" => [Page("Pages/Ficha.razor", "/ficha", """
<TDLink Href="/c/grid">Ver ficha técnica</TDLink>
<TDLink Href="/c/exportx">Descargar catálogo</TDLink>
""")],
        "menu" => [Page("Pages/Inicio.razor", "/inicio", """
<TDMenu Items="menu" />
<TDMenu Items="menu" Dark="false" />
""", Menu)],
        "panelmenu" => [Page("Pages/Inicio.razor", "/inicio", """
<TDPanelMenu Active="Mis pedidos" Open="Pedidos" Sections="secciones" />
""", """
    private readonly TDMenuItem[] secciones =
    [
        new("Catálogo", Icon: "grid", Children: [new("Frenos", Shortcut: "124"), new("Suspensión", Shortcut: "86"), new("Motor"), new("Eléctrico")]),
        new("Pedidos", Icon: "box", Children: [new("Mis pedidos", Shortcut: "3"), new("Cotizaciones"), new("Devoluciones")]),
        new("Mi cuenta", Icon: "user", Children: [new("Perfil"), new("Direcciones"), new("Facturación")]),
        new("Soporte", Icon: "help")
    ];
""")],
        "profilemenu" => [Page("Pages/Cuenta.razor", "/cuenta", """
<TDProfileMenu />
""")],
        "stepsx" => [Page("Pages/Pedido.razor", "/pedido", """
<TDSteps Current="1" Steps="@(new TDOption[] {
    new("datos", "Datos", Hint: "Flota y patente"),
    new("despacho", "Despacho", Hint: "Bodega y horario"),
    new("pago", "Pago", Hint: "Transferencia o crédito"),
    new("ok", "Confirmación", Hint: "Guía emitida")
})" />
""")],
        "tabsx" => [Page("Pages/Ficha.razor", "/ficha", """
<TDTabs AriaLabel="Detalle del repuesto" Selected="desc"
        Tabs="@(new TDOption[] {
            new("desc", "Descripción", Icon: icono),
            new("fit", "Compatibilidad", Count: 12),
            new("stock", "Stock", Count: 3),
            new("app", "Aplicaciones")
        })">
    <TDTabPanel Name="desc" Active="true">Pastilla de freno delantera para Volvo FH. Material cerámico, juego de 4.</TDTabPanel>
    <TDTabPanel Name="fit">FH 460, FH 500 y FM 450. También FM 420 con disco de 45 mm.</TDTabPanel>
    <TDTabPanel Name="stock">Santiago 18 u. · Concepción 9 u. · Temuco 4 u.</TDTabPanel>
    <TDTabPanel Name="app">Camión y bus. No aplica a remolque.</TDTabPanel>
</TDTabs>
<TDTabs Variant="TDTabsVariant.Pills" Selected="lista" AriaLabel="Vista"
        Tabs="@(new TDOption[] { new("lista", "Lista"), new("ficha", "Ficha"), new("stock", "Stock") })">
    <TDTabPanel Name="lista" Active="true">24 repuestos coinciden con el filtro.</TDTabPanel>
    <TDTabPanel Name="ficha">BR-4521-AD · Pastilla de freno delantera.</TDTabPanel>
    <TDTabPanel Name="stock">18 unidades listas para retiro.</TDTabPanel>
</TDTabs>
<TDTabs Variant="TDTabsVariant.Vertical" Selected="pedido" AriaLabel="Pedido"
        Tabs="@(new TDOption[] { new("pedido", "Pedido"), new("despacho", "Despacho"), new("pago", "Pago") })">
    <TDTabPanel Name="pedido" Active="true">OC-00481 · 3 líneas.</TDTabPanel>
    <TDTabPanel Name="despacho">Retiro en Santiago centro antes de las 14 h.</TDTabPanel>
    <TDTabPanel Name="pago">Crédito a 30 días.</TDTabPanel>
</TDTabs>
<TDTabs Closable="true" AllowAdd="true" Selected="p481" AriaLabel="Pedidos abiertos"
        Tabs="@(new TDOption[] { new("p481", "Pedido 481"), new("p490", "Pedido 490") })">
    <TDTabPanel Name="p481" Active="true">Pastilla BR-4521-AD · 4 u.</TDTabPanel>
    <TDTabPanel Name="p490">Filtro de aceite · 2 u.</TDTabPanel>
</TDTabs>
""", """
    private const string icono = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 8 12 3 3 8l9 5 9-5Z\"></path><path d=\"M3 8v8l9 5 9-5V8\"></path></svg>";
""")],
        "toc" => [Page("Pages/Guia.razor", "/guia", """
<TDToc Items="@(new TDOption[] {
    new("antes", "Antes de empezar"),
    new("pasadores", "Pasadores y resortes", Hint: "h3"),
    new("torque", "Torque"),
    new("prueba", "Prueba en ruta")
})">
    <h2 id="antes">Antes de empezar</h2>
    <p>Inmoviliza el vehículo, corta el contacto y deja enfriar el disco. Ten a mano el juego BR-4521-AD y el líquido DOT 4.</p>
    <h3 id="pasadores">Pasadores y resortes</h3>
    <p>Retira los pasadores con alicate de punta. Si el resorte está ovalado, cámbialo: no se reutiliza.</p>
    <h2 id="torque">Torque</h2>
    <p>Aprieta en cruz a 180 Nm. Vuelve a chequear a los 50 km.</p>
    <h2 id="prueba">Prueba en ruta</h2>
    <p>Tres frenadas suaves a 40 km/h. Si vibra, revisa el disco antes de entregar la unidad.</p>
</TDToc>
""")],
        "toolbar" => [Page("Pages/Pedidos.razor", "/pedidos", """
<TDToolbar AriaLabel="Acciones de pedidos">
    <Start>
        <TDButton ButtonType="TDButtonType.Button">Nuevo</TDButton>
        <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Importar</TDButton>
        <span class="td-toolbar__sep" aria-hidden="true"></span>
        <TDSelectBar Name="vista" Selected="@(new[] { "lista" })" Options="@(new TDOption[] { new("lista", "Lista"), new("kanban", "Kanban") })" />
    </Start>
    <Center>
        <label class="td-toolbar__search">
            <input placeholder="Buscar pedido…" aria-label="Buscar pedido" />
        </label>
    </Center>
    <End>
        <TDSplitButton Label="Exportar">
            <button type="button">Excel</button>
            <button type="button">CSV</button>
            <button type="button">PDF</button>
        </TDSplitButton>
    </End>
</TDToolbar>
<TDToolbar Dark="true" AriaLabel="Pedido OC-00481">
    <Start>
        <span class="td-toolbar__title"><strong>Pedido OC-00481</strong><em>Transportes del Sur · 3 repuestos</em></span>
    </Start>
    <End>
        <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Reservar</TDButton>
        <TDButton ButtonType="TDButtonType.Button">Despachar</TDButton>
    </End>
</TDToolbar>
""")],
        "navmenu" => [Page("Pages/Inicio.razor", "/inicio", """
<TDNavigationMenu Items="menu" />
""", """
    private readonly TDNavMega[] menu =
    [
        new("Catálogo", Groups:
        [
            new("Frenos", [new("/c/grid", "Pastillas y balatas"), new("/c/grid", "Discos y tambores"), new("/c/grid", "Sistema neumático"), new("/c/grid", "Sensores")]),
            new("Motor", [new("/c/grid", "Filtros"), new("/c/grid", "Refrigeración"), new("/c/grid", "Turbo"), new("/c/grid", "Correas")]),
            new("Suspensión", [new("/c/grid", "Amortiguadores"), new("/c/grid", "Muelles"), new("/c/grid", "Bujes"), new("/c/grid", "Barras")])
        ], Featured: "Discos, pastillas y sensores en un pedido.", FeaturedEyebrow: "Temporada de frenos", FeaturedTitle: "Kits completos con 15% menos"),
        new("Marcas", Panel: "brands", Groups:
        [
            new("", [new("/c/dropdown", "Volvo"), new("/c/dropdown", "Scania"), new("/c/dropdown", "Mercedes-Benz"), new("/c/dropdown", "MAN")])
        ]),
        new("Servicios", Panel: "desc", Groups:
        [
            new("", [
                new("/c/elocator", "Cotizar con un asesor", Hint: "Respuesta en horario hábil"),
                new("/c/etrack", "Talleres asociados", Hint: "Más de 40 en todo Chile"),
                new("/c/etrack", "Rastrear pedido", Hint: "Estado en tiempo real")
            ])
        ]),
        new("Ofertas", "/c/eflash")
    ];
""")],
        "pmenu" => Pmenu(),
        "stack" => [Page("Pages/Pedido.razor", "/pedido", """
<TDStack Orientation="TDOrientation.Horizontal" Gap="12px" Align="TDAlignItems.Center" Justify="TDJustify.Between" Wrap="true">
    <TDButton ButtonType="TDButtonType.Button">Nuevo pedido</TDButton>
    <span class="td-home__note">OC-00481 · 3 líneas</span>
    <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Exportar</TDButton>
</TDStack>
""")],
        "row" => [Page("Pages/Tablero.razor", "/tablero", """
<TDRow>
    <TDCol Size="12" SizeMd="3"><div class="td-demo-tile">Size 3</div></TDCol>
    <TDCol Size="12" SizeMd="6"><div class="td-demo-tile">Size 6</div></TDCol>
    <TDCol Size="12" SizeMd="3"><div class="td-demo-tile">Size 3</div></TDCol>
</TDRow>
<TDRow>
    <TDCol Size="12" SizeMd="8" Offset="2"><div class="td-demo-tile">Size 8 · Offset 2</div></TDCol>
</TDRow>
<TDRow>
    <TDCol Size="12" SizeMd="4" Order="2"><div class="td-demo-tile">Orden 2 · ficha</div></TDCol>
    <TDCol Size="12" SizeMd="8" Order="1"><div class="td-demo-tile">Orden 1 · listado</div></TDCol>
</TDRow>
""")],
        "column" => [Page("Pages/Tablero.razor", "/tablero", """
<TDRow>
    <TDCol Size="12" SizeMd="6" SizeLg="4"><div class="td-demo-tile">12 / 6 / 4</div></TDCol>
    <TDCol Size="12" SizeMd="6" SizeLg="4"><div class="td-demo-tile">12 / 6 / 4</div></TDCol>
    <TDCol Size="12" SizeMd="12" SizeLg="4"><div class="td-demo-tile">12 / 12 / 4</div></TDCol>
</TDRow>
""")],
        "layout" => [Page("Pages/Panel.razor", "/panel", """
<TDLayout>
    <div class="td-row12">
        <div class="td-appshell__kpi"><span>Pedidos</span><strong>18</strong></div>
        <div class="td-appshell__kpi"><span>En ruta</span><strong>6</strong></div>
        <div class="td-appshell__kpi"><span>Agotados</span><strong>2</strong></div>
    </div>
</TDLayout>
""")],
        "card" or "cardgroup" => [Page("Pages/Catalogo.razor", "/catalogo", """
<TDCard Title="Pastilla delantera" Eyebrow="BR-4521-AD" Media="Frenos">
    <ChildContent>Juego de 4. Volvo FH. $86.900</ChildContent>
    <Footer><TDButton ButtonType="TDButtonType.Button" Size="TDSize.Small">Agregar</TDButton></Footer>
</TDCard>
<TDCard Variant="TDCardVariant.Elevated" Header="Pedido OC-00481" Title="En bodega">
    <ChildContent>3 repuestos · despacho mañana 09:00.</ChildContent>
</TDCard>
""")],
        "dialog" => [Page("Pages/Flota.razor", "/flota", """
<TDButton ButtonType="TDButtonType.Button" data-td-dialog-open="demo-dialog">Abrir diálogo</TDButton>
<TDDialog Id="demo-dialog" Title="Nueva flota" ConfirmText="Guardar">
    <p>El diálogo se abre en el navegador. Guardar sigue siendo un POST.</p>
</TDDialog>
""")],
        "dropzone" => [Page("Pages/Pedidos.razor", "/pedidos", """
<TDDropZone Zones="@(new TDOption[] { new("pend", "Pendiente"), new("prep", "En preparación"), new("ship", "Despachado") })" Items="pedidos" />
""", """
    private readonly TDDropCard[] pedidos =
    [
        new("1", "OC-00481", "3 líneas · Santiago", "pend"),
        new("2", "OC-00490", "Filtro de aceite", "pend"),
        new("3", "OC-00472", "Disco ventilado", "prep"),
        new("4", "OC-00460", "Entregado a ruta", "ship")
    ];
""")],
        "panel" => [Page("Pages/Vehiculo.razor", "/vehiculo", """
<TDPanel Title="Vehículo" Collapsible="true">
    <ChildContent>
        <EditForm Model="vehiculo" FormName="vehiculo" OnSubmit="Guardar" Enhance>
            <TDTextBox @bind-Value="vehiculo.Marca" Label="Marca" />
            <TDTextBox @bind-Value="vehiculo.Modelo" Label="Modelo" />
        </EditForm>
    </ChildContent>
</TDPanel>
""", """
    private Vehiculo vehiculo = new() { Marca = "Transportes del Sur" };
    private void Guardar() { }
    private sealed class Vehiculo
    {
        public string? Marca { get; set; }
        public string? Modelo { get; set; }
    }
""")],
        "popup" => [Page("Pages/Catalogo.razor", "/catalogo", """
<TDPopup Trigger="Filtrar stock" AriaLabel="Filtro de stock">
    <TDCheckBoxList Name="stock" Label="" Options="@(new TDOption[] { new("ok", "En stock"), new("low", "Bajo"), new("out", "Agotado") })" />
</TDPopup>
<TDPopup Trigger="Arriba" Placement="TDPlacement.Top" AriaLabel="Ayuda">
    <p>Cierra con clic fuera o Esc.</p>
</TDPopup>
""")],
        "splitter" => [Page("Pages/Catalogo.razor", "/catalogo", """
<TDSplitter>
    <TDSplitterPane Flex="0 0 28%"><strong>Categorías</strong><span>Frenos · Motor · Eléctrico</span></TDSplitterPane>
    <TDSplitterPane Flex="1 1 44%"><strong>Resultados</strong><span>Pastilla BR-4521-AD</span></TDSplitterPane>
    <TDSplitterPane Flex="0 0 28%" ShowHandle="false"><strong>Detalle</strong><span>18 u. Santiago</span></TDSplitterPane>
</TDSplitter>
<TDSplitter Orientation="TDOrientation.Vertical">
    <TDSplitterPane><strong>Pedido</strong><span>OC-00481 con 3 líneas.</span></TDSplitterPane>
    <TDSplitterPane ShowHandle="false"><strong>Historial</strong><span>Cambios de estado y comentarios.</span></TDSplitterPane>
</TDSplitter>
""")],
        "tilelayout" => [Page("Pages/Tablero.razor", "/tablero", """
<TDTileLayout Items="tarjetas" />
""", """
    private readonly TDTileItem[] tarjetas =
    [
        new("v", "Ventas del mes", "$76 M", "+8 % vs abril", 2),
        new("s", "OTIF", "94 %", "Meta 95 %"),
        new("a", "Agotados", "2", "BR-4521 y SU-1180"),
        new("p", "Pedidos hoy", "18", "6 en ruta")
    ];
""")],
        "econtent" => [Page("Pages/Pedido.razor", "/pedido", """
<TDContent Shortcuts="@(new TDOption[] { new("Ctrl K", "Buscar"), new("N", "Nuevo pedido"), new("Esc", "Cerrar") })">
    <p>Enfoca esta zona y usa los atajos. El contenedor es un div que escucha el teclado en su área.</p>
</TDContent>
""")],
        "qrcode" => [Page("Pages/Etiqueta.razor", "/etiqueta", """
<TDQrCode Value="https://truckdepot.cl/p/BR-4521-AD" Ecc="M" Module="6" Color="#0A0B0C" QuietZone="true" Name="QrPng" />
""")],
        "barcode" => [Page("Pages/Etiqueta.razor", "/etiqueta", """
<TDBarcode Value="BR-4521-AD" Format="code128" BarWidth="2" Height="80" ShowText="true" Name="BarcodePng" />
""")],
        "labeldesigner" => [Page("Pages/Etiquetas.razor", "/etiquetas", """
<TDLabelDesigner Width="62" Height="40" Dpi="203" Copies="1" Template="@plantilla" Record="repuesto" />
""", """
    private readonly TDLabelRecord repuesto = new("BR-4521-AD", "Pastilla de freno delantera", "Volvo", "$ 189.990", "42", "https://truckdepot.cl/p/BR-4521-AD");
    private const string plantilla = "{\n  \"size\": { \"width\": 62, \"height\": 40, \"dpi\": 203 },\n  \"elements\": [\n    { \"type\": \"text\", \"x\": 3, \"y\": 3, \"w\": 56, \"h\": 4.2, \"text\": \"{name}\", \"size\": 3.4, \"bold\": true, \"align\": \"left\" },\n    { \"type\": \"barcode\", \"x\": 3, \"y\": 20.5, \"w\": 38, \"h\": 16, \"text\": \"{code}\", \"format\": \"c128\", \"showText\": true },\n    { \"type\": \"qr\", \"x\": 45, \"y\": 21, \"w\": 14, \"h\": 14, \"text\": \"{url}\" }\n  ]\n}";
""")],
        "reportdesigner" => [Page("Pages/Facturas.razor", "/facturas", """
<TDReportDesigner Report="factura" Rows="8" Numero="F-000481" Cliente="Transportes del Sur SpA" Rut="76.543.210-K" Fecha="2026-09-23" Vendedor="Camila Rojas" />
""")],
        "printers" => [Page("Pages/Impresoras.razor", "/impresoras", """
<TDPrinterConnect Devices="impresoras" />
""", """
    private readonly TDPrinterDevice[] impresoras =
    [
        new("zd421", "Zebra ZD421", "ZD421d · 203 dpi", "wifi", "192.168.1.40:9100", "ZPL", 203, 104, true, true),
        new("ql820", "Brother QL-820NWB", "QL-820NWB · 300 dpi", "wifi", "192.168.1.52:9100", "ESC/P", 300, 62, false, false, true),
        new("zq520", "Zebra ZQ520", "ZQ520 móvil · 203 dpi", "bt", "AC:3F:A4:12:9B:07", "CPCL", 203, 104, false)
    ];
""")],
        "ehid" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDHidListener MinLength="4" GapMs="60" IgnoreWhenTyping="false" InitialCode="BR-4521-AD" />
""")],
        "scanner" => [Page("Pages/Recepcion.razor", "/recepcion", """
<TDScanner Mode="continuous" KeyboardWedge="true" InitialValue="BR-4521-AD" />
""")],
        _ => null
    };

    private const string Menu = """
    private readonly TDMenuItem[] menu =
    [
        new("Catálogo", "/c/grid"),
        new("Pedidos", null, [new("Nuevo pedido", "/c/grid"), new("Borradores", "/c/toast"), new("-"), new("Exportar Excel", "/c/exportx", Shortcut: "⇧E")]),
        new("Bodega", null, [new("Santiago", "/c/gallery"), new("Concepción", "/c/gallery"), new("Temuco", "/c/gallery", Disabled: true)]),
        new("Ayuda", "/c/tokens")
    ];
""";

    private static CatalogCode[] Pmenu()
    {
        CatalogCode Shell(string file, string mode, string search, string small) => Page(file, "/panel", $"""
<TDMenuAppShell Title="Panel de flota" Modules="modulos" ActivePath="/ventas/pedidos" Mode="{mode}" ShowSearch="{search}" ShowSearchOnSmall="{small}" />
""", Modules);

        return
        [
            Shell("Layout/Iconos.razor", "TDMenuShellMode.Icons", "true", "false"),
            Page("Layout/IconosSinBusqueda.razor", "/panel", """
<TDMenuAppShell Title="Panel de flota" Modules="modulos" ActivePath="/ventas/pedidos" Mode="TDMenuShellMode.Icons" ShowSearch="false" />
""", Modules),
            Shell("Layout/Flotante.razor", "TDMenuShellMode.Float", "true", "false"),
            Page("Layout/FlotanteSinBusqueda.razor", "/panel", """
<TDMenuAppShell Title="Panel de flota" Modules="modulos" ActivePath="/ventas/pedidos" Mode="TDMenuShellMode.Float" ShowSearch="false" />
""", Modules),
            Shell("Layout/BusquedaEnPequeno.razor", "TDMenuShellMode.Icons", "true", "true"),
            Page("Shared/MenuApp.razor", "/panel", """
<TDMenuApp Modules="modulos" ActivePath="/ventas/pedidos" ExpandActive="true" RememberExpanded="true" Stay="true" ShowSource="true" />
""", Modules),
            new("Shared/MenuModules.cs", "c#", Modules.Trim())
        ];
    }

    private const string Modules = """
    private readonly TDMenuItem[] modulos =
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
""";

    private static CatalogCode Page(string file, string route, string markup, string? code = null)
    {
        var block = string.IsNullOrWhiteSpace(code) ? "" : $"\n\n@code {{\n{code}\n}}";
        return new(file, "razor", $"""
@page "{route}"
@using TDComponents
@using TDComponents.Components

{markup}{block}
""");
    }
}
