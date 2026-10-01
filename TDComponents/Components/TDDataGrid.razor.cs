using System.Globalization;
using System.Linq.Expressions;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using TDComponents.Data;

namespace TDComponents.Components;

[CascadingTypeParameter(nameof(TItem))]
public partial class TDDataGrid<TItem> : ComponentBase
{
    private readonly List<ITDGridColumn<TItem>> _columns = [];
    private bool _refreshQueued;
    private GridSnapshot? _snapshot;

    [Inject] private NavigationManager Navigation { get; set; } = default!;

    /// <summary>Filas. Puede ser una lista o una consulta.</summary>
    [Parameter] public IEnumerable<TItem>? Data { get; set; }
    /// <summary>Columnas TDColumn.</summary>
    [Parameter] public RenderFragment? Columns { get; set; }
    /// <summary>Prefijo de los parámetros de la URL. Sin él, orden, filtro y página no se comparten por enlace.</summary>
    [Parameter] public string? QueryKey { get; set; }
    /// <summary>Filas por página. El defecto es 10.</summary>
    [Parameter] public int PageSize { get; set; } = 10;
    /// <summary>Tamaños que la persona puede elegir. El defecto es 5, 10 y 20.</summary>
    [Parameter] public IReadOnlyList<int> PageSizeOptions { get; set; } = [5, 10, 20];
    /// <summary>Texto de la caja de búsqueda vacía.</summary>
    [Parameter] public string SearchPlaceholder { get; set; } = "Buscar…";
    /// <summary>Nombre accesible de la tabla.</summary>
    [Parameter] public string AriaLabel { get; set; } = "Tabla";
    /// <summary>Nombre del formulario de guardado.</summary>
    [Parameter] public string? FormName { get; set; }
    /// <summary>Se invoca al guardar las ediciones.</summary>
    [Parameter] public EventCallback OnSubmit { get; set; }
    /// <summary>Identificador entero de cada fila. Hace falta para seleccionar y editar.</summary>
    [Parameter] public Func<TItem, int>? RowId { get; set; }
    /// <summary>Campo de categoría, para agrupar o filtrar por ese eje.</summary>
    [Parameter] public Expression<Func<TItem, string?>>? CategoryProperty { get; set; }
    /// <summary>Campo que agrupa filas.</summary>
    [Parameter] public Expression<Func<TItem, string?>>? GroupProperty { get; set; }
    /// <summary>Muestra la consulta aplicada.</summary>
    [Parameter] public bool ShowQuery { get; set; }
    /// <summary>Nombre de la raíz de la consulta mostrada. El defecto es source.</summary>
    [Parameter] public string QueryRoot { get; set; } = "source";
    /// <summary>Cantidad que se anuncia después de guardar.</summary>
    [Parameter] public int SavedCount { get; set; }
    /// <summary>Muestra la búsqueda general. El defecto es verdadero.</summary>
    [Parameter] public bool ShowSearch { get; set; } = true;
    /// <summary>Muestra las herramientas de la grilla. El defecto es verdadero.</summary>
    [Parameter] public bool ShowTools { get; set; } = true;
    /// <summary>Modo de filtro de las columnas que no declaran el suyo. El defecto es Advanced.</summary>
    [Parameter] public TDFilterMode FilterMode { get; set; } = TDFilterMode.Advanced;
    /// <summary>Multiple, Single o None. El defecto es Multiple.</summary>
    [Parameter] public TDSelectionMode Selection { get; set; } = TDSelectionMode.Multiple;
    /// <summary>Permite ordenar por varias columnas a la vez.</summary>
    [Parameter] public bool MultiSort { get; set; }
    /// <summary>Clave de la columna del orden inicial. Un signo menos delante la ordena descendente.</summary>
    [Parameter] public string? InitialSort { get; set; }
    /// <summary>Muestra el pie con los Aggregate de las columnas.</summary>
    [Parameter] public bool ShowFooter { get; set; }
    /// <summary>Permite arrastrar el borde del encabezado. El ancho no baja de MinWidth.</summary>
    [Parameter] public bool AllowResize { get; set; }
    /// <summary>Permite arrastrar encabezados para cambiar el orden.</summary>
    [Parameter] public bool AllowReorder { get; set; }
    /// <summary>Habilita el menú de clic derecho en la celda.</summary>
    [Parameter] public bool ContextMenu { get; set; }
    /// <summary>Identificador de la fila seleccionada. Úsalo junto con RowId.</summary>
    [Parameter] public int? SelectedId { get; set; }
    /// <summary>Destino de la exportación a Excel. Sin él no hay enlace de Excel.</summary>
    [Parameter] public string? ExcelHref { get; set; }
    /// <summary>Clase CSS de cada fila, para el formato condicional.</summary>
    [Parameter] public Func<TItem, string?>? RowClass { get; set; }
    /// <summary>Texto de ayuda junto a la acción de guardar.</summary>
    [Parameter] public string? SaveHint { get; set; }

