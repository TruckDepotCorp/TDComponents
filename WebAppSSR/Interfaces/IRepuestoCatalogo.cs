using System.Data;
using WebAppSSR.Models;

namespace WebAppSSR.Interfaces;

public interface IRepuestoCatalogo
{
    IReadOnlyList<Repuesto> Repuestos { get; }
    IReadOnlyList<CategoriaNodo> Categorias(string? tipo, string? categoria);
    DataTable Inventario();
    int SaveStock(IReadOnlyDictionary<int, int> stock);
    Repuesto? Find(int id);
    void Save(Repuesto item);
    bool Remove(int id);
}
