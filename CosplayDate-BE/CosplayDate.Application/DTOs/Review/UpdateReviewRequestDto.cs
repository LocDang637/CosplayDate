using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CosplayDate.Application.DTOs.Review
{
    public class UpdateReviewRequestDto
    {
        [Range(1,5)]
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public List<string>? Tags { get; set; }
    }
} 