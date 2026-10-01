import fs from "node:fs";

const html = fs.readFileSync(
    new URL("./uiuxblazor-ui-mockups/project/UiuxBlazor Components v3.dc.html", import.meta.url),
    "utf8",
);

const keys = [
    "grid", "coltemplate", "colresize", "colpicker", "colreorder", "colfooter",
    "colfrozen", "colcomposite", "colconditional", "fltsimple", "fltmenu", "fltadv",
    "fltcbl", "fltmixed", "fltapi", "selsingle", "selmulti", "sortsingle", "sortmulti",
    "cellmenu", "inlineedit", "incelledit", "cascade", "condfmt", "exportx",
    "datatable", "pager", "tree",
];

function parseArray(source, start) {
    let i = start;
    while (source[i] !== "[") {
        i += 1;
    }
    const items = [];
    i += 1;
    while (i < source.length) {
        const ch = source[i];
        if (ch === "]") {
            return items;
        }
        if (ch === "{") {
            const item = {};
            i += 1;
            while (source[i] !== "}") {
                while (/\s|,/.test(source[i])) {
                    i += 1;
                }
                if (source[i] === "}") {
                    break;
                }
                const keyMatch = source.slice(i).match(/^(\w+)\s*:/);
                if (!keyMatch) {
                    throw new Error(`bad key at ${i}: ${source.slice(i, i + 40)}`);
                }
                i += keyMatch[0].length;
                while (/\s/.test(source[i])) {
                    i += 1;
                }
                if (source[i] !== "'" && source[i] !== '"') {
                    throw new Error(`expected string at ${i}`);
                }
                const quote = source[i];
                i += 1;
                let value = "";
                while (i < source.length) {
                    if (source[i] === "\\") {
                        const next = source[i + 1];
                        if (next === "n") {
                            value += "\n";
                        } else if (next === "t") {
                            value += "\t";
                        } else if (next === quote || next === "\\") {
                            value += next;
                        } else if (next === "/") {
                            value += "/";
                        } else if (next === "'") {
                            value += "'";
                        } else {
                            value += next;
                        }
                        i += 2;
                        continue;
                    }
                    if (source[i] === quote) {
                        i += 1;
                        break;
                    }
                    value += source[i];
                    i += 1;
                }
                item[keyMatch[1]] = value;
            }
            items.push(item);
        }
        i += 1;
    }
    return items;
}

function tdify(text) {
    return text
        .replaceAll("UiuxBlazor", "TDComponents")
        .replaceAll("UiuxDataGrid", "TDDataGrid")
        .replaceAll("UiuxColumn", "TDColumn")
        .replaceAll("UiuxPager", "TDPager")
        .replaceAll("UiuxTree", "TDTree")
        .replaceAll("UiuxContextMenu", "TDContextMenu")
        .replaceAll("UiuxMenuItem", "TDMenuItem")
        .replaceAll("UiuxMenuSeparator", "TDMenuSeparator")
        .replaceAll("UiuxBadge", "TDBadge")
        .replaceAll("UiuxProgressBar", "TDProgress")
        .replaceAll("UiuxTextBox", "TDTextBox")
        .replaceAll("UiuxSelect", "TDSelect")
        .replaceAll("UiuxNumeric", "TDNumeric")
        .replaceAll("UiuxTag", "TDBadge")
        .replaceAll("UiuxAddToCart", "TDButton")
        .replaceAll("UiuxCommandColumn", "TDCommandColumn")
        .replaceAll("IUiuxExporter", "ITDExporter")
        .replaceAll("uiux-data-grid", "td-data-grid")
        .replaceAll("uiux-", "td-")
        .replaceAll("Uiux", "TD")
        .replaceAll("data-uiux-", "data-td-");
}

const blocks = [];
for (const key of keys) {
    const needle = `\n  ${key}:`;
    const at = html.indexOf(needle);
    if (at < 0) {
        throw new Error(`missing ${key}`);
    }
    const items = parseArray(html, at + needle.length);
    const cases = items.map((item) => {
        const code = tdify(item.code).replaceAll('"""', '"\u0022"\u0022"');
        return `            new("${item.file.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}", "${item.lang}", """\n${code}\n""")`;
    });
    blocks.push(`        "${key}" =>\n        [\n${cases.join(",\n")}\n        ]`);
}

const csharp = `namespace WebAppSSR.Catalog;

internal static class CatalogSamples
{
    public static IReadOnlyList<CatalogCode> For(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return [];
        }

        return id.ToLowerInvariant() switch
        {
${blocks.join(",\n")},
            _ => []
        };
    }

    public static CatalogCode? Primary(string? id) => For(id).FirstOrDefault();
}
`;

fs.writeFileSync(new URL("../WebAppSSR/Catalog/CatalogSamples.cs", import.meta.url), csharp);
console.log("wrote CatalogSamples.cs", keys.length, "ids");
