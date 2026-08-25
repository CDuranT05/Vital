using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class MeterService : IMeterService
{
    private readonly VitalDbContext _db;

    public MeterService(VitalDbContext db) => _db = db;

    public async Task<QrScanResultDto> ScanQrAsync(string qrCode)
    {
        var meter = await _db.Meters
            .Include(m => m.Property)
            .ThenInclude(p => p.Meters)
            .FirstOrDefaultAsync(m => m.QrCode == qrCode);

        if (meter is null)
            return new QrScanResultDto(qrCode, null, null, null, null, null, false);

        var contract = await _db.Contracts
            .FirstOrDefaultAsync(c => c.PropertyId == meter.PropertyId);

        return new QrScanResultDto(
            qrCode,
            meter.Id,
            meter.MeterNumber,
            contract?.Id,
            contract?.ContractNumber,
            contract?.ServiceAddress,
            contract is not null
        );
    }

    public async Task<MeterDto> RegisterMeterAsync(RegisterMeterRequest request)
    {
        var contract = await _db.Contracts
            .Include(c => c.Property)
            .FirstOrDefaultAsync(c => c.Id == request.ContractId)
            ?? throw new InvalidOperationException("Contrato no encontrado.");

        var meter = new Meter
        {
            Id = Guid.NewGuid(),
            MeterNumber = request.MeterNumber,
            QrCode = request.QrCode,
            PropertyId = contract.PropertyId,
            InstallationDate = DateTime.UtcNow
        };
        _db.Meters.Add(meter);
        await _db.SaveChangesAsync();

        return new MeterDto(meter.Id, meter.MeterNumber, meter.QrCode, meter.IsActive, meter.InstallationDate);
    }

    public async Task<MeterReadingDto> RecordReadingAsync(Guid meterId, string technicianId, RecordReadingRequest request)
    {
        var meter = await _db.Meters.FindAsync(meterId)
            ?? throw new InvalidOperationException("Medidor no encontrado.");

        var reading = new MeterReading
        {
            Id = Guid.NewGuid(),
            MeterId = meterId,
            CurrentReading = request.CurrentReading,
            ReadingDate = DateTime.UtcNow,
            Notes = request.Notes
        };
        _db.MeterReadings.Add(reading);
        await _db.SaveChangesAsync();

        return new MeterReadingDto(reading.Id, meter.Id, meter.MeterNumber, reading.CurrentReading, reading.ReadingDate, reading.Notes);
    }

    public async Task<List<MeterReadingDto>> GetMeterReadingsAsync(Guid meterId)
    {
        var meter = await _db.Meters.FindAsync(meterId)
            ?? throw new InvalidOperationException("Medidor no encontrado.");

        var readings = await _db.MeterReadings
            .Where(r => r.MeterId == meterId)
            .OrderByDescending(r => r.ReadingDate)
            .ToListAsync();

        return readings.Select(r => new MeterReadingDto(r.Id, meter.Id, meter.MeterNumber, r.CurrentReading, r.ReadingDate, r.Notes)).ToList();
    }
}
