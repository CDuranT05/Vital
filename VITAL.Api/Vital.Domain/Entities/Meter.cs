using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities
{
    public class Meter
    {
        public Guid Id { get; set; }

        public string MeterNumber { get; set; } = string.Empty;

        public string QrCode { get; set; } = string.Empty;

        public Guid PropertyId { get; set; }

        public DateTime InstallationDate { get; set; }

        public bool IsActive { get; set; } = true;

        public Property Property { get; set; } = null!;

        public ICollection<MeterReading> Readings { get; set; } = new List<MeterReading>();
    }
}
