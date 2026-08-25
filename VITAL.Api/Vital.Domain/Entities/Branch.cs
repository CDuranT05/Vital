namespace Vital.Domain.Entities;

public class Branch
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
}
