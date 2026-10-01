# Feedback — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. No existen `TDAlert`, `TDNotificationHost` ni `TDProgressBar`.
2. El aviso que se queda junto al campo es `TDMessage`, del módulo Forms. El aviso flotante es `TDToast`.
3. `TDProgress` siempre tiene un valor. No tiene modo indeterminado. La espera sin cifra es `TDLoader` o `TDSkeleton`.
4. El color del `TDBadge` no es el único dato. El texto tiene que decir el estado. `Dot` solo si ese texto ya está al lado.
5. `TDTooltip` no puede ser la única explicación de una acción.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Estado corto junto a un texto | `TDBadge` | `TDChip` si la persona lo quita o lo elige |
| Aviso que permanece en la página | `TDMessage` | `TDToast` |
| Aviso que aparece y no ocupa el formulario | `TDToast` | `TDMessage` |
| Avance conocido, de 0 a `Max` | `TDProgress` | `TDLoader` |
| Espera sin porcentaje | `TDLoader` | `TDProgress` |
| Reservar el alto mientras llegan los datos | `TDSkeleton` | `TDLoader` si ya sabes el tamaño del hueco |
| Frase de ayuda sobre un control | `TDTooltip` | `TDPopup` si el contenido es un bloque |

El diálogo y el panel lateral están en la guía de layout: `TDDialog` y `TDDrawer`.

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| alert | `TDMessage` |
| badge | `TDBadge` |
| toast | `TDToast` |
| progress | `TDProgress` para el avance con valor. `TDLoader` para la espera sin cifra |
| skel | `TDSkeleton` |
| tip | `TDTooltip` |
| modal | `TDDialog` |
| drawer | `TDDrawer` |

## Tipos compartidos

`TDBadgeVariant` — `Neutral` (default), `Success`, `Warning`, `Danger`, `Info`, `Primary`.

`TDToastItem` — `Title`, `Text`, `Severity` (`TDSeverity`, default `Info`).

`TDSeverity` — `Info`, `Success`, `Warning`, `Danger`, `Secondary`.

`TDSize` — `Small`, `Medium`, `Large`. Lo usa el alto de `TDProgress`.

## TDBadge

Marca corta de estado.

```razor
<TDBadge Variant="TDBadgeVariant.Warning">Pocas unidades</TDBadge>
<TDBadge Variant="TDBadgeVariant.Danger" Dot="true" />
<span>Agotado</span>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Variant` | `TDBadgeVariant` | `Neutral` | Énfasis del color. | El color acompaña al texto. |
| `Dot` | `bool` | `false` | Muestra un punto en lugar del texto. | El estado ya está escrito al lado. |
| `ChildContent` | contenido | — | Texto del estado. | Siempre que `Dot` sea falso. |

## TDToast

Avisos flotantes. No ocupan un lugar fijo del formulario.

```razor
<TDToast Items="@(new[] { new TDToastItem("Guardado", "El pedido 1042 quedó registrado.", TDSeverity.Success) })" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IReadOnlyList<TDToastItem>` | vacío | Avisos visibles. | Siempre que haya un aviso. |

## TDProgress

Barra de avance entre cero y `Max`.

```razor
<TDProgress Value="72" Max="100" ShowValue="true" Suffix="%" Label="Despachos del día" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Value` | `double` | `0` | Avance actual. | Siempre. |
| `Max` | `double` | `100` | Tope. | La escala no es 100. |
| `ShowValue` | `bool` | `false` | Muestra el número junto a la barra. | La cifra debe leerse junto a la barra, no solo por el largo. |
| `Label` | `string?` | `null` | Qué está avanzando. | Siempre que el número solo no se entienda. |
| `Size` | `TDSize` | `Medium` | Alto: `Small`, `Medium` o `Large`. | La barra va en una zona densa (Small) o destacada (Large). |
| `Suffix` | `string?` | `null` | Unidad junto al valor, por ejemplo `%`. | El número necesita unidad, por ejemplo %.  |

## TDLoader

Indicador de espera con un texto. El texto tiene que decir qué se está cargando.

```razor
<TDLoader Label="Buscando repuestos" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Label` | `string` | `"Cargando"` | Qué se está cargando. | Siempre, con el dato real. |

## TDSkeleton

Bloque de carga con el tamaño del contenido que va a aparecer. `Width` y `Height` son CSS.

```razor
<TDSkeleton Width="100%" Height="48px" />
<TDSkeleton Width="40px" Height="40px" Circle="true" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Width` | `string` | `"100%"` | Ancho CSS. | El hueco no ocupa todo el ancho del padre. |
| `Height` | `string` | `"16px"` | Alto CSS. | Ajústalo al alto del contenido real. |
| `Circle` | `bool` | `false` | Lo dibuja redondo. | El hueco es un avatar. |

## TDTooltip

Ayuda breve que aparece sobre su contenido.

```razor
<TDTooltip Text="Copia el código del repuesto">
    <TDButton ButtonType="TDButtonType.Button" Variant="TDVariant.Ghost">Copiar</TDButton>
</TDTooltip>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Text` | `string` | `""` | Ayuda. | Una frase. La acción también tiene texto visible. |
| `ChildContent` | contenido | — | Elemento que dispara la ayuda. | Siempre. |
