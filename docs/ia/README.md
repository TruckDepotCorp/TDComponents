# TDComponents — documentación para IA

Esta carpeta es el contrato de uso de la biblioteca. Ante un pedido en lenguaje natural, empieza por [arquitectura.md](arquitectura.md). Esa página traduce la frase a un tag. Después abre la guía del módulo y no agregues parámetros que no estén ahí.

El mismo mapa viaja en el paquete como el tipo `TDComponents.Architecture.TDArchitecture`. No es un control visual. El valor de cada constante es el marcado que hay que emitir.

## Qué lee una IA

| Dónde está la IA | Qué lee primero | Qué lee después |
| --- | --- | --- |
| Este repositorio | [arquitectura.md](arquitectura.md) | La guía del módulo. |
| Un proyecto que solo referencia el NuGet | `TDArchitecture` dentro de `TDComponents.xml` | El XML del componente elegido. El empaquetado deja ese archivo junto a la DLL. |

## Guías

| Módulo | Guía | XML en el componente |
| --- | --- | --- |
| Arquitectura, el mapa de frases | [arquitectura.md](arquitectura.md) | El tipo `TDArchitecture` y cada intención. |
| Forms | [forms.md](forms.md) | Cada componente y cada parámetro. |
| Data | [data.md](data.md) | Cada componente y cada parámetro. |
| Navegación | [navegacion.md](navegacion.md) | Cada componente y cada parámetro. |
| Layout | [layout.md](layout.md) | Cada componente y cada parámetro. |
| Media | [media.md](media.md) | Cada componente y cada parámetro. |
| Feedback | [feedback.md](feedback.md) | Cada componente y cada parámetro. |
| Charts | [charts.md](charts.md) | Cada componente y cada parámetro. |
| Códigos | [codigos.md](codigos.md) | Cada componente y cada parámetro. |
| Ecommerce | [ecommerce.md](ecommerce.md) | Cada componente y cada parámetro. |
| Utilidades | [utilidades.md](utilidades.md) | Cada componente y cada parámetro. |

## Reglas

1. Si un parámetro no está en el documento del módulo, no existe. No lo agregues.
2. El nombre del catálogo (`ProductCard`, `FormField`, `TDLineSeries`, `TDBarChart`) no es el tag Razor. Usa la columna «Tag real» o el `Kind` documentado.
3. Copia los ejemplos del documento. No mezcles atributos de otro componente.
4. Namespace de los tags: `TDComponents.Components`. Enums y records: `TDComponents`.
