using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Auth
{
    public class UnverifiedAccountResponseDto
    {
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool CodeResent { get; set; }
        public string ResendMessage { get; set; } = string.Empty;
    }
}
