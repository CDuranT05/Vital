using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Vital.Domain.Enums;

namespace Vital.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }

        public Guid InvoiceId { get; set; }

        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; }

        public string ReferenceNumber { get; set; } = string.Empty;

        public PaymentMethod PaymentMethod { get; set; } 

        public string? ReceiptPath { get; set; }

        public Invoice Invoice { get; set; } = null!;

    }
}
