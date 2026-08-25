using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Infrastructure.Identity;

namespace Vital.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<ApplicationUser> _userManager;

    // Rate limiting: userId → (attempt count, window start)
    private static readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> _rateLimits = new();
    private const int MaxAttemptsPerHour = 5;

    public ProfileService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<ProfileDto> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");
        return new ProfileDto(user.FirstName, user.LastName, user.IdentityCard, user.Email, user.PhoneNumber);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        EnforceRateLimit(userId);

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        if (!await _userManager.CheckPasswordAsync(user, request.CurrentPassword))
        {
            RegisterFailedAttempt(userId);
            throw new InvalidOperationException("La contraseña actual es incorrecta.");
        }

        ValidatePasswordStrength(request.NewPassword);

        if (request.NewPassword == request.CurrentPassword)
            throw new InvalidOperationException("La nueva contraseña no puede ser igual a la actual.");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        ResetRateLimit(userId);
    }

    public async Task ChangeEmailAsync(string userId, ChangeEmailRequest request)
    {
        EnforceRateLimit(userId);

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        if (!await _userManager.CheckPasswordAsync(user, request.CurrentPassword))
        {
            RegisterFailedAttempt(userId);
            throw new InvalidOperationException("La contraseña es incorrecta.");
        }

        if (!IsValidEmail(request.NewEmail))
            throw new InvalidOperationException("El correo electrónico no tiene un formato válido.");

        if (string.Equals(user.Email, request.NewEmail, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("El nuevo correo es igual al actual.");

        var existing = await _userManager.FindByEmailAsync(request.NewEmail);
        if (existing is not null && existing.Id != userId)
            throw new InvalidOperationException("Este correo ya está registrado en otra cuenta.");

        user.Email = request.NewEmail;
        user.NormalizedEmail = request.NewEmail.ToUpperInvariant();
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        ResetRateLimit(userId);
    }

    public async Task ChangePhoneAsync(string userId, ChangePhoneRequest request)
    {
        EnforceRateLimit(userId);

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        if (!await _userManager.CheckPasswordAsync(user, request.CurrentPassword))
        {
            RegisterFailedAttempt(userId);
            throw new InvalidOperationException("La contraseña es incorrecta.");
        }

        if (!IsValidPhone(request.NewPhone))
            throw new InvalidOperationException("El número de teléfono no tiene un formato válido (ej: 04141234567).");

        if (user.PhoneNumber == request.NewPhone)
            throw new InvalidOperationException("El nuevo teléfono es igual al actual.");

        user.PhoneNumber = request.NewPhone;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        ResetRateLimit(userId);
    }

    // ── Rate limiting ────────────────────────────────────────────────────────

    private static void EnforceRateLimit(string userId)
    {
        if (!_rateLimits.TryGetValue(userId, out var entry)) return;

        if (DateTime.UtcNow - entry.WindowStart > TimeSpan.FromHours(1))
        {
            _rateLimits.TryRemove(userId, out _);
            return;
        }

        if (entry.Count >= MaxAttemptsPerHour)
        {
            var remaining = 60 - (int)(DateTime.UtcNow - entry.WindowStart).TotalMinutes;
            throw new InvalidOperationException(
                $"Demasiados intentos fallidos. Por seguridad, espera {remaining} minuto(s) antes de intentar de nuevo.");
        }
    }

    private static void RegisterFailedAttempt(string userId)
    {
        _rateLimits.AddOrUpdate(userId,
            _ => (1, DateTime.UtcNow),
            (_, old) => (old.Count + 1, old.WindowStart));
    }

    private static void ResetRateLimit(string userId) =>
        _rateLimits.TryRemove(userId, out _);

    // ── Validaciones ─────────────────────────────────────────────────────────

    private static void ValidatePasswordStrength(string password)
    {
        var errors = new List<string>();
        if (password.Length < 8)               errors.Add("mínimo 8 caracteres");
        if (!password.Any(char.IsUpper))        errors.Add("al menos una mayúscula");
        if (!password.Any(char.IsLower))        errors.Add("al menos una minúscula");
        if (!password.Any(char.IsDigit))        errors.Add("al menos un número");
        if (!password.Any(c => "!@#$%^&*()_+-=[]{}|;':\",./<>?".Contains(c)))
            errors.Add("al menos un carácter especial (!@#$%...)");

        if (errors.Count > 0)
            throw new InvalidOperationException(
                $"La contraseña no cumple los requisitos de seguridad: {string.Join(", ", errors)}.");
    }

    private static bool IsValidEmail(string email) =>
        Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");

    private static bool IsValidPhone(string phone) =>
        Regex.IsMatch(phone, @"^(04\d{9}|\+58\d{10})$");
}
