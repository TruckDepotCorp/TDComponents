# Arquitectura — cómo interpreta una IA un pedido

Este es el primer documento. Traduce lo que la persona dice a un tag real. El detalle de cada parámetro está en la guía del módulo y en el XML del componente.

El mismo mapa viaja en el NuGet como el tipo `TDComponents.Architecture.TDArchitecture`. No pinta nada. El valor de cada constante es el marcado. El resumen son las frases de la persona.

```razor
@using TDComponents
@using TDComponents.Components
```

## Procedimiento

1. Lee el pedido y elige la constante de `TDArchitecture` cuya frase coincida. Si hay dos, usa la más específica.
2. Copia el valor de esa constante. Ese es el tag.
3. Abre el XML de ese componente, o la guía del módulo, y usa solo parámetros que existan ahí.
4. Si el pedido nombra un tag que no está en el mapa, no lo inventes. Tradúcelo con la constante.
5. Si ninguna frase encaja, no crees un componente nuevo.

## Reglas de toda la biblioteca

1. Namespace de los tags: `TDComponents.Components`. Enums y records: `TDComponents`.
2. Solo `TDTextBox` acepta `@bind-Value`. El resto de los campos viaja por `Name` en el post.
3. `ChildContent` es el contenido entre etiquetas, no un atributo.
4. Un `bool` omitido vale `false`.
5. No existen `TDFormField`, `TDProductCard`, `TDCartDrawer`, `TDLineSeries`, `TDBarChart`, `TDAlert`, `TDNotificationHost`, `TDProgressBar` ni `TDCardGroup`.
6. No existe `Menu="true"` en `TDFab`. `TDChart` no recibe series. `TDEcom` no recibe productos. `TDImage` no tiene `Src`. `TDScheduler` no recibe citas. `TDDrawer` no tiene `Side`.

## Ejemplos de interpretación

Pedido: «un formulario para crear un pedido, con el nombre de la flota, la marca y guardar».

`EditForm`, porque no hay un tag de formulario. El nombre es `TDTextBox` con `@bind-Value`. La marca es `TDSelect` con `Name`. Guardar es `TDButton`, que ya envía.

Pedido: «un gráfico de embudo de las ventas».

`TDChart Kind="chfunnel"`. No existe `TDFunnelSeries` y no se le pasan datos.

Pedido: «el carrito lateral de la tienda».

`TDEcom Kind="ecart"`. No existe `TDCartDrawer`.

Pedido: «comparar el disco usado con el nuevo».

`TDCompare`. Comparar productos de la tienda es `TDEcom Kind="ecompare"`.

Pedido: «una tabla de repuestos que se pueda filtrar y compartir por enlace».

`TDDataGrid` con `QueryKey` y columnas `TDColumn`. No uses `@bind-Value`. La fila elegida es `SelectedId` junto con `RowId`.

Pedido: «un botón de cancelar dentro del formulario».

`TDButton ButtonType="TDButtonType.Button"`. Sin ese tipo, el botón envía el formulario.

## Dónde está cada grupo

| Grupo en `TDArchitecture` | Guía |
| --- | --- |
| `Forms` | [forms.md](forms.md) |
| `Data`, `Navegacion` | [data.md](data.md), [navegacion.md](navegacion.md) |
| `Layout`, `Media`, `Feedback` | [layout.md](layout.md), [media.md](media.md), [feedback.md](feedback.md) |
| `Charts`, `Codigos`, `Ecommerce`, `Utilidades` | [charts.md](charts.md), [codigos.md](codigos.md), [ecommerce.md](ecommerce.md), [utilidades.md](utilidades.md) |

Las frases exactas están en el XML de `TDArchitecture`, una constante por intención. Esta página no las duplica para que el mapa tenga una sola fuente.
