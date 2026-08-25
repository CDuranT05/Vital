namespace Vital.Application.DTOs;

public record MeterReadingDto(
    Guid Id,
    Guid MeterId,
    string MeterNumber,
    decimal CurrentReading,
    DateTime ReadingDate,
    string? Notes
);

public record RegisterMeterRequest(
    string MeterNumber,
    string QrCode,
    Guid ContractId
);

public record RecordReadingRequest(
    decimal CurrentReading,
    string? Notes
);

public record QrScanResultDto(
    string QrCode,
    Guid? MeterId,
    string? MeterNumber,
    Guid? ContractId,
    string? ContractNumber,
    string? ServiceAddress,
    bool HasContract
);
