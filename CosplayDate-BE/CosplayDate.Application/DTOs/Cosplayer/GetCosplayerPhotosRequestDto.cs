using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class GetCosplayerPhotosRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
        public int PageSize { get; set; } = 20;

        public string? Category { get; set; }
        public bool? IsPortfolio { get; set; }
        public string? SortBy { get; set; } = "display_order"; // display_order, created_date, likes_count, views_count
        public string? SortOrder { get; set; } = "asc"; // asc, desc
        public List<string>? Tags { get; set; }
    }
}
