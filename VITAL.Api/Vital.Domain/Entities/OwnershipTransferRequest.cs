using Vital.Domain.Enums;

namespace Vital.Domain.Entities;

public class OwnershipTransferRequest
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Contract Contract { get; set; } = null!;

    // Nuevo titular
    public string NewOwnerIdentityCard { get; set; } = string.Empty;
    public string NewOwnerFirstName { get; set; } = string.Empty;
    public string NewOwnerLastName { get; set; } = string.Empty;
    public string NewOwnerPhone { get; set; } = string.Empty;
    public string NewOwnerEmail { get; set; } = string.Empty;

    public TransferRequestStatus Status { get; set; } = TransferRequestStatus.Pending;

    // Inspector
    public string? InspectorId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }

    // Técnico asignado para confirmar en sitio
    public string? AssignedTechnicianId { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Nuevo contrato generado al completar
    public Guid? NewContractId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TransferDocument> Documents { get; set; } = new List<TransferDocument>();
}
