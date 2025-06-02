using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class BecomeCosplayerRequestDto
    {
        [Required(ErrorMessage = "Display name is required")]
        [StringLength(100, ErrorMessage = "Display name cannot exceed 100 characters")]
        public string DisplayName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price per hour is required")]
        [Range(1, 10000, ErrorMessage = "Price per hour must be between 1 and 10,000")]
        public decimal PricePerHour { get; set; }

        [Required(ErrorMessage = "Category is required")]
        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string Category { get; set; } = string.Empty;

        [StringLength(10, ErrorMessage = "Gender cannot exceed 10 characters")]
        public string? Gender { get; set; }

        [StringLength(100, ErrorMessage = "Character specialty cannot exceed 100 characters")]
        public string? CharacterSpecialty { get; set; }

        [StringLength(500, ErrorMessage = "Tags cannot exceed 500 characters")]
        public string? Tags { get; set; }

        public List<string>? Specialties { get; set; }

        [Required(ErrorMessage = "You must accept the cosplayer terms")]
        public bool AcceptCosplayerTerms { get; set; }
    }
}
