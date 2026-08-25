using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Domain.Enums;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly VitalDbContext _db;
    private static readonly string _bankLogPath =
        Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bank-payments.json");

    public PaymentService(VitalDbContext db)
    {
        _db = db;
    }

    public async Task<PaymentDto> SubmitPaymentAsync(SubmitPaymentRequest request, string? receiptPath)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Contract)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId)
            ?? throw new InvalidOperationException("Factura no encontrada.");

        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Esta factura ya fue pagada.");

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = request.InvoiceId,
            Amount = invoice.TotalAmount,
            PaymentDate = DateTime.UtcNow,
            ReferenceNumber = request.ReferenceNumber,
            PaymentMethod = (PaymentMethod)request.PaymentMethod,
            ReceiptPath = receiptPath
        };

        invoice.Status = InvoiceStatus.Paid;

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await AppendToBankLogAsync(payment, invoice);

        return new PaymentDto(
            payment.Id,
            payment.InvoiceId,
            invoice.Contract?.ContractNumber ?? "",
            payment.Amount,
            payment.PaymentDate,
            payment.ReferenceNumber,
            (int)payment.PaymentMethod,
            payment.ReceiptPath
        );
    }

    private async Task AppendToBankLogAsync(Payment payment, Invoice invoice)
    {
        var entries = new List<object>();

        if (File.Exists(_bankLogPath))
        {
            var existing = await File.ReadAllTextAsync(_bankLogPath);
            try { entries = JsonSerializer.Deserialize<List<object>>(existing) ?? []; }
            catch { entries = []; }
        }

        entries.Add(new
        {
            paymentId = payment.Id,
            invoiceId = payment.InvoiceId,
            contractNumber = invoice.Contract?.ContractNumber,
            amount = payment.Amount,
            paymentDate = payment.PaymentDate,
            referenceNumber = payment.ReferenceNumber,
            paymentMethod = payment.PaymentMethod.ToString(),
            receiptPath = payment.ReceiptPath
        });

        await File.WriteAllTextAsync(
            _bankLogPath,
            JsonSerializer.Serialize(entries, new JsonSerializerOptions { WriteIndented = true })
        );
    }
}
