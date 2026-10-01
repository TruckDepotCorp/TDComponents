namespace TDComponents;

/// <summary>Comportamiento de <c>TDButton</c> dentro de un formulario.</summary>
public enum TDButtonType
{
    /// <summary>Envía el formulario. Es el valor por defecto. Puede mostrar el texto de espera.</summary>
    Submit,

    /// <summary>No envía el formulario. Úsalo en cualquier botón que solo abre, cancela o ejecuta algo en el cliente.</summary>
    Button,

    /// <summary>Limpia los campos del formulario.</summary>
    Reset
}
