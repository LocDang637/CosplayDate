using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class CosplayerServicesResponseDto
    {
        public List<CosplayerServiceDto> Services { get; set; } = new();
        public int TotalCount { get; set; }
        public string CosplayerName { get; set; } = string.Empty;
    }
}
