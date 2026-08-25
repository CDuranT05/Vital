using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Enums;
using Vital.Infrastructure.Identity;

namespace Vital.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.IdentityCard)
            ?? throw new UnauthorizedAccessException("Credenciales inválidas.");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var token = GenerateToken(user);
        return new LoginResponse(token, user.Id, user.IdentityCard, user.FirstName, user.LastName, user.Role.ToString());
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
    {
        // Solo se pueden registrar Técnicos (T-) e Inspectores (I-)
        var role = DetectRoleFromCard(request.IdentityCard)
            ?? throw new ArgumentException(
                "Solo se pueden registrar técnicos (T-XXXXXXXX) e inspectores (I-XXXXXXXX) por esta vía. " +
                "Los ciudadanos se crean automáticamente al registrar un contrato.");

        if (role == UserRole.Citizen)
            throw new ArgumentException("Los ciudadanos no se registran directamente.");

        var user = new ApplicationUser
        {
            UserName = request.IdentityCard,
            IdentityCard = request.IdentityCard,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Role = role
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        var token = GenerateToken(user);
        return new LoginResponse(token, user.Id, user.IdentityCard, user.FirstName, user.LastName, user.Role.ToString());
    }

    // Detecta el rol por prefijo. Null si no tiene prefijo reconocido de staff.
    public static UserRole? DetectRoleFromCard(string identityCard)
    {
        if (identityCard.StartsWith("T-", StringComparison.OrdinalIgnoreCase)) return UserRole.Technician;
        if (identityCard.StartsWith("I-", StringComparison.OrdinalIgnoreCase)) return UserRole.Inspector;
        return null;
    }

    public string GenerateToken(ApplicationUser user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.IdentityCard),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
