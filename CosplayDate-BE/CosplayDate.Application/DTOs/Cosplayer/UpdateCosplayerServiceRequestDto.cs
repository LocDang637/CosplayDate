using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class UpdateCosplayerServiceRequestDto
    {
        [Required(ErrorMessage = "Service name is required")]
        [StringLength(100, ErrorMessage = "Service name cannot exceed 100 characters")]
        public string ServiceName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Service description cannot exceed 500 characters")]
        public string? ServiceDescription { get; set; }
    }
}
