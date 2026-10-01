using TDComponents;

namespace WebAppSSR.Catalog;

internal static class CodeScenarios
{
    public static TDLabelRecord BrakePad { get; } = new(
        "BR-4521-AD",
        "Pastilla de freno delantera",
        "Volvo",
        "$ 189.990",
        "42",
        "https://truckdepot.cl/p/BR-4521-AD");

    public const string LabelTemplate = """
        {
          "size": { "width": 62, "height": 40, "dpi": 203 },
          "elements": [
            { "type": "text", "x": 3, "y": 3, "w": 56, "h": 4.2, "text": "{name}", "size": 3.4, "bold": true, "align": "left" },
            { "type": "text", "x": 3, "y": 7.6, "w": 56, "h": 3.2, "text": "{brand} · {code}", "size": 2.5, "align": "left" },
            { "type": "text", "x": 3, "y": 11.2, "w": 40, "h": 6, "text": "{price}", "size": 5.2, "bold": true, "align": "left" },
            { "type": "line", "x": 3, "y": 18.6, "w": 56, "h": 0.4, "thick": 0.4 },
            { "type": "barcode", "x": 3, "y": 20.5, "w": 38, "h": 16, "text": "{code}", "format": "c128", "showText": true },
            { "type": "qr", "x": 45, "y": 21, "w": 14, "h": 14, "text": "{url}" },
            { "type": "box", "x": 44, "y": 11, "w": 15, "h": 6.2, "thick": 0.35 },
            { "type": "text", "x": 44, "y": 12.4, "w": 15, "h": 3.4, "text": "STOCK {stock}", "size": 2.3, "bold": true, "align": "center" }
          ]
        }
        """;

    public static IReadOnlyList<TDPrinterDevice> WarehousePrinters { get; } =
    [
        new("zd421", "Zebra ZD421", "ZD421d · 203 dpi", "wifi", "192.168.1.40:9100", "ZPL", 203, 104, true, true),
        new("ql820", "Brother QL-820NWB", "QL-820NWB · 300 dpi", "wifi", "192.168.1.52:9100", "ESC/P", 300, 62, false, false, true),
        new("zq520", "Zebra ZQ520", "ZQ520 móvil · 203 dpi", "bt", "AC:3F:A4:12:9B:07", "CPCL", 203, 104, false)
    ];
}
