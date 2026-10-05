# Ecommerce — contrato de uso para IA

Fuente: parámetros reales de `TDComponents/Components`. El texto del catálogo no es la API.

```razor
@using TDComponents.Components
```

## Reglas que no se pueden romper

1. Hay un solo componente: `TDEcom`. La variante la elige `Kind`.
2. No existen `TDProductCard`, `TDProductDetail`, `TDCartDrawer`, `TDCheckout`, `TDFacetedSearch`, `TDSearchSuggest`, `TDCompareProducts`, `TDFlashSale`, `TDReviews`, `TDPartFinder`, `TDQuoteRequest`, `TDBulkOrder`, `TDRecentlyViewed`, `TDStockAlert`, `TDWishlists`, `TDOrderTracking`, `TDFrequentlyBought`, `TDStoreLocator`, `TDCreditDashboard` ni `TDReturnsRMA`.
3. Sin `Products`, `TDEcom` muestra el catálogo de demostración. Con productos, la variante usa esa lista. Una lista vacía no muestra productos. `Id` es un entero estable.
4. Un `Kind` desconocido pinta las tarjetas, igual que `ecard`.
5. Comparar productos es `Kind="ecompare"`. Comparar dos estados de una foto es `TDCompare`, del módulo Media.

## Qué Kind elegir

| Necesitas | Kind |
| --- | --- |
| Tarjeta de producto | `ecard` |
| Ficha | `edetail` |
| Carrito lateral | `ecart` |
| Pago por pasos | `echeckout` |
| Filtros por facetas | `efacets` |
| Búsqueda con sugerencias | `esearch` |
| Comparar productos | `ecompare` |
| Oferta con cuenta regresiva | `eflash` |
| Reseñas | `ereviews` |
| Buscar por vehículo | `efinder` |
| Solicitud de cotización | `equote` |
| Carga masiva por código | `ebulk` |
| Vistos recientemente | `erecent` |
| Aviso de reingreso | `estock` |
| Listas de favoritos | `ewishmulti` |
| Seguimiento de pedido | `etrack` |
| Comprados juntos | `efbt` |
| Sucursales | `elocator` |
| Crédito de flota | `ecredit` |
| Devolución | `ereturns` |

## Alias del catálogo

Cada id `ecard`, `edetail`, `ecart`, `echeckout`, `efacets`, `esearch`, `ecompare`, `eflash`, `ereviews`, `efinder`, `equote`, `ebulk`, `erecent`, `estock`, `ewishmulti`, `etrack`, `efbt`, `elocator`, `ecredit` y `ereturns` es el mismo tag:

```razor
<TDEcom Kind="ecard" Products="productos" />
```

`productos` es `IReadOnlyList<TDProduct>`: `Id`, `Code`, `Name`, `Brand`, `Price`, `Stock`, `Category`, `Fit`.

## TDEcom

| Parámetro | Tipo | Default | Para qué | Cuándo |
| --- | --- | --- | --- | --- |
| `Kind` | `string` | `"ecard"` | Variante de Ecommerce. | Siempre uno de los valores de la tabla. |
| `Products` | `IReadOnlyList<TDProduct>?` | `null` | Productos del sistema. | Una tienda real. `null` deja la demostración. Vacío deja la variante sin productos. |
