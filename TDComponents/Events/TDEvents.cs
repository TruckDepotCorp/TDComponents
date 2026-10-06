using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace TDComponents;

/// <summary>
/// Eventos de Blazor (<c>@onclick</c>) en renderizado estático, sin SignalR.
/// <para>
/// Al dibujar un <c>TDButton</c> con <c>@onclick</c>, la librería guarda en un token cifrado el tipo del componente dueño del método,
/// el método y el estado de sus campos. El clic envía ese token a <see cref="TDEventsExtensions.MapTDEvents"/>: el servidor crea de nuevo el componente,
/// restaura el estado, ejecuta el método, lo dibuja otra vez y devuelve el HTML. TypeScript lo coloca en <c>TDPage</c>.
/// </para>
/// </summary>
public static class TDEventsExtensions
{
    /// <summary>Registra los servicios necesarios para <c>@onclick</c> en <c>TDButton</c>.</summary>
    public static IServiceCollection AddTDEvents(this IServiceCollection services)
    {
        services.AddAntiforgery();
        services.AddDataProtection();
        return services;
    }

    /// <summary>Publica <c>POST {path}</c>. Exige el token antifalsificación que <c>TDButton</c> ya trae.</summary>
    public static IEndpointRouteBuilder MapTDEvents(this IEndpointRouteBuilder app, string path = "/td/event")
    {
        app.MapPost(path, async (TDEventRequest body, HttpContext http, IAntiforgery antiforgery) =>
        {
            try
            {
                await antiforgery.ValidateRequestAsync(http);
            }
            catch (AntiforgeryValidationException)
            {
                return Results.BadRequest(new { error = "Token antifalsificación no válido." });
            }

            TDEventToken token;
            try
            {
                token = TDEventTokens.Read(http.RequestServices, body.Token);
            }
            catch (Exception ex) when (ex is CryptographicException or JsonException or ArgumentException or TypeLoadException or InvalidOperationException)
            {
                return Results.BadRequest(new { error = "Evento no válido o vencido." });
            }

            var html = await TDEventReplay.RunAsync(http, token, body.Url);
            return Results.Json(new TDEventResponse(html));
        });
        return app;
    }
}

/// <summary>Cuerpo que envía el cliente.</summary>
public sealed class TDEventRequest
{
    /// <summary>Token cifrado que emitió <c>TDButton</c>.</summary>
    public string Token { get; set; } = "";

    /// <summary>Dirección de la página donde está el botón. Sirve para dibujarla igual que en la solicitud original.</summary>
    public string? Url { get; set; }
}

/// <summary>Respuesta con el HTML nuevo del componente.</summary>
public sealed record TDEventResponse(string Html);

internal sealed record TDEventToken(string Owner, string Declaring, int Method, Dictionary<string, JsonElement> State);

internal static class TDEventTokens
{
    private const string Purpose = "TDComponents.Events.v1";
    private const int MaxLength = 64 * 1024;

    /// <summary>Crea el token de un <c>@onclick</c>. Devuelve null si el manejador no es un método del componente.</summary>
    public static string? Create(IServiceProvider services, object? handler)
    {
        var provider = services.GetService<IDataProtectionProvider>();
        if (provider is null || !TryGetDelegate(handler, out var del))
        {
            return null;
        }

        // Solo métodos del propio componente (método de grupo o lambda sin variables capturadas).
        if (del.Target is not ComponentBase owner || del.Method.DeclaringType is not { } declaring)
        {
            return null;
        }

        var token = new TDEventToken(
            owner.GetType().AssemblyQualifiedName!,
            declaring.AssemblyQualifiedName!,
            del.Method.MetadataToken,
            TDState.Capture(owner));

        var protectedToken = provider.CreateProtector(Purpose).Protect(JsonSerializer.Serialize(token));
        return protectedToken.Length <= MaxLength ? protectedToken : null;
    }

