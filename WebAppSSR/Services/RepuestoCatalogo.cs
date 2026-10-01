using System.Data;
using WebAppSSR.Interfaces;
using WebAppSSR.Models;

namespace WebAppSSR.Services;

public sealed class RepuestoCatalogo : IRepuestoCatalogo
{
    private static readonly string[] CategoriasOrden =
        ["Frenos", "Suspensión", "Motor", "Eléctrico", "Transmisión", "Carrocería"];

    private readonly List<Repuesto> _repuestos = Seed();
    private readonly DataTable _inventario = InventarioSeed();

    public IReadOnlyList<Repuesto> Repuestos => _repuestos;

    public IReadOnlyList<CategoriaNodo> Categorias(string? tipo, string? categoria)
    {
        var tipoActual = tipo ?? "";
        var categoriaActual = categoria ?? "";
        return
        [
            Nodo("Catálogo", "", "", tipoActual == "" && categoriaActual == "", true,
            [
                Tipo("Camión", tipoActual, categoriaActual),
                Tipo("Bus", tipoActual, categoriaActual)
            ])
        ];
    }

    public DataTable Inventario() => _inventario;

    public Repuesto? Find(int id) => _repuestos.Find(item => item.Id == id);

    public void Save(Repuesto item)
    {
        if (item.Id == 0)
        {
            item.Id = _repuestos.Max(current => current.Id) + 1;
            item.Updated = DateOnly.FromDateTime(DateTime.Today);
            _repuestos.Insert(0, item);
            return;
        }

        var current = Find(item.Id);
        if (current is null)
        {
            return;
        }

        current.Code = item.Code;
        current.Name = item.Name;
        current.Brand = item.Brand;
        current.Model = item.Model;
        current.Category = item.Category;
        current.Stock = item.Stock;
        current.Price = item.Price;
        current.Updated = DateOnly.FromDateTime(DateTime.Today);
    }

    public bool Remove(int id) => _repuestos.RemoveAll(item => item.Id == id) > 0;

    public int SaveStock(IReadOnlyDictionary<int, int> stock)
    {
        var updated = 0;
        foreach (var item in _repuestos)
        {
            if (!stock.TryGetValue(item.Id, out var quantity) || item.Stock == quantity)
            {
                continue;
            }

            item.Stock = quantity;
            item.Updated = DateOnly.FromDateTime(DateTime.Today);
            updated++;
        }

        return updated;
    }

    private CategoriaNodo Tipo(string tipo, string tipoActual, string categoriaActual)
    {
        var children = CategoriasOrden
            .Where(cat => _repuestos.Any(item => item.Type == tipo && item.Category == cat))
            .Select(cat => Nodo(cat, tipo, cat, tipoActual == tipo && categoriaActual == cat, false, []))
            .ToArray();

        return Nodo(tipo, tipo, "", tipoActual == tipo && categoriaActual == "", true, children);
    }

    private CategoriaNodo Nodo(string name, string tipo, string categoria, bool active, bool expanded, IReadOnlyList<CategoriaNodo> children)
    {
        var count = _repuestos.Count(item =>
            (tipo.Length == 0 || item.Type == tipo) &&
            (categoria.Length == 0 || item.Category == categoria));

        var href = tipo.Length == 0
            ? "/datos"
            : categoria.Length == 0
                ? "/datos?tipo=" + Uri.EscapeDataString(tipo)
                : "/datos?tipo=" + Uri.EscapeDataString(tipo) + "&cat=" + Uri.EscapeDataString(categoria);

        return new CategoriaNodo
        {
            Name = name,
            Type = tipo,
            Category = categoria,
            Href = href,
            Count = count,
            Expanded = expanded || active,
            Active = active,
            Children = children
        };
    }

