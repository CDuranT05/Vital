using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Domain.Enums;
using Vital.Infrastructure.Identity;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class ContractService : IContractService
{
    private readonly VitalDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public ContractService(VitalDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<List<ContractDto>> GetUserContractsAsync(string userId)
    {
        var contracts = await _db.Contracts
            .Include(c => c.Property)
            .ThenInclude(p => p.Meters)
            .Where(c => c.ApplicationUserId == userId && c.Status == ContractStatus.Active)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return contracts.Select(MapToDto).ToList();
    }

    public async Task<ContractDto?> GetContractByIdAsync(Guid id)
    {
        var contract = await _db.Contracts
            .Include(c => c.Property)
            .ThenInclude(p => p.Meters)
            .FirstOrDefaultAsync(c => c.Id == id);

        return contract is null ? null : MapToDto(contract);
    }

    public async Task<ContractDto> CreateContractAsync(CreateContractRequest request)
    {
        // Buscar o crear el ciudadano por su cédula
        var citizen = await _userManager.FindByNameAsync(request.CitizenIdentityCard);

        if (citizen is null)
        {
            // Crear el perfil ciudadano automáticamente
            // Contraseña inicial = cédula (el ciudadano podrá cambiarla luego)
            citizen = new ApplicationUser
            {
                UserName = request.CitizenIdentityCard,
                IdentityCard = request.CitizenIdentityCard,
                FirstName = request.CitizenFirstName,
                LastName = request.CitizenLastName,
                PhoneNumber = request.CitizenPhone,
                Email = $"{request.CitizenIdentityCard.Replace("-", "").ToLower()}@vital.local",
                Role = UserRole.Citizen
            };

            var result = await _userManager.CreateAsync(citizen, request.CitizenIdentityCard);
            if (!result.Succeeded)
                throw new InvalidOperationException(
                    $"Error al crear el ciudadano: {string.Join("; ", result.Errors.Select(e => e.Description))}");
        }
        else if (citizen.Role != UserRole.Citizen)
        {
            // El técnico/inspector también puede tener contrato como ciudadano
            // Se crea igual, usando su misma cuenta pero con rol dual —
            // en este caso solo permitimos si la cédula no tiene prefijo T- ni I-
            if (request.CitizenIdentityCard.StartsWith("T-", StringComparison.OrdinalIgnoreCase) ||
                request.CitizenIdentityCard.StartsWith("I-", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Use la cédula sin prefijo (sin T- ni I-) para registrar el contrato personal de un técnico o inspector.");
            }
        }

        var property = new Property
        {
            Id = Guid.NewGuid(),
            Address = request.ServiceAddress,
            Parish = request.Parish,
            Municipality = request.Municipality,
            State = request.State
        };
        _db.Properties.Add(property);

        var contractNumber = $"VITAL-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";
        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = contractNumber,
            ApplicationUserId = citizen.Id,
            ServiceAddress = request.ServiceAddress,
            IsPrimaryResidence = request.IsPrimaryResidence,
            ContractType = request.ContractType,
            PropertyId = property.Id,
            BranchId = request.BranchId
        };
        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync();

        contract.Property = property;
        return MapToDto(contract);
    }

    private static ContractDto MapToDto(Contract c)
    {
        var meter = c.Property?.Meters.FirstOrDefault();
        return new ContractDto(
            c.Id,
            c.ContractNumber,
            c.ServiceAddress,
            c.IsPrimaryResidence,
            c.ContractType,
            c.CreatedAt,
            c.Property is null ? null : new PropertyDto(c.Property.Id, c.Property.Address, c.Property.Parish, c.Property.Municipality, c.Property.State),
            meter is null ? null : new MeterDto(meter.Id, meter.MeterNumber, meter.QrCode, meter.IsActive, meter.InstallationDate)
        );
    }
}
