using CosplayDate.Application.DTOs.Customer;
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        /// <summary>
        /// Get customer profile by ID
        /// </summary>
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCustomerProfile(int customerId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetCustomerProfileAsync(customerId, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer profile for ID: {CustomerId}", customerId);
                return StatusCode(500, "An error occurred while retrieving the customer profile");
            }
        }

        /// <summary>
        /// Get current user's customer profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetCustomerProfileAsync(currentUserId, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user's customer profile");
                return StatusCode(500, "An error occurred while retrieving your profile");
            }
        }

        /// <summary>
        /// Update customer profile
        /// </summary>
        [HttpPut("profile")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.UpdateCustomerProfileAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer profile");
                return StatusCode(500, "An error occurred while updating your profile");
            }
        }

        /// <summary>
        /// Get customer booking history
        /// </summary>
        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookingHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetBookingHistoryAsync(currentUserId, page, pageSize, status);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer booking history");
                return StatusCode(500, "An error occurred while retrieving booking history");
            }
        }

        /// <summary>
        /// Get customer wallet information
        /// </summary>
        [HttpGet("wallet")]
        public async Task<IActionResult> GetWalletInfo()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetWalletInfoAsync(currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer wallet info");
                return StatusCode(500, "An error occurred while retrieving wallet information");
            }
        }

        /// <summary>
        /// Get customer statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetCustomerStats()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetCustomerStatsAsync(currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer statistics");
                return StatusCode(500, "An error occurred while retrieving customer statistics");
            }
        }

        /// <summary>
        /// Add funds to wallet
        /// </summary>
        [HttpPost("wallet/topup")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> TopUpWallet([FromBody] WalletTopUpRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.TopUpWalletAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error topping up wallet");
                return StatusCode(500, "An error occurred while processing the transaction");
            }
        }

        /// <summary>
        /// Get wallet transactions
        /// </summary>
        [HttpGet("wallet/transactions")]
        public async Task<IActionResult> GetWalletTransactions([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? type = null)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetWalletTransactionsAsync(currentUserId, page, pageSize, type);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wallet transactions");
                return StatusCode(500, "An error occurred while retrieving transaction history");
            }
        }

        /// <summary>
        /// Follow/Unfollow a cosplayer
        /// </summary>
        [HttpPost("follow/{cosplayerId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> ToggleFollow(int cosplayerId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.ToggleFollowAsync(currentUserId, cosplayerId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling follow for cosplayer: {CosplayerId}", cosplayerId);
                return StatusCode(500, "An error occurred while processing the follow request");
            }
        }

        /// <summary>
        /// Get customer's favorite cosplayers
        /// </summary>
        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavoriteCosplayers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _customerService.GetFavoriteCosplayersAsync(currentUserId, page, pageSize);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite cosplayers");
                return StatusCode(500, "An error occurred while retrieving favorite cosplayers");
            }
        }
    }
}