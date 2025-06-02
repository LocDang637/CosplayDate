using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class GetCosplayersRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
        public int PageSize { get; set; } = 20;

        public string? SearchTerm { get; set; }
        public string? Category { get; set; }
        public string? Location { get; set; }
        public string? Gender { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public decimal? MinRating { get; set; }
        public bool? IsAvailable { get; set; }
        public string? SortBy { get; set; } = "rating"; // rating, price, name, created_date
        public string? SortOrder { get; set; } = "desc"; // asc, desc
        public List<string>? Specialties { get; set; }
        public List<string>? Tags { get; set; }
    }
}
