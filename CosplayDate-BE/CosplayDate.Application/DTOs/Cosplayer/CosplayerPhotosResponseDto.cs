using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class CosplayerPhotosResponseDto
    {
        public List<CosplayerPhotoDto> Photos { get; set; } = new();
        public int TotalCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public string CosplayerName { get; set; } = string.Empty;
        public List<string> AvailableCategories { get; set; } = new();
        public List<string> AvailableTags { get; set; } = new();
    }
}
