using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class ToggleFollowResponseDto
    {
        public bool IsFollowing { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalFollowers { get; set; }
    }
}
