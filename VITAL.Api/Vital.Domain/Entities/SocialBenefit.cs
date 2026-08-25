using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Vital.Domain.Enums;

namespace Vital.Domain.Entities;

public class SocialBenefit
{
    public Guid Id { get; set; }

    public VulnerabilityLevel VulnerabilityLevel { get; set; }

    public decimal DiscountPercentage { get; set; }

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
