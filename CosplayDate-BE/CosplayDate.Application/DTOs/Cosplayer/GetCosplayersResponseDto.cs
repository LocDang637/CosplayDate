using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class GetCosplayersResponseDto
    {
        public List<CosplayerSummaryDto> Cosplayers { get; set; } = new();
        public int TotalCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public List<string> AvailableCategories { get; set; } = new();
        public List<string> AvailableSpecialties { get; set; } = new();
        public List<string> AvailableTags { get; set; } = new();
    }
}
