# Mapas — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El mapa es OpenStreetMap, pintado en el navegador. No usa un proveedor de pago.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDMaps` muestra uno o varios pilotos o vehículos. Cada uno es un `TDMapUnit`.
2. Sin `Units` queda la flota de demostración. Una lista vacía es un mapa real sin marcas.
3. La ficha sale de los campos del objeto: nombre, tipo, estado, vehículo, patente, detalle, momento y coordenada. El estado va escrito, no solo con color.
4. `Route` es la lista de coordenadas por donde pasó el piloto, en orden. `MatchRoute` vale true si se omite y reconstruye esa lista por calles. En false, une los puntos en línea recta. `Stops` son las paradas ejecutadas. `ShowRoute` y `ShowStops` valen true si se omiten.
5. Para mover una marca, vuelve a pintar `TDMaps` con el mismo `Id` y la nueva latitud y longitud.
6. `TDMapUser` es la persona que tiene la sesión en este equipo. La coordenada la entrega el navegador. `Name` y `Role` salen de la sesión.
7. `TDLocate` es un botón. Al hacer clic lee la ubicación actual de este equipo y llena `Latitud`, `Longitud` y `Precision` para el formulario. No abre un mapa.
8. `TDMapRoute` calcula el camino por calles de `Origin` a `Destination`. `Deliveries` son las entregas, en el orden de la lista. Una lista vacía es la ruta directa.
9. `TileUrl` es una plantilla `https://…/{z}/{x}/{y}.png`. Otro esquema se ignora y queda OpenStreetMap.
10. `RouterUrl` es un servidor OSRM. El defecto es el servicio público de demostración. En producción usa el servidor propio.

## Qué componente elegir

| Necesitas | Tag |
| --- | --- |
| Ver 1 o N pilotos, el recorrido reconstruido y las paradas | `TDMaps` |
| Reconstruir el camino ya recorrido desde una lista de coordenadas | `TDMaps` con `MatchRoute="true"` |
| Calcular de un punto A a un punto B con entregas | `TDMapRoute` |
| Ver dónde está quien inició sesión y el trazo de esta visita | `TDMapUser` |
| Un botón que obtiene la ubicación actual y la deja en el formulario | `TDLocate` |
| Una pantalla de flota con datos del sistema | `Pantallas.Mapa` |
| La ubicación de la sesión en el mapa | `Pantallas.Ubicacion` |
| El punto actual, sin mapa | `Pantallas.Punto` |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| maps | `TDMaps` |
| maptrace | `TDMaps` con `MatchRoute` |
| mapuser | `TDMapUser` |
| locate | `TDLocate` |
| maproute | `TDMapRoute` |

## TDMaps

```razor
<TDMaps Title="Pilotos en ruta" Units="pilotos" MatchRoute="true" />

@code {
    private readonly TDMapUnit[] pilotos =
    [
        new("cr", "Camila Rojas", 14.626, -90.560, "Piloto", "En ruta", "Volvo FH", "ABCD-12",
            "Pedido OC-00481", "Hace 1 minuto",
            [new(14.526, -90.588), new(14.626, -90.560)],
            [new("Bodega Villa Nueva", 14.526, -90.588, "08:10", "Cargó 3 repuestos")])
    ];
}
```

| Parámetro | Uso |
| --- | --- |
| `Units` | Lista de `TDMapUnit`. Null es la demostración. Vacía no inventa marcas. |
| `Title` | Título visible. El defecto es Pilotos en ruta. |
| `Height` | Alto CSS. El defecto es 480px. |
| `MapId` | Conserva el encuadre entre actualizaciones. El defecto es pilotos. |
| `ShowRoute` | Dibuja `Route`. El defecto es true. |
| `MatchRoute` | Reconstruye `Route` por calles. El defecto es true. En false une las coordenadas en línea recta. |
| `Profile` | `driving`, `walking` o `cycling`. El defecto es driving. |
| `RouterUrl` | Servidor que reconstruye el recorrido. El defecto es `https://router.project-osrm.org`. En producción usa el servidor propio. |
| `ShowStops` | Dibuja `Stops`. El defecto es true. |
| `TileUrl` | Plantilla `{z}/{x}/{y}` en http o https. |
| `Attribution` | Nombre del mapa. El defecto es OpenStreetMap. |

