using Vital.Domain.Enums;

namespace Vital.Application.DTOs;

public record ContractDto(
    Guid Id,
    string ContractNumber,
    string ServiceAddress,
    bool IsPrimaryResidence,
    ContractType ContractType,
    DateTime CreatedAt,
    PropertyDto? Property,
    MeterDto? Meter
);

public record PropertyDto(
    Guid Id,
    string Address,
    string Parish,
    string Municipality,
    string State
);

public record MeterDto(
    Guid Id,
    string MeterNumber,
    string QrCode,
    bool IsActive,
    DateTime InstallationDate
);

public record CreateContractRequest(
    string CitizenIdentityCard,
    string CitizenFirstName,
    string CitizenLastName,
    string CitizenPhone,
    string ServiceAddress,
    bool IsPrimaryResidence,
    ContractType ContractType,
    string Parish,
    string Municipality,
    string State,
    Guid BranchId
);
