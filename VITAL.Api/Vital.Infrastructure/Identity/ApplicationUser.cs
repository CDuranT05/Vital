using Microsoft.AspNetCore.Identity;
using Vital.Domain.Enums;

namespace Vital.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string IdentityCard { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Citizen;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? BranchId { get; set; }
}
