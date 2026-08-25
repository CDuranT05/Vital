namespace Vital.Domain.Entities;

public class PasswordResetToken
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string TokenHash { get; set; } = string.Empty;  // SHA-256 del token real
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public int FailedAttempts { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
}
