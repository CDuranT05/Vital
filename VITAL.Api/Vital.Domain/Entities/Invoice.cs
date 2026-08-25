using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Vital.Domain.Enums;

namespace Vital.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; }

    public Guid ContractId { get; set; }

    public DateTime BillingPeriodStart { get; set; }

    public DateTime BillingPeriodEnd { get; set; }

    public decimal ConsumptionKwh { get; set; }

    public decimal Amount { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime DueDate { get; set; }

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid TariffId { get; set; }

    public Tariff Tariff { get; set; } = null!;

    public Contract Contract { get; set; } = null!;

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();

}
