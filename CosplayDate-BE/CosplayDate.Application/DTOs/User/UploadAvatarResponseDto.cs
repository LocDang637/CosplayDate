using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UploadAvatarResponseDto
    {
        public string AvatarUrl { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}
