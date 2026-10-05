namespace WebAppSSR.Catalog;

internal static class CatalogMapPages
{
    public static IReadOnlyList<CatalogCode>? For(string id) => id.ToLowerInvariant() switch
    {
        "maps" => [Page("Pages/Ruta.razor", "/ruta", """
<TDMaps Title="Pilotos en ruta" Units="pilotos" MatchRoute="true" />
""", """
    private readonly TDMapUnit[] pilotos =
    [
        new("cr", "Camila Rojas", 14.626, -90.560, "Piloto", "En ruta", "Volvo FH", "ABCD-12", "Pedido OC-00481 · tres paradas", "Hace 1 minuto",
        [
            new(14.526, -90.588),
            new(14.575, -90.590),
            new(14.633, -90.607),
            new(14.626, -90.560)
        ],
        [
            new("Bodega Villa Nueva", 14.526, -90.588, "08:10", "Cargó 3 repuestos"),
            new("Cliente Mixco", 14.633, -90.607, "08:40", "Entregó el filtro"),
            new("Taller Zona 1", 14.642, -90.513, "09:05", "Dejó las pastillas")
        ]),
        new("dt", "Diego Torres", 14.599, -90.514, "Piloto", "Detenido", "Scania R", "EFGH-34", "Descarga en el cliente", "Hace 4 minutos",
        [
            new(14.642, -90.513),
            new(14.620, -90.513),
            new(14.599, -90.514)
        ],
        [
            new("Zona 10", 14.599, -90.514, "09:20", "Espera la firma de la guía")
        ]),
        new("js", "Jorge Soto", 14.555, -90.545, "Vehículo", "En ruta", "Mercedes Actros", "IJKL-56", "Vuelve a bodega", "Hace 2 minutos",
        [
            new(14.569, -90.478),
            new(14.560, -90.510),
            new(14.555, -90.545)
        ],
        [
            new("Santa Catarina Pinula", 14.569, -90.478, "08:55", "Retiró una devolución")
        ])
    ];
""")],
        "maptrace" => [Page("Pages/Recorrido.razor", "/recorrido", """
<TDMaps Title="Recorrido de Camila Rojas" Units="recorrido" MatchRoute="true" />
""", """
    private readonly TDMapUnit[] recorrido =
    [
        new("cr", "Camila Rojas", 14.599, -90.514, "Piloto", "En ruta", "Volvo FH", "ABCD-12", "Pedido OC-00481 · recorrido del turno", "Hace 1 minuto",
        [
            new(14.526, -90.588),
            new(14.538, -90.572),
            new(14.552, -90.558),
            new(14.566, -90.546),
            new(14.578, -90.534),
            new(14.590, -90.524),
            new(14.598, -90.518),
            new(14.599, -90.514)
        ])
    ];
""")],
        "mapuser" => [Page("Pages/Ubicacion.razor", "/ubicacion", """
<TDMapUser Name="María Soto" Role="Operadora de recepción" />
""")],
        "locate" => [Page("Pages/Aqui.razor", "/aqui", """
<TDLocate />
""")],
        "maproute" => [Page("Pages/Entregas.razor", "/entregas", """
<TDMapRoute Title="Ruta de entregas" Origin="salida" Destination="llegada" Deliveries="entregas" />
""", """
    private readonly TDMapStop salida = new("Bodega Villa Nueva", 14.526, -90.588, Note: "Salida con la carga");
    private readonly TDMapStop llegada = new("Cliente Santa Catarina Pinula", 14.569, -90.478, Note: "Última entrega del turno");
    private readonly TDMapStop[] entregas =
    [
        new("Cliente Mixco", 14.633, -90.607, "1", "Filtro de aceite"),
        new("Taller Zona 1", 14.642, -90.513, "2", "Pastillas BR-4521-AD"),
        new("Cliente Zona 10", 14.599, -90.514, "3", "Disco ventilado")
    ];
""")],
        _ => null
    };

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
