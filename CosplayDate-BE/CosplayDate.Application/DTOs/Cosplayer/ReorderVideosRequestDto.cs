using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class ReorderVideosRequestDto
    {
        [Required(ErrorMessage = "Video orders are required")]
        [MinLength(1, ErrorMessage = "At least one video order is required")]
        public List<VideoOrderDto> VideoOrders { get; set; } = new();
    }

    public class VideoOrderDto
    {
        [Required(ErrorMessage = "Video ID is required")]
        public int VideoId { get; set; }

        [Range(0, 999, ErrorMessage = "Display order must be between 0 and 999")]
        public int DisplayOrder { get; set; }
    }
}
