using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class BecomeCosplayerResponseDto
    {
        public int CosplayerId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool RequiresApproval { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
