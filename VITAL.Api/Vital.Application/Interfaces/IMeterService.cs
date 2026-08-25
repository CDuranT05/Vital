using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface IMeterService
{
    Task<QrScanResultDto> ScanQrAsync(string qrCode);
    Task<MeterDto> RegisterMeterAsync(RegisterMeterRequest request);
    Task<MeterReadingDto> RecordReadingAsync(Guid meterId, string technicianId, RecordReadingRequest request);
    Task<List<MeterReadingDto>> GetMeterReadingsAsync(Guid meterId);
}
