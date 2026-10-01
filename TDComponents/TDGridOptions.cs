namespace TDComponents;

/// <summary>Modo de filtro de <c>TDDataGrid</c> o de una <c>TDColumn</c>.</summary>
public enum TDFilterMode
{
    /// <summary>La columna usa el modo de la grilla.</summary>
    Inherit,

    /// <summary>La columna no se filtra.</summary>
    None,

    /// <summary>Una caja bajo el encabezado, con el operador por defecto del tipo.</summary>
    Simple,

    /// <summary>La caja simple más un menú para elegir el operador.</summary>
    Menu,

    /// <summary>Embudo del encabezado con dos condiciones combinadas. Es el defecto de la grilla.</summary>
    Advanced,

    /// <summary>Lista de valores distintos con conteo.</summary>
    CheckList,

    /// <summary>Cada columna puede declarar un modo distinto.</summary>
    Mixed
}

/// <summary>Cuántas filas se pueden elegir en <c>TDDataGrid</c>.</summary>
public enum TDSelectionMode
{
    /// <summary>Casillas por fila y selección de todas. Es el defecto.</summary>
    Multiple,

    /// <summary>Una fila a la vez.</summary>
    Single,

    /// <summary>La grilla no selecciona filas.</summary>
    None
}

/// <summary>Borde al que se pega una columna mientras la tabla se desplaza en horizontal.</summary>
public enum TDFrozenEdge
{
    /// <summary>La columna se desplaza con el resto. Es el defecto.</summary>
    None,

    /// <summary>Queda fija a la izquierda.</summary>
    Left,

    /// <summary>Queda fija a la derecha.</summary>
    Right
}

/// <summary>Total del pie de una <c>TDColumn</c>. Solo se ve si la grilla tiene <c>ShowFooter</c>.</summary>
public enum TDAggregate
{
    /// <summary>Sin total. Es el defecto.</summary>
    None,

    /// <summary>Cuenta las filas visibles.</summary>
    Count,

    /// <summary>Suma los valores numéricos visibles.</summary>
    Sum,

    /// <summary>Promedia los valores numéricos visibles.</summary>
    Average
}

/// <summary>Orden que <c>TDDataGrid</c> calcula a partir de la URL. No se pasa como parámetro.</summary>
/// <param name="Key">Clave de la columna.</param>
/// <param name="Descending">Verdadero si el orden es descendente.</param>
public sealed record TDSort(string Key, bool Descending);

/// <summary>Celda de pie que <c>TDDataGrid</c> calcula con <c>TDAggregate</c>. No se pasa como parámetro.</summary>
/// <param name="Label">Rótulo del total, por ejemplo Suma o Conteo.</param>
/// <param name="Value">Cifra ya formateada.</param>
public sealed record TDFooterCell(string Label, string Value);
