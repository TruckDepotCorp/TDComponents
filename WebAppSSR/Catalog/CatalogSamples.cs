namespace WebAppSSR.Catalog;

internal static class CatalogSamples
{
    public static IReadOnlyList<CatalogCode> For(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return [];
        }

        var extra = CatalogSamplesExtra.For(id);
        if (extra.Count > 0)
        {
            return extra;
        }

        return id.ToLowerInvariant() switch
        {
        "grid" =>
        [
            new("Pages/Repuestos.razor", "razor", """
@page "/repuestos"
@attribute [StreamRendering]
@inject AppDbContext Db

<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowSorting="true" AllowFiltering="true"
              AllowPaging="true" PageSize="10" PageSizeOptions="@(new[] { 5, 10, 20 })"
              AllowColumnPicker="true" AllowExport="GridExport.Csv"
              SelectionMode="GridSelection.Multiple"
              FormName="save-stock" OnSubmit="SaveStockAsync">
    <Columns>
        <TDColumn Title="Foto" Sortable="false" Filterable="false">
            <Template Context="p"><img src="@(p.ThumbUrl)" alt="" width="36" height="36" /></Template>
        </TDColumn>
        <TDColumn Property="p => p.Code" Title="Código" Mono="true" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Model" Title="Aplicación" Visible="false" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock">
            <EditTemplate Context="p">
                <input type="number" name="Stock[@p.Id]" value="@p.Stock" min="0" />
            </EditTemplate>
        </TDColumn>
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" TextAlign="TextAlign.Right" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>

@code {
    [SupplyParameterFromForm(FormName = "save-stock")]
    private Dictionary<int, int>? Stock { get; set; }

    private async Task SaveStockAsync()
    {
        if (Stock is null) return;
        foreach (var (id, qty) in Stock)
            await Db.Parts.Where(p => p.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, qty));
    }
}
"""),
            new("Models/Part.cs", "c#", """
public class Part
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Brand { get; set; } = "";
    public string Model { get; set; } = "";
    public string Category { get; set; } = "";
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? ThumbUrl { get; set; }
}
""")
        ],
        "coltemplate" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()">
    <Columns>
        <TDColumn Title="Repuesto" Property="p => p.Name">
            <Template Context="p">
                <div class="td-cell-media">
                    <img src="@(p.ThumbUrl)" alt="" width="36" height="36" />
                    <div><strong>@p.Name</strong><small class="td-mono">@p.Code</small></div>
                </div>
            </Template>
        </TDColumn>
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Stock" Title="Estado">
            <Template Context="p">
                <TDBadge Variant="@StockVariant(p.Stock)" Dot="true">@StockLabel(p.Stock)</TDBadge>
            </Template>
        </TDColumn>
        <TDColumn Property="p => p.Stock" Title="Nivel de stock">
            <Template Context="p"><TDProgress Value="@p.Stock" Max="120" ShowValue="true" Size="ProgressSize.Sm" /></Template>
        </TDColumn>
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" TextAlign="TextAlign.Right" />
        <TDColumn Title="Acciones" Sortable="false" TextAlign="TextAlign.Right">
            <Template Context="p">
                <a href="/cotizar/@p.Id" class="td-btn-secondary">Cotizar</a>
                <TDButton PartId="@p.Id" />
            </Template>
        </TDColumn>
    </Columns>
</TDDataGrid>
""")
        ],
        "colresize" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts"
              AllowColumnResize="true"
              SettingsKey="repuestos-anchos"   @* guarda anchos en localStorage *@
              OnColumnResized="OnResized">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" Width="120px" MinWidth="80px" />
        <TDColumn Property="p => p.Name" Title="Repuesto" Width="240px" />
        <TDColumn Property="p => p.Brand" Title="Marca" Width="130px" />
        <TDColumn Property="p => p.Category" Title="Categoría" Width="130px" />
        <TDColumn Property="p => p.Stock" Title="Stock" Width="90px" />
        <TDColumn Property="p => p.Price" Title="Precio" Width="120px" Format="C0" />
    </Columns>
</TDDataGrid>

@code {
    private void OnResized(ColumnResizedArgs e)
        => Logger.LogInformation("{Col} → {W}px", e.Column.Title, e.Width);
}
""")
        ],
        "colpicker" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts"
              AllowColumnPicker="true"
              ColumnsShowingText="columnas visibles"
              AllColumnsText="Todas">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" Pickable="false" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Model" Title="Aplicación" Visible="false" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Visible="false" />
    </Columns>
