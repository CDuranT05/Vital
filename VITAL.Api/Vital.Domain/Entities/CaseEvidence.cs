using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities
{
    public class CaseEvidence
    {
        public Guid Id { get; set; }

        public Guid VulnerabilityCaseId { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public VulnerabilityCase VulnerabilityCase { get; set; } = null!;
    }
}
