namespace WebAppSSR.Models;

public sealed class Repuesto
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Brand { get; set; } = "";
    public string Model { get; set; } = "";
    public string Type { get; set; } = "";
    public string Category { get; set; } = "";
    public int Stock { get; set; }
    public int Price { get; set; }
    public DateOnly Updated { get; set; }
}

public sealed class CategoriaNodo
{
    public string Name { get; init; } = "";
    public string Type { get; init; } = "";
    public string Category { get; init; } = "";
    public string? Href { get; init; }
    public int Count { get; init; }
    public bool Expanded { get; init; }
    public bool Active { get; init; }
    public IReadOnlyList<CategoriaNodo> Children { get; init; } = [];
}
