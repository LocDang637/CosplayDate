using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class CustomerStatsDto
    {
        public int TotalBookings { get; set; }
        public decimal TotalSpent { get; set; }
        public int FavoriteCosplayers { get; set; }
        public int ReviewsGiven { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public decimal AvgBookingValue { get; set; }
        public decimal AvgRatingGiven { get; set; }
        public int ActiveBookings { get; set; }
    }
}
