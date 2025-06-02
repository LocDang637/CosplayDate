using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class PhotoLikeResponseDto
    {
        public bool IsLiked { get; set; }
        public int TotalLikes { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