</TDDataGrid>
""")
        ],
        "colreorder" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts"
              AllowColumnReorder="true"
              SettingsKey="repuestos-orden"
              OnColumnReordered="OnReordered">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" Reorderable="false" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
    </Columns>
</TDDataGrid>

@code {
    private void OnReordered(ColumnReorderedArgs e)
        => Logger.LogInformation("{Col}: {From} → {To}", e.Column.Title, e.OldIndex, e.NewIndex);
}
""")
        ],
        "colfooter" =>
        [
            new("Pages/Inventario.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts" ShowFooter="true">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" Aggregate="Aggregate.Count" FooterText="{0} repuestos" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" Aggregate="Aggregate.Sum" FooterFormat="N0" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" Aggregate="Aggregate.Average" />
        <TDColumn Title="Valor inventario" Property="p => p.Stock * p.Price" Format="C0">
            <FooterTemplate Context="rows">
                <strong>@rows.Sum(p => p.Stock * p.Price).ToString("C0")</strong>
            </FooterTemplate>
        </TDColumn>
    </Columns>
</TDDataGrid>
""")
        ],
        "colfrozen" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts" Style="max-width:100%">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" Width="120px" Frozen="true" />
        <TDColumn Property="p => p.Name" Title="Repuesto" Width="240px" Frozen="true" />
        <TDColumn Property="p => p.Brand" Title="Marca" Width="130px" />
        <TDColumn Property="p => p.Model" Title="Aplicación" Width="170px" />
        @* … más columnas … *@
        <TDColumn Title="Acciones" Width="130px"
                    Frozen="true" FrozenPosition="FrozenColumnPosition.Right">
            <Template Context="p"><a href="/cotizar/@p.Id">Cotizar</a></Template>
        </TDColumn>
    </Columns>
</TDDataGrid>
""")
        ],
        "colcomposite" =>
        [
            new("Pages/Inventario.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts">
    <Columns>
        <TDColumn Title="Repuesto">
            <Columns>
                <TDColumn Property="p => p.Code" Title="Código" />
                <TDColumn Property="p => p.Name" Title="Descripción" />
            </Columns>
        </TDColumn>
        <TDColumn Title="Inventario">
            <Columns>
                <TDColumn Property="p => p.Stock" Title="Stock" />
                <TDColumn Property="p => p.Reserved" Title="Reservado" />
                <TDColumn Property="p => p.Available" Title="Disponible" />
            </Columns>
        </TDColumn>
        <TDColumn Title="Precio">
            <Columns>
                <TDColumn Property="p => p.Cost" Title="Costo" Format="C0" />
                <TDColumn Property="p => p.Price" Title="Venta" Format="C0" />
                <TDColumn Property="p => p.Margin" Title="Margen" Format="P0" />
            </Columns>
        </TDColumn>
    </Columns>
</TDDataGrid>
""")
        ],
        "colconditional" =>
        [
            new("Pages/Repuestos.razor", "razor", """
@inject AuthenticationStateProvider Auth

<TDDataGrid TItem="Part" Data="@_parts">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />

        @if (_user.IsInRole("Bodega") || _user.IsInRole("Gerencia"))
        {
            <TDColumn Property="p => p.Stock" Title="Stock" />
        }
        @if (_user.IsInRole("Bodega"))
        {
            <TDColumn Property="p => p.Location" Title="Ubicación" />
        }
        @if (_user.IsInRole("Gerencia"))
        {
            <TDColumn Property="p => p.Cost" Title="Costo" Format="C0" />
            <TDColumn Property="p => p.Margin" Title="Margen" Format="P0" />
        }
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0"
                    Visible="@(!_user.IsInRole("Bodega"))" />
    </Columns>
</TDDataGrid>

@code {
    private ClaimsPrincipal _user = new();
    protected override async Task OnInitializedAsync()
        => _user = (await Auth.GetAuthenticationStateAsync()).User;
}
""")
        ],
        "fltsimple" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowFiltering="true"
              FilterMode="GridFilterMode.Simple"
              FilterCaseSensitivity="FilterCaseSensitivity.CaseInsensitive"
              FilterDelay="300">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>
""")
        ],
        "fltmenu" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowFiltering="true"
              FilterMode="GridFilterMode.SimpleWithMenu">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" FilterOperator="FilterOperator.StartsWith" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" FilterOperator="FilterOperator.Equals" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" FilterOperator="FilterOperator.GreaterThanOrEquals" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>
