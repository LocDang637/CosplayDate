using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UserStatsDto
    {
        public int TotalFollowers { get; set; }
        public int TotalFollowing { get; set; }
        public int TotalPosts { get; set; }
        public int TotalLikes { get; set; }
        public DateTime MemberSince { get; set; }
        public int EventsAttended { get; set; }
        public decimal ProfileViews { get; set; }
    }
}
