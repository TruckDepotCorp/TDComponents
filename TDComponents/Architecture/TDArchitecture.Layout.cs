namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>Estructura de la página: marcos, tarjetas, diálogos y paneles.</summary>
    public static class Layout
    {
        /// <summary>Marco simple de aplicación, cabecera, barra y cuerpo.</summary>
        /// <remarks><c>Side</c> es el texto <c>start</c> o <c>end</c>. Si el menú tiene módulos anidados, usa el marco de Navegación.</remarks>
        public const string Marco = "TDLayout";

        /// <summary>Apilar en fila o en columna, stack, gap.</summary>
        /// <remarks>No suma 12 columnas. Para eso usa <see cref="Grilla"/>.</remarks>
        public const string Apilar = "TDStack";

        /// <summary>Grilla de 12 columnas, fila y columnas responsivas.</summary>
        /// <remarks>Los hijos son <c>TDCol</c>. <c>Size</c> va de 1 a 12.</remarks>
        public const string Grilla = "TDRow";

        /// <summary>Tarjeta, ficha visual, card con título y pie.</summary>
        /// <remarks>No existe <c>TDCardGroup</c>. Varias tarjetas van en <see cref="Grilla"/> o en <see cref="Apilar"/>. Una métrica de tablero es <see cref="Metricas"/>.</remarks>
        public const string Tarjeta = "TDCard";

        /// <summary>Métricas, tablero, cifras, KPI en rejilla.</summary>
        public const string Metricas = "TDTileLayout";

        /// <summary>Diálogo, modal, confirmar, aviso que bloquea.</summary>
        /// <remarks><c>Id</c> único. Con <c>Drawer</c> el mismo diálogo se ve de lado. No existe otro modal.</remarks>
        public const string Dialogo = "TDDialog";

        /// <summary>Panel lateral con su botón, filtros, drawer.</summary>
        /// <remarks>No tiene <c>Side</c>.</remarks>
        public const string PanelLateral = "TDDrawer";

        /// <summary>Bloque con título, panel de contenido, sección plegable.</summary>
        public const string Bloque = "TDPanel";

        /// <summary>Popup, contenido anclado a un botón, popover.</summary>
        /// <remarks>Si solo es una frase de ayuda, usa el tooltip de Feedback.</remarks>
        public const string Popup = "TDPopup";

        /// <summary>Paneles que se redimensionan, splitter.</summary>
        /// <remarks>Los hijos son <c>TDSplitterPane</c>.</remarks>
        public const string Paneles = "TDSplitter";

        /// <summary>Arrastrar tarjetas entre columnas, kanban, drop zone.</summary>
        public const string Arrastrar = "TDDropZone";

        /// <summary>Zona con atajos de teclado.</summary>
        /// <remarks>En cada <c>TDOption</c>, <c>Label</c> es la acción y <c>Value</c> es la tecla.</remarks>
        public const string Atajos = "TDContent";
    }

    /// <summary>Imagen, galería y agenda.</summary>
    public static class Media
    {
        /// <summary>Antes y después de una foto, comparar dos estados de una imagen.</summary>
        /// <remarks>Comparar productos es Ecommerce con <c>Kind="ecompare"</c>, no este componente.</remarks>
        public const string AntesDespues = "TDCompare";

        /// <summary>Galería de piezas con título y código.</summary>
        /// <remarks>No recibe archivos. Cada pieza es un <c>TDGalleryItem</c>.</remarks>
        public const string Galeria = "TDGallery";

        /// <summary>Una imagen, ampliar, descargar, texto alternativo.</summary>
        /// <remarks>No existe <c>Src</c>. Pinta <c>Alt</c> sobre <c>Background</c>.</remarks>
        public const string Imagen = "TDImage";

        /// <summary>Agenda, calendario, scheduler.</summary>
        /// <remarks>No recibe citas ni vistas. No tiene parámetros.</remarks>
        public const string Agenda = "TDScheduler";
    }

    /// <summary>Estados, avisos, avance y espera.</summary>
    public static class Feedback
    {
        /// <summary>Estado corto, badge, stock, contador junto a un texto.</summary>
        /// <remarks>El texto dice el estado. El color no basta. No existe <c>TDAlert</c>: el aviso junto al campo es <c>TDMessage</c>.</remarks>
        public const string Estado = "TDBadge";

        /// <summary>Aviso flotante, toast, notificación que no ocupa el formulario.</summary>
        /// <remarks>No existe <c>TDNotificationHost</c>. Cada aviso es un <c>TDToastItem</c>.</remarks>
        public const string AvisoFlotante = "TDToast";

        /// <summary>Barra de avance, porcentaje, progreso con valor.</summary>
        /// <remarks>No existe <c>TDProgressBar</c>. No tiene modo indeterminado. La espera sin cifra es <see cref="Espera"/>.</remarks>
        public const string Avance = "TDProgress";

        /// <summary>Cargando, espera sin porcentaje, spinner con texto.</summary>
        /// <remarks>El texto tiene que decir qué se carga.</remarks>
        public const string Espera = "TDLoader";

        /// <summary>Placeholder, skeleton, reservar el alto mientras llegan los datos.</summary>
        public const string Hueco = "TDSkeleton";

        /// <summary>Ayuda breve, tooltip, frase sobre un control.</summary>
        /// <remarks>No puede ser la única explicación de la acción.</remarks>
        public const string Ayuda = "TDTooltip";
    }
}
