using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Auth
{
    public class VerifyEmailResponseDto
    {
        public bool IsVerified { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime? VerifiedAt { get; set; }
    }
}
