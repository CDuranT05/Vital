using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Domain.Enums;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly VitalDbContext _db;

    public InvoiceService(VitalDbContext db) => _db = db;

    public async Task<List<InvoiceDto>> GetUserInvoicesAsync(string userId)
    {
        var invoices = await _db.Invoices
            .Include(i => i.Contract)
            .Where(i => i.Contract.ApplicationUserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<List<InvoiceDto>> GetContractInvoicesAsync(Guid contractId)
    {
        var invoices = await _db.Invoices
            .Include(i => i.Contract)
            .Where(i => i.ContractId == contractId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invoices.Select(MapToDto).ToList();
    }

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(Guid id)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Contract)
            .FirstOrDefaultAsync(i => i.Id == id);

        return invoice is null ? null : MapToDto(invoice);
    }

    public async Task<GenerateInvoiceResultDto> GenerateFromMeterReadingAsync(Guid meterId, decimal currentReading)
    {
        var meter = await _db.Meters.FindAsync(meterId)
            ?? throw new InvalidOperationException("Medidor no encontrado.");

        var contract = await _db.Contracts
            .Include(c => c.Property)
            .FirstOrDefaultAsync(c => c.PropertyId == meter.PropertyId)
            ?? throw new InvalidOperationException("El medidor no tiene un contrato asociado. Registre el contrato primero.");

        var lastReading = await _db.MeterReadings
            .Where(r => r.MeterId == meterId)
            .OrderByDescending(r => r.ReadingDate)
            .FirstOrDefaultAsync();

        var previousReading = lastReading?.CurrentReading ?? 0m;
        var consumption = Math.Max(0m, currentReading - previousReading);

        _db.MeterReadings.Add(new MeterReading
        {
            Id = Guid.NewGuid(),
            MeterId = meterId,
            CurrentReading = currentReading,
            ReadingDate = DateTime.UtcNow
        });

        var tariff = await _db.Tariffs
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.EffectiveFrom)
            .FirstOrDefaultAsync();

        if (tariff is null)
        {
            tariff = new Tariff
            {
                Id = Guid.NewGuid(),
                Name = "Tarifa Base",
                PricePerKwh = 0.20m,
                EffectiveFrom = DateTime.UtcNow,
                IsActive = true
            };
            _db.Tariffs.Add(tariff);
        }

        var amount = consumption * tariff.PricePerKwh;
        var now = DateTime.UtcNow;
        var periodStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var periodEnd = periodStart.AddMonths(1).AddDays(-1);

        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            ContractId = contract.Id,
            BillingPeriodStart = periodStart,
            BillingPeriodEnd = periodEnd,
            ConsumptionKwh = consumption,
            Amount = amount,
            DiscountAmount = 0m,
            TotalAmount = amount,
            DueDate = periodEnd.AddDays(10),
            Status = InvoiceStatus.Pending,
            TariffId = tariff.Id
        };
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();

        invoice.Contract = contract;
        return new GenerateInvoiceResultDto(MapToDto(invoice), previousReading, consumption);
    }

    private static InvoiceDto MapToDto(Invoice i) => new(
        i.Id,
        i.ContractId,
        i.Contract?.ContractNumber ?? "",
        i.BillingPeriodStart,
        i.BillingPeriodEnd,
        i.ConsumptionKwh,
        i.Amount,
        i.DiscountAmount,
        i.TotalAmount,
        i.DueDate,
        i.Status,
        i.CreatedAt
    );
}
