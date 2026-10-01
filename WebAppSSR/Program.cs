using WebAppSSR.Components;
using WebAppSSR.Interfaces;
using WebAppSSR.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents();
builder.Services.AddSingleton<IContactoService, ContactoService>();
builder.Services.AddSingleton<IRepuestoCatalogo, RepuestoCatalogo>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapGet("/datos/repuestos.xlsx", (IRepuestoCatalogo catalogo, HttpRequest request) =>
{
    var filas = RepuestoExcel.Filtrar(catalogo.Repuestos, request.Query);
    return Results.File(RepuestoExcel.Libro(filas), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "repuestos.xlsx");
});
app.MapStaticAssets();
app.MapRazorComponents<App>();

app.Run();
