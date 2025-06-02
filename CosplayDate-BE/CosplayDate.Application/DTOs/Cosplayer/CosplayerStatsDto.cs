using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Cosplayer
{
    public class CosplayerStatsDto
    {
        public int TotalBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int TotalFollowers { get; set; }
        public int TotalPhotos { get; set; }
        public int TotalVideos { get; set; }
        public int TotalLikes { get; set; }
        public int ProfileViews { get; set; }
        public DateTime MemberSince { get; set; }
        public decimal SuccessRate { get; set; }
        public string ResponseTime { get; set; } = string.Empty;
    }
}
