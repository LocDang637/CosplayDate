using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class UpdateCosplayerPhotoRequestDto
    {
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string? Title { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
        public string? Category { get; set; }

        public bool? IsPortfolio { get; set; }

        [Range(0, 999, ErrorMessage = "Display order must be between 0 and 999")]
        public int? DisplayOrder { get; set; }

        public List<string>? Tags { get; set; }
    }
}
