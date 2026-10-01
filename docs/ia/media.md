# Media — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDCompare` compara dos estados de una imagen. El comparador de productos es `TDEcom` con `Kind="ecompare"`.
2. `TDImage` no tiene dirección de imagen. Pinta `Alt` sobre `Background`, con vista previa y descarga. No inventes `Src`.
3. `TDGallery` no recibe archivos. Cada pieza es un `TDGalleryItem` (`Title`, `Code`, `Background`).
4. `TDScheduler` no recibe eventos. La agenda vive en el cliente y el componente no tiene parámetros.
5. El carrusel de diapositivas está en la guía de navegación: `TDCarousel`.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Antes y después de una foto | `TDCompare` | `TDEcom Kind="ecompare"` |
| Pieza con título y código en una rejilla | `TDGallery` | `TDImage` si es una sola figura |
| Figura con texto alternativo y vista ampliada | `TDImage` | TDGallery si son varias piezas con código. |
| Agenda de demostración | `TDScheduler` | No le pases citas: no tiene ese parámetro |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| compare | `TDCompare` |
| gallery | `TDGallery` |
| imageview | `TDImage` |
| scheduler | `TDScheduler` |
| pcarousel | `TDCarousel`, documentado en navegación |

## TDCompare

Se arrastra la división entre el estado anterior y el posterior.

```razor
<TDCompare Label="Disco de freno" BeforeLabel="Usado 36 mm" AfterLabel="Nuevo 45 mm" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Label` | `string` | `"Horizontal · arrastrar"` | Título del comparador. | El título por defecto no nombra la pieza. |
| `BeforeLabel` | `string` | `"Antes · disco usado 36 mm"` | Etiqueta del estado anterior. | Siempre el estado anterior real. |
| `AfterLabel` | `string` | `"Después · disco nuevo 45 mm"` | Etiqueta del estado posterior. | Siempre el estado posterior real. |
| `Vertical` | `bool` | `false` | La división se arrastra en vertical. | La comparación se lee de arriba abajo. |
| `FollowMouse` | `bool` | `false` | La división sigue al mouse sin mantener pulsado. | La división debe moverse sin mantener pulsado. |

## TDGallery

Rejilla de piezas con título y código.

```razor
<TDGallery Items="piezas" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Items` | `IReadOnlyList<TDGalleryItem>` | vacío | `Title`, `Code` y `Background` de cada pieza. | Siempre. |

## TDImage

Imagen con pie, vista previa y descarga. `Alt` describe la imagen. No repitas el pie dentro del texto alternativo.

```razor
<TDImage Alt="Disco de freno ventilado" Caption="BR-4521-AD" Background="#1F2327" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Alt` | `string` | `"Imagen"` | Texto alternativo. | Siempre, con una descripción real. |
| `Caption` | `string` | `""` | Pie visible. | Hay un pie que no debe repetirse dentro de Alt. |
| `Background` | `string` | `"#1F2327"` | Color de respaldo. | El color de respaldo no es el de la marca. |
| `Preview` | `bool` | `true` | Permite abrir la vista ampliada. | En falso si no debe ampliarse. |
| `Download` | `bool` | `true` | Muestra la descarga. | En falso si no se descarga. |

## TDScheduler

Agenda de demostración. No declares parámetros: el calendario vive en el cliente.

```razor
<TDScheduler />
```
