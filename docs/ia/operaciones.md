# Operaciones — contrato de uso para IA

Piso de bodega: andén, conteo, incidencia, ruta, pallet, relevo, reposición, ubicación sugerida, calidad y despacho. No es el teléfono de [mobile.md](mobile.md) y no abre la cámara. El mapa está en `TDArchitecture.Operaciones`.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. Hay diez componentes. No existe un `TDOperaciones` con `Kind`.
2. `TDDockBoard` con `Doors` nulo o vacío dice que no hay puertas. No inventa un muelle.
3. `TDCountDiff` publica las unidades contadas en `Name`. El defecto es `contado`.
4. `TDReplenLine` publica las unidades movidas en `Field`. El defecto es `movidas`.
5. El estado siempre va escrito. `TDMobileTone` solo refuerza el color.
6. `TDSlotCheck` no abre la cámara. Si las ubicaciones no coinciden, dice que no se deje el artículo.
7. `TDShiftNote` es el relevo. La conexión del teléfono sigue siendo `TDShiftBar`.
8. Una incidencia dice qué pasó, qué hacer ahora y a quién pedir ayuda.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Puertas del andén y el transportista | `TDDockBoard` | `TDJobList` si la cola es de tareas, no de camiones |
| Esperado contra contado | `TDCountDiff` | `TDQtyPad` si no hay una existencia del sistema |
| Qué falló y a quién avisar | `TDIssueCard` | `TDAlert` si el aviso no es una incidencia de piso |
| Una parada de la ruta | `TDRouteStop` | `TDDataGrid` si es el listado de escritorio |
| Capas, peso y mezcla de un pallet | `TDPalletBuild` | `TDProgressBar` si no hay un armado |
| Lo que dejó el turno anterior | `TDShiftNote` | `TDShiftBar` si solo importa la conexión |
| Mover de reserva a picking | `TDReplenLine` | `TDPickLine` si la orden pide retirar, no reponer |
| Sugerida contra escaneada | `TDSlotCheck` | `TDBinCard` si solo se muestra la ficha |
| Un lote que calidad retuvo | `TDQcHold` | `TDBadge` si hace falta cantidad y responsable |
| Cerrar un despacho con sello | `TDDispatchCard` | `TDConfirmSheet` si no hay andén ni hora de salida |

## Tipos

`TDDockDoor` — `Id`, `Door`, `Carrier`, `Status`, `When`, `Tone`, `Href`. Lo usa `TDDockBoard`. `Status` es el texto: Libre, Descargando, Cargando o Bloqueada. `Href` abre la puerta. Si se omite, la fila no es un enlace.

## TDDockBoard

```razor
<TDDockBoard Doors="muelles" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Doors` | `IReadOnlyList<TDDockDoor>?` | `null` | Puertas del turno. | Siempre. Vacío dice que no hay asignación. |

## TDCountDiff

```razor
<TDCountDiff Sku="BR-4521-AD" Location="Pasillo A · rack 12 · nivel 2" Expected="24" Counted="21" Unit="unidades" Name="contado" />
```

Sumar y quitar no bajan de cero. El aviso dice si coincide, falta o sobra.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Artículo contado. | Siempre. |
| `Location` | `string` | `""` | Dónde se contó. | Siempre. |
| `Expected` | `int` | `0` | Existencia del sistema. | Siempre. |
| `Counted` | `int` | `0` | Lo que la persona ya contó. | Hay un conteo parcial. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |
| `Name` | `string?` | `null` | Campo del post. Vacío usa `contado`. | El formulario guarda el conteo. |

## TDIssueCard

```razor
<TDIssueCard Title="Faltan 3 pastillas" What="El conteo quedó abierto. La mercadería no se movió." Next="Vuelve a contar el casillero o deja la incidencia para el supervisor." Tone="TDMobileTone.Warning" HelpHref="/supervisor" HelpLabel="Pedir ayuda al supervisor de turno" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Title` | `string` | `Incidencia` | Qué falló, en una frase. | Siempre. |
| `What` | `string` | `""` | Qué pasó y qué no se movió. | Siempre. |
| `Next` | `string` | `""` | Qué hacer ahora. | Siempre. |
| `Tone` | `TDMobileTone` | `Warning` | Énfasis. No reemplaza el texto. | El caso no es neutro. |
| `HelpHref` | `string?` | `null` | Destino de ayuda humana. | Hay un responsable. |
| `HelpLabel` | `string?` | `null` | A quién se pide ayuda. | Hay `HelpHref`. |

## TDRouteStop

```razor
<TDRouteStop Sequence="2" Customer="Taller Los Andes" Address="Av. Vicuña Mackenna 4200, La Florida" Window="Entre 14:00 y 16:00" Packages="8" Status="En ruta" Tone="TDMobileTone.Success" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sequence` | `int` | `1` | Orden de la parada, desde 1. | Siempre. |
| `Customer` | `string` | `""` | Cliente o destino. | Siempre. |
| `Address` | `string` | `""` | Dirección en palabras. | Siempre. |
| `Window` | `string` | `""` | Horario de entrega. | Hay ventana. |
| `Packages` | `int` | `0` | Bultos de la parada. | Siempre. |
| `Status` | `string` | `""` | En ruta, Entregada o Demorada. | Siempre. |
| `Tone` | `TDMobileTone` | `Neutral` | Énfasis. No reemplaza `Status`. | El estado no es neutro. |

