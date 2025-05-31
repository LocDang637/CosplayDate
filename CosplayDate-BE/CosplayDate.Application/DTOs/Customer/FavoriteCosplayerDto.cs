using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class FavoriteCosplayerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public decimal Rating { get; set; }
        public int TotalReviews { get; set; }
        public decimal PricePerHour { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? CharacterSpecialty { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime FavoriteDate { get; set; }
    }
}
