using CosplayDate.Application.DTOs.Booking;
using CosplayDate.Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Admin
{
    public class ReviewStatsDto
    {
        public int TotalReviews { get; set; }
        public int VerifiedReviews { get; set; }
        public int ReviewsToday { get; set; }
        public int ReviewsThisWeek { get; set; }
        public int ReviewsThisMonth { get; set; }
        public double AverageRating { get; set; }
        public int Rating5Count { get; set; }
        public int Rating4Count { get; set; }
        public int Rating3Count { get; set; }
        public int Rating2Count { get; set; }
        public int Rating1Count { get; set; }
        public double ReviewGrowthRate { get; set; }
        public int ReviewsWithResponse { get; set; }
        public double ResponseRate { get; set; }
    }
    public class AdminDashboardStatsDto
    {
        public UserStatsDto UserStats { get; set; } = null!;
        public BookingStatsDto BookingStats { get; set; } = null!;
        public RevenueStatsDto RevenueStats { get; set; } = null!;
        public ReviewStatsDto ReviewStats { get; set; } = null!;
        public List<DailyStatsDto> DailyTrends { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class UserStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalCosplayers { get; set; }
        public int OnlineUsers { get; set; }
        public int OnlineCosplayers { get; set; }
        public int VerifiedUsers { get; set; }
        public int NewUsersToday { get; set; }
        public int NewUsersThisWeek { get; set; }
        public int NewUsersThisMonth { get; set; }
        public double UserGrowthRate { get; set; } // Percentage growth from last month
    }

    public class BookingStatsDto
    {
        public int TotalBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int PendingBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public int BookingsToday { get; set; }
        public int BookingsThisWeek { get; set; }
        public int BookingsThisMonth { get; set; }
        public double BookingGrowthRate { get; set; }
        public double CompletionRate { get; set; }
        public double CancellationRate { get; set; }
        public decimal AverageBookingValue { get; set; }
    }

    public class RevenueStatsDto
    {
        public decimal TotalRevenue { get; set; } // 20% commission from completed bookings
        public decimal RevenueToday { get; set; }
        public decimal RevenueThisWeek { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public decimal RevenueLastMonth { get; set; }
        public double RevenueGrowthRate { get; set; }
        public decimal PendingRevenue { get; set; } // 20% of confirmed bookings not yet completed
        public decimal TotalBookingValue { get; set; } // Total value of all completed bookings
        public decimal AverageCommissionPerBooking { get; set; }
        public decimal ProjectedMonthlyRevenue { get; set; }
    }

    public class SystemHealthDto
    {
        public int ActiveEscrows { get; set; }
        public decimal TotalEscrowAmount { get; set; }
        public int PendingPayments { get; set; }
        public int FailedPayments { get; set; }
        public double SystemUptime { get; set; }
        public DateTime LastBackup { get; set; }
    }

    public class DailyStatsDto
    {
        public DateTime Date { get; set; }
        public int NewUsers { get; set; }
        public int NewBookings { get; set; }
        public int CompletedBookings { get; set; }
        public decimal Revenue { get; set; }
        public decimal BookingValue { get; set; }
    }
}
