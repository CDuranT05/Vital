using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Text;
using Vital.Domain.Enums;

namespace Vital.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }

        public string IdentityCard { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public UserRole Role { get; set; } = UserRole.Citizen;

        public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    }
}

