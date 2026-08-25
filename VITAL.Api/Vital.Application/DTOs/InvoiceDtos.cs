using Vital.Domain.Enums;

namespace Vital.Application.DTOs;

public record InvoiceDto(
    Guid Id,
    Guid ContractId,
    string ContractNumber,
    DateTime BillingPeriodStart,
    DateTime BillingPeriodEnd,
    decimal ConsumptionKwh,
    decimal Amount,
    decimal DiscountAmount,
    decimal TotalAmount,
    DateTime DueDate,
    InvoiceStatus Status,
    DateTime CreatedAt
);

public record GenerateInvoiceRequest(Guid MeterId, decimal CurrentReading);
public record GenerateInvoiceResultDto(InvoiceDto Invoice, decimal PreviousReading, decimal ConsumptionKwh);
