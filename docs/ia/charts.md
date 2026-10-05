# Charts — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. Hay un solo componente: `TDChart`. El dibujo lo elige `Kind`.
2. No existen `TDLineSeries`, `TDColumnSeries`, `TDPieSeries`, `TDScatterSeries`, `TDRadialGauge`, `TDSparkline`, `TDHeatmap`, `TDWaterfallSeries`, `TDFunnelSeries`, `TDParetoChart`, `TDTreemap`, `TDRadarSeries`, `TDSankey`, `TDBulletChart`, `TDGantt`, `TDForecastChart`, `TDVarianceChart`, `TDQuadrantChart`, `TDCohortChart`, `TDMarimekko`, `TDSlopeChart`, `TDDumbbellChart`, `TDControlChart` ni `TDBarChart`.
3. Sin `Series`, `TDChart` muestra los datos de demostración. Con `Series`, usa las cifras del sistema. Línea (`chline`), columnas (`chcol`) y pie (`chpie`) conservan su geometría. Cualquier otro `Kind`, si recibe series, las pinta como columnas.
4. Un `Kind` desconocido se pinta como línea. El default es `chline`.
5. El id de catálogo `chart` (barras CSS) no es un componente.

## Qué Kind elegir

| Necesitas | Kind |
| --- | --- |
| Serie en el tiempo | `chline` |
| Comparar categorías | `chcol` |
| Participación de un total | `chpie` |
| Relación entre dos variables | `chscatter` |
| Un valor contra un arco | `chgauge` |
| Tendencia mínima junto a una cifra | `chspark` |
| Intensidad en una matriz | `chheat` |
| Cómo se llega de un total a otro | `chwf` |
| Conversión por etapas | `chfunnel` |
| Prioridad por impacto acumulado | `chpareto` |
| Jerarquía por área | `chtree` |
| Varios criterios en los mismos ejes | `chradar` |
| Flujos entre nodos | `chsankey` |
| Un KPI contra una meta | `chbullet` |
| Barras de tiempo con avance | `chgantt` |
| Real contra pronóstico | `chforecast` |
| Desviación contra presupuesto | `chvariance` |
| Dos ejes para clasificar un portafolio | `chquadrant` |
| Retención por cohorte | `chcohort` |
| Participación en dos dimensiones | `chmekko` |
| Cambio de posición entre dos periodos | `chslope` |
| Dos valores por fila | `chdumbbell` |
| Serie con límites de control | `chcontrol` |

## Alias del catálogo

Cada id `chline`, `chcol`, `chpie`, `chscatter`, `chgauge`, `chspark`, `chheat`, `chwf`, `chfunnel`, `chpareto`, `chtree`, `chradar`, `chsankey`, `chbullet`, `chgantt`, `chforecast`, `chvariance`, `chquadrant`, `chcohort`, `chmekko`, `chslope`, `chdumbbell` y `chcontrol` es el mismo tag:

```razor
<TDChart Kind="chcol" Title="Ventas del mes" Unit="CLP" Categories="meses" Series="ventas" />
```

`ventas` es `IReadOnlyList<TDChartSeries>`. Cada serie tiene `Name` y `Values`, en el mismo orden que `Categories`. Sin `Series` queda la lámina del catálogo. Una lista vacía deja el gráfico sin cifras.

## TDChart

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Kind` | `string` | `"chline"` | Gráfico que se pinta. | Siempre uno de la tabla. Un texto distinto se ve como línea. |
| `Categories` | `IReadOnlyList<string>?` | `null` | Etiquetas del eje. En un pie, cada una es una porción. | Hay series del sistema. |
| `Series` | `IReadOnlyList<TDChartSeries>?` | `null` | Cifras del sistema. | Un gráfico real. `null` deja la demostración. Vacío deja el gráfico sin cifras. |
| `Title` | `string?` | `null` | Título visible. | El título del catálogo no nombra el dato. |
| `Unit` | `string?` | `null` | Unidad junto a cada cifra. | El número necesita CLP, u u otra unidad. |
