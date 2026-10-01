# Utilidades — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. `TDThemePicker` no tiene parámetros. Cambia las variables `--td-*`. Los componentes no cambian de marca.
2. `TDOrganizationChart` recibe un `TDOrgNode`. El nombre abre `Href`. El correo es el enlace «Correo». `SelectedId` coincide con `Id`.
3. `TDTerminal` consulta `PartsJson`, un arreglo JSON. El default es `[]`.
4. `TDAnimateOnScroll` no es la única forma de mostrar un dato. El contenido tiene que existir sin la animación.

## Qué componente elegir

| Necesitas | Tag | No uses |
| --- | --- | --- |
| Tema claro u oscuro de los temas incluidos | `TDThemePicker` | variables `--td-*` sueltas si el selector ya basta |
| Organigrama | `TDOrganizationChart` | `TDTree` si es un árbol de datos, no de personas |
| Consola de demostración | `TDTerminal` | No la uses como terminal del sistema: los comandos son los de la demostración. |
| Entrada animada al hacer scroll | `TDAnimateOnScroll` | en un dato que la persona tiene que leer de inmediato |

## Alias del catálogo

| Id de catálogo | Tag real |
| --- | --- |
| tokens | `TDThemePicker` |
| orgchart | `TDOrganizationChart` |
| terminal | `TDTerminal` |
| aos | `TDAnimateOnScroll` |

## Tipos compartidos

`TDOrgNode` — `Id`, `Name`, `Role`, `Initials`, `Children`, `Href`, `Email`.

## TDThemePicker

```razor
<TDThemePicker />
```

No declara parámetros. Los temas incluidos son Modern, Material, Material Expressive y Fluent, en claro y oscuro.

## TDOrganizationChart

```razor
<TDOrganizationChart Root="raiz" SelectedId="@persona" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Root` | `TDOrgNode?` | `null` | Persona raíz. `Children` arma el resto. | Siempre. |
| `Multiple` | `bool` | `false` | Permite marcar varias personas. | Se comparan varias fichas a la vez. |
| `SelectedId` | `string?` | `null` | `Id` de la persona marcada. | Hay una ficha activa. |

## TDTerminal

```razor
<TDTerminal Prompt="td@taller:~$" PartsJson="@repuestosJson" />
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Prompt` | `string` | `"td@taller:~$"` | Texto que precede a cada comando. | El prefijo de demostración no es el del taller. |
| `Welcome` | `string` | `"TDTerminal 1.0 · escribe help para ver los comandos"` | Línea al abrir. | La línea de apertura debe decir los comandos reales. |
| `PartsJson` | `string` | `"[]"` | Arreglo JSON de repuestos que los comandos consultan. | Hay un catálogo que la consola debe leer. |

## TDAnimateOnScroll

```razor
<TDAnimateOnScroll Enter="fade-up" Duration="400" Once="true">
    <TDCard Title="Stock">128 unidades</TDCard>
</TDAnimateOnScroll>
```

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Enter` | `string` | `"fade-up"` | Animación de entrada. | Otra entrada distinta de fade-up. El dato igual tiene que leerse sin animación. |
| `Duration` | `int` | `400` | Duración en milisegundos. | 400 ms se siente largo o corto para ese bloque. |
| `Delay` | `int` | `0` | Espera antes de animar, en milisegundos. | Varios bloques entran en secuencia y este espera. |
| `Once` | `bool` | `true` | Anima solo la primera vez. | En falso solo si debe repetirse cada vez que vuelve a entrar. El defecto evita mareo. |
| `Threshold` | `double` | `0.25` | Fracción visible que dispara la animación. | Debe dispararse con más o menos fracción visible que 0,25. |
| `ChildContent` | contenido | — | Contenido que se anima. | Siempre. |
