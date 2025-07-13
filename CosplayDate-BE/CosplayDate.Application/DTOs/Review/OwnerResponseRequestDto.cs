using System.ComponentModel.DataAnnotations;

namespace CosplayDate.Application.DTOs.Review
{
    public class OwnerResponseRequestDto
    {
        [Required]
        public string Response { get; set; } = string.Empty;
    }
} 