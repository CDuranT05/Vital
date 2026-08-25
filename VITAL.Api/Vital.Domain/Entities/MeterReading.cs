using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities
{
    public class MeterReading
    {
        public Guid Id { get; set; }

        public Guid MeterId { get; set; }

        public decimal CurrentReading { get; set; }

        public DateTime ReadingDate { get; set; }

        public string? Notes { get; set; }

        public Meter Meter { get; set; } = null!;
    }
}
