﻿using CosplayDate.Application.DTOs.Admin;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IAdminAnalyticsService
    {
        Task<ApiResponse<AdminDashboardStatsDto>> GetDashboardStatsAsync();
        Task<ApiResponse<UserStatsDto>> GetUserStatsAsync();
        Task<ApiResponse<BookingStatsDto>> GetBookingStatsAsync();
        Task<ApiResponse<RevenueStatsDto>> GetRevenueStatsAsync();
        Task<ApiResponse<ReviewStatsDto>> GetReviewStatsAsync();
        Task<ApiResponse<List<DailyStatsDto>>> GetDailyTrendsAsync(DateTime? fromDate = null, DateTime? toDate = null);
    }
}