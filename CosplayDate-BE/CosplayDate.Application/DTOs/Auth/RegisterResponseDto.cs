using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Auth
{
    public class RegisterResponseDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool RequiresEmailVerification { get; set; } = true;
    }
}
