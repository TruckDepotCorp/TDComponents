namespace WebAppSSR.Catalog;

internal static class CatalogViewPages
{
    public static IReadOnlyList<CatalogCode>? For(string id)
    {
        var key = id.ToLowerInvariant();
        if (Charts.TryGetValue(key, out var chart))
        {
            return [Page(chart.File, chart.Route, $"<TDChart Kind=\"{key}\" />")];
        }

        if (Shops.TryGetValue(key, out var shop))
        {
            return [Page(shop.File, shop.Route, $"<TDEcom Kind=\"{key}\" />")];
        }

        return key switch
        {
            "chart" => [Page("Pages/Ventas.razor", "/ventas", """
<div class="td-preview-bars">
    <div class="td-preview-bar" style="--w:88%"><span>Marzo $88 M</span></div>
    <div class="td-preview-bar" style="--w:64%"><span>Abril $64 M</span></div>
    <div class="td-preview-bar" style="--w:76%"><span>Mayo $76 M</span></div>
</div>
""")],
            "aos" => [Page("Pages/Inicio.razor", "/inicio", """
<p class="td-home__note">Desplázate dentro del recuadro. Con movimiento reducido el contenido aparece sin animar.</p>
<div class="td-aos-box">
    <TDAnimateOnScroll Enter="fade-up"><div class="td-aos-card"><strong>Despacho en 24 h</strong><span>A todo Chile desde tres bodegas.</span></div></TDAnimateOnScroll>
    <TDAnimateOnScroll Enter="slide-left" Once="false"><div class="td-aos-card"><strong>Garantía 12 meses</strong><span>En todos los repuestos originales.</span></div></TDAnimateOnScroll>
    <TDAnimateOnScroll Enter="slide-right"><div class="td-aos-card"><strong>Talleres asociados</strong><span>Más de 40 talleres para instalar.</span></div></TDAnimateOnScroll>
    <TDAnimateOnScroll Enter="zoom"><div class="td-aos-card"><strong>Crédito de flota</strong><span>Paga a 30 días con cuenta aprobada.</span></div></TDAnimateOnScroll>
    <TDAnimateOnScroll Enter="flip"><div class="td-aos-card"><strong>Cotiza en minutos</strong><span>Un asesor responde en horario hábil.</span></div></TDAnimateOnScroll>
    <TDAnimateOnScroll Enter="fade"><div class="td-aos-card"><strong>Stock en línea</strong><span>Disponibilidad real por bodega.</span></div></TDAnimateOnScroll>
    <TDAnimateOnScroll Enter="fade-up" Delay="240"><div class="td-aos-card"><strong>Retiro en tienda</strong><span>El mismo día si compras antes de las 13:00.</span></div></TDAnimateOnScroll>
</div>
""")],
            "terminal" => [Page("Pages/Consola.razor", "/consola", """
<TDTerminal PartsJson="@repuestos" />
<div class="td-term-chips">
    <button type="button" class="td-btn td-btn--secondary td-btn--sm" data-td-term-chip="help">help</button>
    <button type="button" class="td-btn td-btn--secondary td-btn--sm" data-td-term-chip="stock BR-4521-AD">stock BR-4521-AD</button>
    <button type="button" class="td-btn td-btn--secondary td-btn--sm" data-td-term-chip="buscar filtro">buscar filtro</button>
    <button type="button" class="td-btn td-btn--secondary td-btn--sm" data-td-term-chip="pedido 481">pedido 481</button>
    <button type="button" class="td-btn td-btn--secondary td-btn--sm" data-td-term-chip="imprimir BR-4521-AD 3">imprimir BR-4521-AD 3</button>
</div>
""", """
    private const string repuestos = "[{\"code\":\"BR-4521-AD\",\"name\":\"Pastilla de freno delantera\",\"brand\":\"Volvo\",\"stock\":18,\"price\":189990},{\"code\":\"FO-2210\",\"name\":\"Filtro de aceite\",\"brand\":\"Mann\",\"stock\":42,\"price\":24990}]";
""")],
            "orgchart" => [Page("Pages/Equipo.razor", "/equipo", """
<p class="td-section-title">Equipo Truck Depot · 10 personas</p>
<p class="td-home__note">El nombre abre la ficha. El correo abre el cliente de correo. La píldora con el número pliega o muestra el equipo.</p>
@if (!string.IsNullOrWhiteSpace(Persona) && Ficha is null)
{
    <p class="td-home__note" role="status">No hay una ficha para ese colaborador. <a href="/equipo">Volver al organigrama</a></p>
}
else if (Ficha is { } ficha)
{
    <article class="td-org-ficha">
        <p class="td-section-title">Ficha</p>
        <h2>@ficha.Person.Name</h2>
        <p>@ficha.Person.Role</p>
        @if (!string.IsNullOrWhiteSpace(ficha.Person.Email))
        {
            <p><a href="@($"mailto:{ficha.Person.Email}")">@ficha.Person.Email</a></p>
        }
        <p class="td-org-ficha__meta">
            @if (ficha.Manager is { } manager)
            {
                <span>Reporta a <a href="@manager.Href">@manager.Name</a>, @manager.Role.</span>
            }
            else
            {
                <span>Cabeza del organigrama.</span>
            }
        </p>
        @if (ficha.Person.Children is { Count: > 0 } team)
        {
            <p class="td-org-ficha__meta">Equipo directo</p>
            <ul class="td-org-ficha__team">
                @foreach (var member in team)
                {
                    <li><a href="@member.Href">@member.Name</a> <span class="td-org-ficha__meta">@member.Role</span></li>
                }
            </ul>
        }
        else
        {
            <p class="td-org-ficha__meta">Sin equipo a cargo.</p>
        }
        <p><a href="/equipo">Cerrar ficha</a></p>
    </article>
}
<TDOrganizationChart Root="equipo" SelectedId="@Persona" />
""", Org)],
            "pcarousel" => [Page("Pages/Inicio.razor", "/inicio", """
<p class="td-section-title">Banner · rotación automática</p>
<TDCarousel Slides="@(new TDSlide[] {
    new("Oferta de flota", "Pastillas Volvo FH", "Juego de 4, retiro hoy en Santiago. Precio de convenio.", "Ver ficha", "#0A0B0C", "#ED2A24"),
    new("Despacho", "Llega mañana a regiones", "Pedidos antes de las 14 h salen el mismo día.", "Armar pedido", "#14171A", "#F2B04A"),
    new("Bodega", "Stock en tres sucursales", "Santiago, Concepción y Temuco con reserva inmediata.", "Ver stock", "#1F2327", "#4CC47F")
})" />
""")],
            "compare" => [Page("Pages/Comparar.razor", "/comparar", """
<div class="td-demo-grid">
    <TDCompare />
    <TDCompare Label="Vertical" Vertical="true" />
    <TDCompare Label="Sigue al mouse" FollowMouse="true" />
</div>
<p class="td-field__hint">Las fotos son marcadores de posición; en producción van dos imágenes del mismo encuadre.</p>
""")],
            "gallery" => [Page("Pages/Galeria.razor", "/galeria", """
<TDGallery Items="fotos" />
""", """
    private readonly TDGalleryItem[] fotos =
    [
        new("Pastilla delantera", "BR-4521-AD", "linear-gradient(135deg,#ED2A24,#3A0A0A)"),
        new("Disco ventilado", "DC-8841", "linear-gradient(135deg,#6E757D,#1F2327)"),
        new("Filtro de aceite", "FO-2210", "linear-gradient(135deg,#1A4B8C,#0A0B0C)"),
        new("Amortiguador cabina", "AM-1102", "linear-gradient(135deg,#177A41,#0A0B0C)")
    ];
""")],
            "imageview" => [Page("Pages/Imagen.razor", "/imagen", """
<div class="td-demo-grid">
    <TDImage Alt="Disco de freno" Caption="Disco ventilado 45 mm · clic para ampliar" Background="linear-gradient(135deg,#6E757D,#1F2327)" />
    <TDImage Alt="Pastilla BR-4521-AD" Caption="Juego de 4 · Volvo FH" Background="linear-gradient(135deg,#ED2A24,#3A0A0A)" />
</div>
""")],
            "scheduler" => [Page("Pages/Agenda.razor", "/agenda", """
<TDScheduler />
""")],
            _ => null
        };
    }

