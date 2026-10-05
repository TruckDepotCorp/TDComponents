namespace WebAppSSR.Catalog;

internal static class CatalogMiscPages
{
    public static IReadOnlyList<CatalogCode>? For(string id) => id.ToLowerInvariant() switch
    {
        "mxinicio" => [Page("Pages/Inicio.razor", "/inicio", """
<TDShopFrame>
    <TDShopBar />
    <main class="td-mxmain">
        <TDShopHead Kicker="Lunes, 5 de octubre · Maxi Technogia" Title="Buenas tardes, José" />
        <div class="td-mxsplit">
            <TDShopHero />
            <TDShopCash />
        </div>
        <div class="td-mxtiles">
            <TDShopTile Title="Nueva venta" Detail="Cobrar a un cliente" Icon="receipt" Primary="true" NeedsCash="true" />
            <TDShopTile Title="Nueva compra" Detail="Ingresar mercadería" Icon="bag" />
            <TDShopTile Title="Caja" Detail="Cerrada" Icon="cash" />
            <TDShopTile Title="Producto" Detail="Agregar al inventario" Icon="box" />
        </div>
        <div class="td-mxsplit">
            <TDShopAlerts />
            <TDShopEmpty />
        </div>
    </main>
    <TDShopMenu />
</TDShopFrame>
""")],
        "mxpos" => [Page("Pages/Venta.razor", "/venta", """
<TDShopFrame>
    <TDShopBar Action="" />
    <div class="td-mxpos">
        <TDShopFilter Placeholder="Buscar producto o código" Chips="categorias">
            <TDProductTile Name="Teclado inalámbrico" Sku="TC-04" Price="185" Stock="6" Category="Accesorios" />
        </TDShopFilter>
        <TDCart CashOpen="true" />
    </div>
    <TDShopMenu Active="Ventas" />
</TDShopFrame>
""")],
        "mxproducto" => [Page("Pages/Producto.razor", "/producto", """
<TDProductSheet Name="Mouse alámbrico" Price="Q 60.00" Cost="Q 52.00" Stock="0">
    <TDStockAdjust Stock="0" />
    <TDLinkList />
</TDProductSheet>
""")],
        "mxeditar" => [Page("Pages/EditarProducto.razor", "/editar-producto", """
<TDSaveBar>
    <label class="td-mxfield"><span>Nombre</span><input data-td-mx-name value="Mouse alámbrico" /></label>
    <TDMargin Price="60" Cost="52" />
</TDSaveBar>
""")],
        "mxficha" => [Page("Pages/FichaCliente.razor", "/cliente", """
<TDCollect Debt="415.50" />
<TDMoveList />
<TDAddrList />
""")],
        _ => Atom(id)
    };

    private static IReadOnlyList<CatalogCode>? Atom(string id)
    {
        var tag = id.ToLowerInvariant() switch
        {
            "mxbar" => "<TDShopBar />",
            "mxmenu" => "<TDShopMenu />",
            "mxhead" => """<TDShopHead Kicker="Lunes, 5 de octubre · Maxi Technogia" Title="Buenas tardes, José" />""",
            "mxhero" => "<TDShopHero />",
            "mxcash" => "<TDShopCash />",
            "mxtile" => """<TDShopTile Title="Nueva venta" Icon="receipt" Primary="true" NeedsCash="true" />""",
            "mxalerts" => "<TDShopAlerts />",
            "mxempty" => "<TDShopEmpty />",
            "mxkpi" => "<TDShopKpis />",
            "mxsearch" => "<TDShopFilter />",
            "mxclient" => "<TDClientRow />",
            "mxclientes" => "<TDClientRow Name=\"Don Luis (Jute)\" Credit=\"true\" HasDebt=\"true\" Debt=\"Q 415.50\" />",
            "mxcollect" => """<TDCollect Debt="415.50" />""",
            "mxmoves" => "<TDMoveList />",
            "mxaddr" => "<TDAddrList />",
            "mxptile" => """<TDProductTile Name="Mouse alámbrico" Sku="MS-ALM" Price="60" Stock="0" />""",
            "mxcart" => "<TDCart />",
            "mxsale" => """<TDSaleRow Number="V-0012" Client="Taller El Progreso" Status="Pagada" Total="Q 540.00" />""",
            "mxventas" => """<TDSaleRow Number="V-0011" Client="Don Luis (Jute)" Method="Crédito" Status="Por cobrar" Total="Q 315.50" Tone="TDShopTone.Warning" />""",
            "mxsheet" => "<TDProductSheet />",
            "mxstock" => "<TDStockAdjust />",
            "mxmargin" => """<TDMargin Price="60" Cost="52" />""",
            "mxsave" => """<TDSaveBar><label class="td-mxfield"><span>Nombre</span><input data-td-mx-name value="Mouse alámbrico" /></label></TDSaveBar>""",
            "mxlinks" => "<TDLinkList />",
            _ => null
        };
        return tag is null ? null : [Page($"Pages/{id}.razor", $"/{id}", tag)];
    }

    private static CatalogCode Page(string file, string route, string markup) => new(file, "razor", $"""
@page "{route}"
@using TDComponents
@using TDComponents.Components

{markup}
""");
}
