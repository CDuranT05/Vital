namespace Vital.Application.DTOs;

public record CreateTransferRequest(
    Guid ContractId,
    string NewOwnerIdentityCard,
    string NewOwnerFirstName,
    string NewOwnerLastName,
    string NewOwnerPhone,
    string NewOwnerEmail
);

public record ApproveTransferRequest(string? ReviewNotes);
public record RejectTransferRequest(string ReviewNotes);

public record TransferDocumentDto(
    Guid Id,
    string OriginalName,
    string DocumentType,
    DateTime UploadedAt
);

public record TransferRequestDto(
    Guid Id,
    Guid ContractId,
    string ContractNumber,
    string ServiceAddress,
    string Parish,
    string Municipality,
    string State,
    string CurrentOwnerName,
    string CurrentOwnerIdentityCard,
    string NewOwnerIdentityCard,
    string NewOwnerFirstName,
    string NewOwnerLastName,
    string NewOwnerPhone,
    string NewOwnerEmail,
    int Status,
    string StatusLabel,
    string? ReviewNotes,
    DateTime CreatedAt,
    DateTime? ReviewedAt,
    List<TransferDocumentDto> Documents
);

public record TechnicianTransferDto(
    Guid Id,
    Guid ContractId,
    string ContractNumber,
    string ServiceAddress,
    string Parish,
    string Municipality,
    string State,
    string CurrentOwnerName,
    string CurrentOwnerIdentityCard,
    string NewOwnerIdentityCard,
    string NewOwnerFirstName,
    string NewOwnerLastName,
    string NewOwnerPhone,
    DateTime CreatedAt
);
