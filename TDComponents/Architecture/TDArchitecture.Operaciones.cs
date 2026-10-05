namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>
    /// Operación de bodega: andén, conteo, incidencia, ruta, pallet, relevo, reposición, ubicación, calidad y despacho.
    /// Cada constante es un componente. No es el teléfono de <see cref="Mobile"/>, no abre la cámara y no es <c>TDEcom</c>.
    /// </summary>
    public static class Operaciones
    {
        /// <summary>Tablero de muelles, andén, puerta de camión, transportista y estado.</summary>
        /// <remarks><c>Doors</c> es <c>TDDockDoor</c>. Vacío o nulo dice que no hay puertas asignadas. <c>Href</c> abre esa puerta.</remarks>
        public const string Muelles = """<TDDockBoard Doors="muelles" />""";

        /// <summary>Diferencia de conteo, esperado contra contado, faltante o sobrante.</summary>
        /// <remarks><c>Name</c> publica las unidades contadas. El aviso dice si coincide, falta o sobra.</remarks>
        public const string Conteo = """<TDCountDiff Sku="BR-4521-AD" Location="Pasillo A · rack 12 · nivel 2" Expected="24" Counted="21" Unit="unidades" Name="contado" />""";

        /// <summary>Incidencia de bodega: qué pasó, qué hacer y a quién pedir ayuda.</summary>
        /// <remarks>El color no reemplaza el texto. <c>HelpLabel</c> nombra a la persona que ayuda.</remarks>
        public const string Incidencia = """<TDIssueCard Title="Faltan 3 pastillas" What="El conteo quedó abierto. La mercadería no se movió." Next="Vuelve a contar el casillero o deja la incidencia para el supervisor." Tone="TDMobileTone.Warning" HelpHref="/supervisor" HelpLabel="Pedir ayuda al supervisor de turno" />""";

        /// <summary>Parada de ruta, cliente, ventana de entrega y bultos.</summary>
        /// <remarks><c>Status</c> va escrito: En ruta, Entregada o Demorada.</remarks>
        public const string Parada = """<TDRouteStop Sequence="2" Customer="Taller Los Andes" Address="Av. Vicuña Mackenna 4200, La Florida" Window="Entre 14:00 y 16:00" Packages="8" Status="En ruta" Tone="TDMobileTone.Success" />""";

        /// <summary>Armado de pallet, capas, peso máximo y mezcla de artículos.</summary>
        /// <remarks>Si el peso supera <c>MaxWeightKg</c>, el texto pide quitar bultos. <c>Mixed</c> avisa que hay más de un artículo.</remarks>
        public const string Pallet = """<TDPalletBuild Code="PLT-1842" Title="Pastillas de freno delanteras" Layers="3" LayerTarget="4" WeightKg="820" MaxWeightKg="900" Mixed="true" />""";

        /// <summary>Nota de relevo, lo que dejó el turno anterior.</summary>
        /// <remarks>No es la barra de conexión. <c>OpenTasks</c> en cero dice que el turno anterior cerró su cola.</remarks>
        public const string Relevo = """<TDShiftNote From="María Soto" At="Hoy a las 14:00, bodega Quilicura" Note="El muelle 2 sigue descargando. El lote L-904 está en calidad y no se mueve." OpenTasks="2" />""";

        /// <summary>Reposición, mover de la reserva a la ubicación de picking.</summary>
        /// <remarks><c>Field</c> publica las unidades movidas. Mover y devolver no pasan de cero ni de <c>Needed</c>.</remarks>
        public const string Reposicion = """<TDReplenLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" From="Reserva · pasillo C · rack 3" To="Picking · pasillo A · rack 12" Needed="12" Moved="4" Unit="unidades" Field="movidas" />""";

        /// <summary>Ubicación sugerida contra la ubicación escaneada.</summary>
        /// <remarks>Si no coinciden, el texto dice que no se deje el artículo. No abre la cámara.</remarks>
        public const string UbicacionSugerida = """<TDSlotCheck Sku="BR-4521-AD" Suggested="A-12-2-04" Scanned="B-04-1-02" />""";

        /// <summary>Lote retenido por calidad, cuántas unidades y quién puede liberarlo.</summary>
        /// <remarks>Sin <c>Owner</c>, nadie del piso puede mover el lote.</remarks>
        public const string Calidad = """<TDQcHold Lot="L-904" Reason="El empaque llegó abierto. Calidad tiene que revisarlo." Quantity="48" Unit="unidades" Owner="Camila Ríos, calidad" Tone="TDMobileTone.Danger" />""";

        /// <summary>Cierre de despacho, andén, hora de salida y sello.</summary>
        /// <remarks><c>ActionLabel</c> dice la consecuencia, por ejemplo cerrar esa orden. Un sello vacío se lee como sin sello.</remarks>
        public const string Despacho = """<TDDispatchCard Order="OC-00481" Door="Muelle 4" Departs="Hoy a las 17:10" Status="Falta el sello" Tone="TDMobileTone.Warning" ActionHref="/anden" ActionLabel="Cerrar despacho OC-00481" />""";
    }
}
