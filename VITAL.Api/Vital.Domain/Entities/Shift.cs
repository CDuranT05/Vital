namespace Vital.Domain.Entities;

public class Shift
{
    public Guid Id { get; set; }
    public string TechnicianId { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public string ShiftName { get; set; } = string.Empty;
    public int StartHour { get; set; }
    public int EndHour { get; set; }
    public bool IsActive { get; set; } = true;

    public bool IsOnDutyNow()
    {
        var hour = DateTime.UtcNow.AddHours(-4).Hour; // UTC-4 Venezuela
        if (EndHour > StartHour)
            return hour >= StartHour && hour < EndHour;
        // Turno nocturno cruza medianoche
        return hour >= StartHour || hour < EndHour;
    }
}
