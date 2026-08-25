namespace Vital.Application.DTOs;

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record ChangeEmailRequest(
    string CurrentPassword,
    string NewEmail
);

public record ChangePhoneRequest(
    string CurrentPassword,
    string NewPhone
);

public record ProfileDto(
    string FirstName,
    string LastName,
    string IdentityCard,
    string? Email,
    string? Phone
);
