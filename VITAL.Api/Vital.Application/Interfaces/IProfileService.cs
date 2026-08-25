using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface IProfileService
{
    Task<ProfileDto> GetProfileAsync(string userId);
    Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
    Task ChangeEmailAsync(string userId, ChangeEmailRequest request);
    Task ChangePhoneAsync(string userId, ChangePhoneRequest request);
}
