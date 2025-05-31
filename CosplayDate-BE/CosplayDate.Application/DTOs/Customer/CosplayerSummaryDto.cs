using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class CosplayerSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public decimal Rating { get; set; }
        public string Specialty { get; set; } = string.Empty;
    }
}
