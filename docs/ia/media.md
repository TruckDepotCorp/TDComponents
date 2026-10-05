# Media — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDCompare` compara dos estados de una imagen. El comparador de productos es `TDEcom` con `Kind="ecompare"`.
2. `TDImage` muestra la foto de la aplicación con `Src`. Sin `Src` pinta `Alt` sobre `Background`, que es la vista del catálogo.
3. `TDGallery` no recibe archivos. Cada pieza es un `TDGalleryItem` (`Title`, `Code`, `Background`).
4. `TDScheduler` sin `Appointments` muestra la semana del catálogo. Una lista vacía es una agenda real sin trabajos. `Name` publica las citas en el post.
5. El carrusel de diapositivas está en la guía de navegación: `TDCarousel`.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Antes y después de una foto | `TDCompare` | `TDEcom Kind="ecompare"` |
| Pieza con título y código en una rejilla | `TDGallery` | `TDImage` si es una sola figura |
| Figura con texto alternativo y vista ampliada | `TDImage` | TDGallery si son varias piezas con código. |
| Agenda con citas del sistema | `TDScheduler` | `TDChart` para un calendario de números |

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
<TDImage Src="@parte.Foto" Alt="Disco de freno ventilado" Caption="BR-4521-AD" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Src` | `string?` | `null` | Dirección de la imagen de la aplicación. | Una ficha o un listado real. Sin ella queda la vista de catálogo. Se rechazan `javascript:` y `data:`. |
| `Alt` | `string` | `"Imagen"` | Texto alternativo. | Siempre, con una descripción real. |
| `Caption` | `string` | `""` | Pie visible. | Hay un pie que no debe repetirse dentro de Alt. |
| `Background` | `string` | `"#1F2327"` | Color de respaldo. | El color de respaldo no es el de la marca. |
| `Preview` | `bool` | `true` | Permite abrir la vista ampliada. | En falso si no debe ampliarse. |
| `Download` | `bool` | `true` | Muestra la descarga. | En falso si no se descarga. |

## TDScheduler

Calendario de trabajos. Sin `Appointments` pinta la semana de demostración. Con citas, pinta las de la aplicación. El horario visible va de 07:00 a 20:00, en pasos de 15 minutos. Las fechas van en `yyyy-MM-dd` y las horas en `HH:mm`.

```razor
<TDScheduler Date="@hoy" View="week" Resources="bahias" Appointments="citas" Name="agenda" />
```

`bahias` es `IReadOnlyList<TDScheduleResource>` y `citas` es `IReadOnlyList<TDAppointment>`. Si `Name` está puesto, al guardar, mover o eliminar el campo oculto lleva un JSON de `TDAppointment`: `Id`, `Title`, `Date`, `Start`, `End`, `ResourceId`, `Note`.

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Appointments` | `IReadOnlyList<TDAppointment>?` | `null` | Citas del sistema. | Una agenda real. `null` deja la demostración. Vacío deja el calendario sin trabajos. |
| `Resources` | `IReadOnlyList<TDScheduleResource>?` | `null` | Bahías, personas o equipos. | Los recursos no son las cuatro bahías del catálogo. `null` las deja. |
| `Date` | `string?` | `null` | Día inicial, `yyyy-MM-dd`. | La agenda debe abrir en un día distinto de hoy. |
| `View` | `string` | `"week"` | `day`, `week`, `month`, `agenda` o `resources`. | La vista inicial no es la semana. |
| `Name` | `string?` | `null` | Campo oculto con el JSON de las citas actuales. | El formulario tiene que guardar los cambios de la agenda. |
| `ReadOnly` | `bool` | `false` | Se puede cambiar el día y la vista, no los trabajos. | La persona no debe crear, mover ni borrar citas. |