## TDPalletBuild

```razor
<TDPalletBuild Code="PLT-1842" Title="Pastillas de freno delanteras" Layers="3" LayerTarget="4" WeightKg="820" MaxWeightKg="900" Mixed="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Code` | `string` | `""` | Licencia o código del pallet. | Siempre. |
| `Title` | `string` | `Armado` | Qué se está armando. | Siempre. |
| `Layers` | `int` | `0` | Capas ya colocadas. | Siempre. |
| `LayerTarget` | `int` | `0` | Capas que pide el armado. | Hay un objetivo. |
| `WeightKg` | `decimal` | `0` | Peso actual, en kilogramos. | Siempre. |
| `MaxWeightKg` | `decimal` | `0` | Peso máximo permitido. | Hay tope. |
| `Mixed` | `bool` | `false` | El pallet junta más de un artículo. | Hay mezcla. |

## TDShiftNote

```razor
<TDShiftNote From="María Soto" At="Hoy a las 14:00, bodega Quilicura" Note="El muelle 2 sigue descargando. El lote L-904 está en calidad y no se mueve." OpenTasks="2" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `From` | `string` | `""` | Quién entrega el turno. | Siempre. |
| `At` | `string` | `""` | Cuándo lo dejó. | Siempre. |
| `Note` | `string` | `""` | Lo que el siguiente turno tiene que saber. | Siempre. |
| `OpenTasks` | `int` | `0` | Tareas que siguen abiertas. Cero cierra la cola. | Siempre. |

## TDReplenLine

```razor
<TDReplenLine Sku="BR-4521-AD" Name="Pastilla de freno delantera" From="Reserva · pasillo C · rack 3" To="Picking · pasillo A · rack 12" Needed="12" Moved="4" Unit="unidades" Field="movidas" />
```

Mover y devolver no pasan de cero ni de `Needed`.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Código. | Siempre. |
| `Name` | `string` | `""` | Artículo. | Siempre. |
| `From` | `string` | `""` | Reserva, de donde se saca. | Siempre. |
| `To` | `string` | `""` | Picking, a donde se lleva. | Siempre. |
| `Needed` | `int` | `0` | Unidades que pide la reposición. | Siempre. |
| `Moved` | `int` | `0` | Unidades ya movidas. | Hay un avance. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |
| `Field` | `string?` | `null` | Campo del post. Vacío usa `movidas`. | El formulario guarda el movimiento. |

## TDSlotCheck

```razor
<TDSlotCheck Sku="BR-4521-AD" Suggested="A-12-2-04" Scanned="B-04-1-02" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Sku` | `string` | `""` | Artículo que se guarda. | Siempre. |
| `Suggested` | `string` | `""` | Ubicación que propone el sistema. | Siempre. |
| `Scanned` | `string` | `""` | Ubicación leída. Vacío dice que no hay lectura. | Después del lector. |

## TDQcHold

```razor
<TDQcHold Lot="L-904" Reason="El empaque llegó abierto. Calidad tiene que revisarlo." Quantity="48" Unit="unidades" Owner="Camila Ríos, calidad" Tone="TDMobileTone.Danger" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Lot` | `string` | `""` | Lote retenido. | Siempre. |
| `Reason` | `string` | `""` | Por qué está en espera. | Siempre. |
| `Quantity` | `int` | `0` | Unidades retenidas. | Siempre. |
| `Unit` | `string` | `unidades` | Unidad. | Siempre. |
| `Owner` | `string?` | `null` | Quién puede liberarlo. Vacío: nadie del piso. | Hay un responsable. |
| `Tone` | `TDMobileTone` | `Danger` | Énfasis. No reemplaza `Reason`. | El caso no es neutro. |

## TDDispatchCard

```razor
<TDDispatchCard Order="OC-00481" Door="Muelle 4" Departs="Hoy a las 17:10" Status="Falta el sello" Tone="TDMobileTone.Warning" ActionHref="/anden" ActionLabel="Cerrar despacho OC-00481" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Order` | `string` | `""` | Orden o guía. | Siempre. |
| `Door` | `string` | `""` | Andén de salida. | Siempre. |
| `Departs` | `string` | `""` | Hora de salida. | Siempre. |
| `Seal` | `string?` | `null` | Número de sello. Vacío se lee como sin sello. | Ya se selló. |
| `Status` | `string` | `""` | Listo, Falta sello o Demorado. | Siempre. |
| `Tone` | `TDMobileTone` | `Neutral` | Énfasis. No reemplaza `Status`. | El estado no es neutro. |
| `ActionHref` | `string?` | `null` | Destino de la acción. | Hay un cierre. |
| `ActionLabel` | `string?` | `null` | Consecuencia, por ejemplo cerrar esa orden. | Hay `ActionHref`. |
