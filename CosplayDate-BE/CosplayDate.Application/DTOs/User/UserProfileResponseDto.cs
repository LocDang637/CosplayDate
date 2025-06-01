using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UserProfileResponseDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string? Location { get; set; }
        public string? Bio { get; set; }
        public string UserType { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string MembershipTier { get; set; } = string.Empty;
        public int LoyaltyPoints { get; set; }
        public decimal WalletBalance { get; set; }
        public decimal ProfileCompleteness { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Interests { get; set; } = new();
        public bool IsOwnProfile { get; set; }
        public bool IsFollowing { get; set; }
        public UserStatsDto Stats { get; set; } = new();
    }
}