    private string SearchFormId => string.IsNullOrEmpty(QueryKey) ? "td-q" : "td-q-" + QueryKey;
    private bool ShowChecks => Selection == TDSelectionMode.Multiple;
    /// <summary>Máximo de filas exportadas. El defecto es 500.</summary>
    [Parameter] public int ExportLimit { get; set; } = 500;
    /// <summary>Título cuando no hay filas visibles.</summary>
    [Parameter] public string EmptyTitle { get; set; } = "Ningún resultado coincide con los filtros";
    /// <summary>Detalle de ese estado vacío.</summary>
    [Parameter] public string EmptyDetail { get; set; } = "Ajusta la búsqueda o limpia los filtros.";

    private string SizeFormId => string.IsNullOrEmpty(QueryKey) ? "td-size" : "td-size-" + QueryKey;

    protected override void OnParametersSet()
    {
        _snapshot = null;
    }

    internal void AddColumn(ITDGridColumn<TItem> column)
    {
        if (_columns.Any(existing => existing.Key == column.Key))
        {
            return;
        }

        _columns.Add(column);
        if (_refreshQueued)
        {
            return;
        }

        _refreshQueued = true;
        StateHasChanged();
    }

    private GridSnapshot View()
    {
        if (_snapshot is not null)
        {
            return _snapshot;
        }

        var query = CurrentQuery();
        var search = TDGridRequest.Read(query, QueryKey, "q");
        var sort = TDGridRequest.Read(query, QueryKey, "sort");
        var direction = TDGridRequest.Read(query, QueryKey, "dir");
        var page = TDGridRequest.ReadInt(query, QueryKey, "page", 1);
        var size = TDGridRequest.ReadInt(query, QueryKey, "size", PageSize);
        if (!PageSizeOptions.Contains(size))
        {
            size = PageSize;
        }

        var advanced = TDGridRequest.ParseFilters(TDGridRequest.Read(query, QueryKey, "f"));
        var simpleKeys = new HashSet<string>(StringComparer.Ordinal);
        var simple = new List<TDColumnFilter>();
        foreach (var column in _columns.Where(column => column.Filterable))
        {
            var value = TDGridRequest.Read(query, QueryKey, "v-" + column.Key);
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            var op = TDGridRequest.Read(query, QueryKey, "op-" + column.Key) ?? DefaultOp(column);
            simple.Add(new TDColumnFilter(column.Key, op, value, "and", "", null));
            simpleKeys.Add(column.Key);
        }

        var filters = advanced.Concat(simple).ToList();
        var category = TDGridRequest.Read(query, QueryKey, "cat");
        var group = TDGridRequest.Read(query, QueryKey, "tipo");
        var sorts = ReadSorts(string.IsNullOrEmpty(sort) && MultiSort ? InitialSort : sort, direction);
        var filtered = Apply(Data ?? [], search, filters, category, group, sorts);
        var total = filtered.Count;
        var pages = Math.Max(1, (int)Math.Ceiling(total / (double)size));
        page = Math.Clamp(page, 1, pages);
        var rows = filtered.Skip((page - 1) * size).Take(size).ToList();
        var exportRows = filtered.Count <= ExportLimit ? filtered : rows;
        var filterText = TDGridRequest.FormatFilters(filters.Where(filter => !simpleKeys.Contains(filter.Key)));
        var footers = ShowFooter
            ? _columns.ToDictionary(column => column.Key, column => FooterCell(column, filtered), StringComparer.Ordinal)
            : new Dictionary<string, TDFooterCell?>(StringComparer.Ordinal);

        _snapshot = new GridSnapshot(
            search,
            sorts.FirstOrDefault()?.Key,
            sorts.FirstOrDefault()?.Descending ?? false,
            page,
            pages,
            size,
            total,
            category,
            group,
            filters,
            filterText,
            rows,
            BuildExport(exportRows),
            BuildLinq(search, filters, category, group, sorts.Count > 0 ? Column(sorts[0].Key) : null, sorts.FirstOrDefault()?.Descending ?? false, page, size, total),
            sorts,
            simpleKeys,
            footers);
        return _snapshot;
    }