`TDMapPoint` es latitud y longitud. Pásala en `Route`, en el orden en que el piloto pasó por ahí. Con dos o más puntos el mapa reconstruye el camino por calles y muestra distancia y tiempo. Una lista vacía no inventa un recorrido. Si no hay camino, el mapa lo dice y deja la línea entre las coordenadas. `TDMapStop` suma el lugar, el momento y la nota.

## TDMapUser

```razor
<TDMapUser Name="@usuario.Nombre" Role="@usuario.Rol" />
```

| Parámetro | Uso |
| --- | --- |
| `Name` | Persona de la sesión. El defecto es Tú. |
| `Role` | Rol o turno. El defecto es Sesión actual. |
| `Title` | Título visible. El defecto es Tu ubicación. |
| `Height` | Alto CSS. El defecto es 480px. |
| `MapId` | El defecto es usuario. |
| `Follow` | Centra el mapa mientras se desplaza. El defecto es true. |
| `ShowTrail` | Trazo de esta visita. El defecto es true. |
| `TileUrl` | Igual que en `TDMaps`. |
| `Attribution` | Igual que en `TDMaps`. |

Si el equipo niega la ubicación, el mapa dice qué pasó y ofrece Reintentar ubicación.

## TDLocate

Un botón. Al hacer clic lee la ubicación actual de este equipo. No abre un mapa.

```razor
<TDLocate />
```

| Parámetro | Uso |
| --- | --- |
| `Label` | Texto del botón. El defecto es Obtener mi ubicación. |
| `UpdateLabel` | Texto después de una lectura correcta. El defecto es Actualizar ubicación. |
| `RetryLabel` | Texto cuando falla. El defecto es Reintentar ubicación. |
| `PendingText` | Texto mientras lee. El defecto es Buscando tu ubicación…. |
| `Hint` | Qué va a pasar, antes del primer clic. |
| `LatitudeName` | Campo del post. El defecto es `Latitud`. El valor usa punto decimal. |
| `LongitudeName` | Campo del post. El defecto es `Longitud`. |
| `AccuracyName` | Precisión en metros. El defecto es `Precision`. |

La coordenada visible incluye el hemisferio. La precisión va en metros, con texto. Si el navegador no tiene ubicación, o el equipo niega el permiso, el botón dice qué pasó y pasa a Reintentar ubicación.

## TDMapRoute

Calcula el camino por calles. Las entregas se visitan en el orden de la lista, entre la salida y la llegada.

```razor
<TDMapRoute Origin="salida" Destination="llegada" Deliveries="entregas" />
```

| Parámetro | Uso |
| --- | --- |
| `Origin` | Punto A. `TDMapStop` con nombre y coordenada. |
| `Destination` | Punto B. Sin este dato no se calcula. |
| `Deliveries` | Entregas intermedias, en orden. Vacía es la ruta directa. Máximo 20. |
| `Title` | El defecto es Ruta de entregas. |
| `Height` | Alto CSS. El defecto es 480px. |
| `MapId` | El defecto es ruta. |
| `Profile` | `driving`, `walking` o `cycling`. El defecto es driving. |
| `RouterUrl` | Servidor OSRM. El defecto es `https://router.project-osrm.org`. |
| `TileUrl` | Igual que en `TDMaps`. |
| `Attribution` | Igual que en `TDMaps`. |

El mapa muestra distancia y tiempo total, y el tramo desde la parada anterior en cada entrega. Si no hay camino, dice qué pasó y ofrece Reintentar ruta.

