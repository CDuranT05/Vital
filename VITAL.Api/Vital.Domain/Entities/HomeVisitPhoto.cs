using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Vital.Domain.Entities;

public class HomeVisitPhoto
{
    public Guid Id { get; set; }

    public Guid HomeVisitId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public HomeVisit HomeVisit { get; set; } = null!;
}
