namespace TDComponents;

/// <summary>Jerarquía visual de un botón o una acción.</summary>
public enum TDVariant
{
    /// <summary>Acción principal de la zona. Una sola por grupo.</summary>
    Primary,

    /// <summary>Acción alternativa. No compite con la primaria.</summary>
    Secondary,

    /// <summary>Acción terciaria, sin relleno.</summary>
    Ghost,

    /// <summary>Acción destructiva: eliminar, anular, rechazar.</summary>
    Danger
}
