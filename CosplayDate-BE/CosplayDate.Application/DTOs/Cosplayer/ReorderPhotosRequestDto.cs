using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class ReorderPhotosRequestDto
    {
        [Required(ErrorMessage = "Photo orders are required")]
        [MinLength(1, ErrorMessage = "At least one photo order is required")]
        public List<PhotoOrderDto> PhotoOrders { get; set; } = new();
    }

    public class PhotoOrderDto
    {
        [Required(ErrorMessage = "Photo ID is required")]
        public int PhotoId { get; set; }

        [Range(0, 999, ErrorMessage = "Display order must be between 0 and 999")]
        public int DisplayOrder { get; set; }
    }
}