    private static List<Repuesto> Seed() =>
    [
        P(1, "BR-4521-AD", "Pastilla de freno delantera", "Volvo", "Volvo FH 460", "Camión", "Frenos", 42, 189990, "2026-09-18"),
        P(2, "SU-1180-KT", "Amortiguador de cabina", "Scania", "Scania R450", "Camión", "Suspensión", 8, 246500, "2026-09-02"),
        P(3, "MT-7702-FL", "Filtro de aceite", "Mercedes-Benz", "Mercedes-Benz Actros 2651", "Camión", "Motor", 120, 24990, "2026-09-20"),
        P(4, "EL-3310-AL", "Alternador 24V 110A", "Freightliner", "Freightliner Cascadia", "Camión", "Eléctrico", 0, 612000, "2026-08-27"),
        P(5, "TR-5049-EM", "Kit de embrague 430 mm", "International", "International LT 625", "Camión", "Transmisión", 5, 1089990, "2026-09-11"),
        P(6, "BR-4609-DS", "Disco de freno ventilado", "Mercedes-Benz", "Mercedes-Benz O500 RS", "Bus", "Frenos", 16, 158400, "2026-09-15"),
        P(7, "SU-2231-BL", "Bolsa de aire suspensión", "Volvo", "Volvo B12R", "Bus", "Suspensión", 27, 132750, "2026-09-19"),
        P(8, "MT-8840-TB", "Turbocompresor", "Scania", "Scania K410", "Bus", "Motor", 3, 1490000, "2026-09-21"),
        P(9, "EL-1024-MA", "Motor de arranque 24V", "Hino", "Hino 500 FM", "Camión", "Eléctrico", 11, 398900, "2026-09-05"),
        P(10, "MT-3301-BA", "Bomba de agua", "Kenworth", "Kenworth T880", "Camión", "Motor", 19, 214300, "2026-08-30"),
        P(11, "CA-7710-ES", "Espejo retrovisor calefaccionado", "Volvo", "Volvo FH 540", "Camión", "Carrocería", 34, 96500, "2026-09-08"),
        P(12, "BR-5512-VA", "Válvula relé de freno", "MAN", "MAN TGX 18.480", "Camión", "Frenos", 9, 87400, "2026-09-12"),
        P(13, "TR-2208-CR", "Cruceta de cardán", "Iveco", "Iveco Stralis", "Camión", "Transmisión", 48, 45900, "2026-09-17"),
        P(14, "SU-6603-BR", "Barra estabilizadora", "Mercedes-Benz", "Mercedes-Benz O500 U", "Bus", "Suspensión", 6, 312000, "2026-09-03"),
        P(15, "EL-4450-FA", "Faro LED delantero", "Scania", "Scania Serie S", "Camión", "Eléctrico", 22, 278600, "2026-09-14"),
        P(16, "MT-1190-IN", "Inyector diésel", "Volvo", "Volvo D13", "Camión", "Motor", 0, 529000, "2026-08-22"),
        P(17, "CA-3320-PA", "Parachoques delantero", "International", "International HX 620", "Camión", "Carrocería", 2, 684500, "2026-09-09"),
        P(18, "BR-7781-TA", "Tambor de freno trasero", "Hino", "Hino Dutro", "Camión", "Frenos", 14, 171200, "2026-09-16"),
        P(19, "TR-9902-SI", "Sincronizador 3ª/4ª", "Scania", "Scania GRS905", "Camión", "Transmisión", 7, 143800, "2026-09-01"),
        P(20, "SU-4417-RE", "Resorte de hoja delantero", "Kenworth", "Kenworth W900", "Camión", "Suspensión", 13, 256700, "2026-09-06"),
        P(21, "EL-8812-SE", "Sensor ABS de rueda", "Mercedes-Benz", "Mercedes-Benz Citaro", "Bus", "Eléctrico", 64, 38900, "2026-09-20"),
        P(22, "MT-5520-RA", "Radiador de aluminio", "MAN", "MAN Lion's City", "Bus", "Motor", 4, 896000, "2026-09-13"),
        P(23, "CA-1150-LI", "Limpiaparabrisas 1000 mm", "Volvo", "Volvo B8R", "Bus", "Carrocería", 85, 18900, "2026-09-19"),
        P(24, "BR-3390-CA", "Caliper de freno", "Iveco", "Iveco Crossway", "Bus", "Frenos", 10, 368400, "2026-09-10")
    ];

    private static Repuesto P(int id, string code, string name, string brand, string model, string type, string category, int stock, int price, string updated) =>
        new()
        {
            Id = id,
            Code = code,
            Name = name,
            Brand = brand,
            Model = model,
            Type = type,
            Category = category,
            Stock = stock,
            Price = price,
            Updated = DateOnly.Parse(updated)
        };

