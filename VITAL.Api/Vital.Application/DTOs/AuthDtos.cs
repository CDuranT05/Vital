namespace Vital.Application.DTOs;

public record LoginRequest(string IdentityCard, string Password);

public record LoginResponse(
    string Token,
    string UserId,
    string IdentityCard,
    string FirstName,
    string LastName,
    string Role
);

/// <summary>
/// Solo para registrar Técnicos (T-XXXXXXXX) e Inspectores (I-XXXXXXXX).
/// Los ciudadanos se crean automáticamente al registrar un contrato.
/// </summary>
public record RegisterRequest(
    string IdentityCard,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Password
);
