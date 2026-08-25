using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Vital.Domain.Enums;


namespace Vital.Domain.Entities
{
    public class Contract
    {
        public Guid Id { get; set; }

        public string ContractNumber { get; set; } = string.Empty;

        public string ApplicationUserId { get; set; } = string.Empty;

        public string ServiceAddress { get; set; } = string.Empty;

        public bool IsPrimaryResidence { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Guid PropertyId { get; set; }

        public Property Property { get; set; } = null!;

        public ContractType ContractType { get; set; }

        public ContractStatus Status { get; set; } = ContractStatus.Active;

        public Guid BranchId { get; set; }
        public Branch? Branch { get; set; }

        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

        public ICollection<VulnerabilityCase> VulnerabilityCases { get; set; } = new List<VulnerabilityCase>();
    }
}
