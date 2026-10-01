namespace TDComponents.Architecture;

public static partial class TDArchitecture
{
    /// <summary>Tablas, páginas y árboles de datos.</summary>
    public static class Data
    {
        /// <summary>Tabla de objetos, listado, grilla, repuestos, pedidos, ordenar, filtrar, paginar.</summary>
        /// <remarks>No acepta <c>@bind-Value</c>. La fila elegida es <c>SelectedId</c> con <c>RowId</c>. No existen <c>GridFilterMode</c>, <c>EditMode</c> ni <c>AllowColumnResize</c>. El filtro es <c>TDFilterMode</c>, el redimensionado es <c>AllowResize</c> y el guardado es <c>FormName</c> con <c>OnSubmit</c>.</remarks>
        public const string Tabla = "TDDataGrid";

        /// <summary>Columna de la grilla, celda, total, columna fija, plantilla de celda.</summary>
        /// <remarks>Va dentro de <c>Columns</c>. Sin <c>Template</c>, <c>Kind</c> decide la cara y el filtro. <c>Width</c> en 0 no fija el ancho.</remarks>
        public const string Columna = "TDColumn";

        /// <summary>Tabla sin modelo, DataTable, ADO.NET, procedimiento almacenado.</summary>
        /// <remarks>Las columnas salen del esquema. No declares <c>TDColumn</c>.</remarks>
        public const string TablaAdo = "TDDataTable";

        /// <summary>Paginación fuera de la grilla, páginas como URL.</summary>
        /// <remarks>Sin <c>HrefForPage</c> los controles no navegan. La grilla ya pagina sola.</remarks>
        public const string Paginas = "TDPager";

        /// <summary>Árbol de categorías para recorrer, jerarquía de datos, no un desplegable.</summary>
        /// <remarks><c>Text</c> es obligatorio. Para elegir un nodo dentro de un formulario usa el árbol de Forms.</remarks>
        public const string Arbol = "TDTree";
    }

    /// <summary>Menús, pestañas, migas, pasos y barras.</summary>
    public static class Navegacion
    {
        /// <summary>Secciones que se pliegan, ayuda, filtros secundarios, acordeón.</summary>
        /// <remarks>No es la navegación principal. <c>Single</c> deja una sola abierta.</remarks>
        public const string Acordeon = "TDAccordion";

        /// <summary>Ruta, migas de pan, dónde estoy, breadcrumb.</summary>
        /// <remarks>En cada <c>TDOption</c>, <c>Label</c> es el texto y <c>Hint</c> es el destino. El último es la página actual.</remarks>
        public const string Migas = "TDBreadcrumb";

        /// <summary>Carrusel, banner, diapositivas que rotan.</summary>
        /// <remarks>Recibe <c>Slides</c> de tipo <c>TDSlide</c>. No es genérico y no tiene <c>TItem</c>.</remarks>
        public const string Carrusel = "TDCarousel";

        /// <summary>Clic derecho, menú contextual.</summary>
        public const string ClicDerecho = "TDContextMenu";

        /// <summary>Enlace, link, ir a una URL.</summary>
        /// <remarks>Con <c>Button</c> se ve como botón y no envía formularios. Para enviar usa el botón de Forms.</remarks>
        public const string Enlace = "TDLink";

        /// <summary>Barra de menú con submenús, menú del sitio.</summary>
        public const string MenuSitio = "TDMenu";

        /// <summary>Menú de módulos de la aplicación, menú lateral de app.</summary>
        /// <remarks>Los módulos van en <c>Modules</c>. No existe un parámetro <c>Source</c> para un JSON.</remarks>
        public const string MenuModulos = "TDMenuApp";

        /// <summary>Marco de la aplicación con cabecera y menú de módulos.</summary>
        public const string MarcoApp = "TDMenuAppShell";

        /// <summary>Mega menú, paneles anchos de navegación.</summary>
        public const string MegaMenu = "TDNavigationMenu";

        /// <summary>Menú de cuenta, configuración, ajustes en secciones.</summary>
        public const string MenuCuenta = "TDPanelMenu";

        /// <summary>Menú de la persona, usuario autenticado, cerrar sesión, avatar.</summary>
        /// <remarks>Reemplaza nombre, cargo, correo e iniciales de demostración.</remarks>
        public const string MenuPersona = "TDProfileMenu";

        /// <summary>Pasos de un proceso, wizard, checkout visual, seguimiento.</summary>
        /// <remarks><c>Current</c> empieza en cero. No son pestañas.</remarks>
        public const string Pasos = "TDSteps";

        /// <summary>Pestañas, tabs, vistas de la misma página.</summary>
        /// <remarks>El <c>Name</c> del panel tiene que coincidir con el <c>Value</c> de la pestaña y con <c>Selected</c>.</remarks>
        public const string Pestanas = "TDTabs";

        /// <summary>Índice de la página, en esta página, tabla de contenidos, TOC.</summary>
        /// <remarks><c>Target</c> es el id del contenedor. En <c>Items</c>, <c>Value</c> es el ancla.</remarks>
        public const string Indice = "TDToc";

        /// <summary>Barra de acciones, toolbar, nuevo y exportar.</summary>
        /// <remarks>Las zonas son <c>Start</c>, <c>Center</c> y <c>End</c>. No es el menú del sitio.</remarks>
        public const string Acciones = "TDToolbar";
    }
}
