using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities
{
    public class Property
    {
        public Guid Id { get; set; }

        public string Address { get; set; } = string.Empty;

        public string Parish { get; set; } = string.Empty;

        public string Municipality { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Meter> Meters { get; set; } = new List<Meter>();
    }
}

