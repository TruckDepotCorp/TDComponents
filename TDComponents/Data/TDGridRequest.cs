using System.Globalization;

namespace TDComponents.Data;

/// <summary>Filtro de una columna de <c>TDDataGrid</c>, tal como viaja en la URL.</summary>
/// <remarks>
/// <para>No es un parámetro del componente. La grilla lo escribe en la query <c>f</c> cuando hay <c>QueryKey</c>. Úsalo para leer o rearmar ese texto con <see cref="TDGridRequest"/>.</para>
/// <para>Operadores: <c>contains</c>, <c>ncontains</c>, <c>eq</c>, <c>neq</c>, <c>starts</c>, <c>ends</c>, <c>empty</c>, <c>nempty</c>, <c>lt</c>, <c>lte</c>, <c>gt</c>, <c>gte</c>, <c>in</c>. <c>empty</c> y <c>nempty</c> no llevan valor.</para>
/// </remarks>
/// <param name="Key">Clave de la columna.</param>
/// <param name="Op1">Operador de la primera condición.</param>
/// <param name="Value1">Valor de la primera condición. Nulo en operadores unarios.</param>
/// <param name="Logic"><c>and</c> o <c>or</c> entre las dos condiciones. El defecto al leer es <c>and</c>.</param>
/// <param name="Op2">Operador de la segunda condición. Vacío si no hay segunda condición.</param>
/// <param name="Value2">Valor de la segunda condición.</param>
public sealed record TDColumnFilter(string Key, string Op1, string? Value1, string Logic, string Op2, string? Value2)
{
    /// <summary>La primera condición tiene operador y, si hace falta, valor.</summary>
    public bool HasFirst => IsActive(Op1, Value1);

    /// <summary>La segunda condición tiene operador y, si hace falta, valor.</summary>
    public bool HasSecond => IsActive(Op2, Value2);

    /// <summary>Un operador unario cuenta como activo. El resto exige valor.</summary>
    public static bool IsActive(string? op, string? value)
        => !string.IsNullOrEmpty(op) && (IsUnary(op) || !string.IsNullOrEmpty(value));

    /// <summary><c>empty</c> y <c>nempty</c> no necesitan valor.</summary>
    public static bool IsUnary(string? op) => op is "empty" or "nempty";
}

/// <summary>Lee y escribe el estado de <c>TDDataGrid</c> en la query string.</summary>
/// <remarks>
/// <para>Con <c>QueryKey</c> igual a <c>g</c>, los nombres quedan <c>gq</c>, <c>gsort</c>, <c>gdir</c>, <c>gsize</c>, <c>gf</c>, <c>gpage</c>, <c>gsel</c>, <c>gcat</c> y <c>gtipo</c>. El filtro simple de una columna usa <c>gv-</c> y <c>gop-</c> más la clave.</para>
/// <para>No construyas el texto de <c>f</c> a mano. Usa <see cref="FormatFilters"/> y <see cref="ParseFilters"/>.</para>
/// </remarks>
public static class TDGridRequest
{
    /// <summary>Nombre del parámetro. Si <paramref name="prefix"/> tiene texto, se antepone a <paramref name="name"/>.</summary>
    public static string Key(string? prefix, string name)
        => string.IsNullOrEmpty(prefix) ? name : prefix + name;

    /// <summary>Valor de la query, o nulo si falta o está en blanco.</summary>
    public static string? Read(IReadOnlyDictionary<string, string> query, string? prefix, string name)
        => query.TryGetValue(Key(prefix, name), out var value) && !string.IsNullOrWhiteSpace(value) ? value : null;

    /// <summary>Entero positivo de la query. Si no se puede leer, devuelve <paramref name="fallback"/>.</summary>
    public static int ReadInt(IReadOnlyDictionary<string, string> query, string? prefix, string name, int fallback)
        => int.TryParse(Read(query, prefix, name), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value) && value > 0
            ? value
            : fallback;

    /// <summary>Separa el texto de filtros. Cada filtro va separado por <c>;</c> y sus campos por <c>|</c>.</summary>
    public static IReadOnlyList<TDColumnFilter> ParseFilters(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return [];
        }

        var filters = new List<TDColumnFilter>();
        foreach (var part in raw.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var bits = part.Split('|');
            if (bits.Length < 2)
            {
                continue;
            }

            filters.Add(new TDColumnFilter(
                Unescape(bits[0]),
                Unescape(bits[1]),
                bits.Length > 2 ? Unescape(bits[2]) : null,
                bits.Length > 3 && Unescape(bits[3]) == "or" ? "or" : "and",
                bits.Length > 4 ? Unescape(bits[4]) : "",
                bits.Length > 5 ? Unescape(bits[5]) : null));
        }

        return filters;
    }

    /// <summary>Arma el texto de la query <c>f</c> a partir de filtros ya activos.</summary>
    public static string FormatFilters(IEnumerable<TDColumnFilter> filters)
        => string.Join(';', filters.Select(filter => string.Join('|',
            Escape(filter.Key),
            Escape(filter.Op1),
            Escape(filter.Value1),
            Escape(filter.Logic),
            Escape(filter.Op2),
            Escape(filter.Value2))));

    /// <summary>Etiqueta en español del operador. Un operador desconocido se devuelve tal cual.</summary>
    public static string OperatorLabel(string op) => op switch
    {
        "contains" => "contiene",
        "ncontains" => "no contiene",
        "eq" => "igual a",
        "neq" => "distinto de",
        "starts" => "empieza con",
        "ends" => "termina con",
        "empty" => "está vacío",
        "nempty" => "no está vacío",
        "lt" => "menor que",
        "lte" => "menor o igual a",
        "gt" => "mayor que",
        "gte" => "mayor o igual a",
        "in" => "es uno de",
        _ => op
    };

    private static string Escape(string? value)
        => Uri.EscapeDataString(value ?? "");

    private static string Unescape(string value)
        => Uri.UnescapeDataString(value);
}