""")
        ],
        "fltadv" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowFiltering="true"
              FilterMode="GridFilterMode.Advanced"
              LogicalFilterOperator="LogicalFilterOperator.And"
              FilterPopupRenderMode="PopupRenderMode.OnDemand">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>
""")
        ],
        "fltcbl" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowFiltering="true"
              FilterMode="GridFilterMode.CheckBoxList">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" ShowFilterCounts="true" />
        <TDColumn Property="p => p.Category" Title="Categoría"
                    FilterValues="@(new[] { "Frenos", "Motor" })" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>

@* Los valores distintos se consultan con SELECT DISTINCT sobre el IQueryable filtrado. *@
""")
        ],
        "fltmixed" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowFiltering="true"
              FilterMode="GridFilterMode.Advanced">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" FilterMode="GridFilterMode.Simple" />
        <TDColumn Property="p => p.Name" Title="Repuesto" FilterMode="GridFilterMode.Simple" />
        <TDColumn Property="p => p.Brand" Title="Marca" FilterMode="GridFilterMode.CheckBoxList" />
        <TDColumn Property="p => p.Category" Title="Categoría" FilterMode="GridFilterMode.CheckBoxList" />
        <TDColumn Property="p => p.Stock" Title="Stock" FilterMode="GridFilterMode.SimpleWithMenu" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>
""")
        ],
        "fltapi" =>
        [
            new("Pages/Repuestos.razor (servidor)", "razor", """
<nav class="td-presets">
    <a href="/repuestos?preset=agotados">Solo agotados</a>
    <a href="/repuestos?preset=volvo">Volvo con stock</a>
</nav>

<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowFiltering="true" FilterMode="GridFilterMode.Advanced"
              Filters="@_filters"
              LogicalFilterOperator="LogicalFilterOperator.And" />

@code {
    [SupplyParameterFromQuery(Name = "preset")] public string? Preset { get; set; }
    private IReadOnlyList<FilterDescriptor> _filters = [];

    protected override void OnParametersSet() => _filters = Preset switch
    {
        "agotados" => [new("Stock", FilterOperator.Equals, 0)],
        "volvo" => [new("Brand", FilterOperator.Equals, "Volvo"),
                    new("Stock", FilterOperator.GreaterThan, 0)],
        _ => []
    };
}
"""),
            new("wwwroot/js/filtros.ts (navegador)", "ts", """
const grid = document.querySelector<TDDataGridElement>("td-data-grid")!;

grid.setFilter("Stock", "eq", 0);
grid.setFilter("Category", "in", ["Frenos", "Motor"]);
grid.logicalOperator = "or";
grid.caseSensitive = false;
grid.clearFilters();

grid.addEventListener("ux-filter", e => console.log(e.detail.filters));
""")
        ],
        "selsingle" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts"
              SelectionMode="GridSelection.Single"
              @bind-Value="_selected"
              RowSelectOnClick="true">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
    </Columns>
</TDDataGrid>

@if (_selected.FirstOrDefault() is { } part)
{
    <PartDetail Part="part" />
}

