using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities
{
    public class HomeVisit
    {
        public Guid Id { get; set; }

        public Guid VulnerabilityCaseId { get; set; }

        public string InspectorId { get; set; } = string.Empty;

        public DateTime VisitDate { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string Observations { get; set; } = string.Empty;

        public bool InformationConfirmed { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public VulnerabilityCase VulnerabilityCase { get; set; } = null!;

        public ICollection<HomeVisitPhoto> Photos { get; set; } = new List<HomeVisitPhoto>();

        public ICollection<NeighborStatement> NeighborStatements { get; set; } = new List<NeighborStatement>();
    }
}
