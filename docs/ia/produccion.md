# Producción — pantallas con datos del sistema

Úsala cuando el pedido es una aplicación, no una vista del catálogo. El mapa está en `TDArchitecture.Pantallas`. El valor de cada constante es el marcado mínimo. Los nombres de modelo se cambian por los de la aplicación.

## Qué entra en producción

| Pantalla | Constante | De dónde salen los datos |
| --- | --- | --- |
| Alta o edición | `Pantallas.Alta` | El modelo del `EditForm`. Texto, selección simple, fecha, máscara, número e interruptor usan `@bind-Value`. El archivo usa `Field` o `OnChange`. |
| Listado filtrable | `Pantallas.Listado` | `Data` de `TDDataGrid`. `QueryKey` deja orden, filtro y página en la URL. |
| Ficha | `Pantallas.Ficha` | El registro ya cargado, dentro de `TDLayout`, `TDTabs` y `TDCard`. |
| Carrito o líneas | `Pantallas.Carrito` | La lista de la aplicación, pintada dentro de `TDDrawer`. |
| Tablero | `Pantallas.Tablero` | `TDTileItem` armados con los totales reales. |
| Foto | `Pantallas.Foto` | `Src` de `TDImage`. |
| Agenda | `Pantallas.Agenda` | `Appointments` y `Resources` de `TDScheduler`. `Name` devuelve las citas en el post. |
| Gráfico | `Pantallas.Grafico` | `Series` y `Categories` de `TDChart`. Sin `Series` queda la lámina del catálogo. |
| Tienda | `Pantallas.Tienda` | `Products` de `TDEcom`. Sin `Products` queda el catálogo de demostración. |
| Teléfono de bodega | `Pantallas.Telefono` | Barra, turno, pasos, escaneo, cantidad, confirmación y navegación. La cámara sigue siendo `TDScanner`. |
| Flota en el mapa | `Pantallas.Mapa` | `Units` de `TDMaps`: posición, `Route` con las coordenadas ya recorridas y paradas. `MatchRoute` reconstruye esa lista por calles. |
| Dónde estoy | `Pantallas.Ubicacion` | `TDMapUser` con el nombre y el rol de la sesión. La coordenada sale del equipo. |
| Ruta con entregas | `Pantallas.Ruta` | `Origin`, `Destination` y `Deliveries` de `TDMapRoute`. El orden de la lista es el orden de visita. |

## Qué se queda en el catálogo

Estas vistas enseñan el diseño. No leen el modelo de la aplicación.

| Pedido | No emitas | Emite |
| --- | --- | --- |
| Tienda con productos del sistema | `TDEcom` sin `Products` | `Pantallas.Tienda` |
| Listado operativo o carrito de líneas propias | `TDEcom` | `Pantallas.Listado` o `Pantallas.Carrito` |
| Cifras en un gráfico | `TDChart` sin `Series` | `Pantallas.Grafico` |
| Agenda del catálogo, sin citas del sistema | `TDScheduler` sin `Appointments` | `Pantallas.Agenda` |
| Consola del servidor | `TDTerminal` | No es un terminal del sistema. |
| Foto de un registro | `TDImage` sin `Src` | `Pantallas.Foto` |
| Flota real en el mapa | `TDMaps` sin `Units` | `Pantallas.Mapa` |

`TDChart` sin `Series` y `TDEcom` sin `Products` reproducen la lámina del catálogo. Con `Series` o `Products` pintan los datos del sistema. Una lista vacía deja el gráfico o la tienda vacíos.