    private static readonly Dictionary<string, (string File, string Route)> Charts = new()
    {
        ["chline"] = ("Pages/Ventas.razor", "/ventas"),
        ["chcol"] = ("Pages/Ventas.razor", "/ventas"),
        ["chpie"] = ("Pages/Stock.razor", "/stock"),
        ["chscatter"] = ("Pages/Pedidos.razor", "/pedidos"),
        ["chgauge"] = ("Pages/Meta.razor", "/meta"),
        ["chspark"] = ("Pages/Kpi.razor", "/kpi"),
        ["chheat"] = ("Pages/Demanda.razor", "/demanda"),
        ["chwf"] = ("Pages/Margen.razor", "/margen"),
        ["chfunnel"] = ("Pages/Conversion.razor", "/conversion"),
        ["chpareto"] = ("Pages/Abc.razor", "/abc"),
        ["chtree"] = ("Pages/Categorias.razor", "/categorias"),
        ["chradar"] = ("Pages/Proveedores.razor", "/proveedores"),
        ["chsankey"] = ("Pages/Despachos.razor", "/despachos"),
        ["chbullet"] = ("Pages/Kpi.razor", "/kpi"),
        ["chgantt"] = ("Pages/Programa.razor", "/programa"),
        ["chforecast"] = ("Pages/Pronostico.razor", "/pronostico"),
        ["chvariance"] = ("Pages/Presupuesto.razor", "/presupuesto"),
        ["chquadrant"] = ("Pages/Portafolio.razor", "/portafolio"),
        ["chcohort"] = ("Pages/Retencion.razor", "/retencion"),
        ["chmekko"] = ("Pages/Mezcla.razor", "/mezcla"),
        ["chslope"] = ("Pages/Sucursales.razor", "/sucursales"),
        ["chdumbbell"] = ("Pages/Entrega.razor", "/entrega"),
        ["chcontrol"] = ("Pages/Control.razor", "/control")
    };

