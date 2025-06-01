using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string UserType { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? Location { get; set; }
        public DateTime FollowDate { get; set; }
    }
}
