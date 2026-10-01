namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>
    /// Gráficos. Siempre es <c>TDChart</c>. El valor de la constante es el <c>Kind</c>.
    /// No existen series, <c>TDLineSeries</c> ni <c>TDBarChart</c>. El componente no recibe datos.
    /// </summary>
    public static class Charts
    {
        /// <summary>Línea, área, serie en el tiempo.</summary>
        public const string Linea = """<TDChart Kind="chline" />""";

        /// <summary>Columnas, barras, comparar categorías.</summary>
        public const string Columnas = """<TDChart Kind="chcol" />""";

        /// <summary>Pie, donut, torta, participación de un total.</summary>
        public const string Pie = """<TDChart Kind="chpie" />""";

        /// <summary>Dispersión, burbujas, relación entre dos variables.</summary>
        public const string Dispersion = """<TDChart Kind="chscatter" />""";

        /// <summary>Gauge, tacómetro, un valor contra un arco.</summary>
        public const string Gauge = """<TDChart Kind="chgauge" />""";

        /// <summary>Sparkline, mini tendencia, KPI pequeño.</summary>
        public const string Spark = """<TDChart Kind="chspark" />""";

        /// <summary>Mapa de calor, heatmap, intensidad en una matriz.</summary>
        public const string Calor = """<TDChart Kind="chheat" />""";

        /// <summary>Cascada, waterfall, puente de un total a otro.</summary>
        public const string Cascada = """<TDChart Kind="chwf" />""";

        /// <summary>Embudo, funnel, conversión por etapas.</summary>
        public const string Embudo = """<TDChart Kind="chfunnel" />""";

        /// <summary>Pareto, ABC, prioridad por impacto acumulado.</summary>
        public const string Pareto = """<TDChart Kind="chpareto" />""";

        /// <summary>Treemap, jerarquía por área.</summary>
        public const string Treemap = """<TDChart Kind="chtree" />""";

        /// <summary>Radar, varios criterios en los mismos ejes.</summary>
        public const string Radar = """<TDChart Kind="chradar" />""";

        /// <summary>Sankey, flujos entre nodos.</summary>
        public const string Flujos = """<TDChart Kind="chsankey" />""";

        /// <summary>Bullet, un KPI contra una meta.</summary>
        public const string Bullet = """<TDChart Kind="chbullet" />""";

        /// <summary>Gantt, barras de tiempo, planificación.</summary>
        public const string Gantt = """<TDChart Kind="chgantt" />""";

        /// <summary>Pronóstico, forecast, real contra pronóstico.</summary>
        public const string Pronostico = """<TDChart Kind="chforecast" />""";

        /// <summary>Presupuesto contra real, varianza, desviación.</summary>
        public const string Varianza = """<TDChart Kind="chvariance" />""";

        /// <summary>Cuadrante, portafolio, matriz de dos ejes.</summary>
        public const string Cuadrante = """<TDChart Kind="chquadrant" />""";

        /// <summary>Cohortes, retención.</summary>
        public const string Cohortes = """<TDChart Kind="chcohort" />""";

        /// <summary>Marimekko, mekko, participación en dos dimensiones.</summary>
        public const string Mekko = """<TDChart Kind="chmekko" />""";

        /// <summary>Slope, cambio de ranking entre dos periodos.</summary>
        public const string Ranking = """<TDChart Kind="chslope" />""";

        /// <summary>Dumbbell, dos valores por fila, antes y después en un gráfico.</summary>
        /// <remarks>Antes y después de una foto es <c>TDCompare</c>, no este gráfico.</remarks>
        public const string DosValores = """<TDChart Kind="chdumbbell" />""";

        /// <summary>Control estadístico, SPC, límites de control.</summary>
        public const string Control = """<TDChart Kind="chcontrol" />""";
    }
}