    public static TDEventToken Read(IServiceProvider services, string token)
    {
        var json = services.GetRequiredService<IDataProtectionProvider>().CreateProtector(Purpose).Unprotect(token);
        return JsonSerializer.Deserialize<TDEventToken>(json) ?? throw new ArgumentException("Token vacío.");
    }

    private static bool TryGetDelegate(object? handler, out Delegate del)
    {
        del = null!;
        switch (handler)
        {
            case Delegate d:
                del = d;
                return true;
            case null:
                return false;
        }

        // EventCallback y EventCallback<T>: el delegado vive en un campo interno.
        var field = handler.GetType().GetField("Delegate", BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public);
        if (field?.GetValue(handler) is Delegate inner)
        {
            del = inner;
            return true;
        }
        return false;
    }
}

internal static class TDState
{
    private const BindingFlags All = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly;

    public static Dictionary<string, JsonElement> Capture(object owner)
    {
        var state = new Dictionary<string, JsonElement>();
        foreach (var field in Fields(owner.GetType()))
        {
            try
            {
                state[Key(field)] = JsonSerializer.SerializeToElement(field.GetValue(owner), field.FieldType);
            }
            catch (Exception ex) when (ex is NotSupportedException or JsonException or InvalidOperationException)
            {
                // Un campo que no se puede serializar no forma parte del estado.
            }
        }
        return state;
    }

    public static void Restore(object owner, Dictionary<string, JsonElement> state)
    {
        foreach (var field in Fields(owner.GetType()))
        {
            if (!state.TryGetValue(Key(field), out var value))
            {
                continue;
            }
            try
            {
                field.SetValue(owner, value.Deserialize(field.FieldType));
            }
            catch (Exception ex) when (ex is NotSupportedException or JsonException or InvalidOperationException)
            {
                // Se queda con el valor inicial del campo.
            }
        }
    }

    private static string Key(FieldInfo field) => $"{field.DeclaringType!.FullName}::{field.Name}";

    private static IEnumerable<FieldInfo> Fields(Type type)
    {
        for (var t = type; t is not null && t != typeof(ComponentBase) && t != typeof(object); t = t.BaseType)
        {
            foreach (var field in t.GetFields(All))
            {
                if (IsState(field))
                {
                    yield return field;
                }
            }
        }
    }

