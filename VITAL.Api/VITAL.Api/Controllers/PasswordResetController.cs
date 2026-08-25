using Microsoft.AspNetCore.Mvc;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/password-reset")]
public class PasswordResetController : ControllerBase
{
    private readonly IPasswordResetService _resetService;

    public PasswordResetController(IPasswordResetService resetService) =>
        _resetService = resetService;

    /// <summary>POST /api/password-reset/request — Solicita un token de restablecimiento</summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestReset([FromBody] RequestResetDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.IdentityCard))
            return BadRequest(new { message = "La cédula es requerida." });

        try
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var token = await _resetService.RequestResetAsync(dto.IdentityCard.Trim(), ip);

            // En producción: enviar 'token' por SMS/email y NO devolverlo en la respuesta.
            // Durante desarrollo lo incluimos para poder probarlo sin servidor de correo.
            return Ok(new
            {
                message = "Si la cédula está registrada, recibirás un código de restablecimiento.",
                devToken = token   // ← REMOVER en producción
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>POST /api/password-reset/validate — Verifica que el token sea válido antes de mostrar el form</summary>
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateToken([FromBody] ValidateTokenDto dto)
    {
        var valid = await _resetService.ValidateTokenAsync(
            dto.IdentityCard.Trim(), dto.Token.Trim());

        return Ok(new { valid });
    }

    /// <summary>POST /api/password-reset/confirm — Aplica la nueva contraseña</summary>
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmReset([FromBody] ConfirmResetDto dto)
    {
        try
        {
            await _resetService.ResetPasswordAsync(
                dto.IdentityCard.Trim(), dto.Token.Trim(), dto.NewPassword);

            return Ok(new { message = "Contraseña restablecida correctamente. Ya puedes iniciar sesión." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record RequestResetDto(string IdentityCard);
public record ValidateTokenDto(string IdentityCard, string Token);
public record ConfirmResetDto(string IdentityCard, string Token, string NewPassword);
