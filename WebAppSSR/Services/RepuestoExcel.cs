using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO.Compression;
using System.Text;
using System.Xml.Linq;
using TDComponents.Data;
using WebAppSSR.Models;

namespace WebAppSSR.Services;

public static class RepuestoExcel
{
    public static IEnumerable<Repuesto> Filtrar(IEnumerable<Repuesto> source, IQueryCollection query)
    {
        var search = query["q"].ToString();
        var category = query["cat"].ToString();
        var type = query["tipo"].ToString();
        IEnumerable<Repuesto> items = source.Where(item =>
            (search.Length == 0 || item.Code.Contains(search, StringComparison.OrdinalIgnoreCase) || item.Name.Contains(search, StringComparison.OrdinalIgnoreCase))
            && (category.Length == 0 || item.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            && (type.Length == 0 || item.Type.Equals(type, StringComparison.OrdinalIgnoreCase)));

        foreach (var filter in TDGridRequest.ParseFilters(query["f"].ToString()))
        {
            items = items.Where(item => Coincide(item, filter)).ToList();
        }

        var sort = query["sort"].ToString();
        var descending = string.Equals(query["dir"].ToString(), "desc", StringComparison.OrdinalIgnoreCase);
        if (sort.Contains(':'))
        {
            var first = sort.Split(',')[0].Split(':');
            sort = first[0];
            descending = first.ElementAtOrDefault(1) == "desc";
        }

        items = sort switch
        {
            "Code" => Order(items, item => item.Code, descending),
            "Name" => Order(items, item => item.Name, descending),
            "Brand" => Order(items, item => item.Brand, descending),
            "Model" => Order(items, item => item.Model, descending),
            "Category" => Order(items, item => item.Category, descending),
            "Stock" => Order(items, item => item.Stock, descending),
            "Price" => Order(items, item => item.Price, descending),
            "Updated" => Order(items, item => item.Updated, descending),
            _ => items
        };
        return items;
    }

    public static byte[] Libro(IEnumerable<Repuesto> items)
    {
        var rows = items.Select(item => new[]
        {
            item.Code,
            item.Name,
            item.Brand,
            item.Model,
            item.Category,
            item.Stock.ToString(CultureInfo.InvariantCulture),
            item.Price.ToString(CultureInfo.InvariantCulture),
            item.Updated.ToString("dd'/'MM'/'yyyy", CultureInfo.InvariantCulture)
        }).ToList();
        var headers = new[] { "Código", "Repuesto", "Marca", "Aplicación", "Categoría", "Stock", "Precio", "Actualizado" };
        return Crear(headers, rows);
    }

    private static IEnumerable<Repuesto> Order<T>(IEnumerable<Repuesto> items, Func<Repuesto, T> key, bool descending)
        => descending ? items.OrderByDescending(key) : items.OrderBy(key);

    private static bool Coincide(Repuesto item, TDColumnFilter filter)
    {
        var text = Campo(item, filter.Key);
        var value = filter.Value1 ?? "";
        var ok = filter.Op1 switch
        {
            "contains" => text.Contains(value, StringComparison.OrdinalIgnoreCase),
            "ncontains" => !text.Contains(value, StringComparison.OrdinalIgnoreCase),
            "starts" => text.StartsWith(value, StringComparison.OrdinalIgnoreCase),
            "ends" => text.EndsWith(value, StringComparison.OrdinalIgnoreCase),
            "eq" => text.Equals(value, StringComparison.OrdinalIgnoreCase) || Numero(item, filter.Key, value, (left, right) => left == right),
            "neq" => !text.Equals(value, StringComparison.OrdinalIgnoreCase),
            "gt" => Numero(item, filter.Key, value, (left, right) => left > right),
            "gte" => Numero(item, filter.Key, value, (left, right) => left >= right),
            "lt" => Numero(item, filter.Key, value, (left, right) => left < right),
            "lte" => Numero(item, filter.Key, value, (left, right) => left <= right),
            "in" => value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Any(piece => text.Equals(piece, StringComparison.OrdinalIgnoreCase)),
            _ => true
        };
        return ok;
    }

    private static bool Numero(Repuesto item, string key, string value, Func<decimal, decimal, bool> test)
    {
        if (!decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var expected))
        {
            return false;
        }

        decimal? actual = key switch
        {
            "Stock" => item.Stock,
            "Price" => item.Price,
            _ => null
        };
        return actual is decimal number && test(number, expected);
    }

    private static string Campo(Repuesto item, string key) => key switch
    {
        "Code" => item.Code,
        "Name" => item.Name,
        "Brand" => item.Brand,
        "Model" => item.Model,
        "Category" => item.Category,
        "Stock" => item.Stock.ToString(CultureInfo.InvariantCulture),
        "Price" => item.Price.ToString(CultureInfo.InvariantCulture),
        "Updated" => item.Updated.ToString("dd'/'MM'/'yyyy", CultureInfo.InvariantCulture),
        _ => ""
    };

    private static byte[] Crear(IReadOnlyList<string> headers, IReadOnlyList<string[]> rows)
    {
        var sheet = new XElement(XName.Get("worksheet", Ns),
            new XElement(XName.Get("sheetData", Ns),
                Fila(1, headers),
                rows.Select((row, index) => Fila(index + 2, row))));
        var workbook = new XElement(XName.Get("workbook", Ns),
            new XAttribute(XNamespace.Xmlns + "r", Rel),
            new XElement(XName.Get("sheets", Ns),
                new XElement(XName.Get("sheet", Ns),
                    new XAttribute("name", "Repuestos"),
                    new XAttribute("sheetId", 1),
                    new XAttribute(XName.Get("id", Rel), "rId1"))));

        using var stream = new MemoryStream();
        using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, true))
        {
            Texto(zip, "[Content_Types].xml", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
                </Types>
                """);
            Texto(zip, "_rels/.rels", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
                </Relationships>
                """);
            Texto(zip, "xl/_rels/workbook.xml.rels", """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                </Relationships>
                """);
            Texto(zip, "xl/workbook.xml", workbook.ToString(SaveOptions.DisableFormatting));
            Texto(zip, "xl/worksheets/sheet1.xml", sheet.ToString(SaveOptions.DisableFormatting));
        }

        return stream.ToArray();
    }

    private static XElement Fila(int index, IReadOnlyList<string> cells)
    {
        var row = new XElement(XName.Get("row", Ns), new XAttribute("r", index));
        for (var column = 0; column < cells.Count; column++)
        {
            row.Add(new XElement(XName.Get("c", Ns),
                new XAttribute("r", Letra(column) + index),
                new XAttribute("t", "inlineStr"),
                new XElement(XName.Get("is", Ns),
                    new XElement(XName.Get("t", Ns), cells[column]))));
        }

        return row;
    }

    private static string Letra(int index)
    {
        var name = "";
        var value = index;
        do
        {
            name = (char)('A' + value % 26) + name;
            value = value / 26 - 1;
        }
        while (value >= 0);
        return name;
    }

    private static void Texto(ZipArchive zip, string path, string content)
    {
        var entry = zip.CreateEntry(path, CompressionLevel.Fastest);
        using var writer = new StreamWriter(entry.Open(), new UTF8Encoding(false));
        writer.Write(content);
    }

    private const string Ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    private const string Rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
}
