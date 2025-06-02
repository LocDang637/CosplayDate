using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class ReviewSummaryDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerAvatarUrl { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public bool? IsVerified { get; set; }
        public int? HelpfulCount { get; set; }
        public string? OwnerResponse { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
