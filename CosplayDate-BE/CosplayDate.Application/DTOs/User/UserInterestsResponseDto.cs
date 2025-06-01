using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UserInterestsResponseDto
    {
        public List<string> Interests { get; set; } = new();
        public List<string> AvailableInterests { get; set; } = new();
    }
}
