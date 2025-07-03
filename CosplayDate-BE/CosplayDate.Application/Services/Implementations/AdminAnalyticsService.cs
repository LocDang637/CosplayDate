using CosplayDate.Application.DTOs.Admin;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Implementations
{
    public class AdminAnalyticsService : IAdminAnalyticsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AdminAnalyticsService> _logger;
        private const decimal COMMISSION_RATE = 0.20m; // 20% commission

        public AdminAnalyticsService(IUnitOfWork unitOfWork, ILogger<AdminAnalyticsService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<ApiResponse<AdminDashboardStatsDto>> GetDashboardStatsAsync()
        {
            try
            {
                var userStats = await GetUserStatsInternalAsync();
                var bookingStats = await GetBookingStatsInternalAsync();
                var revenueStats = await GetRevenueStatsInternalAsync();
                var systemHealth = await GetSystemHealthInternalAsync();
                var dailyTrends = await GetDailyTrendsInternalAsync(DateTime.Today.AddDays(-30), DateTime.Today);

                var dashboardStats = new AdminDashboardStatsDto
                {
                    UserStats = userStats,
                    BookingStats = bookingStats,
                    RevenueStats = revenueStats,
                    SystemHealth = systemHealth,
                    DailyTrends = dailyTrends,
                    GeneratedAt = DateTime.UtcNow
                };

                return ApiResponse<AdminDashboardStatsDto>.Success(dashboardStats, "Dashboard statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard statistics");
                return ApiResponse<AdminDashboardStatsDto>.Error("Failed to retrieve dashboard statistics");
            }
        }

        public async Task<ApiResponse<UserStatsDto>> GetUserStatsAsync()
        {
            try
            {
                var stats = await GetUserStatsInternalAsync();
                return ApiResponse<UserStatsDto>.Success(stats, "User statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user statistics");
                return ApiResponse<UserStatsDto>.Error("Failed to retrieve user statistics");
            }
        }

        public async Task<ApiResponse<BookingStatsDto>> GetBookingStatsAsync()
        {
            try
            {
                var stats = await GetBookingStatsInternalAsync();
                return ApiResponse<BookingStatsDto>.Success(stats, "Booking statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving booking statistics");
                return ApiResponse<BookingStatsDto>.Error("Failed to retrieve booking statistics");
            }
        }

        public async Task<ApiResponse<RevenueStatsDto>> GetRevenueStatsAsync()
        {
            try
            {
                var stats = await GetRevenueStatsInternalAsync();
                return ApiResponse<RevenueStatsDto>.Success(stats, "Revenue statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving revenue statistics");
                return ApiResponse<RevenueStatsDto>.Error("Failed to retrieve revenue statistics");
            }
        }

        public async Task<ApiResponse<List<DailyStatsDto>>> GetDailyTrendsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                fromDate ??= DateTime.Today.AddDays(-30);
                toDate ??= DateTime.Today;

                var trends = await GetDailyTrendsInternalAsync(fromDate.Value, toDate.Value);
                return ApiResponse<List<DailyStatsDto>>.Success(trends, "Daily trends retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily trends");
                return ApiResponse<List<DailyStatsDto>>.Error("Failed to retrieve daily trends");
            }
        }

        public async Task<ApiResponse<SystemHealthDto>> GetSystemHealthAsync()
        {
            try
            {
                var health = await GetSystemHealthInternalAsync();
                return ApiResponse<SystemHealthDto>.Success(health, "System health retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system health");
                return ApiResponse<SystemHealthDto>.Error("Failed to retrieve system health");
            }
        }

        // Internal helper methods
        private async Task<UserStatsDto> GetUserStatsInternalAsync()
        {
            var allUsers = await _unitOfWork.Users.GetAllAsync();
            var usersList = allUsers.ToList();

            var today = DateTime.Today;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddDays(-30);
            var lastMonth = today.AddMonths(-1);

            var totalUsers = usersList.Count;
            var totalCustomers = usersList.Count(u => u.UserType == "Customer");
            var totalCosplayers = usersList.Count(u => u.UserType == "Cosplayer");
            var onlineUsers = usersList.Count(u => u.IsOnline == true);

            // Get online cosplayers (users who are cosplayers AND online)
            var cosplayerUserIds = (await _unitOfWork.Cosplayers.GetAllAsync()).Select(c => c.UserId).ToList();
            var onlineCosplayers = usersList.Count(u => u.IsOnline == true && cosplayerUserIds.Contains(u.Id));

            var verifiedUsers = usersList.Count(u => u.IsVerified);
            var newUsersToday = usersList.Count(u => u.CreatedAt?.Date == today);
            var newUsersThisWeek = usersList.Count(u => u.CreatedAt >= weekAgo);
            var newUsersThisMonth = usersList.Count(u => u.CreatedAt >= monthAgo);

            // Calculate growth rate
            var usersLastMonth = usersList.Count(u => u.CreatedAt < lastMonth);
            var userGrowthRate = usersLastMonth > 0 ? ((double)(totalUsers - usersLastMonth) / usersLastMonth) * 100 : 0;

            return new UserStatsDto
            {
                TotalUsers = totalUsers,
                TotalCustomers = totalCustomers,
                TotalCosplayers = totalCosplayers,
                OnlineUsers = onlineUsers,
                OnlineCosplayers = onlineCosplayers,
                VerifiedUsers = verifiedUsers,
                NewUsersToday = newUsersToday,
                NewUsersThisWeek = newUsersThisWeek,
                NewUsersThisMonth = newUsersThisMonth,
                UserGrowthRate = Math.Round(userGrowthRate, 2)
            };
        }

        private async Task<BookingStatsDto> GetBookingStatsInternalAsync()
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var bookingsList = allBookings.ToList();

            var today = DateTime.Today;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddDays(-30);

            var totalBookings = bookingsList.Count;
            var completedBookings = bookingsList.Count(b => b.Status == "Completed");
            var pendingBookings = bookingsList.Count(b => b.Status == "Pending");
            var confirmedBookings = bookingsList.Count(b => b.Status == "Confirmed");
            var cancelledBookings = bookingsList.Count(b => b.Status == "Cancelled");

            var bookingsToday = bookingsList.Count(b => b.CreatedAt?.Date == today);
            var bookingsThisWeek = bookingsList.Count(b => b.CreatedAt >= weekAgo);
            var bookingsThisMonth = bookingsList.Count(b => b.CreatedAt >= monthAgo);

            // Calculate rates
            var completionRate = totalBookings > 0 ? ((double)completedBookings / totalBookings) * 100 : 0;
            var cancellationRate = totalBookings > 0 ? ((double)cancelledBookings / totalBookings) * 100 : 0;

            // Calculate growth rate
            var bookingsLastMonth = bookingsList.Count(b => b.CreatedAt < monthAgo);
            var bookingGrowthRate = bookingsLastMonth > 0 ? ((double)(bookingsThisMonth) / bookingsLastMonth) * 100 : 0;

            // Average booking value
            var averageBookingValue = completedBookings > 0 ?
                bookingsList.Where(b => b.Status == "Completed").Average(b => b.TotalPrice) : 0;

            return new BookingStatsDto
            {
                TotalBookings = totalBookings,
                CompletedBookings = completedBookings,
                PendingBookings = pendingBookings,
                ConfirmedBookings = confirmedBookings,
                CancelledBookings = cancelledBookings,
                BookingsToday = bookingsToday,
                BookingsThisWeek = bookingsThisWeek,
                BookingsThisMonth = bookingsThisMonth,
                BookingGrowthRate = Math.Round(bookingGrowthRate, 2),
                CompletionRate = Math.Round(completionRate, 2),
                CancellationRate = Math.Round(cancellationRate, 2),
                AverageBookingValue = Math.Round(averageBookingValue, 2)
            };
        }

        private async Task<RevenueStatsDto> GetRevenueStatsInternalAsync()
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var bookingsList = allBookings.ToList();

            var today = DateTime.Today;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddDays(-30);
            var lastMonthStart = today.AddMonths(-1).Date;
            var thisMonthStart = new DateTime(today.Year, today.Month, 1);

            // Get completed bookings for revenue calculation
            var completedBookings = bookingsList.Where(b => b.PaymentStatus == "Completed").ToList();
            var confirmedBookings = bookingsList.Where(b => b.Status == "Confirmed").ToList();

            // Calculate total revenue (20% commission from completed bookings)
            var totalBookingValue = completedBookings.Sum(b => b.TotalPrice);
            var totalRevenue = totalBookingValue * COMMISSION_RATE;

            // Time-based revenue
            var revenueToday = completedBookings
                .Where(b => b.UpdatedAt?.Date == today)
                .Sum(b => b.TotalPrice) * COMMISSION_RATE;

            var revenueThisWeek = completedBookings
                .Where(b => b.UpdatedAt >= weekAgo)
                .Sum(b => b.TotalPrice) * COMMISSION_RATE;

            var revenueThisMonth = completedBookings
                .Where(b => b.UpdatedAt >= thisMonthStart)
                .Sum(b => b.TotalPrice) * COMMISSION_RATE;

            var revenueLastMonth = completedBookings
                .Where(b => b.UpdatedAt >= lastMonthStart && b.UpdatedAt < thisMonthStart)
                .Sum(b => b.TotalPrice) * COMMISSION_RATE;

            // Calculate growth rate
            var revenueGrowthRate = revenueLastMonth > 0 ?
                ((double)(revenueThisMonth - revenueLastMonth) / (double)revenueLastMonth) * 100 : 0;

            // Pending revenue from confirmed bookings
            var pendingRevenue = confirmedBookings.Sum(b => b.TotalPrice) * COMMISSION_RATE;

            // Average commission per booking
            var averageCommissionPerBooking = completedBookings.Count > 0 ?
                totalRevenue / completedBookings.Count : 0;

            // Project monthly revenue based on current trend
            var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
            var daysPassed = today.Day;
            var projectedMonthlyRevenue = daysPassed > 0 ?
                (revenueThisMonth / daysPassed) * daysInMonth : 0;

            return new RevenueStatsDto
            {
                TotalRevenue = Math.Round(totalRevenue, 2),
                RevenueToday = Math.Round(revenueToday, 2),
                RevenueThisWeek = Math.Round(revenueThisWeek, 2),
                RevenueThisMonth = Math.Round(revenueThisMonth, 2),
                RevenueLastMonth = Math.Round(revenueLastMonth, 2),
                RevenueGrowthRate = Math.Round(revenueGrowthRate, 2),
                PendingRevenue = Math.Round(pendingRevenue, 2),
                TotalBookingValue = Math.Round(totalBookingValue, 2),
                AverageCommissionPerBooking = Math.Round(averageCommissionPerBooking, 2),
                ProjectedMonthlyRevenue = Math.Round(projectedMonthlyRevenue, 2)
            };
        }

        private async Task<SystemHealthDto> GetSystemHealthInternalAsync()
        {
            // Get escrow statistics
            var allEscrows = await _unitOfWork.EscrowTransactions.GetAllAsync();
            var escrowsList = allEscrows.ToList();

            var activeEscrows = escrowsList.Count(e => e.Status == "Held");
            var totalEscrowAmount = escrowsList.Where(e => e.Status == "Held").Sum(e => e.Amount);

            // Get payment statistics
            var allPayments = await _unitOfWork.Payments.GetAllAsync();
            var paymentsList = allPayments.ToList();

            var pendingPayments = paymentsList.Count(p => p.Status == "Pending");
            var failedPayments = paymentsList.Count(p => p.Status == "Failed");

            return new SystemHealthDto
            {
                ActiveEscrows = activeEscrows,
                TotalEscrowAmount = Math.Round(totalEscrowAmount, 2),
                PendingPayments = pendingPayments,
                FailedPayments = failedPayments,
                SystemUptime = 99.9, // This would typically come from monitoring service
                LastBackup = DateTime.UtcNow.AddHours(-6) // This would come from backup service
            };
        }

        private async Task<List<DailyStatsDto>> GetDailyTrendsInternalAsync(DateTime fromDate, DateTime toDate)
        {
            var allUsers = await _unitOfWork.Users.GetAllAsync();
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();

            var usersList = allUsers.ToList();
            var bookingsList = allBookings.ToList();

            var trends = new List<DailyStatsDto>();

            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                var newUsers = usersList.Count(u => u.CreatedAt?.Date == date);
                var newBookings = bookingsList.Count(b => b.CreatedAt?.Date == date);
                var completedBookings = bookingsList.Count(b => b.UpdatedAt?.Date == date && b.Status == "Completed");

                var dayBookingValue = bookingsList
                    .Where(b => b.UpdatedAt?.Date == date && b.PaymentStatus == "Completed")
                    .Sum(b => b.TotalPrice);
                var dayRevenue = dayBookingValue * COMMISSION_RATE;

                trends.Add(new DailyStatsDto
                {
                    Date = date,
                    NewUsers = newUsers,
                    NewBookings = newBookings,
                    CompletedBookings = completedBookings,
                    Revenue = Math.Round(dayRevenue, 2),
                    BookingValue = Math.Round(dayBookingValue, 2)
                });
            }

            return trends.OrderBy(t => t.Date).ToList();
        }
    }
}