    private static bool IsState(FieldInfo field)
    {
        if (field.IsInitOnly || field.IsStatic || field.IsDefined(typeof(InjectAttribute), true))
        {
            return false;
        }

        // Campo de respaldo de una propiedad: se omiten las inyectadas y las que vienen de una cascada o del formulario.
        if (field.Name.StartsWith('<') && field.Name.IndexOf('>') is var end and > 1)
        {
            var property = field.DeclaringType!.GetProperty(field.Name[1..end], BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (property is not null
                && (property.IsDefined(typeof(InjectAttribute), true) || property.IsDefined(typeof(CascadingParameterAttributeBase), true)))
            {
                return false;
            }
        }

        var type = field.FieldType;
        var ns = type.Namespace ?? "";
        return !type.IsInterface
            && !typeof(Delegate).IsAssignableFrom(type)
            && !typeof(Task).IsAssignableFrom(type)
            && !typeof(IDisposable).IsAssignableFrom(type)
            && !typeof(IAsyncDisposable).IsAssignableFrom(type)
            && !ns.StartsWith("Microsoft.", StringComparison.Ordinal)
            && !ns.StartsWith("System.Threading", StringComparison.Ordinal)
            && !ns.StartsWith("System.IO", StringComparison.Ordinal)
            && !ns.StartsWith("System.Net", StringComparison.Ordinal);
    }
}

internal static class TDEventReplay
{
    public static async Task<string> RunAsync(HttpContext http, TDEventToken token, string? pageUrl)
    {
        InitializeNavigation(http, pageUrl);

        var ownerType = Type.GetType(token.Owner, throwOnError: true)!;
        var declaring = Type.GetType(token.Declaring, throwOnError: true)!;
        var method = (MethodInfo)declaring.Module.ResolveMethod(token.Method)!;

        if (!typeof(ComponentBase).IsAssignableFrom(ownerType) || !method.DeclaringType!.IsAssignableFrom(ownerType))
        {
            throw new InvalidOperationException("El evento no pertenece a un componente.");
        }

        var activator = new ReplayActivator(ownerType, token.State);
        var services = new ReplayServices(http.RequestServices, activator);
        await using var renderer = new HtmlRenderer(services, http.RequestServices.GetRequiredService<ILoggerFactory>());

        return await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var parameters = ParameterView.FromDictionary(new Dictionary<string, object?>
            {
                [nameof(TDReplayHost.OwnerType)] = ownerType,
                [nameof(TDReplayHost.Http)] = http,
            });
            var root = renderer.BeginRenderingComponent<TDReplayHost>(parameters);
            await root.QuiescenceTask;

            var instance = activator.Instance ?? throw new InvalidOperationException("No se pudo crear el componente.");
            var args = method.GetParameters().Length == 0 ? [] : new object?[] { null };
            var work = new EventCallbackWorkItem(async () =>
            {
                if (method.Invoke(instance, args) is Task task)
                {
                    await task;
                }
            });
            await ((IHandleEvent)instance).HandleEventAsync(work, null);

            return root.ToHtmlString();
        });
    }

    /// <summary>Los componentes con &lt;form&gt; (EditForm) leen NavigationManager.Uri al dibujarse. En este endpoint no está inicializado.</summary>
    private static void InitializeNavigation(HttpContext http, string? pageUrl)
    {
        if (http.RequestServices.GetService<NavigationManager>() is not IHostEnvironmentNavigationManager navigation)
        {
            return;
        }

        var request = http.Request;
        var baseUri = $"{request.Scheme}://{request.Host}{request.PathBase}/";
        var uri = Uri.TryCreate(pageUrl, UriKind.Absolute, out var page)
            && string.Equals(page.Authority, request.Host.Value, StringComparison.OrdinalIgnoreCase)
            && string.Equals(page.Scheme, request.Scheme, StringComparison.OrdinalIgnoreCase)
            ? page.ToString()
            : baseUri;
        try
        {
            navigation.Initialize(baseUri, uri);
        }
        catch (InvalidOperationException)
        {
            // Ya estaba inicializado en esta solicitud.
        }
    }

    private sealed class ReplayActivator(Type ownerType, Dictionary<string, JsonElement> state) : IComponentActivator
    {
        public IComponent? Instance { get; private set; }

        public IComponent CreateInstance(Type componentType)
        {
            var component = (IComponent)Activator.CreateInstance(componentType)!;
            if (Instance is null && componentType == ownerType)
            {
                TDState.Restore(component, state);
                Instance = component;
            }
            return component;
        }
    }

    private sealed class ReplayServices(IServiceProvider inner, IComponentActivator activator) : IServiceProvider
    {
        public object? GetService(Type serviceType) =>
            serviceType == typeof(IComponentActivator) ? activator : inner.GetService(serviceType);
    }
}

/// <summary>Contenedor interno para dibujar un componente con la solicitud actual en cascada.</summary>
internal sealed class TDReplayHost : ComponentBase
{
    [Parameter] public Type OwnerType { get; set; } = default!;

    [Parameter] public HttpContext? Http { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenComponent<CascadingValue<HttpContext?>>(0);
        builder.AddComponentParameter(1, nameof(CascadingValue<HttpContext?>.Value), Http);
        builder.AddComponentParameter(2, nameof(CascadingValue<HttpContext?>.IsFixed), true);
        builder.AddComponentParameter(3, nameof(CascadingValue<HttpContext?>.ChildContent), (RenderFragment)(inner =>
        {
            inner.OpenComponent(0, OwnerType);
            inner.CloseComponent();
        }));
        builder.CloseComponent();
    }
}