    private static readonly Dictionary<string, (string File, string Route)> Shops = new()
    {
        ["ecard"] = ("Pages/Tienda.razor", "/tienda"),
        ["edetail"] = ("Pages/Ficha.razor", "/ficha"),
        ["ecart"] = ("Pages/Carrito.razor", "/carrito"),
        ["echeckout"] = ("Pages/Pago.razor", "/pago"),
        ["efacets"] = ("Pages/Buscar.razor", "/buscar"),
        ["esearch"] = ("Pages/Buscar.razor", "/buscar"),
        ["ecompare"] = ("Pages/Comparar.razor", "/comparar"),
        ["eflash"] = ("Pages/Oferta.razor", "/oferta"),
        ["ereviews"] = ("Pages/Resenas.razor", "/resenas"),
        ["efinder"] = ("Pages/Vehiculo.razor", "/vehiculo"),
        ["equote"] = ("Pages/Cotizar.razor", "/cotizar"),
        ["ebulk"] = ("Pages/PedidoMasivo.razor", "/pedido-masivo"),
        ["erecent"] = ("Pages/Vistos.razor", "/vistos"),
        ["estock"] = ("Pages/AvisoStock.razor", "/aviso-stock"),
        ["ewishmulti"] = ("Pages/Favoritos.razor", "/favoritos"),
        ["etrack"] = ("Pages/Seguimiento.razor", "/seguimiento"),
        ["efbt"] = ("Pages/Combo.razor", "/combo"),
        ["elocator"] = ("Pages/Sucursales.razor", "/sucursales"),
        ["ecredit"] = ("Pages/Credito.razor", "/credito"),
        ["ereturns"] = ("Pages/Devolucion.razor", "/devolucion")
    };

    private const string Org = """
    [SupplyParameterFromQuery(Name = "persona")]
    public string? Persona { get; set; }

    private static TDOrgNode Person(string id, string name, string role, string initials, string email, params TDOrgNode[] team) =>
        new(id, name, role, initials, team.Length == 0 ? null : team, $"/equipo?persona={id}", email);

    private static readonly TDOrgNode equipo = Person("gg", "María Reyes", "Gerente general", "MR", "maria.reyes@truckdepot.cl",
        Person("op", "Jorge Soto", "Operaciones", "JS", "jorge.soto@truckdepot.cl",
            Person("bq", "Paula Lagos", "Bodega Quilicura", "PL", "paula.lagos@truckdepot.cl"),
            Person("de", "Raúl Vera", "Despacho", "RV", "raul.vera@truckdepot.cl"),
            Person("ta", "Carla Muñoz", "Taller", "CM", "carla.munoz@truckdepot.cl")),
        Person("co", "Andrés Fuentes", "Comercial", "AF", "andres.fuentes@truckdepot.cl",
            Person("vf", "Camila Rojas", "Ventas flota", "CR", "camila.rojas@truckdepot.cl"),
            Person("ec", "Diego Torres", "E-commerce", "DT", "diego.torres@truckdepot.cl")),
        Person("fi", "Lucía Bravo", "Finanzas", "LB", "lucia.bravo@truckdepot.cl",
            Person("cb", "Tomás Núñez", "Cobranza", "TN", "tomas.nunez@truckdepot.cl")));

    private (TDOrgNode Person, TDOrgNode? Manager)? Ficha =>
        string.IsNullOrWhiteSpace(Persona) ? null : Locate(equipo, Persona, null);

    private static (TDOrgNode Person, TDOrgNode? Manager)? Locate(TDOrgNode node, string id, TDOrgNode? manager)
    {
        if (node.Id == id)
        {
            return (node, manager);
        }

        if (node.Children is null)
        {
            return null;
        }

        foreach (var child in node.Children)
        {
            var hit = Locate(child, id, node);
            if (hit is not null)
            {
                return hit;
            }
        }

        return null;
    }
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