@code {
    private IList<Part> _selected = [];
}
""")
        ],
        "selmulti" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<form method="post" @formname="bulk" data-enhance>
    <AntiforgeryToken />
    <TDDataGrid TItem="Part" Data="@_parts"
                  SelectionMode="GridSelection.Multiple"
                  @bind-Value="_selected"
                  ShowSelectAll="true"
                  SelectionName="SelectedIds">  @* envía los Id seleccionados *@
        <Columns>
            <TDColumn Property="p => p.Code" Title="Código" />
            <TDColumn Property="p => p.Name" Title="Repuesto" />
            <TDColumn Property="p => p.Stock" Title="Stock" />
            <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        </Columns>
    </TDDataGrid>
    <button type="submit" name="action" value="quote">Cotizar selección</button>
</form>

@code {
    [SupplyParameterFromForm(FormName = "bulk")] public int[]? SelectedIds { get; set; }
    private IList<Part> _selected = [];
}
""")
        ],
        "sortsingle" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowSorting="true"
              SortCycle="SortCycle.AscDescNone">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Descripción" Sortable="false" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" SortOrder="SortOrder.Descending" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>

@* El orden viaja en la URL (?sort=price:desc) y se traduce a OrderBy en EF Core. *@
""")
        ],
        "sortmulti" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()"
              AllowSorting="true"
              AllowMultiColumnSorting="true"
              ShowMultiColumnSortingIndex="true"
              Sorts="@_initialSort">
    <Columns>
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
    </Columns>
</TDDataGrid>

@code {
    private readonly SortDescriptor[] _initialSort =
    [
        new("Category", SortOrder.Ascending),
        new("Price", SortOrder.Descending)
    ];
}
""")
        ],
        "cellmenu" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_query" @ref="_grid"
              AllowSorting="true" AllowFiltering="true"
              CellNavigation="true"
              CellContextMenu="OnCellContextMenu">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" />
        <TDColumn Property="p => p.Category" Title="Categoría" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
    </Columns>
</TDDataGrid>

<TDContextMenu Id="cell-menu">
    <TDMenuItem Text="Copiar valor" Action="MenuAction.CopyCell" Shortcut="Ctrl+C" />
    <TDMenuItem Text="Copiar fila" Action="MenuAction.CopyRow" />
    <TDMenuSeparator />
    <TDMenuItem Text="Filtrar por este valor" Action="MenuAction.FilterEquals" />
    <TDMenuItem Text="Excluir este valor" Action="MenuAction.FilterNotEquals" />
    <TDMenuItem Text="Ordenar ascendente" Action="MenuAction.SortAsc" />
    <TDMenuItem Text="Ordenar descendente" Action="MenuAction.SortDesc" />
    <TDMenuSeparator />
    <TDMenuItem Text="Ver ficha técnica" Href="/repuestos/{Id}" />
</TDContextMenu>
"""),
            new("Pages/Repuestos.razor.cs", "c#", """
private void OnCellContextMenu(DataGridCellMouseEventArgs<Part> args)
{
    // Acciones de copiar, filtrar y ordenar se resuelven en el navegador (0 ms).
    // Solo las acciones con Href o FormName vuelven al servidor.
    Logger.LogDebug("Menú en {Col} de {Code}", args.Column.Property, args.Data.Code);
}
"""),
            new("wwwroot/js/menu.ts", "ts", """