    private List<TDSort> ReadSorts(string? sort, string? direction)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return [];
        }

        var keys = sort.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var dirs = (direction ?? "").Split(',');
        var sorts = new List<TDSort>();
        for (var index = 0; index < keys.Length; index++)
        {
            var key = keys[index];
            var descending = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
            var split = key.Split(':');
            if (split.Length == 2)
            {
                key = split[0];
                descending = split[1] == "desc";
            }
            else if (index < dirs.Length && !string.IsNullOrEmpty(dirs[index]))
            {
                descending = dirs[index] == "desc";
            }

            if (_columns.Any(column => column.Key == key && column.Sortable))
            {
                sorts.Add(new TDSort(key, descending));
            }

            if (!MultiSort)
            {
                break;
            }
        }

        return sorts;
    }

    private ITDGridColumn<TItem>? Column(string key)
        => _columns.FirstOrDefault(column => column.Key == key);

    private static string DefaultOp(ITDGridColumn<TItem> column)
        => column.FilterType == "text" ? "contains" : "eq";

    private TDFilterMode ModeOf(ITDGridColumn<TItem> column)
    {
        if (column.FilterMode != TDFilterMode.Inherit)
        {
            return column.FilterMode;
        }

        return FilterMode == TDFilterMode.Mixed ? TDFilterMode.Advanced : FilterMode;
    }

    private bool InFilterRow(ITDGridColumn<TItem> column)
        => column.Filterable && ModeOf(column) is TDFilterMode.Simple or TDFilterMode.Menu;

    private bool ShowFunnel(ITDGridColumn<TItem> column)
        => column.Filterable && ModeOf(column) is TDFilterMode.Advanced or TDFilterMode.CheckList;

    private bool IsCheckList(ITDGridColumn<TItem> column)
        => ModeOf(column) == TDFilterMode.CheckList;

    private string? SimpleValue(GridSnapshot view, ITDGridColumn<TItem> column)
        => view.SimpleKeys.Contains(column.Key)
            ? view.Filters.FirstOrDefault(filter => filter.Key == column.Key)?.Value1
            : null;

    private string SimpleOp(GridSnapshot view, ITDGridColumn<TItem> column)
        => view.Filters.FirstOrDefault(filter => filter.Key == column.Key && view.SimpleKeys.Contains(column.Key))?.Op1
           ?? DefaultOp(column);

    private int? SortIndex(GridSnapshot view, ITDGridColumn<TItem> column)
    {
        var index = view.Sorts.ToList().FindIndex(sort => sort.Key == column.Key);
        return index < 0 ? null : index;
    }

    private bool SortDescending(GridSnapshot view, ITDGridColumn<TItem> column)
        => view.Sorts.FirstOrDefault(sort => sort.Key == column.Key)?.Descending ?? false;

    private string? RowCss(TItem item)
    {
        var classes = new List<string>();
        var extra = RowClass?.Invoke(item);
        if (!string.IsNullOrWhiteSpace(extra))
        {
            classes.Add(extra);
        }

        if (Selection == TDSelectionMode.Single && RowId is not null && SelectedId == RowId(item))
        {
            classes.Add("is-selected");
        }

        return classes.Count == 0 ? null : string.Join(' ', classes);
    }

    private string FreezeClass(ITDGridColumn<TItem> column)
        => column.Frozen switch
        {
            TDFrozenEdge.Left => "is-frozen-left",
            TDFrozenEdge.Right => "is-frozen-right",
            _ => ""
        };

    private IReadOnlyList<(string? Title, int Span)> Groups()
    {
        if (_columns.All(column => string.IsNullOrEmpty(column.GroupTitle)))
        {
            return [];
        }

        var groups = new List<(string? Title, int Span)>();
        foreach (var column in _columns)
        {
            if (groups.Count > 0 && groups[^1].Title == column.GroupTitle)
            {
                groups[^1] = (column.GroupTitle, groups[^1].Span + 1);
            }
            else
            {
                groups.Add((column.GroupTitle, 1));
            }
        }

        return groups;
    }

    private string DistinctJson(ITDGridColumn<TItem> column)
    {
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var item in Data ?? [])
        {
            var text = column.Display(item);
            if (string.IsNullOrWhiteSpace(text))
            {
                continue;
            }

            counts[text] = counts.GetValueOrDefault(text) + 1;
        }

        var payload = counts
            .OrderBy(pair => pair.Key, StringComparer.CurrentCultureIgnoreCase)
            .Take(40)
            .Select(pair => new { v = pair.Key, n = pair.Value });
        return JsonSerializer.Serialize(payload, new JsonSerializerOptions { Encoder = JavaScriptEncoder.Default });
    }

    private TDFooterCell? FooterCell(ITDGridColumn<TItem> column, IReadOnlyList<TItem> rows)
    {
        if (column.Aggregate == TDAggregate.None)
        {
            return null;
        }

        if (column.Aggregate == TDAggregate.Count)
        {
            return new TDFooterCell("Conteo", rows.Count.ToString("N0", CultureInfo.GetCultureInfo("es-CL")) + " repuestos");
        }

        decimal total = 0;
        var count = 0;
        foreach (var row in rows)
        {
            var value = column.Read(row);
            if (value is null)
            {
                continue;
            }

            total += Convert.ToDecimal(value, CultureInfo.InvariantCulture);
            count++;
        }

        var number = column.Aggregate == TDAggregate.Average && count > 0 ? total / count : total;
        var culture = CultureInfo.GetCultureInfo("es-CL");
        var text = column.Kind == TDColumnKind.Money
            ? "$ " + number.ToString("N0", culture)
            : number.ToString("N0", culture);
        return new TDFooterCell(column.Aggregate == TDAggregate.Average ? "Promedio" : "Suma", text);
    }

    private List<TItem> Apply(
        IEnumerable<TItem> source,
        string? search,
        IReadOnlyList<TDColumnFilter> filters,
        string? category,
        string? group,
        IReadOnlyList<TDSort> sorts)
    {
        var predicate = BuildPredicate(search, filters, category, group);
        if (source is IQueryable<TItem> query)
        {
            if (predicate is not null)
            {
                query = query.Where(predicate);
            }

            IOrderedQueryable<TItem>? ordered = null;
            foreach (var sort in sorts)
            {
                var column = Column(sort.Key);
                if (column?.SortExpression is null)
                {
                    continue;
                }

                ordered = ordered is null
                    ? OrderQuery(query, column, sort.Descending)
                    : ThenQuery(ordered, column, sort.Descending);
                query = ordered;
            }

            return query.ToList();
        }

        IEnumerable<TItem> items = source;
        if (predicate is not null)
        {
            var test = predicate.Compile();
            items = items.Where(test);
        }

        var list = items.ToList();
        if (sorts.Count > 0)
        {
            list.Sort((left, right) =>
            {
                foreach (var sort in sorts)
                {
                    var column = Column(sort.Key);
                    if (column is null)
                    {
                        continue;
                    }

                    var result = Compare(column.Read(left), column.Read(right));
                    if (sort.Descending)
                    {
                        result = -result;
                    }

                    if (result != 0)
                    {
                        return result;
                    }
                }

                return 0;
            });
        }

        return list;
    }

    private Expression<Func<TItem, bool>>? BuildPredicate(
        string? search,
        IReadOnlyList<TDColumnFilter> filters,
        string? category,
        string? group)
    {
        Expression<Func<TItem, bool>>? predicate = null;
        if (!string.IsNullOrWhiteSpace(search))
        {
            Expression<Func<TItem, bool>>? searchPredicate = null;
            foreach (var column in _columns.Where(column => column.Searchable))
            {
                var contains = column.BuildFilter("contains", search);
                if (contains is not null)
                {
                    searchPredicate = searchPredicate is null ? contains : Or(searchPredicate, contains);
                }
            }

            predicate = searchPredicate;
        }

        foreach (var filter in filters)
        {
            var column = _columns.FirstOrDefault(item => item.Key == filter.Key && item.Filterable);
            if (column is null)
            {
                continue;
            }

            var first = filter.HasFirst ? column.BuildFilter(filter.Op1, filter.Value1) : null;
            var second = filter.HasSecond ? column.BuildFilter(filter.Op2, filter.Value2) : null;
            Expression<Func<TItem, bool>>? columnPredicate = first is null
                ? second
                : second is null
                    ? first
                    : filter.Logic == "or" ? Or(first, second) : And(first, second);
            if (columnPredicate is not null)
            {
                predicate = predicate is null ? columnPredicate : And(predicate, columnPredicate);
            }
        }

        if (!string.IsNullOrEmpty(category) && CategoryProperty is not null)
        {
            predicate = AndIf(predicate, Equal(CategoryProperty, category));
        }

        if (!string.IsNullOrEmpty(group) && GroupProperty is not null)
        {
            predicate = AndIf(predicate, Equal(GroupProperty, group));
        }

        return predicate;
    }

    private string NameOf(string name) => TDGridRequest.Key(QueryKey, name);

    private string SortHref(GridSnapshot view, ITDGridColumn<TItem> column)
    {
        var sorts = view.Sorts.ToList();
        if (!MultiSort)
        {
            var active = sorts.Count == 1 && sorts[0].Key == column.Key;
            bool? next = !active ? false : sorts[0].Descending ? null : true;
            return Link(view, 1, fields =>
            {
                fields[NameOf("sort")] = next is null ? null : column.Key;
                fields[NameOf("dir")] = next == true ? "desc" : next == false ? "asc" : null;
            });
        }

        var index = sorts.FindIndex(sort => sort.Key == column.Key);
        if (index < 0)
        {
            sorts.Add(new TDSort(column.Key, false));
        }
        else if (!sorts[index].Descending)
        {
            sorts[index] = new TDSort(column.Key, true);
        }
        else
        {
            sorts.RemoveAt(index);
        }

        return Link(view, 1, fields =>
        {
            fields[NameOf("sort")] = sorts.Count == 0 ? null : string.Join(',', sorts.Select(sort => sort.Key + ":" + (sort.Descending ? "desc" : "asc")));
            fields[NameOf("dir")] = null;
        });
    }

    private string PageHref(GridSnapshot view, int page) => Link(view, page, _ => { });

    private string ClearHref(GridSnapshot view)
        => Link(view, 1, fields =>
        {
            fields[NameOf("q")] = null;
            fields[NameOf("f")] = null;
            foreach (var key in view.SimpleKeys)
            {
                fields[NameOf("v-" + key)] = null;
                fields[NameOf("op-" + key)] = null;
            }
        });

    private string RemoveFilterHref(GridSnapshot view, string key)
        => Link(view, 1, fields =>
        {
            if (view.SimpleKeys.Contains(key))
            {
                fields[NameOf("v-" + key)] = null;
                fields[NameOf("op-" + key)] = null;
            }
            else
            {
                fields[NameOf("f")] = TDGridRequest.FormatFilters(view.Filters.Where(filter => filter.Key != key && !view.SimpleKeys.Contains(filter.Key)));
            }
        });

    private string SelectHref(TItem item)
        => Link(View(),  View().Page, fields => fields[NameOf("sel")] = RowId is null ? null : RowId(item).ToString(CultureInfo.InvariantCulture));

    private string EqHref(GridSnapshot view, ITDGridColumn<TItem> column, TItem item)
    {
        var value = column.Display(item);
        var encoded = TDGridRequest.FormatFilters(
        [
            ..view.Filters.Where(filter => filter.Key != column.Key && !view.SimpleKeys.Contains(filter.Key)),
            new TDColumnFilter(column.Key, "eq", value, "and", "", null)
        ]);
        return Link(view, 1, fields => fields[NameOf("f")] = encoded);
    }

    private string SortDirectionHref(GridSnapshot view, ITDGridColumn<TItem> column, bool descending)
        => Link(view, 1, fields =>
        {
            fields[NameOf("sort")] = column.Key;
            fields[NameOf("dir")] = descending ? "desc" : "asc";
        });

    private IReadOnlyDictionary<string, string?> SizeFields(GridSnapshot view)
    {
        var fields = ViewFields(view);
        fields.Remove(NameOf("size"));
        return fields;
    }

    private string ChipLabel(TDColumnFilter filter)
    {
        var column = _columns.FirstOrDefault(item => item.Key == filter.Key);
        var title = column?.Title ?? filter.Key;
        var first = Part(column, filter.Op1, filter.Value1);
        var second = Part(column, filter.Op2, filter.Value2);
        var joiner = filter.Logic == "or" ? " o " : " y ";
        return title + " " + string.Join(joiner, new[] { first, second }.Where(part => !string.IsNullOrEmpty(part)));
    }

    private static string? Part(ITDGridColumn<TItem>? column, string op, string? value)
    {
        if (!TDColumnFilter.IsActive(op, value))
        {
            return null;
        }

        if (TDColumnFilter.IsUnary(op))
        {
            return TDGridRequest.OperatorLabel(op);
        }

        var shown = column?.FilterType == "text" ? $"\"{value}\"" : value;
        return TDGridRequest.OperatorLabel(op) + " " + shown;
    }

    private string EncodedFilter(TDColumnFilter? filter)
        => filter is null
            ? ""
            : string.Join('|', filter.Op1, filter.Value1, filter.Logic, filter.Op2, filter.Value2);

    private static (string Label, string ClassName) StockState(object? value)
    {
        var number = 0m;
        if (value is not null)
        {
            try
            {
                number = Convert.ToDecimal(value, CultureInfo.InvariantCulture);
            }
            catch (FormatException)
            {
                number = 0;
            }
            catch (InvalidCastException)
            {
                number = 0;
            }
        }

        if (number <= 0)
        {
            return ("Agotado", "is-out");
        }

        return number <= 10 ? ("Pocas unidades", "is-low") : ("En stock", "is-ok");
    }

    private static string StockValue(ITDGridColumn<TItem> column, TItem item)
        => Convert.ToString(column.Read(item), CultureInfo.InvariantCulture) ?? "0";

    private string RemoveSearchHref(GridSnapshot view)
        => Link(view, 1, fields => fields[NameOf("q")] = null);

    private Dictionary<string, string?> ViewFields(GridSnapshot view)
    {
        var fields = new Dictionary<string, string?>
        {
            [NameOf("q")] = view.Search,
            [NameOf("sort")] = SortQuery(view),
            [NameOf("dir")] = MultiSort || view.Sorts.Count == 0 ? null : view.Sorts[0].Descending ? "desc" : "asc",
            [NameOf("size")] = view.PageSize == PageSize ? null : view.PageSize.ToString(CultureInfo.InvariantCulture),
            [NameOf("f")] = string.IsNullOrEmpty(view.FilterText) ? null : view.FilterText,
            [NameOf("cat")] = view.Category,
            [NameOf("tipo")] = view.Group,
            [NameOf("sel")] = SelectedId?.ToString(CultureInfo.InvariantCulture)
        };

        foreach (var key in view.SimpleKeys)
        {
            var filter = view.Filters.First(item => item.Key == key);
            fields[NameOf("v-" + key)] = filter.Value1;
            fields[NameOf("op-" + key)] = filter.Op1 == DefaultOp(Column(key)!) ? null : filter.Op1;
        }

        return fields;
    }

    private string? SortQuery(GridSnapshot view)
    {
        if (view.Sorts.Count == 0)
        {
            return null;
        }

        return MultiSort
            ? string.Join(',', view.Sorts.Select(sort => sort.Key + ":" + (sort.Descending ? "desc" : "asc")))
            : view.Sorts[0].Key;
    }

    private string Link(GridSnapshot view, int page, Action<Dictionary<string, string?>> edit)
    {
        var fields = ViewFields(view);
        edit(fields);
        fields[NameOf("page")] = page > 1 ? page.ToString(CultureInfo.InvariantCulture) : null;
        var path = Navigation.ToAbsoluteUri(Navigation.Uri).AbsolutePath;
        var pairs = fields.Where(pair => !string.IsNullOrEmpty(pair.Value))
            .Select(pair => new KeyValuePair<string, string?>(pair.Key, pair.Value));
        return path + QueryString.Create(pairs).ToUriComponent();
    }

    private string SortAria(GridSnapshot view, ITDGridColumn<TItem> column)
    {
        var sort = view.Sorts.FirstOrDefault(item => item.Key == column.Key);
        return sort is null ? "none" : sort.Descending ? "descending" : "ascending";
    }

    private static string CellClass(ITDGridColumn<TItem> column) => column.Kind switch
    {
        TDColumnKind.Mono or TDColumnKind.Date => "td-grid__mono",
        TDColumnKind.Strong => "td-grid__strong",
        TDColumnKind.Muted => "td-grid__muted",
        TDColumnKind.Money => "td-grid__money",
        _ => "td-grid__text"
    };

    private string BuildExport(IReadOnlyList<TItem> rows)
    {
        var columns = _columns.Where(column => column.Kind != TDColumnKind.Thumb && column.Visible).ToList();
        var payload = new
        {
            columns = columns.Select(column => new { key = column.Key, label = column.Title }),
            rows = rows.Select(row => columns.ToDictionary(column => column.Key, column => column.Display(row)))
        };
        return JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.Default
        });
    }

    private string BuildLinq(
        string? search,
        IReadOnlyList<TDColumnFilter> filters,
        string? category,
        string? group,
        ITDGridColumn<TItem>? sortColumn,
        bool descending,
        int page,
        int size,
        int total)
    {
        var lines = new List<string> { QueryRoot };
        if (!string.IsNullOrWhiteSpace(search))
        {
            var parts = _columns.Where(column => column.Searchable && column.PropertyName is not null)
                .Select(column => $"p.{column.PropertyName}.Contains(\"{Escape(search)}\")");
            var clause = string.Join(" || ", parts);
            if (!string.IsNullOrEmpty(clause))
            {
                lines.Add("    .Where(p => " + clause + ")");
            }
        }

        foreach (var filter in filters)
        {
            var column = _columns.FirstOrDefault(item => item.Key == filter.Key);
            if (column?.PropertyName is null)
            {
                continue;
            }

            var checks = new List<string>();
            if (filter.HasFirst)
            {
                checks.Add(LinqCheck(column, filter.Op1, filter.Value1));
            }

            if (filter.HasSecond)
            {
                checks.Add(LinqCheck(column, filter.Op2, filter.Value2));
            }

            if (checks.Count > 0)
            {
                lines.Add("    .Where(p => " + string.Join(filter.Logic == "or" ? " || " : " && ", checks) + ")");
            }
        }

        if (!string.IsNullOrEmpty(group) && GroupProperty is not null)
        {
            lines.Add($"    .Where(p => p.{MemberName(GroupProperty)} == \"{Escape(group)}\")");
        }

        if (!string.IsNullOrEmpty(category) && CategoryProperty is not null)
        {
            lines.Add($"    .Where(p => p.{MemberName(CategoryProperty)} == \"{Escape(category)}\")");
        }

        if (sortColumn?.PropertyName is not null)
        {
            lines.Add(descending
                ? $"    .OrderByDescending(p => p.{sortColumn.PropertyName})"
                : $"    .OrderBy(p => p.{sortColumn.PropertyName})");
        }

        lines.Add($"    .Skip({(page - 1) * size}).Take({size})");
        return string.Join('\n', lines) + $"\n// {total} coincidencias";
    }

    private static string LinqCheck(ITDGridColumn<TItem> column, string op, string? value)
    {
        var property = "p." + column.PropertyName;
        if (op == "empty")
        {
            return column.FilterType == "text" ? $"string.IsNullOrEmpty({property})" : $"{property} == null";
        }

        if (op == "nempty")
        {
            return column.FilterType == "text" ? $"!string.IsNullOrEmpty({property})" : $"{property} != null";
        }

        if (column.FilterType == "text")
        {
            var literal = $"\"{Escape(value)}\"";
            return op switch
            {
                "eq" => $"{property} == {literal}",
                "neq" => $"{property} != {literal}",
                "starts" => $"{property}.StartsWith({literal})",
                "ends" => $"{property}.EndsWith({literal})",
                "ncontains" => $"!{property}.Contains({literal})",
                _ => $"{property}.Contains({literal})"
            };
        }

        var symbol = op switch
        {
            "neq" => "!=",
            "lt" => "<",
            "lte" => "<=",
            "gt" => ">",
            "gte" => ">=",
            _ => "=="
        };
        return $"{property} {symbol} {value}";
    }

    private Dictionary<string, string> CurrentQuery()
    {
        var parsed = QueryHelpers.ParseQuery(Navigation.ToAbsoluteUri(Navigation.Uri).Query);
        return parsed.ToDictionary(pair => pair.Key, pair => pair.Value.ToString(), StringComparer.OrdinalIgnoreCase);
    }

    private static IOrderedQueryable<TItem> OrderQuery(IQueryable<TItem> query, ITDGridColumn<TItem> column, bool descending)
        => (IOrderedQueryable<TItem>)InvokeOrder(nameof(Queryable.OrderBy), nameof(Queryable.OrderByDescending), query, column, descending);

    private static IOrderedQueryable<TItem> ThenQuery(IOrderedQueryable<TItem> query, ITDGridColumn<TItem> column, bool descending)
        => (IOrderedQueryable<TItem>)InvokeOrder(nameof(Queryable.ThenBy), nameof(Queryable.ThenByDescending), query, column, descending);

    private static object InvokeOrder(string ascending, string descendingName, IQueryable<TItem> query, ITDGridColumn<TItem> column, bool descending)
    {
        var name = descending ? descendingName : ascending;
        var method = typeof(Queryable).GetMethods().Single(candidate =>
            candidate.Name == name && candidate.IsGenericMethodDefinition && candidate.GetParameters().Length == 2);
        var closed = method.MakeGenericMethod(typeof(TItem), column.SortExpression!.ReturnType);
        return closed.Invoke(null, [query, column.SortExpression])!;
    }

    private static Expression<Func<TItem, bool>> Equal(Expression<Func<TItem, string?>> property, string value)
    {
        var parameter = Expression.Parameter(typeof(TItem), "p");
        var body = Replace(property.Body, property.Parameters[0], parameter);
        var coalesced = Expression.Coalesce(body, Expression.Constant(string.Empty));
        var lower = Expression.Call(coalesced, nameof(string.ToLower), Type.EmptyTypes);
        return Expression.Lambda<Func<TItem, bool>>(
            Expression.Equal(lower, Expression.Constant(value.ToLowerInvariant())),
            parameter);
    }

    private static Expression<Func<TItem, bool>>? AndIf(Expression<Func<TItem, bool>>? left, Expression<Func<TItem, bool>> right)
        => left is null ? right : And(left, right);

    private static Expression<Func<TItem, bool>> And(Expression<Func<TItem, bool>> left, Expression<Func<TItem, bool>> right)
        => Merge(left, right, Expression.AndAlso);

    private static Expression<Func<TItem, bool>> Or(Expression<Func<TItem, bool>> left, Expression<Func<TItem, bool>> right)
        => Merge(left, right, Expression.OrElse);

    private static Expression<Func<TItem, bool>> Merge(
        Expression<Func<TItem, bool>> left,
        Expression<Func<TItem, bool>> right,
        Func<Expression, Expression, Expression> combine)
    {
        var parameter = Expression.Parameter(typeof(TItem), "p");
        var body = combine(
            Replace(left.Body, left.Parameters[0], parameter),
            Replace(right.Body, right.Parameters[0], parameter));
        return Expression.Lambda<Func<TItem, bool>>(body, parameter);
    }

    private static Expression Replace(Expression body, ParameterExpression from, ParameterExpression to)
        => new Swap(from, to).Visit(body)!;

    private static int Compare(object? left, object? right)
    {
        if (left is null && right is null)
        {
            return 0;
        }

        if (left is null)
        {
            return -1;
        }

        if (right is null)
        {
            return 1;
        }

        if (left is string leftText && right is string rightText)
        {
            return string.Compare(leftText, rightText, StringComparison.CurrentCultureIgnoreCase);
        }

        if (left is IComparable comparable)
        {
            return comparable.CompareTo(right);
        }

        return string.Compare(left.ToString(), right.ToString(), StringComparison.Ordinal);
    }

    private static string? MemberName(LambdaExpression expression)
    {
        var body = expression.Body is UnaryExpression unary ? unary.Operand : expression.Body;
        return body is MemberExpression member ? member.Member.Name : "Value";
    }

    private static string Escape(string? value)
        => (value ?? "").Replace("\\", "\\\\", StringComparison.Ordinal).Replace("\"", "\\\"", StringComparison.Ordinal);

    private sealed class Swap(ParameterExpression from, ParameterExpression to) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node)
            => node == from ? to : base.VisitParameter(node);
    }

    private sealed record GridSnapshot(
        string? Search,
        string? SortKey,
        bool Descending,
        int Page,
        int Pages,
        int PageSize,
        int Total,
        string? Category,
        string? Group,
        IReadOnlyList<TDColumnFilter> Filters,
        string FilterText,
        IReadOnlyList<TItem> Rows,
        string ExportJson,
        string Linq,
        IReadOnlyList<TDSort> Sorts,
        IReadOnlySet<string> SimpleKeys,
        IReadOnlyDictionary<string, TDFooterCell?> Footers);
}
