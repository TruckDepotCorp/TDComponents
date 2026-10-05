namespace WebAppSSR.Catalog;

internal static class CatalogSurfacePages
{
    public static IReadOnlyList<CatalogCode>? For(string id) => id.ToLowerInvariant() switch
    {
        "tokens" => [Page("Pages/Temas.razor", "/temas", """
<TDThemePicker />
""")],
        "modal" => [Page("Pages/Flota.razor", "/flota", """
<TDButton ButtonType="TDButtonType.Button" data-td-dialog-open="demo-dialog">Abrir diálogo</TDButton>
<TDDialog Id="demo-dialog" Title="Nueva flota" ConfirmText="Guardar">
    <p>El diálogo se abre en el navegador. Guardar sigue siendo un POST.</p>
</TDDialog>
""")],
        "drawer" => [Page("Pages/Catalogo.razor", "/catalogo", """
<TDDrawer Id="demo-drawer" Trigger="Filtros del catálogo" Title="Filtros">
    <TDSelect Name="marca-filtro" Label="Marca" Value="volvo" Options="@(new TDOption[] { new("volvo", "Volvo"), new("scania", "Scania"), new("mercedes", "Mercedes-Benz"), new("man", "MAN") })" />
    <TDSelect Name="sistema-filtro" Label="Sistema" Value="frenos" Options="@(new TDOption[] { new("frenos", "Frenos"), new("motor", "Motor") })" />
    <p class="td-field__hint">El conteo de resultados se recalcula en el servidor al aplicar.</p>
</TDDrawer>
""")],
        "tip" => [Page("Pages/Ficha.razor", "/ficha", """
<div class="td-row">
    <TDTooltip Text="Retiro el mismo día en Santiago centro">
        <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Secondary">Stock en bodega</TDButton>
    </TDTooltip>
    <TDTooltip Text="Cierra con Esc. También aparece al enfocar.">
        <TDLink Href="/c/grid">¿Cómo se reserva?</TDLink>
    </TDTooltip>
</div>
""")],
        "alert" => [Page("Pages/Pedido.razor", "/pedido", """
<TDMessage Severity="TDSeverity.Success" Title="Pedido recibido" Closable="true">Guardamos OC-00481. Te avisamos cuando salga de bodega.</TDMessage>
<TDMessage Severity="TDSeverity.Warning" Title="Stock bajo">Quedan 3 pastillas BR-4521-AD.</TDMessage>
<TDMessage Severity="TDSeverity.Danger" Title="No pudimos emitir la guía">El servidor de facturación no respondió.</TDMessage>
""")],
        "badge" => [Page("Pages/Stock.razor", "/stock", """
<div class="td-row">
    <TDBadge Variant="TDBadgeVariant.Success" Dot="true">En stock</TDBadge>
    <TDBadge Variant="TDBadgeVariant.Warning" Dot="true">Bajo</TDBadge>
    <TDBadge Variant="TDBadgeVariant.Danger" Dot="true">Agotado</TDBadge>
    <TDBadge Variant="TDBadgeVariant.Primary">18</TDBadge>
    <TDBadge>Premium</TDBadge>
</div>
""")],
        "toast" => [Page("Pages/Pedido.razor", "/pedido", """
<TDToast Items="@(new TDToastItem[] {
    new("Pedido recibido", "OC-00481 salió de bodega.", TDSeverity.Success),
    new("Stock bajo", "Quedan 3 pastillas BR-4521-AD.", TDSeverity.Warning)
})" />
""")],
        "progress" => [Page("Pages/Meta.razor", "/meta", """
<p class="td-section-title">Determinado</p>
<TDProgress Label="Frenos" Value="72" ShowValue="true" Suffix="%" />
<TDProgress Label="Motor" Value="48" ShowValue="true" Suffix="%" />
<TDProgress Label="Eléctrico" Value="31" Size="TDSize.Small" ShowValue="true" Suffix="%" />
<p class="td-section-title">Loader</p>
<TDLoader />
""")],
        "skel" => [Page("Pages/Ficha.razor", "/ficha", """
<div class="td-row" style="align-items:center">
    <TDSkeleton Circle="true" Width="48px" Height="48px" />
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
        <TDSkeleton Width="40%" Height="14px" />
        <TDSkeleton Width="70%" Height="14px" />
        <TDSkeleton Width="55%" Height="14px" />
    </div>
</div>
""")],
        _ => null
    };

    private static CatalogCode Page(string file, string route, string markup, string? code = null)
    {
        var block = string.IsNullOrWhiteSpace(code) ? "" : $"\n\n@code {{\n{code}\n}}";
        return new(file, "razor", $"""
@page "{route}"
@using TDComponents
@using TDComponents.Components

{markup}{block}
""");
    }
}
