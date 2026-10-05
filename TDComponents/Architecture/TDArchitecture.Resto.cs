namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>Códigos, etiquetas, informes, pistola y cámara.</summary>
    public static class Codigos
    {
        /// <summary>Código QR, un enlace o un texto en QR.</summary>
        /// <remarks><c>Ecc</c> es <c>L</c>, <c>M</c>, <c>Q</c> o <c>H</c>. El defecto es <c>M</c>.</remarks>
        public const string Qr = "TDQrCode";

        /// <summary>Código de barras, Code 128, EAN.</summary>
        /// <remarks><c>code128</c> para texto. <c>ean13</c> y <c>ean8</c> solo si el valor es numérico de esa longitud. Otro formato se pinta como Code 128.</remarks>
        public const string Barras = "TDBarcode";

        /// <summary>Etiqueta térmica, etiqueta de repuesto, ZPL, milímetros.</summary>
        public const string Etiqueta = "TDLabelDesigner";

        /// <summary>Informe, factura, reporte por bandas, diseñador de reportes.</summary>
        /// <remarks><c>Report</c> elige la plantilla. El defecto es <c>factura</c>. No es la etiqueta térmica.</remarks>
        public const string Informe = "TDReportDesigner";

        /// <summary>Impresoras, conectar impresora, Bluetooth, red.</summary>
        /// <remarks>Con <c>Devices</c> nulo muestra el juego de demostración.</remarks>
        public const string Impresoras = "TDPrinterConnect";

        /// <summary>Pistola USB, lector HID, código que llega como teclado sin foco en un campo.</summary>
        public const string Pistola = "TDHidListener";

        /// <summary>Cámara, escanear, lector con confirmación, scanner.</summary>
        /// <remarks><c>continuous</c> sigue leyendo. <c>single</c> pausa hasta confirmar.</remarks>
        public const string Camara = "TDScanner";
    }

    /// <summary>
    /// Tienda. Siempre es <c>TDEcom</c>. Los productos del sistema van en <c>Products</c>.
    /// Sin <c>Products</c> queda el catálogo de demostración. Un listado operativo o un carrito de líneas propias salen de <see cref="Pantallas"/>.
    /// </summary>
    public static class Ecommerce
    {
        /// <summary>Tarjeta de producto, product card.</summary>
        public const string Tarjeta = """<TDEcom Kind="ecard" Products="productos" />""";

        /// <summary>Ficha de producto, detalle, product detail.</summary>
        public const string Ficha = """<TDEcom Kind="edetail" Products="productos" />""";

        /// <summary>Carrito, cart, drawer del carrito.</summary>
        public const string Carrito = """<TDEcom Kind="ecart" Products="productos" />""";

        /// <summary>Checkout, pago, pasos de compra.</summary>
        public const string Pago = """<TDEcom Kind="echeckout" Products="productos" />""";

        /// <summary>Facetas, filtros de la tienda.</summary>
        public const string Facetas = """<TDEcom Kind="efacets" Products="productos" />""";

        /// <summary>Buscador de la tienda, sugerencias de productos.</summary>
        public const string Buscar = """<TDEcom Kind="esearch" Products="productos" />""";

        /// <summary>Comparar productos, hasta cuatro fichas.</summary>
        /// <remarks>Comparar dos fotos es <c>TDCompare</c>.</remarks>
        public const string Comparar = """<TDEcom Kind="ecompare" Products="productos" />""";

        /// <summary>Oferta relámpago, flash sale, cuenta regresiva.</summary>
        public const string Oferta = """<TDEcom Kind="eflash" Products="productos" />""";

        /// <summary>Reseñas, reviews, estrellas de opiniones.</summary>
        public const string Resenas = """<TDEcom Kind="ereviews" Products="productos" />""";

        /// <summary>Buscar por vehículo, patente, part finder.</summary>
        public const string Vehiculo = """<TDEcom Kind="efinder" Products="productos" />""";

        /// <summary>Cotización, quote, pedido grande a un asesor.</summary>
        public const string Cotizar = """<TDEcom Kind="equote" Products="productos" />""";

        /// <summary>Pedido masivo, CSV, carga por código y cantidad.</summary>
        public const string Masivo = """<TDEcom Kind="ebulk" Products="productos" />""";

        /// <summary>Vistos recientemente, historial de productos.</summary>
        public const string Vistos = """<TDEcom Kind="erecent" Products="productos" />""";

        /// <summary>Aviso de reingreso, avísame cuando haya stock.</summary>
        public const string Reingreso = """<TDEcom Kind="estock" Products="productos" />""";

        /// <summary>Favoritos, listas de deseos, wishlists.</summary>
        public const string Favoritos = """<TDEcom Kind="ewishmulti" Products="productos" />""";

        /// <summary>Seguimiento de pedido, tracking, guía.</summary>
        public const string Seguimiento = """<TDEcom Kind="etrack" Products="productos" />""";

        /// <summary>Comprados juntos, frequently bought.</summary>
        public const string Juntos = """<TDEcom Kind="efbt" Products="productos" />""";

        /// <summary>Sucursales, bodegas, dónde comprar, store locator.</summary>
        public const string Sucursales = """<TDEcom Kind="elocator" Products="productos" />""";

        /// <summary>Crédito de flota, línea de crédito, facturas.</summary>
        public const string Credito = """<TDEcom Kind="ecredit" Products="productos" />""";

        /// <summary>Devolución, RMA, cambio.</summary>
        public const string Devolucion = """<TDEcom Kind="ereturns" Products="productos" />""";
    }

    /// <summary>Tema, organigrama, consola y animación.</summary>
    public static class Utilidades
    {
        /// <summary>Tema, claro, oscuro, Modern, Material, Fluent.</summary>
        /// <remarks>No tiene parámetros. Cambia las variables <c>--td-*</c>.</remarks>
        public const string Tema = "TDThemePicker";

        /// <summary>Organigrama, quién reporta a quién, ficha y correo.</summary>
        /// <remarks>La raíz es un <c>TDOrgNode</c>. <c>SelectedId</c> coincide con <c>Id</c>.</remarks>
        public const string Organigrama = "TDOrganizationChart";

        /// <summary>Consola de demostración, terminal de comandos del catálogo.</summary>
        /// <remarks>No es un terminal del sistema. <c>PartsJson</c> es un arreglo JSON.</remarks>
        public const string Consola = "TDTerminal";

        /// <summary>Animar al entrar en pantalla, animate on scroll.</summary>
        /// <remarks>El dato tiene que poder leerse sin la animación.</remarks>
        public const string Animar = "TDAnimateOnScroll";
    }
}
