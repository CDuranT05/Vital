using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities;

public class NeighborStatement
{
    public Guid Id { get; set; }

    public Guid HomeVisitId { get; set; }

    public string NeighborName { get; set; } = string.Empty;

    public string IdentityCard { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Statement { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public HomeVisit HomeVisit { get; set; } = null!;
}
