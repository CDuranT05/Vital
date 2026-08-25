namespace Vital.Application.Interfaces;

public interface IPasswordResetService
{
    /// <summary>
    /// Genera un token seguro. Devuelve el token en texto plano para entregarlo al usuario
    /// (por SMS/email en producción). Siempre retorna éxito aunque la cédula no exista
    /// para evitar enumeración de usuarios.
    /// </summary>
    Task<string?> RequestResetAsync(string identityCard, string? ipAddress);

    /// <summary>
    /// Valida que el token sea correcto, no haya expirado y no esté agotado.
    /// </summary>
    Task<bool> ValidateTokenAsync(string identityCard, string token);

    /// <summary>
    /// Aplica el cambio de contraseña si el token es válido. Marca el token como usado.
    /// </summary>
    Task ResetPasswordAsync(string identityCard, string token, string newPassword);
}