    private static DataTable InventarioSeed()
    {
        var table = new DataTable("Inventario");
        table.Columns.Add("Bodega", typeof(string)).Caption = "Bodega";
        table.Columns.Add("Sku", typeof(string)).Caption = "SKU";
        table.Columns.Add("Descripcion", typeof(string)).Caption = "Descripción";
        table.Columns.Add("Marca", typeof(string)).Caption = "Marca";
        table.Columns.Add("Categoria", typeof(string)).Caption = "Categoría";
        table.Columns.Add("Stock", typeof(int)).Caption = "Stock";
        table.Columns.Add("Reservado", typeof(int)).Caption = "Reservado";
        table.Columns.Add("Costo", typeof(decimal)).Caption = "Costo";
        table.Columns.Add("UltimaEntrada", typeof(DateTime)).Caption = "Última entrada";
        table.Columns.Add("Proveedor", typeof(string)).Caption = "Proveedor";
        table.Columns.Add("Ubicacion", typeof(string)).Caption = "Ubicación";
        table.Columns["UltimaEntrada"]!.AllowDBNull = true;
        table.Columns["Proveedor"]!.AllowDBNull = true;
        table.Columns["Ubicacion"]!.AllowDBNull = true;

        void Row(string bodega, string sku, string descripcion, string marca, string categoria, int stock, int reservado, decimal costo, string? entrada, string? proveedor, string? ubicacion)
        {
            table.Rows.Add(bodega, sku, descripcion, marca, categoria, stock, reservado, costo,
                entrada is null ? DBNull.Value : DateTime.Parse(entrada),
                proveedor is null ? DBNull.Value : proveedor,
                ubicacion is null ? DBNull.Value : ubicacion);
        }

        Row("Quilicura", "BR-4521-AD", "Pastilla de freno delantera", "Volvo", "Frenos", 42, 6, 98500, "2026-09-18", "Frenos del Sur SpA", "A-03-2");
        Row("Quilicura", "MT-7702-FL", "Filtro de aceite", "Mercedes-Benz", "Motor", 120, 24, 11200, "2026-09-20", "FiltroMax Ltda.", "B-01-4");
        Row("Quilicura", "EL-3310-AL", "Alternador 24V 110A", "Freightliner", "Eléctrico", 0, 0, 402000, null, "ElectroParts", "C-02-1");
        Row("Antofagasta", "TR-5049-EM", "Kit de embrague 430 mm", "International", "Transmisión", 5, 2, 712000, "2026-09-11", "Transmisiones Norte", null);
        Row("Antofagasta", "SU-2231-BL", "Bolsa de aire suspensión", "Volvo", "Suspensión", 27, 3, 81400, "2026-09-19", null, "D-04-3");
        Row("Antofagasta", "MT-8840-TB", "Turbocompresor", "Scania", "Motor", 3, 1, 988000, "2026-09-21", "Turbo Service", "A-01-1");
        Row("Concepción", "BR-4609-DS", "Disco de freno ventilado", "Mercedes-Benz", "Frenos", 16, 0, 99800, "2026-09-15", "Frenos del Sur SpA", "A-02-2");
        Row("Concepción", "EL-1024-MA", "Motor de arranque 24V", "Hino", "Eléctrico", 11, 4, 251000, null, "ElectroParts", "C-01-3");
        Row("Concepción", "CA-7710-ES", "Espejo retrovisor calefaccionado", "Volvo", "Carrocería", 34, 0, 54300, "2026-09-08", null, null);
        Row("Puerto Montt", "SU-1180-KT", "Amortiguador de cabina", "Scania", "Suspensión", 8, 2, 152000, "2026-09-02", "Suspensiones Sur", "D-01-1");
        Row("Puerto Montt", "MT-1190-IN", "Inyector diésel", "Volvo", "Motor", 0, 0, 338000, "2026-08-22", "Diesel Pro", null);
        Row("Quilicura", "TR-2208-CR", "Cruceta de cardán", "Iveco", "Transmisión", 48, 5, 24100, "2026-09-17", "Transmisiones Norte", "E-02-4");
        Row("Antofagasta", "EL-8812-SE", "Sensor ABS de rueda", "Mercedes-Benz", "Eléctrico", 64, 10, 19800, "2026-09-20", "ElectroParts", "C-03-2");
        Row("Concepción", "CA-1150-LI", "Limpiaparabrisas 1000 mm", "Volvo", "Carrocería", 85, 12, 8900, null, null, "F-01-1");
        return table;
    }
}
