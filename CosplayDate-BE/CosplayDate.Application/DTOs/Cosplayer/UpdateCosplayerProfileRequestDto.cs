using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class UpdateCosplayerProfileRequestDto
    {
        [StringLength(100, ErrorMessage = "Display name cannot exceed 100 characters")]
        public string? DisplayName { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Price per hour must be a positive value")]
        public decimal? PricePerHour { get; set; }

        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string? Category { get; set; }

        [StringLength(10, ErrorMessage = "Gender cannot exceed 10 characters")]
        public string? Gender { get; set; }

        [StringLength(100, ErrorMessage = "Character specialty cannot exceed 100 characters")]
        public string? CharacterSpecialty { get; set; }

        [StringLength(500, ErrorMessage = "Tags cannot exceed 500 characters")]
        public string? Tags { get; set; }

        public bool? IsAvailable { get; set; }

        public List<string>? Specialties { get; set; }
    }
}
