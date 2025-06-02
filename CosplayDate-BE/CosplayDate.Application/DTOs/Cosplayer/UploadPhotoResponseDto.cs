using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class UploadPhotoResponseDto
    {
        public int PhotoId { get; set; }
        public string PhotoUrl { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}
