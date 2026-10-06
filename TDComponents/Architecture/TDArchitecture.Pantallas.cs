namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>Pantallas de una aplicación real. Los datos salen del sistema, no del catálogo.</summary>
    /// <remarks>Empieza aquí cuando el pedido es un alta, un listado, una ficha, un carrito, un tablero, una foto, una agenda, un gráfico, una tienda o un teléfono de bodega. Cada constante es el marcado mínimo. Los nombres de modelo se reemplazan por los de la aplicación.</remarks>
    public static class Pantallas
    {
        /// <summary>Alta, crear, formulario de pedido, guardar un modelo del sistema.</summary>
        /// <remarks><c>TDEditForm</c> es el <c>EditForm</c>. El texto y el desplegable usan <c>@bind-Value</c>. <c>SubmitLabel</c> es el botón que envía. Si el botón lo armas tú, omite <c>SubmitLabel</c> y usa <c>TDButton</c>.</remarks>
        public const string Alta = """
            <TDEditForm Model="pedido" FormName="pedido" OnValidSubmit="Guardar" Enhance Title="Alta de flota" SubmitLabel="Guardar flota">
                <TDTextBox @bind-Value="pedido.Flota" Label="Nombre de la flota" Required="true" RequiredText="Obligatorio" />
                <TDSelect @bind-Value="pedido.Marca" Label="Marca" Options="marcas" />
            </TDEditForm>
            """;

        /// <summary>Listado operativo, tabla de repuestos o pedidos, filtrar, paginar, compartir por enlace.</summary>
        /// <remarks>Los registros van en <c>Data</c>. <c>QueryKey</c> publica el estado en la URL. No uses <c>@bind-Value</c>. No uses <c>TDEcom</c> para este listado.</remarks>
        public const string Listado = """
            <TDDataGrid TItem="Part" Data="parts" QueryKey="g" RowId="p => p.Id" AriaLabel="Repuestos" FilterMode="TDFilterMode.Advanced">
                <Columns>
                    <TDColumn TItem="Part" TValue="string" Property="p => p.Code" Title="Código" Kind="TDColumnKind.Mono" Searchable="true" />
                    <TDColumn TItem="Part" TValue="string" Property="p => p.Name" Title="Repuesto" Searchable="true" />
                    <TDColumn TItem="Part" TValue="int" Property="p => p.Stock" Title="Stock" Kind="TDColumnKind.Stock" Align="TDColumnAlign.End" />
                </Columns>
            </TDDataGrid>
            """;

        /// <summary>Ficha de un registro, detalle, stock y datos del ítem que ya cargó la aplicación.</summary>
        /// <remarks>El marco, las pestañas y la tarjeta reciben los valores del modelo. No uses <c>TDEcom Kind="edetail"</c> para una ficha con datos propios.</remarks>
        public const string Ficha = """
            <TDLayout Title="Panel de flota" BodyTitle="@parte.Nombre" Active="bo" Items="menu">
                <TDTabs AriaLabel="Ficha" Tabs="pestanas" Selected="stock">
                    <TDTabPanel Name="stock">
                        <TDCard Title="Stock">@parte.Stock</TDCard>
                    </TDTabPanel>
                    <TDTabPanel Name="datos">
                        <TDCard Title="@parte.Codigo">@parte.Nombre</TDCard>
                    </TDTabPanel>
                </TDTabs>
            </TDLayout>
            """;

        /// <summary>Carrito o líneas de un pedido que pertenecen a la aplicación.</summary>
        /// <remarks>Las líneas las pinta la página. <c>TDEcom Kind="ecart"</c> es la vista del catálogo y no lee esta lista.</remarks>
        public const string Carrito = """
            <TDDrawer Id="carrito" Trigger="Carrito" Title="Carrito" ConfirmText="Pagar" CancelText="Seguir">
                @foreach (var linea in lineas)
                {
                    <p>@linea.Nombre · @linea.Cantidad</p>
                }
            </TDDrawer>
            """;

        /// <summary>Tablero, métricas, cifras del día, KPI con números del sistema.</summary>
        /// <remarks><c>Items</c> es una lista <c>TDTileItem</c> armada con los totales reales. Una serie en el tiempo usa <see cref="Grafico"/>.</remarks>
        public const string Tablero = """<TDTileLayout Columns="4" Items="metricas" />""";

        /// <summary>Foto de un repuesto, un documento o un vehículo que ya tiene dirección.</summary>
        /// <remarks><c>Src</c> apunta al archivo de la aplicación. <c>Alt</c> describe la imagen.</remarks>
        public const string Foto = """<TDImage Src="@parte.Foto" Alt="@parte.Nombre" Caption="@parte.Codigo" />""";

        /// <summary>Gráfico con cifras del sistema: línea, columnas o participación.</summary>
        /// <remarks><c>Series</c> son los números reales. Sin <c>Series</c> queda la lámina del catálogo. Un kind que no es línea, columna o pie pinta esas series como columnas.</remarks>
        public const string Grafico = """<TDChart Kind="chcol" Title="Ventas del mes" Unit="CLP" Categories="meses" Series="ventas" />""";

        /// <summary>Tienda, catálogo o ficha con los productos del sistema.</summary>
        /// <remarks><c>Products</c> es la lista real. Sin ese parámetro queda el catálogo de demostración. El carrito de líneas propias sigue siendo <see cref="Carrito"/>.</remarks>
        public const string Tienda = """<TDEcom Kind="ecard" Products="productos" />""";

        /// <summary>Teléfono de bodega, WMS o ERP: recepción, escaneo y confirmación en una sola pantalla.</summary>
        /// <remarks>Los datos salen del turno y de la lectura ya resuelta. La cámara sigue siendo <c>TDScanner</c>. <c>Jobs</c> vacío no inventa tareas. Cada tarea con <c>Href</c> abre su destino.</remarks>
        public const string Telefono = """
            <div class="td-phone">
                <TDAppBar Title="Recepción" Subtitle="@bodega" BackHref="/tareas" BackLabel="Volver a las tareas" ActionHref="/ayuda" ActionLabel="Ayuda" />
                <TDShiftBar Operator="@operador" Site="@bodega" Role="@puesto" Pending="@pendientes" Online="@enLinea" />
                <TDJobSteps Title="@flujo" Current="@paso" Steps="pasos" />
                <TDScanCard Code="@codigo" Name="@articulo" Location="@ubicacion" Stock="@existencia" Unit="unidades" Status="@estado" Tone="TDMobileTone.Success" ActionLabel="Guardar en la ubicación" ActionHref="/guardar" />
                <TDQtyPad Label="Cantidad a guardar" Value="@cantidad" Unit="unidades" Min="1" Max="@tope" Name="cantidad" />
                <TDConfirmSheet Open="true" Title="Guardar en la ubicación" Detail="Si cierras, la mercadería no se mueve." ConfirmLabel="Guardar en la ubicación" CancelLabel="Seguir revisando" HelpHref="/supervisor" HelpLabel="Pedir ayuda al supervisor" />
                <TDBottomNav Active="tareas" Items="secciones" />
            </div>
            """;

        /// <summary>Agenda del taller, citas, bahías, calendario con trabajos del sistema.</summary>
        /// <remarks><c>Appointments</c> es la lista real. Vacía significa que no hay trabajos. Sin ese parámetro queda la semana del catálogo. <c>Name</c> publica el JSON de las citas al guardar, mover o eliminar.</remarks>
        public const string Agenda = """<TDScheduler Date="@hoy" View="week" Resources="bahias" Appointments="citas" Name="agenda" />""";

        /// <summary>Mapa de la flota: uno o varios pilotos, el recorrido reconstruido y las paradas ya hechas.</summary>
        /// <remarks><c>Units</c> son las posiciones reales. <c>Route</c> de cada piloto es la lista de coordenadas por donde pasó. El mapa reconstruye esa lista por calles. Vacía significa que no hay nadie en ruta. Sin ese parámetro queda la flota del catálogo. Cada actualización de la lista mueve la marca del mismo <c>Id</c>.</remarks>
        public const string Mapa = """<TDMaps Title="Pilotos en ruta" Units="pilotos" MatchRoute="true" />""";

        /// <summary>Dónde está la persona que inició sesión, con el recorrido de esta visita.</summary>
        /// <remarks>La coordenada la entrega el equipo. <c>Name</c> y <c>Role</c> salen de la sesión. No envíes latitud desde el servidor para este caso.</remarks>
        public const string Ubicacion = """<TDMapUser Name="@usuario.Nombre" Role="@usuario.Rol" />""";

        /// <summary>Ruta por calles de la salida a la llegada, con las entregas del camino.</summary>
        /// <remarks><c>Deliveries</c> van en el orden de visita. Vacía es el camino directo. Sin <c>Origin</c> ni <c>Destination</c> queda la ruta del catálogo. El trazado lo calcula OSRM.</remarks>
        public const string Ruta = """<TDMapRoute Origin="salida" Destination="llegada" Deliveries="entregas" />""";
    }
}
