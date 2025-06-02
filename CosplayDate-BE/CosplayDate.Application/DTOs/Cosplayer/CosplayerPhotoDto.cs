using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class CosplayerPhotoDto
    {
        public int Id { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public bool? IsPortfolio { get; set; }
        public int? DisplayOrder { get; set; }
        public int? LikesCount { get; set; }
        public int? ViewsCount { get; set; }
        public List<string> Tags { get; set; } = new();
        public bool IsLiked { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
