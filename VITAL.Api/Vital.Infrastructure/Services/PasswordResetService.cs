using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Infrastructure.Identity;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class PasswordResetService : IPasswordResetService
{
    private readonly VitalDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    // Rate limit por cédula: máx 3 solicitudes por hora
    private static readonly ConcurrentDictionary<string, (int Count, DateTime Window)> _requestLimits = new();
    private const int MaxRequestsPerHour = 3;
    private const int TokenExpiryMinutes = 15;
    private const int MaxFailedAttempts = 3;

    public PasswordResetService(VitalDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<string?> RequestResetAsync(string identityCard, string? ipAddress)
    {
        // Rate limit por cédula
        EnforceRequestRateLimit(identityCard);

        var user = await _userManager.FindByNameAsync(identityCard);

        // Siempre limpiar tokens anteriores no usados (evita acumulación)
        if (user is not null)
        {
            var old = await _db.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.IsUsed)
                .ToListAsync();
            _db.PasswordResetTokens.RemoveRange(old);
        }

        // Aunque el usuario no exista, devolvemos la misma estructura para no revelar si existe
        if (user is null)
        {
            await Task.Delay(Random.Shared.Next(80, 150)); // timing attack mitigation
            return null; // el controller devuelve 200 igual
        }

        // Generar token de 256 bits (32 bytes) criptográficamente seguro
        var rawBytes = RandomNumberGenerator.GetBytes(32);
        var rawToken = Convert.ToBase64String(rawBytes)
            .Replace('+', '-').Replace('/', '_').TrimEnd('='); // URL-safe base64

        // Solo guardar el hash SHA-256 — el token plano nunca se persiste
        var tokenHash = ComputeSha256(rawToken);

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(TokenExpiryMinutes),
            IpAddress = ipAddress
        });
        await _db.SaveChangesAsync();

        RegisterRequest(identityCard);
        return rawToken; // se entrega al usuario (SMS/email en producción)
    }

    public async Task<bool> ValidateTokenAsync(string identityCard, string token)
    {
        var (record, _) = await FindValidToken(identityCard, token);
        return record is not null;
    }

    public async Task ResetPasswordAsync(string identityCard, string token, string newPassword)
    {
        var (record, user) = await FindValidToken(identityCard, token);

        if (record is null || user is null)
            throw new InvalidOperationException("El código es inválido, expiró o ya fue utilizado.");

        ValidatePasswordStrength(newPassword);

        // Cambiar contraseña usando token de reset de Identity
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        // Marcar token como usado — single-use garantizado
        record.IsUsed = true;
        await _db.SaveChangesAsync();

        // Limpiar rate limit tras éxito
        _requestLimits.TryRemove(identityCard, out _);
    }

    // ── Búsqueda segura del token ────────────────────────────────────────────

    private async Task<(PasswordResetToken? Record, ApplicationUser? User)> FindValidToken(
        string identityCard, string token)
    {
        var user = await _userManager.FindByNameAsync(identityCard);
        if (user is null) return (null, null);

        var tokenHash = ComputeSha256(token);

        var record = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

        if (record is null) return (null, null);

        // Token expirado
        if (DateTime.UtcNow > record.ExpiresAt)
        {
            record.IsUsed = true;
            await _db.SaveChangesAsync();
            return (null, null);
        }

        // Demasiados intentos fallidos → invalidar token
        if (record.FailedAttempts >= MaxFailedAttempts)
        {
            record.IsUsed = true;
            await _db.SaveChangesAsync();
            return (null, null);
        }

        // Comparación en tiempo constante para evitar timing attacks
        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(tokenHash),
            Encoding.UTF8.GetBytes(record.TokenHash)))
        {
            record.FailedAttempts++;
            await _db.SaveChangesAsync();
            return (null, null);
        }

        return (record, user);
    }

    // ── Utilidades ───────────────────────────────────────────────────────────

    private static string ComputeSha256(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLower();
    }

    private static void ValidatePasswordStrength(string password)
    {
        var errors = new List<string>();
        if (password.Length < 8)                                               errors.Add("mínimo 8 caracteres");
        if (!password.Any(char.IsUpper))                                       errors.Add("al menos una mayúscula");
        if (!password.Any(char.IsLower))                                       errors.Add("al menos una minúscula");
        if (!password.Any(char.IsDigit))                                       errors.Add("al menos un número");
        if (!Regex.IsMatch(password, @"[!@#$%^&*()\-_=+\[\]{}|;':"",./<>?]")) errors.Add("al menos un carácter especial");
        if (errors.Count > 0)
            throw new InvalidOperationException(
                $"La contraseña no cumple los requisitos: {string.Join(", ", errors)}.");
    }

    private static void EnforceRequestRateLimit(string identityCard)
    {
        if (!_requestLimits.TryGetValue(identityCard, out var entry)) return;
        if (DateTime.UtcNow - entry.Window > TimeSpan.FromHours(1))
        {
            _requestLimits.TryRemove(identityCard, out _);
            return;
        }
        if (entry.Count >= MaxRequestsPerHour)
        {
            var wait = 60 - (int)(DateTime.UtcNow - entry.Window).TotalMinutes;
            throw new InvalidOperationException(
                $"Demasiadas solicitudes. Espera {wait} minuto(s) antes de intentar de nuevo.");
        }
    }

    private static void RegisterRequest(string identityCard) =>
        _requestLimits.AddOrUpdate(identityCard,
            _ => (1, DateTime.UtcNow),
            (_, old) => (old.Count + 1, old.Window));
}
