namespace TDComponents;

/// <summary>Tono de un aviso. El texto del estado va escrito; el tono no es el único aviso.</summary>
public enum TDShopTone
{
    /// <summary>Información neutra.</summary>
    Neutral,

    /// <summary>Dato de crédito o información.</summary>
    Info,

    /// <summary>El paso puede continuar.</summary>
    Success,

    /// <summary>Hay algo que revisar antes de seguir.</summary>
    Warning,

    /// <summary>El paso está bloqueado.</summary>
    Danger
}

/// <summary>Entrada del menú lateral.</summary>
/// <param name="Label">Nombre visible.</param>
/// <param name="Group">Título de grupo. Solo la primera opción del grupo lo trae.</param>
/// <param name="Badge">Conteo, si aplica.</param>
public sealed record TDShopLink(string Label, string? Group = null, int? Badge = null);

/// <summary>Indicador de una franja.</summary>
/// <param name="Label">Qué mide.</param>
/// <param name="Value">Cifra principal ya formateada.</param>
/// <param name="Detail">Contexto en una línea.</param>
/// <param name="Tone">Color de la cifra.</param>
public sealed record TDShopKpi(string Label, string Value, string Detail, TDShopTone Tone = TDShopTone.Neutral);

/// <summary>Fila de lo que requiere atención.</summary>
/// <param name="Title">Qué pasa.</param>
/// <param name="Detail">Por qué importa.</param>
/// <param name="Action">Texto del botón.</param>
/// <param name="Tone">Gravedad.</param>
public sealed record TDShopAlert(string Title, string Detail, string Action, TDShopTone Tone = TDShopTone.Warning);

/// <summary>Filtro con conteo.</summary>
/// <param name="Label">Texto del filtro.</param>
/// <param name="Count">Cuántos elementos entran.</param>
/// <param name="Tag">Marca que deben tener las filas. Vacío muestra todos.</param>
public sealed record TDShopChip(string Label, int Count, string Tag = "");

/// <summary>Movimiento de crédito o de stock.</summary>
/// <param name="Title">Qué ocurrió.</param>
/// <param name="When">Cuándo, como texto.</param>
/// <param name="Amount">Monto o unidades ya formateado, con signo.</param>
/// <param name="Incoming">True si suma deuda o entrada. False si es cobro o salida.</param>
public sealed record TDShopMove(string Title, string When, string Amount, bool Incoming);

/// <summary>Dirección de un cliente.</summary>
/// <param name="Label">Nombre corto del lugar.</param>
/// <param name="Line">Dirección.</param>
public sealed record TDShopAddress(string Label, string Line);

/// <summary>Producto del punto de venta.</summary>
/// <param name="Name">Nombre.</param>
/// <param name="Sku">Código.</param>
/// <param name="Price">Precio de venta.</param>
/// <param name="Stock">Existencia. Cero no se puede agregar.</param>
/// <param name="Category">Filtro de categoría.</param>
public sealed record TDShopProduct(string Name, string Sku, decimal Price, int Stock, string Category);
