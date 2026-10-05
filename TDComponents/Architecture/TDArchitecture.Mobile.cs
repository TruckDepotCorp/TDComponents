namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>
    /// Teléfono del operador: bodega, WMS o ERP en una pantalla chica.
    /// Cada constante es un componente. No es <c>TDEcom</c> ni el escáner de cámara.
    /// </summary>
    public static class Mobile
    {
        /// <summary>Barra superior de una pantalla de teléfono: título, bodega y volver.</summary>
        /// <remarks><c>BackHref</c> es el destino de volver. <c>ActionHref</c> es la ayuda o la acción secundaria.</remarks>
        public const string Barra = """<TDAppBar Title="Recepción" Subtitle="Bodega Quilicura" BackHref="/tareas" BackLabel="Volver a las tareas" />""";

        /// <summary>Navegación inferior, pulgar, secciones de la app móvil.</summary>
        /// <remarks><c>Items</c> es <c>TDMobileDest</c>. <c>Active</c> es el <c>Id</c> de la sección actual.</remarks>
        public const string Navegacion = """<TDBottomNav Active="tareas" Items="secciones" />""";

        /// <summary>Resultado de un escaneo, código leído, ubicación y cuánto hay.</summary>
        /// <remarks>La cámara es <see cref="Codigos.Camara"/>. Esta tarjeta muestra lo que el sistema resolvió.</remarks>
        public const string Escaneo = """<TDScanCard Code="BR-4521-AD" Name="Pastilla de freno delantera" Location="Pasillo A · rack 12 · nivel 2" Stock="24" Unit="unidades" Status="Ubicación confirmada" ActionLabel="Guardar 24 unidades en A-12" ActionHref="/guardar" />""";

        /// <summary>Teclado de cantidad, guantes, unidades a recoger o guardar.</summary>
        /// <remarks><c>Name</c> es el campo del post. <c>Min</c> y <c>Max</c> limitan la cantidad.</remarks>
        public const string Cantidad = """<TDQtyPad Label="Cantidad a guardar" Value="4" Unit="unidades" Min="1" Max="48" Name="cantidad" />""";

        /// <summary>Cola de tareas de bodega, recoger, guardar, contar, recibir.</summary>
        /// <remarks><c>Jobs</c> es <c>TDWarehouseJob</c>. Una lista vacía no inventa tareas. <c>Href</c> abre la tarea; sin destino, la fila no es un enlace.</remarks>
        public const string Tareas = """<TDJobList Jobs="tareas" />""";

        /// <summary>Ficha de ubicación, pasillo, rack, nivel, bin y existencia.</summary>
        public const string Ubicacion = """<TDBinCard Aisle="A" Rack="12" Level="2" Bin="04" Sku="BR-4521-AD" SkuName="Pastilla de freno delantera" Quantity="24" Unit="unidades" />""";

        /// <summary>Confirmación al pie de la pantalla, antes de guardar un movimiento.</summary>
        /// <remarks><c>Open</c> la muestra. Cancelar la cierra en el teléfono. Confirmar envía el formulario.</remarks>
        public const string Confirmar = """<TDConfirmSheet Open="true" Title="Guardar 24 unidades en A-12" Detail="El pallet sigue en el muelle hasta que confirmes. Si cierras, no se mueve nada." ConfirmLabel="Guardar en A-12" CancelLabel="Seguir revisando" HelpHref="/supervisor" HelpLabel="Pedir ayuda al supervisor" />""";

        /// <summary>Turno del operador, bodega, conexión y movimientos por sincronizar.</summary>
        public const string Turno = """<TDShiftBar Operator="María Soto" Site="Bodega Quilicura" Role="Operadora de recepción" Pending="3" Online="false" />""";

        /// <summary>Línea de picking, desde dónde, cuánto pedir y cuánto ya se tomó.</summary>
        /// <remarks><c>Field</c> publica las unidades recogidas en el post. Si se omite, el campo se llama recogidas.</remarks>
        public const string Recoger = """<TDPickLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" From="Pasillo A · rack 12 · nivel 2" Quantity="6" Picked="2" Unit="unidades" Field="recogidas" />""";

        /// <summary>Pasos de una recepción o un almacenaje en el teléfono.</summary>
        /// <remarks><c>Current</c> es el índice del paso activo, desde cero.</remarks>
        public const string Pasos = """<TDJobSteps Title="Recepción del pallet 18" Current="1" Steps="pasos" />""";

        /// <summary>Carrusel de tarjetas en el teléfono. El encabezado dice cuál es y cuántas hay.</summary>
        /// <remarks><c>Cards</c> es <c>TDCarouselCard</c>. Vacío dice que no hay tarjetas. <c>Auto</c> en falso deja el giro en los botones. El encabezado y la acción usan <c>TDButtonIcon</c>. No reemplaza a <c>TDCarousel</c>.</remarks>
        public const string Tarjetas = """<TDCardCarousel AriaLabel="Tareas del turno" Auto="true" Interval="5000" Cards="tarjetas" />""";

        /// <summary>Botón de ícono para el teléfono. El nombre accesible dice la acción.</summary>
        /// <remarks><c>Icon</c> es el nombre de Material Symbols, por ejemplo <c>arrow_back</c>. La página tiene que cargar esa fuente con los nombres que usa. <c>ButtonType</c> por defecto no envía el formulario.</remarks>
        public const string Icono = """<TDButtonIcon Icon="arrow_back" Label="Tarjeta anterior" />""";
    }
}
