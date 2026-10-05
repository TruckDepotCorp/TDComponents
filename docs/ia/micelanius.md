# Micelanius — contrato de uso para IA

Pantallas de mostrador. Cada pieza es un componente. La pantalla se arma juntándolas dentro de `TDShopFrame`.

```razor
@using TDComponents
@using TDComponents.Components
```

## Reglas

1. `TDShopFrame` es el marco: contiene la barra, el contenido y `TDShopMenu`.
2. `TDShopCash` abierto o cerrado cambia el texto de `TDShopTile` que tenga `NeedsCash`.
3. `TDShopFilter` filtra lo que pongas adentro. Cada fila trae `Tags`. El chip con `Tag` vacío muestra todos.
4. `TDClientRow` muestra Cobrar solo si `HasDebt` es true.
5. `TDCollect` no registra un monto mayor que `Debt`. Cero deuda dice que no hay saldo.
6. `TDProductTile` con `Stock` 0 no entra al `TDCart`.
7. `TDCart` no cobra si la caja está cerrada, el carrito está vacío, el crédito no tiene cliente o el efectivo no alcanza. El motivo va escrito.
8. `TDStockAdjust` no edita el número a mano: entrada o salida, cantidad y motivo.
9. `TDMargin` recalcula margen y ganancia. Si el costo supera el precio, lo dice.
10. `TDSaveBar` deja Guardar apagado hasta que haya un cambio y el campo `data-td-mx-name` no esté vacío.

## Pantalla de inicio

```razor
<TDShopFrame>
    <TDShopBar />
    <main class="td-mxmain">
        <TDShopHead Kicker="Lunes, 5 de octubre · Maxi Technogia" Title="Buenas tardes, José" />
        <div class="td-mxsplit">
            <TDShopHero />
            <TDShopCash />
        </div>
        <TDShopTile Title="Nueva venta" Icon="receipt" Primary="true" NeedsCash="true" />
        <TDShopAlerts />
        <TDShopEmpty />
    </main>
    <TDShopMenu />
</TDShopFrame>
```

## Qué componente elegir

| Necesitas | Tag |
| --- | --- |
| Marco de la pantalla | `TDShopFrame` |
| Barra de marca | `TDShopBar` |
| Menú lateral | `TDShopMenu` |
| Título | `TDShopHead` |
| Ganancia del día | `TDShopHero` |
| Caja | `TDShopCash` |
| Acceso rápido | `TDShopTile` |
| Avisos | `TDShopAlerts` |
| Sin datos | `TDShopEmpty` |
| Indicadores | `TDShopKpis` |
| Buscar y filtrar | `TDShopFilter` |
| Fila de cliente | `TDClientRow` |
| Cobro | `TDCollect` |
| Movimientos | `TDMoveList` |
| Direcciones | `TDAddrList` |
| Producto del punto de venta | `TDProductTile` |
| Carrito | `TDCart` |
| Venta del historial | `TDSaleRow` |
| Ficha de producto | `TDProductSheet` |
| Ajuste de stock | `TDStockAdjust` |
| Margen | `TDMargin` |
| Pie de guardado | `TDSaveBar` |
| Enlaces de la ficha | `TDLinkList` |

Los montos se escriben ya formateados, en quetzales: `Q 415.50`. El precio de `TDProductTile` y `TDMargin` es un número.
