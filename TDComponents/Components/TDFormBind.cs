using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;

namespace TDComponents.Components;

public partial class TDSelect
{
    /// <summary>Se invoca cuando el formulario devuelve la opción.</summary>
    [Parameter] public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>Campo del modelo. Lo usa la validación del <c>EditForm</c>.</summary>
    [Parameter] public Expression<Func<string?>>? ValueExpression { get; set; }
}

public partial class TDDatePicker
{
    /// <summary>Se invoca cuando el formulario devuelve la fecha.</summary>
    [Parameter] public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>Campo del modelo. Lo usa la validación del <c>EditForm</c>.</summary>
    [Parameter] public Expression<Func<string?>>? ValueExpression { get; set; }
}

public partial class TDMask
{
    /// <summary>Se invoca cuando el formulario devuelve el texto.</summary>
    [Parameter] public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>Campo del modelo. Lo usa la validación del <c>EditForm</c>.</summary>
    [Parameter] public Expression<Func<string?>>? ValueExpression { get; set; }
}

public partial class TDNumeric
{
    /// <summary>Se invoca cuando el formulario devuelve la cantidad.</summary>
    [Parameter] public EventCallback<decimal> ValueChanged { get; set; }

    /// <summary>Campo del modelo. Lo usa la validación del <c>EditForm</c>.</summary>
    [Parameter] public Expression<Func<decimal>>? ValueExpression { get; set; }
}

public partial class TDSwitch
{
    /// <summary>Estado enlazado al modelo. Acepta <c>@bind-Value</c>.</summary>
    [Parameter] public bool Value { get; set; }

    /// <summary>Se invoca cuando el formulario devuelve el estado.</summary>
    [Parameter] public EventCallback<bool> ValueChanged { get; set; }

    /// <summary>Campo del modelo. Lo usa la validación del <c>EditForm</c>.</summary>
    [Parameter] public Expression<Func<bool>>? ValueExpression { get; set; }
}

public partial class TDFileInput
{
    /// <summary>Propiedad <c>IFormFile</c> del modelo. El archivo llega en el post con el nombre de ese campo.</summary>
    [Parameter] public Expression<Func<IFormFile?>>? Field { get; set; }

    /// <summary>Archivo elegido. En una página interactiva entrega el <c>IBrowserFile</c>. En una página estática el archivo viaja en el post.</summary>
    [Parameter] public EventCallback<InputFileChangeEventArgs> OnChange { get; set; }
}

public partial class TDPhotoButton
{
    /// <summary>Propiedad <c>IFormFile</c> del modelo. El post trae el JPEG ya comprimido con ese nombre.</summary>
    [Parameter] public Expression<Func<IFormFile?>>? Field { get; set; }
}

public partial class TDPhotoCapture
{
    /// <summary>Propiedad <c>IFormFileCollection</c> del modelo. El post trae todos los JPEG de la colección con ese nombre.</summary>
    [Parameter] public Expression<Func<IFormFileCollection?>>? Field { get; set; }
}
