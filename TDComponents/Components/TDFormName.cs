using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Http;

namespace TDComponents.Components;

/// <summary>
/// Calcula el nombre que el post del <c>EditForm</c> espera y se lo entrega al campo visible.
/// No es un control de la página. Fuera de un enlace, el catálogo sigue usando el nombre de respaldo.
/// </summary>
public class TDFormName<TValue> : ComponentBase
{
    /// <summary>Valor actual. Lo entrega <c>@bind-Value</c>.</summary>
    [Parameter] public TValue? Value { get; set; }

    /// <summary>Aviso de cambio. Lo entrega <c>@bind-Value</c>.</summary>
    [Parameter] public EventCallback<TValue> ValueChanged { get; set; }

    /// <summary>Campo del modelo. Si existe, su nombre es el del post.</summary>
    [Parameter] public Expression<Func<TValue>>? ValueExpression { get; set; }

    /// <summary>Nombre escrito en el componente. Gana al campo del modelo.</summary>
    [Parameter] public string? ExplicitName { get; set; }

    /// <summary>Nombre cuando el campo no está enlazado y no tiene <c>Name</c>.</summary>
    [Parameter] public string Fallback { get; set; } = "";

    /// <summary>Marcado del campo. El argumento es el nombre del post.</summary>
    [Parameter] public RenderFragment<string>? ChildContent { get; set; }

    private string PostedName
    {
        get
        {
            if (!string.IsNullOrEmpty(ExplicitName))
            {
                return ExplicitName;
            }

            if (ValueExpression is not null)
            {
                var modelField = FieldIdentifier.Create(ValueExpression).FieldName;
                if (!string.IsNullOrEmpty(modelField))
                {
                    return modelField;
                }
            }

            return Fallback;
        }
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.AddContent(0, ChildContent?.Invoke(PostedName));
    }
}

/// <summary>Nombre de post para un texto.</summary>
public sealed class TDFormText : TDFormName<string?>
{
}

/// <summary>Nombre de post para un decimal.</summary>
public sealed class TDFormNumber : TDFormName<decimal>
{
}

/// <summary>Nombre de post para un sí o no.</summary>
public sealed class TDFormFlag : TDFormName<bool>
{
}

/// <summary>Nombre de post para un archivo.</summary>
public sealed class TDFormFile : TDFormName<IFormFile?>
{
}
