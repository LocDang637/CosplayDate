using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


//Admin account: admin@cosplaydate.com    //Admin@123
                
namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "RequireAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly IAdminAnalyticsService _analyticsService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IAdminAnalyticsService analyticsService, ILogger<DashboardController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Get complete admin dashboard statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var result = await _analyticsService.GetDashboardStatsAsync();
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard stats");
                return StatusCode(500, new { message = "Failed to retrieve dashboard statistics" });
            }
        }

        /// <summary>
        /// Get user statistics only
        /// </summary>
        [HttpGet("users/stats")]
        public async Task<IActionResult> GetUserStats()
        {
            try
            {
                var result = await _analyticsService.GetUserStatsAsync();
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user stats");
                return StatusCode(500, new { message = "Failed to retrieve user statistics" });
            }
        }

        /// <summary>
        /// Get booking statistics only
        /// </summary>
        [HttpGet("bookings/stats")]
        public async Task<IActionResult> GetBookingStats()
        {
            try
            {
                var result = await _analyticsService.GetBookingStatsAsync();
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving booking stats");
                return StatusCode(500, new { message = "Failed to retrieve booking statistics" });
            }
        }

        /// <summary>
        /// Get revenue statistics only
        /// </summary>
        [HttpGet("revenue/stats")]
        public async Task<IActionResult> GetRevenueStats()
        {
            try
            {
                var result = await _analyticsService.GetRevenueStatsAsync();
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving revenue stats");
                return StatusCode(500, new { message = "Failed to retrieve revenue statistics" });
            }
        }

        /// <summary>
        /// Get daily trends for specified date range
        /// </summary>
        [HttpGet("trends/daily")]
        public async Task<IActionResult> GetDailyTrends(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            try
            {
                var result = await _analyticsService.GetDailyTrendsAsync(fromDate, toDate);
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving daily trends");
                return StatusCode(500, new { message = "Failed to retrieve daily trends" });
            }
        }

        /// <summary>
        /// Get system health metrics
        /// </summary>
        [HttpGet("system/health")]
        public async Task<IActionResult> GetSystemHealth()
        {
            try
            {
                var result = await _analyticsService.GetSystemHealthAsync();
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving system health");
                return StatusCode(500, new { message = "Failed to retrieve system health" });
            }
        }
    }
}
