namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>
    /// Entrada de mercadería y revisión del producto.
    /// Cada constante es un componente. No abre la cámara, no es el teléfono de <see cref="Mobile"/> y no es el andén de <see cref="Operaciones"/>.
    /// </summary>
    public static class Entrada
    {
        /// <summary>Entrada de mercadería, orden de compra, proveedor, muelle y líneas recibidas.</summary>
        public const string Documento = """<TDReceiptHeader Document="OC-00481" Supplier="Frenos del Pacífico" Dock="Muelle 2 · Bodega Quilicura" ExpectedLines="6" ReceivedLines="4" Status="En recepción" Tone="TDMobileTone.Warning" />""";

        /// <summary>Línea de la orden, unidades pedidas contra unidades recibidas.</summary>
        /// <remarks><c>Field</c> publica las unidades recibidas. Puede superar lo pedido; el aviso lo dice. El número abre un diálogo para escribir la cantidad.</remarks>
        public const string Linea = """<TDReceiptLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" Ordered="24" Received="21" Unit="unidades" Field="recibidas" />""";

        /// <summary>Aviso de despacho, bultos declarados contra bultos contados en el camión.</summary>
        /// <remarks><c>Field</c> publica los bultos contados.</remarks>
        public const string Aviso = """<TDAsnMatch Notice="ASN-18" ExpectedPackages="12" CountedPackages="10" Field="bultos" />""";

        /// <summary>Sello del camión al llegar, el del aviso contra el leído, intacto o violado.</summary>
        /// <remarks>Si no coinciden o el sello está violado, el texto pide detener la descarga. No es el sello de salida.</remarks>
        public const string Sello = """<TDSealCheck Expected="SL-88421" Read="SL-88419" Intact="true" />""";

        /// <summary>Lote y vencimiento de lo que entra. Sin uno de los dos no se ingresa a stock.</summary>
        public const string Lote = """<TDLotCapture Sku="BR-4521-AD" Lot="L-904" Expires="Marzo 2028" Quantity="24" Unit="unidades" />""";

        /// <summary>Revisión del producto, criterios que cumplen, no cumplen o siguen pendientes.</summary>
        /// <remarks><c>Checks</c> es <c>TDInspectCheck</c>. Vacío dice que no hay criterios. Cada criterio publica su resultado.</remarks>
        public const string Revision = """<TDInspectList Product="Pastilla de freno delantera" Checks="criterios" FieldPrefix="revision" />""";

        /// <summary>Unidades dañadas en la revisión: qué se vio y qué hacer con ellas.</summary>
        public const string Dano = """<TDDamageNote Sku="BR-4521-AD" What="La caja llegó húmeda y dos pastillas están oxidadas." Affected="2" Unit="unidades" Next="Separa las 2 unidades. El resto puede seguir a revisión." Tone="TDMobileTone.Warning" />""";

        /// <summary>Temperatura de la carga contra el rango permitido.</summary>
        /// <remarks>Fuera de rango, el texto pide no ingresar el producto y avisar a calidad.</remarks>
        public const string Temperatura = """<TDTempCheck Product="Líquido de frenos" Reading="11" Min="2" Max="8" Unit="°C" />""";

        /// <summary>Etiqueta del producto, código de la orden contra el impreso, y si se lee.</summary>
        /// <remarks>No abre la cámara. Si no coincide o no se lee, el texto pide no guardarlo.</remarks>
        public const string Etiqueta = """<TDLabelCheck Expected="BR-4521-AD" Printed="BR-4521-AD" Readable="false" />""";

        /// <summary>Decisión de la revisión: aceptar a stock, devolver al proveedor o mandar a calidad.</summary>
        /// <remarks><c>ActionLabel</c> dice la consecuencia. <c>Consequence</c> dice qué queda detenido o qué entra.</remarks>
        public const string Decision = """<TDDisposition Product="Pastilla de freno delantera" Decision="Mandar a calidad" Consequence="Las 24 unidades quedan detenidas. No entran a la ubicación de picking." Tone="TDMobileTone.Danger" ActionHref="/calidad" ActionLabel="Mandar 24 unidades a calidad" />""";
    }
}
