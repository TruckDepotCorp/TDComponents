namespace TDComponents;

/// <summary>Punto de una ruta recorrida.</summary>
/// <param name="Latitude">Latitud en grados. Sur es negativo.</param>
/// <param name="Longitude">Longitud en grados. Oeste es negativo.</param>
public sealed record TDMapPoint(double Latitude, double Longitude);

/// <summary>Parada ya ejecutada por un piloto o un vehículo.</summary>
/// <param name="Name">Lugar de la parada.</param>
/// <param name="Latitude">Latitud en grados.</param>
/// <param name="Longitude">Longitud en grados.</param>
/// <param name="At">Momento de la parada, como texto ya formateado.</param>
/// <param name="Note">Qué se hizo en esa parada.</param>
public sealed record TDMapStop(
    string Name,
    double Latitude,
    double Longitude,
    string? At = null,
    string? Note = null);

/// <summary>Piloto o vehículo que se dibuja en <c>TDMaps</c>.</summary>
/// <param name="Id">Identificador estable. Sirve para actualizar la misma marca cuando cambia la posición.</param>
/// <param name="Name">Nombre que se lee en la ficha y en la lista.</param>
/// <param name="Latitude">Latitud actual.</param>
/// <param name="Longitude">Longitud actual.</param>
/// <param name="Kind">Piloto o Vehículo. Es el texto que se muestra.</param>
/// <param name="Status">Estado escrito: En ruta, Detenido u otro texto de la aplicación.</param>
/// <param name="Vehicle">Vehículo que conduce o que se está viendo.</param>
/// <param name="Plate">Patente.</param>
/// <param name="Detail">Línea de contexto: pedido, cliente o destino.</param>
/// <param name="Updated">Cuándo llegó la última posición, como texto.</param>
/// <param name="Route">Coordenadas por donde ya pasó, en orden. <c>TDMaps</c> reconstruye ese recorrido por calles.</param>
/// <param name="Stops">Paradas ejecutadas.</param>
public sealed record TDMapUnit(
    string Id,
    string Name,
    double Latitude,
    double Longitude,
    string Kind = "Piloto",
    string Status = "En ruta",
    string? Vehicle = null,
    string? Plate = null,
    string? Detail = null,
    string? Updated = null,
    IReadOnlyList<TDMapPoint>? Route = null,
    IReadOnlyList<TDMapStop>? Stops = null);
