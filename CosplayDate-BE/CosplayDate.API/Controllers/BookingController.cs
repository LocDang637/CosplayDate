using CosplayDate.Application.DTOs.Booking;
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly ILogger<BookingController> _logger;

        public BookingController(IBookingService bookingService, ILogger<BookingController> logger)
        {
            _bookingService = bookingService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new booking
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "RequireVerifiedUser")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> CreateBooking([FromForm] CreateBookingRequestDto request)
        {
            //if (!ModelState.IsValid)
            //{
            //    return BadRequest(ModelState);
            //}

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var userType = User.FindFirst("UserType")?.Value;

                _logger.LogInformation("Creating booking for User ID: {UserId}, UserType: {UserType}", currentUserId, userType);

                if (userType != "Customer" && userType != "Khách hàng")
                {
                    _logger.LogWarning("Invalid user type for booking creation: {UserType}", userType);
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = $"Only customers can create bookings. Current user type: {userType}",
                        errors = new[] { "Invalid user type for booking creation" }
                    });
                }

                var result = await _bookingService.CreateBookingAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    // CẢI TIẾN: Thêm EscrowId vào phản hồi
                    var escrow = await _bookingService.GetEscrowByBookingAsync(result.Data.BookingId);
                    var response = new
                    {
                        result.IsSuccess,
                        result.Message,
                        Data = new
                        {
                            result.Data.BookingId,
                            result.Data.BookingCode,
                            result.Data.TotalPrice,
                            result.Data.PaymentUrl,
                            result.Data.Message,
                            result.Data.CreatedAt,
                            EscrowId = escrow.Data?.Id// Thêm EscrowId
                        }
                    };
                    return CreatedAtAction(nameof(GetBookingDetails), new { id = result.Data?.BookingId }, response);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking for User ID: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while creating the booking" });
            }
        }

        /// <summary>
        /// Get booking details by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingDetails(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.GetBookingDetailsAsync(id, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking details for ID: {BookingId}, User ID: {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while retrieving booking details" });
            }
        }

        /// <summary>
        /// Get user's bookings with filters - shows all bookings for the authenticated user
        /// For customers: shows bookings they created
        /// For cosplayers: shows bookings assigned to them
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetBookings([FromQuery] GetBookingsRequestDto request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.GetBookingsAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings for User ID: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while retrieving bookings" });
            }
        }

        /// <summary>
        /// Update a booking (customers only, pending bookings only)
        /// </summary>
        [HttpPut("{id}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateBooking(int id, [FromBody] UpdateBookingRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // CẢI TIẾN: Đảm bảo kiểm tra ModelState
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.UpdateBookingAsync(id, currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking {BookingId} for User ID: {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while updating the booking" });
            }
        }

        /// <summary>
        /// Cancel a booking
        /// </summary>
        [HttpPost("{id}/cancel")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingRequestDto request)
        {
            if (!ModelState.IsValid || string.IsNullOrEmpty(request.CancellationReason))
            {
                return BadRequest(new
                {
                    isSuccess = false,
                    message = "Cancellation reason is required",
                    errors = new[] { "Cancellation reason cannot be empty" }
                });
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.CancelBookingAsync(id, currentUserId, request);

                if (result.IsSuccess)
                {
                    // CẢI TIẾN: Thêm EscrowId vào phản hồi
                    var escrow = await _bookingService.GetEscrowByBookingAsync(id);
                    var response = new
                    {
                        result.IsSuccess,
                        result.Message,
                        EscrowId = escrow.Data?.Id// Thêm EscrowId
                    };
                    return Ok(response);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking {BookingId} for User ID: {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while cancelling the booking" });
            }
        }

        /// <summary>
        /// Confirm a booking (cosplayers only)
        /// </summary>
        [HttpPost("{id}/confirm")]
        [Authorize(Policy = "RequireCosplayer")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> ConfirmBooking(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.ConfirmBookingAsync(id, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming booking {BookingId} for User ID: {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while confirming the booking" });
            }
        }

        /// <summary>
        /// Complete a booking (after service is done)
        /// </summary>
        [HttpPost("{id}/complete")]
        [EnableRateLimiting("ApiPolicy")]
        
        public async Task<IActionResult> CompleteBooking(int id)
        {
            //if (!ModelState.IsValid) // CẢI TIẾN: Đảm bảo kiểm tra ModelState (nếu có body trong tương lai)
            //{
            //    return BadRequest(ModelState);
            //}

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.CompleteBookingAsync(id, currentUserId);

                if (result.IsSuccess)
                {
                    // CẢI TIẾN: Thêm EscrowId vào phản hồi
                    var escrow = await _bookingService.GetEscrowByBookingAsync(id);
                    var response = new
                    {
                        result.IsSuccess,
                        result.Message,
                        EscrowId = escrow.Data?.Id// Thêm EscrowId
                    };
                    return Ok(response);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing booking {BookingId} for User ID: {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while completing the booking" });
            }
        }

        /// <summary>
        /// Calculate booking price for given time range
        /// </summary>
        [HttpGet("calculate-price")]
        public async Task<IActionResult> CalculateBookingPrice(
            [FromQuery] int cosplayerId,
            [FromQuery] string startTime,
            [FromQuery] string endTime)
        {
            try
            {
                if (!TimeOnly.TryParse(startTime, out var start) || !TimeOnly.TryParse(endTime, out var end))
                {
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Invalid time format. Use HH:mm format",
                        errors = new[] { "Invalid time format" }
                    });
                }

                var result = await _bookingService.CalculateBookingPriceAsync(cosplayerId, start, end);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating booking price for Cosplayer ID: {CosplayerId}", cosplayerId);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while calculating the booking price" });
            }
        }

        /// <summary>
        /// Get upcoming bookings for the current user
        /// </summary>
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingBookings([FromQuery] int pageSize = 10)
        {
            try
            {
                var request = new GetBookingsRequestDto
                {
                    Page = 1,
                    PageSize = pageSize,
                    FromDate = DateOnly.FromDateTime(DateTime.Today),
                    Status = null, // Get all statuses except cancelled
                    SortBy = "booking_date",
                    SortOrder = "asc"
                };

                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.GetBookingsAsync(currentUserId, request);

                if (result.IsSuccess && result.Data != null)
                {
                    // Filter out cancelled bookings
                    var upcomingBookings = result.Data.Bookings
                        .Where(b => b.Status != "Cancelled")
                        .ToList();

                    var response = new
                    {
                        isSuccess = true,
                        message = "Upcoming bookings retrieved successfully",
                        data = new
                        {
                            bookings = upcomingBookings,
                            totalCount = upcomingBookings.Count
                        }
                    };

                    return Ok(response);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting upcoming bookings for User ID: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while retrieving upcoming bookings" });
            }
        }

        /// <summary>
        /// Get booking history (completed and cancelled bookings)
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetBookingHistory([FromQuery] GetBookingsRequestDto request)
        {
            try
            {
                // Override to get only completed and cancelled bookings
                request.ToDate = DateOnly.FromDateTime(DateTime.Today.AddDays(-1));
                request.SortBy = "booking_date";
                request.SortOrder = "desc";

                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.GetBookingsAsync(currentUserId, request);

                if (result.IsSuccess && result.Data != null)
                {
                    // Filter to show only completed and cancelled bookings
                    var historyBookings = result.Data.Bookings
                        .Where(b => b.Status == "Completed" || b.Status == "Cancelled")
                        .ToList();

                    var response = new GetBookingsResponseDto
                    {
                        Bookings = historyBookings,
                        TotalCount = historyBookings.Count,
                        CurrentPage = request.Page,
                        PageSize = request.PageSize,
                        TotalPages = (int)Math.Ceiling((double)historyBookings.Count / request.PageSize),
                        HasNextPage = false,
                        HasPreviousPage = false,
                        Stats = result.Data.Stats
                    };

                    return Ok(new
                    {
                        isSuccess = true,
                        message = "Booking history retrieved successfully",
                        data = response
                    });
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking history for User ID: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while retrieving booking history" });
            }
        }

        /// <summary>
        /// Get booking statistics for the current user
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetBookingStats()
        {
            try
            {
                var request = new GetBookingsRequestDto
                {
                    Page = 1,
                    PageSize = 1000, // Get all bookings for stats
                    SortBy = "created_date",
                    SortOrder = "desc"
                };

                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new InvalidOperationException("User ID not found"));
                var result = await _bookingService.GetBookingsAsync(currentUserId, request);

                if (result.IsSuccess && result.Data != null)
                {
                    return Ok(new
                    {
                        isSuccess = true,
                        message = "Booking statistics retrieved successfully",
                        data = result.Data.Stats
                    });
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking stats for User ID: {UserId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { isSuccess = false, message = "An error occurred while retrieving booking statistics" });
            }
        }
    }
}