using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class CosplayerDetailsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public decimal PricePerHour { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Gender { get; set; }
        public string? CharacterSpecialty { get; set; }
        public decimal? Rating { get; set; }
        public int? TotalReviews { get; set; }
        public int? FollowersCount { get; set; }
        public string? ResponseTime { get; set; }
        public decimal? SuccessRate { get; set; }
        public bool? IsAvailable { get; set; }
        public string? Location { get; set; }
        public string? Bio { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<string> Specialties { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<CosplayerServiceDto> Services { get; set; } = new();
        public List<CosplayerPhotoDto> Photos { get; set; } = new();
        public List<CosplayerVideoDto> Videos { get; set; } = new();
        public List<ReviewSummaryDto> RecentReviews { get; set; } = new();
        public bool IsFollowing { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsOwnProfile { get; set; }
        public CosplayerStatsDto Stats { get; set; } = new();
    }
}
