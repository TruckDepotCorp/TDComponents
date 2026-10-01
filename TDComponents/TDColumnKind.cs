namespace TDComponents;

/// <summary>Presentación de una celda de <c>TDColumn</c> cuando no hay <c>Template</c>.</summary>
public enum TDColumnKind
{
    /// <summary>Texto normal. Es el defecto. El filtro trata la columna como texto.</summary>
    Text,

    /// <summary>Texto monoespaciado, para códigos.</summary>
    Mono,

    /// <summary>Texto con énfasis.</summary>
    Strong,

    /// <summary>Texto secundario.</summary>
    Muted,

    /// <summary>Valor dentro de una píldora.</summary>
    Pill,

    /// <summary>Importe. El filtro trata la columna como número.</summary>
    Money,

    /// <summary>Fecha. El filtro trata la columna como fecha.</summary>
    Date,

    /// <summary>Número. El filtro trata la columna como número.</summary>
    Number,

    /// <summary>Stock. El filtro trata la columna como número.</summary>
    Stock,

    /// <summary>Miniatura. La dirección sale de <c>Thumb</c>.</summary>
    Thumb
}
