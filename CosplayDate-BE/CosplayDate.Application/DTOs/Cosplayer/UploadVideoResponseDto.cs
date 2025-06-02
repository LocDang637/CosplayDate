using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class UploadVideoResponseDto
    {
        public int VideoId { get; set; }
        public string VideoUrl { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? Title { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}
