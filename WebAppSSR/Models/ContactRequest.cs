using System.ComponentModel.DataAnnotations;

namespace WebAppSSR.Models;

public sealed class ContactRequest
{
    [Required(ErrorMessage = "Escribe el nombre de la persona a la que debemos responder.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "Escribe un nombre de 2 a 80 caracteres.")]
    public string FullName { get; set; } = "";

    [Required(ErrorMessage = "Escribe un correo para poder responder.")]
    [EmailAddress(ErrorMessage = "Escribe un correo como nombre@empresa.com.")]
    [StringLength(120, ErrorMessage = "El correo admite como máximo 120 caracteres.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Escribe qué necesitas que hagamos.")]
    [StringLength(280, MinimumLength = 12, ErrorMessage = "Describe la solicitud entre 12 y 280 caracteres.")]
    public string Message { get; set; } = "";

    public string? PreviewPassword { get; set; }
}