grid.addEventListener("ux-cell-contextmenu", e => {
    const { row, column, value } = e.detail;
    // e.preventDefault() para mostrar un menú propio
});
""")
        ],
        "inlineedit" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts" @ref="_grid"
              EditMode="GridEditMode.Single"
              FormName="edit-part" OnRowSave="SaveAsync" OnRowDelete="DeleteAsync">
    <HeaderTemplate>
        <button type="button" class="td-btn-primary" data-td-grid-insert>Agregar repuesto</button>
    </HeaderTemplate>
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" EditableOnInsertOnly="true" />
        <TDColumn Property="p => p.Name" Title="Repuesto">
            <EditTemplate Context="p">
                <TDTextBox Name="Name" Value="@p.Name" Required="true" MinLength="3" />
            </EditTemplate>
        </TDColumn>
        <TDColumn Property="p => p.Brand" Title="Marca">
            <EditTemplate Context="p"><TDSelect Name="Brand" Options="_brands" Value="@p.Brand" /></EditTemplate>
        </TDColumn>
        <TDColumn Property="p => p.Stock" Title="Stock">
            <EditTemplate Context="p"><TDNumeric Name="Stock" Value="@p.Stock" Min="0" /></EditTemplate>
        </TDColumn>
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0">
            <EditTemplate Context="p"><TDNumeric Name="Price" Value="@p.Price" Min="1" /></EditTemplate>
        </TDColumn>
        <TDCommandColumn Edit="true" Delete="true" ConfirmDelete="¿Eliminar?" />
    </Columns>
</TDDataGrid>
"""),
            new("Pages/Repuestos.razor.cs", "c#", """
[SupplyParameterFromForm(FormName = "edit-part")]
private PartEdit? Edit { get; set; }

private async Task SaveAsync(GridRowSaveArgs<Part> e)
{
    if (!e.IsValid) return;                 // errores vuelven mapeados a cada campo
    if (e.IsNew) Db.Parts.Add(e.Item); else Db.Parts.Update(e.Item);
    await Db.SaveChangesAsync();
}

private async Task DeleteAsync(Part p)
    => await Db.Parts.Where(x => x.Id == p.Id).ExecuteDeleteAsync();
""")
        ],
        "incelledit" =>
        [
            new("Pages/Inventario.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts"
              EditMode="GridEditMode.InCell"
              FormName="batch-edit" OnBatchSave="SaveBatchAsync"
              ShowDirtyIndicator="true">
    <Columns>
        <TDColumn Property="p => p.Code" Title="Código" Editable="false" />
        <TDColumn Property="p => p.Name" Title="Repuesto" />
        <TDColumn Property="p => p.Brand" Title="Marca" EditorType="EditorType.Select" Options="_brands" />
        <TDColumn Property="p => p.Category" Title="Categoría" Editable="false" />
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
    </Columns>
</TDDataGrid>

@code {
    private async Task SaveBatchAsync(IReadOnlyList<CellChange<Part>> changes)
    {
        foreach (var c in changes) c.Apply();   // Id + propiedad + valor nuevo
        await Db.SaveChangesAsync();
    }
}
""")
        ],
        "cascade" =>
        [
            new("Shared/BuscarPorVehiculo.razor", "razor", """
<form method="get" data-enhance>
    <TDSelect Name="brand" Label="Marca" Options="_brands" @bind-Value="Brand" />
    <TDSelect Name="model" Label="Modelo" DependsOn="brand"
                OptionsUrl="/api/modelos?brand={brand}" @bind-Value="Model" />
    <TDSelect Name="system" Label="Sistema" DependsOn="model"
                OptionsUrl="/api/sistemas?model={model}" @bind-Value="System" />
</form>

<TDDataGrid TItem="Part" Data="@Query()" />

@code {
    [SupplyParameterFromQuery] public string? Brand { get; set; }
    [SupplyParameterFromQuery] public string? Model { get; set; }
    [SupplyParameterFromQuery] public string? System { get; set; }

    private IQueryable<Part> Query() => Db.Parts
        .Where(p => Brand == null || p.Brand == Brand)
        .Where(p => Model == null || p.Model == Model)
        .Where(p => System == null || p.Category == System);
}
""")
        ],
        "condfmt" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@_parts" RowRender="OnRowRender" CellRender="OnCellRender">
    <Columns>
        <TDColumn Property="p => p.Name" Title="Repuesto">
            <Template Context="p">
                @p.Name
                @if (p.Price > 500_000) { <TDBadge Variant="TagVariant.Solid">Premium</TDBadge> }
            </Template>
        </TDColumn>
        <TDColumn Property="p => p.Stock" Title="Stock" />
        <TDColumn Property="p => p.Price" Title="Precio" Format="C0" />
        <TDColumn Property="p => p.UpdatedAt" Title="Actualizado" Format="dd/MM/yyyy" />
    </Columns>
</TDDataGrid>

@code {
    private void OnRowRender(RowRenderArgs<Part> e)
    {
        if (e.Data.Stock == 0) e.Class = "td-row-danger";
        if (e.Data.UpdatedAt < DateTime.Today.AddDays(-20)) e.Class += " td-row-muted";
    }

    private void OnCellRender(CellRenderArgs<Part> e)
    {
        if (e.Column.Property == nameof(Part.Stock) && e.Data.Stock is > 0 and <= 10)
            e.Class = "td-cell-warning";
    }
}
""")
        ],
        "exportx" =>
        [
            new("Pages/Repuestos.razor", "razor", """
<TDDataGrid TItem="Part" Data="@Db.Parts.AsNoTracking()" @ref="_grid"
              AllowFiltering="true" AllowSorting="true" AllowColumnPicker="true"
              AllowExport="GridExport.Excel | GridExport.Csv"
              ExportUrl="/export/repuestos"
              ExportFileName="repuestos-@DateTime.Today:yyyyMMdd" />

@* El botón genera /export/repuestos.xlsx?f.cat=…&sort=…&cols=code,name,… *@
"""),
            new("Endpoints/ExportEndpoints.cs", "c#", """
app.MapGet("/export/repuestos.{format}", async (string format,
    [AsParameters] GridQuery q, AppDbContext db, ITDExporter exporter) =>
{
    var data = db.Parts.AsNoTracking().ApplyGridQuery(q);   // mismos filtros y orden
    return format switch
    {
        "xlsx" => Results.File(await exporter.ToExcelAsync(data, q.Columns),
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "repuestos.xlsx"),
        "csv"  => Results.File(await exporter.ToCsvAsync(data, q.Columns, separator: x27;x27),
                  "text/csv", "repuestos.csv"),
        _ => Results.BadRequest()
    };
});
"""),
            new("wwwroot/js/export.ts", "ts", """
// CSV sin ida al servidor, con los datos ya cargados en la página
grid.exportCsv({ separator: ";", bom: true, fileName: "repuestos.csv" });
""")
        ],
        "datatable" =>
        [
            new("Pages/Inventario.razor", "razor", """
@page "/inventario"
@attribute [StreamRendering]
@inject IInventoryRepository Repo

<TDDataGrid Data="@_table" AutoGenerateColumns="true"
              AllowSorting="true" FilterMode="GridFilterMode.Row"
              AllowPaging="true" PageSize="5"
              AllowColumnPicker="true" />

@code {
    private DataTable? _table;

    protected override async Task OnInitializedAsync()
        => _table = await Repo.GetStockByWarehouseAsync();
}
"""),
            new("Columnas explícitas (opcional)", "razor", """
<TDDataGrid Data="@_table" FilterMode="GridFilterMode.Row">
    <Columns>
        @foreach (DataColumn col in _table!.Columns)
        {
            <TDColumn Field="@col.ColumnName" Title="@col.Caption"
                        Type="@col.DataType" Format="@FormatFor(col)" />
        }
    </Columns>
</TDDataGrid>
"""),
            new("Data/InventoryRepository.cs", "c#", """
public async Task<DataTable> GetStockByWarehouseAsync()
{
    await using var cn = new SqlConnection(_connectionString);
    await using var cmd = new SqlCommand("dbo.sp_InventarioPorBodega", cn)
    {
        CommandType = CommandType.StoredProcedure
    };
    await cn.OpenAsync();
    await using var reader = await cmd.ExecuteReaderAsync();

    var table = new DataTable("Inventario");
    table.Load(reader);
    return table;
}
""")
        ],
        "pager" =>
        [
            new("Pages/Catalogo.razor", "razor", """
@page "/catalogo"

<TDPager Count="@_total" Page="@Page" PageSize="@Size"
           PageSizeOptions="@(new[] { 10, 20, 50 })"
           Href="/catalogo?page={0}&size={1}" />

@code {
    [SupplyParameterFromQuery] public int Page { get; set; } = 1;
    [SupplyParameterFromQuery] public int Size { get; set; } = 20;
    private int _total;
}
""")
        ],
        "tree" =>
        [
            new("Shared/CategoryTree.razor", "razor", """
<TDTree TItem="Category" Data="@_roots"
          Text="c => c.Name"
          Children="c => c.Children"
          Count="c => c.PartCount"
          Href="@(c => $"/catalogo/{c.Slug}")"
          Expanded="@(c => c.Slug is "motor" or "filtros")" />
""")
        ],
            _ => []
        };
    }

    public static CatalogCode? Primary(string? id) => For(id).FirstOrDefault();
}
