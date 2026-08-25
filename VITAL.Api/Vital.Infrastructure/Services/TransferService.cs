using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Domain.Enums;
using Vital.Infrastructure.Identity;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class TransferService : ITransferService
{
    private readonly VitalDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public TransferService(VitalDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<TransferRequestDto> CreateRequestAsync(
        CreateTransferRequest request,
        string citizenId,
        List<(Stream Data, string FileName, string DocumentType)> documents)
    {
        var contract = await _db.Contracts
            .Include(c => c.Property)
            .FirstOrDefaultAsync(c => c.Id == request.ContractId && c.ApplicationUserId == citizenId)
            ?? throw new InvalidOperationException("Contrato no encontrado o no tienes permiso.");

        if (contract.Status != ContractStatus.Active)
            throw new InvalidOperationException("Solo se puede transferir un contrato activo.");

        var existing = await _db.TransferRequests
            .AnyAsync(t => t.ContractId == request.ContractId &&
                           t.Status != TransferRequestStatus.Rejected &&
                           t.Status != TransferRequestStatus.Completed);
        if (existing)
            throw new InvalidOperationException("Ya existe una solicitud de transferencia activa para este contrato.");

        var transfer = new OwnershipTransferRequest
        {
            Id = Guid.NewGuid(),
            ContractId = request.ContractId,
            NewOwnerIdentityCard = request.NewOwnerIdentityCard,
            NewOwnerFirstName = request.NewOwnerFirstName,
            NewOwnerLastName = request.NewOwnerLastName,
            NewOwnerPhone = request.NewOwnerPhone,
            NewOwnerEmail = request.NewOwnerEmail
        };
        _db.TransferRequests.Add(transfer);
        await _db.SaveChangesAsync();

        // Guardar documentos
        var uploadsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "transfer-docs", transfer.Id.ToString());
        Directory.CreateDirectory(uploadsDir);

        foreach (var (data, fileName, docType) in documents)
        {
            var ext = Path.GetExtension(fileName);
            var storedName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, storedName);
            await using var stream = File.Create(filePath);
            await data.CopyToAsync(stream);

            _db.TransferDocuments.Add(new TransferDocument
            {
                Id = Guid.NewGuid(),
                TransferRequestId = transfer.Id,
                OriginalName = fileName,
                FileName = storedName,
                FilePath = filePath,
                DocumentType = docType
            });
        }
        await _db.SaveChangesAsync();

        var citizen = await _userManager.FindByIdAsync(citizenId);
        return await BuildDto(transfer, contract, citizen);
    }

    public async Task<List<TransferRequestDto>> GetPendingForInspectorAsync(string inspectorId)
    {
        var inspector = await _db.Users.FindAsync(inspectorId) as ApplicationUser;
        var branchId = inspector?.BranchId;

        var query = _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .Include(t => t.Documents)
            .Where(t => t.Status == TransferRequestStatus.Pending || t.Status == TransferRequestStatus.UnderReview);

        if (branchId.HasValue)
            query = query.Where(t => t.Contract.BranchId == branchId.Value);

        var transfers = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        var result = new List<TransferRequestDto>();
        foreach (var t in transfers)
        {
            var citizen = await _userManager.FindByIdAsync(t.Contract.ApplicationUserId);
            result.Add(await BuildDto(t, t.Contract, citizen));
        }
        return result;
    }

    public async Task<TransferRequestDto> GetByIdAsync(Guid id)
    {
        var transfer = await _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .Include(t => t.Documents)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new InvalidOperationException("Solicitud no encontrada.");

        var citizen = await _userManager.FindByIdAsync(transfer.Contract.ApplicationUserId);
        return await BuildDto(transfer, transfer.Contract, citizen);
    }

    public async Task<TransferRequestDto> ApproveAsync(Guid id, string inspectorId, string? notes)
    {
        var transfer = await _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .Include(t => t.Documents)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new InvalidOperationException("Solicitud no encontrada.");

        // Asignar técnico de turno activo en la sucursal del contrato
        var technicianId = await FindOnDutyTechnicianAsync(transfer.Contract.BranchId);

        transfer.Status = TransferRequestStatus.ApprovedPendingTechnician;
        transfer.InspectorId = inspectorId;
        transfer.ReviewedAt = DateTime.UtcNow;
        transfer.ReviewNotes = notes;
        transfer.AssignedTechnicianId = technicianId;
        await _db.SaveChangesAsync();

        var citizen = await _userManager.FindByIdAsync(transfer.Contract.ApplicationUserId);
        return await BuildDto(transfer, transfer.Contract, citizen);
    }

    public async Task<TransferRequestDto> RejectAsync(Guid id, string inspectorId, string notes)
    {
        var transfer = await _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .Include(t => t.Documents)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new InvalidOperationException("Solicitud no encontrada.");

        transfer.Status = TransferRequestStatus.Rejected;
        transfer.InspectorId = inspectorId;
        transfer.ReviewedAt = DateTime.UtcNow;
        transfer.ReviewNotes = notes;
        await _db.SaveChangesAsync();

        var citizen = await _userManager.FindByIdAsync(transfer.Contract.ApplicationUserId);
        return await BuildDto(transfer, transfer.Contract, citizen);
    }

    public async Task<List<TechnicianTransferDto>> GetAssignedForTechnicianAsync(string technicianId)
    {
        var transfers = await _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .Where(t => t.AssignedTechnicianId == technicianId &&
                        t.Status == TransferRequestStatus.ApprovedPendingTechnician)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var result = new List<TechnicianTransferDto>();
        foreach (var t in transfers)
        {
            var currentOwner = await _userManager.FindByIdAsync(t.Contract.ApplicationUserId);
            result.Add(BuildTechnicianDto(t, t.Contract, currentOwner));
        }
        return result;
    }

    public async Task<TechnicianTransferDto?> GetPendingForContractAsync(Guid contractId)
    {
        var transfer = await _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .FirstOrDefaultAsync(t => t.ContractId == contractId &&
                                      t.Status == TransferRequestStatus.ApprovedPendingTechnician);

        if (transfer is null) return null;
        var currentOwner = await _userManager.FindByIdAsync(transfer.Contract.ApplicationUserId);
        return BuildTechnicianDto(transfer, transfer.Contract, currentOwner);
    }

    public async Task CompleteAsync(Guid id, string technicianId)
    {
        var transfer = await _db.TransferRequests
            .Include(t => t.Contract).ThenInclude(c => c.Property)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new InvalidOperationException("Solicitud no encontrada.");

        if (transfer.AssignedTechnicianId != technicianId)
            throw new InvalidOperationException("No tienes permiso para completar esta transferencia.");

        // Crear o encontrar el nuevo titular
        var newOwner = await _userManager.FindByNameAsync(transfer.NewOwnerIdentityCard);
        if (newOwner is null)
        {
            newOwner = new ApplicationUser
            {
                UserName = transfer.NewOwnerIdentityCard,
                IdentityCard = transfer.NewOwnerIdentityCard,
                FirstName = transfer.NewOwnerFirstName,
                LastName = transfer.NewOwnerLastName,
                PhoneNumber = transfer.NewOwnerPhone,
                Email = string.IsNullOrEmpty(transfer.NewOwnerEmail)
                    ? $"{transfer.NewOwnerIdentityCard.Replace("-", "").ToLower()}@vital.local"
                    : transfer.NewOwnerEmail,
                Role = UserRole.Citizen
            };
            var result = await _userManager.CreateAsync(newOwner, transfer.NewOwnerIdentityCard);
            if (!result.Succeeded)
                throw new InvalidOperationException($"Error al crear el nuevo titular: {string.Join("; ", result.Errors.Select(e => e.Description))}");
            await _userManager.AddToRoleAsync(newOwner, "Citizen");
        }

        // Marcar contrato anterior como Transferido
        var oldContract = transfer.Contract;
        oldContract.Status = ContractStatus.Transferred;

        // Crear nuevo contrato para el nuevo titular
        var newContract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = $"VITAL-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
            ApplicationUserId = newOwner.Id,
            ServiceAddress = oldContract.ServiceAddress,
            IsPrimaryResidence = oldContract.IsPrimaryResidence,
            ContractType = oldContract.ContractType,
            PropertyId = oldContract.PropertyId,
            BranchId = oldContract.BranchId,
            Status = ContractStatus.Active
        };
        _db.Contracts.Add(newContract);

        transfer.Status = TransferRequestStatus.Completed;
        transfer.CompletedAt = DateTime.UtcNow;
        transfer.NewContractId = newContract.Id;

        await _db.SaveChangesAsync();
    }

    private async Task<string?> FindOnDutyTechnicianAsync(Guid branchId)
    {
        var shifts = await _db.Shifts
            .Where(s => s.BranchId == branchId && s.IsActive)
            .ToListAsync();

        var onDuty = shifts.FirstOrDefault(s => s.IsOnDutyNow()) ?? shifts.FirstOrDefault();
        return onDuty?.TechnicianId;
    }

    private static string StatusLabel(TransferRequestStatus status) => status switch
    {
        TransferRequestStatus.Pending => "Pendiente de Revisión",
        TransferRequestStatus.UnderReview => "En Revisión",
        TransferRequestStatus.ApprovedPendingTechnician => "Aprobada — Pendiente Técnico",
        TransferRequestStatus.Rejected => "Rechazada",
        TransferRequestStatus.Completed => "Completada",
        _ => "Desconocido"
    };

    private static Task<TransferRequestDto> BuildDto(
        OwnershipTransferRequest t, Contract contract, ApplicationUser? citizen)
    {
        var dto = new TransferRequestDto(
            t.Id,
            contract.Id,
            contract.ContractNumber,
            contract.ServiceAddress,
            contract.Property?.Parish ?? "",
            contract.Property?.Municipality ?? "",
            contract.Property?.State ?? "",
            citizen is null ? "Desconocido" : $"{citizen.FirstName} {citizen.LastName}",
            citizen?.IdentityCard ?? "",
            t.NewOwnerIdentityCard,
            t.NewOwnerFirstName,
            t.NewOwnerLastName,
            t.NewOwnerPhone,
            t.NewOwnerEmail,
            (int)t.Status,
            StatusLabel(t.Status),
            t.ReviewNotes,
            t.CreatedAt,
            t.ReviewedAt,
            t.Documents.Select(d => new TransferDocumentDto(d.Id, d.OriginalName, d.DocumentType, d.UploadedAt)).ToList()
        );
        return Task.FromResult(dto);
    }

    private static TechnicianTransferDto BuildTechnicianDto(
        OwnershipTransferRequest t, Contract contract, ApplicationUser? currentOwner) =>
        new(
            t.Id,
            contract.Id,
            contract.ContractNumber,
            contract.ServiceAddress,
            contract.Property?.Parish ?? "",
            contract.Property?.Municipality ?? "",
            contract.Property?.State ?? "",
            currentOwner is null ? "Desconocido" : $"{currentOwner.FirstName} {currentOwner.LastName}",
            currentOwner?.IdentityCard ?? "",
            t.NewOwnerIdentityCard,
            t.NewOwnerFirstName,
            t.NewOwnerLastName,
            t.NewOwnerPhone,
            t.CreatedAt
        );
}
