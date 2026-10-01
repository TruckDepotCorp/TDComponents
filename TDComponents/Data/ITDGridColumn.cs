using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;

namespace TDComponents.Data;

/// <summary>Contrato de una columna que <c>TDDataGrid</c> ya obtiene de <c>TDColumn</c>.</summary>
/// <remarks>No implementes esta interfaz en la página. Declara <c>TDColumn</c> dentro de <c>Columns</c>.</remarks>
public interface ITDGridColumn<TItem>
{
    /// <summary>Clave estable de la columna en la URL.</summary>
    string Key { get; }

    /// <summary>Texto del encabezado.</summary>
    string Title { get; }

    /// <summary>Nombre del campo enlazado. Nulo si la columna solo tiene plantilla.</summary>
    string? PropertyName { get; }

    /// <summary>Presentación cuando no hay plantilla.</summary>
    TDColumnKind Kind { get; }

    /// <summary>Alineación de la celda.</summary>
    TDColumnAlign Align { get; }

    /// <summary>La columna participa en el orden.</summary>
    bool Sortable { get; }

    /// <summary>La columna participa en el filtro.</summary>
    bool Filterable { get; }

    /// <summary>La búsqueda general incluye esta columna.</summary>
    bool Searchable { get; }

    /// <summary>La columna se pinta.</summary>
    bool Visible { get; }

    /// <summary>La persona puede mostrarla u ocultarla.</summary>
    bool Pickable { get; }

    /// <summary>Ancho fijo en píxeles. Cero no fija el ancho.</summary>
    int Width { get; }

    /// <summary>Ancho mínimo al redimensionar.</summary>
    int MinWidth { get; }

    /// <summary>Borde fijo al desplazar en horizontal.</summary>
    TDFrozenEdge Frozen { get; }

    /// <summary>Total del pie.</summary>
    TDAggregate Aggregate { get; }

    /// <summary>Encabezado que agrupa esta columna con las siguientes del mismo texto.</summary>
    string? GroupTitle { get; }

    /// <summary>Modo de filtro propio. <see cref="TDFilterMode.Inherit"/> usa el de la grilla.</summary>
    TDFilterMode FilterMode { get; }

    /// <summary>Tipo de filtro que deriva de <see cref="Kind"/>: texto, número o fecha.</summary>
    string FilterType { get; }

    /// <summary>Expresión de orden. Nula si la columna no se ordena por un campo.</summary>
    LambdaExpression? SortExpression { get; }

    /// <summary>Valor crudo del ítem para filtrar y ordenar.</summary>
    object? Read(TItem item);

    /// <summary>Texto que se pinta cuando no hay plantilla.</summary>
    string Display(TItem item);

    /// <summary>Dirección de la miniatura cuando <see cref="Kind"/> es <see cref="TDColumnKind.Thumb"/>.</summary>
    string? ThumbText(TItem item);

    /// <summary>Predicado del filtro. Nulo si el operador no aplica al valor.</summary>
    Expression<Func<TItem, bool>>? BuildFilter(string op, string? value);

    /// <summary>Celda libre. Si existe, reemplaza a <see cref="Display"/>.</summary>
    RenderFragment<TItem>? Template { get; }
}
