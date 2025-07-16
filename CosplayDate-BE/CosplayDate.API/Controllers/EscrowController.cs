using CosplayDate.Application.DTOs.Escrow;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EscrowController : ControllerBase
    {
        private readonly IEscrowService _escrowService;
        private readonly ILogger<EscrowController> _logger;
        private readonly IServiceProvider _serviceProvider;

        public EscrowController(
            IEscrowService escrowService, 
            ILogger<EscrowController> logger,
            IServiceProvider serviceProvider)
        {
            _escrowService = escrowService;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        /// <summary>
        /// Customer marks service as completed and releases payment
        /// </summary>
        [HttpPost("release/{escrowId}")]
        public async Task<IActionResult> ReleaseEscrow(int bookingId, [FromBody] ReleaseEscrowRequestDto? request = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var success = await _escrowService.ReleaseEscrowAsync(bookingId);

                if (!success)
                {
                    return BadRequest(new EscrowActionResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cannot release escrow. Check if you're authorized and escrow is valid."
                    });
                }

                var escrow = await _escrowService.GetEscrowByIdAsync(bookingId);

                return Ok(new EscrowActionResponseDto
                {
                    IsSuccess = true,
                    Message = "Payment released successfully!",
                    TransactionCode = escrow?.TransactionCode,
                    Amount = escrow?.Amount,
                    ProcessedAt = escrow?.ReleasedAt,
                    NewStatus = "Released"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error releasing escrow {bookingId}", bookingId);
                return StatusCode(500, new EscrowActionResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed to release payment"
                });
            }
        }

        /// <summary>
        /// Admin or system refunds escrow
        /// </summary>
        [HttpPost("refund/{escrowId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefundEscrow(int escrowId, [FromBody] RefundEscrowRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var (success, errorMessage) = await _escrowService.RefundEscrowAsync(escrowId, request.Reason);

                if (!success)
                {
                    return BadRequest(new EscrowActionResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cannot refund escrow. Check if escrow is valid."
                    });
                }

                var escrow = await _escrowService.GetEscrowByIdAsync(escrowId);

                return Ok(new EscrowActionResponseDto
                {
                    IsSuccess = true,
                    Message = "Refund processed successfully!",
                    TransactionCode = escrow?.TransactionCode,
                    Amount = escrow?.Amount,
                    ProcessedAt = escrow?.RefundedAt,
                    NewStatus = "Refunded"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refunding escrow {EscrowId}", escrowId);
                return StatusCode(500, new EscrowActionResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed to process refund"
                });
            }
        }

        /// <summary>
        /// Get escrow details for a booking
        /// </summary>
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetEscrowByBooking(int bookingId)
        {
            try
            {
                var escrow = await _escrowService.GetEscrowByBookingAsync(bookingId);

                if (escrow == null)
                {
                    return NotFound(new { message = "No escrow found for this booking" });
                }

                var escrowDto = new EscrowTransactionDto
                {
                    Id = escrow.Id,
                    BookingId = escrow.BookingId,
                    PaymentId = escrow.PaymentId,
                    CustomerId = escrow.CustomerId,
                    CosplayerId = escrow.CosplayerId,
                    Amount = escrow.Amount,
                    Status = escrow.Status,
                    TransactionCode = escrow.TransactionCode,
                    CreatedAt = escrow.CreatedAt,
                    ReleasedAt = escrow.ReleasedAt,
                    RefundedAt = escrow.RefundedAt
                };

                return Ok(escrowDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow for booking {BookingId}", bookingId);
                return StatusCode(500, new { message = "Failed to retrieve escrow details" });
            }
        }

        /// <summary>
        /// Get pending escrows for cosplayer (money waiting to be released)
        /// </summary>
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingEscrows()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var cosplayerId = await GetCosplayerIdByUserId(userId);
                if (cosplayerId == null)
                {
                    return BadRequest(new { message = "User is not a cosplayer" });
                }

                var escrows = await _escrowService.GetPendingEscrowsAsync(cosplayerId.Value);
                var pendingEscrows = MapToPendingEscrowDtos(escrows);

                return Ok(pendingEscrows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending escrows");
                return StatusCode(500, new { message = "Failed to retrieve pending escrows" });
            }
        }

        /// <summary>
        /// Get user's escrow history (supports both customers and cosplayers)
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetEscrowHistory([FromQuery] EscrowListRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // Determine if user is a customer or cosplayer
                var cosplayerId = await GetCosplayerIdByUserId(userId);
                var isCustomer = cosplayerId == null;

                List<Domain.Entities.EscrowTransaction> escrows;
                
                if (isCustomer)
                {
                    // Get customer escrows
                    escrows = await _escrowService.GetCustomerEscrowsAsync(userId);
                }
                else if (cosplayerId.HasValue)
                {
                    // Get cosplayer escrows
                    escrows = await _escrowService.GetCosplayerEscrowsAsync(cosplayerId.Value);
                }
                else
                {
                    // This shouldn't happen, but handle gracefully
                    escrows = new List<Domain.Entities.EscrowTransaction>();
                }

                // Apply filtering and pagination
                var filteredEscrows = ApplyFilters(escrows, request);
                var totalCount = filteredEscrows.Count();
                var pagedEscrows = filteredEscrows
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                // Use the enhanced history method to get detailed information
                var detailedHistory = await _escrowService.GetEscrowHistoryAsync(userId, isCustomer);
                
                // Map to DTOs with enhanced information
                var escrowDtos = pagedEscrows.Select(escrow =>
                {
                    var historyItem = detailedHistory.FirstOrDefault(h => h.Id == escrow.Id);
                    
                    return new EscrowTransactionDto
                    {
                        Id = escrow.Id,
                        BookingId = escrow.BookingId,
                        PaymentId = escrow.PaymentId,
                        CustomerId = escrow.CustomerId,
                        CosplayerId = escrow.CosplayerId,
                        Amount = escrow.Amount,
                        Status = escrow.Status,
                        TransactionCode = escrow.TransactionCode,
                        CreatedAt = escrow.CreatedAt,
                        ReleasedAt = escrow.ReleasedAt,
                        RefundedAt = escrow.RefundedAt,
                        // Enhanced fields from history
                        BookingCode = historyItem?.BookingCode,
                        CustomerName = isCustomer ? null : historyItem?.PartnerName,
                        CosplayerName = isCustomer ? historyItem?.PartnerName : null,
                        ServiceType = historyItem?.ServiceType,
                        BookingDate = historyItem?.BookingDate
                    };
                }).ToList();

                var response = new EscrowListResponseDto
                {
                    Escrows = escrowDtos,
                    TotalCount = totalCount,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
                    HasNextPage = request.Page * request.PageSize < totalCount,
                    HasPreviousPage = request.Page > 1,
                    Summary = CalculateEscrowSummary(escrows)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow history");
                return StatusCode(500, new { message = "Failed to retrieve escrow history" });
            }
        }

        /// <summary>
        /// Get escrow analytics (Admin only)
        /// </summary>
        [HttpGet("analytics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetEscrowAnalytics()
        {
            try
            {
                var analytics = await _escrowService.GetEscrowAnalyticsAsync();
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow analytics");
                return StatusCode(500, new { message = "Failed to retrieve analytics" });
            }
        }

        #region Helper Methods

        private async Task<int?> GetCosplayerIdByUserId(int userId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                
                var cosplayer = await unitOfWork.Cosplayers.FindAsync(c => c.UserId == userId);
                return cosplayer.FirstOrDefault()?.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer ID for user {UserId}", userId);
                return null;
            }
        }

        private List<PendingEscrowDto> MapToPendingEscrowDtos(List<Domain.Entities.EscrowTransaction> escrows)
        {
            // Map escrow transactions to pending DTOs with booking and customer details
            // This is a placeholder - you'll need to implement proper mapping
            return escrows.Select(e => new PendingEscrowDto
            {
                Id = e.Id,
                BookingId = e.BookingId,
                Amount = e.Amount,
                TransactionCode = e.TransactionCode,
                CreatedAt = e.CreatedAt,
                DaysHeld = (DateTime.UtcNow - e.CreatedAt).Days
            }).ToList();
        }

        private IQueryable<Domain.Entities.EscrowTransaction> ApplyFilters(
            List<Domain.Entities.EscrowTransaction> escrows,
            EscrowListRequestDto request)
        {
            var query = escrows.AsQueryable();

            if (!string.IsNullOrEmpty(request.Status))
            {
                query = query.Where(e => e.Status == request.Status);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(e => e.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(e => e.CreatedAt <= request.ToDate.Value);
            }

            if (request.MinAmount.HasValue)
            {
                query = query.Where(e => e.Amount >= request.MinAmount.Value);
            }

            if (request.MaxAmount.HasValue)
            {
                query = query.Where(e => e.Amount <= request.MaxAmount.Value);
            }

            // Apply sorting
            query = request.SortBy.ToLower() switch
            {
                "amount" => request.SortDirection.ToUpper() == "ASC"
                    ? query.OrderBy(e => e.Amount)
                    : query.OrderByDescending(e => e.Amount),
                "status" => request.SortDirection.ToUpper() == "ASC"
                    ? query.OrderBy(e => e.Status)
                    : query.OrderByDescending(e => e.Status),
                _ => request.SortDirection.ToUpper() == "ASC"
                    ? query.OrderBy(e => e.CreatedAt)
                    : query.OrderByDescending(e => e.CreatedAt)
            };

            return query;
        }

        private EscrowSummaryDto CalculateEscrowSummary(List<Domain.Entities.EscrowTransaction> escrows)
        {
            return new EscrowSummaryDto
            {
                TotalEscrows = escrows.Count,
                HeldEscrows = escrows.Count(e => e.Status == "Held"),
                ReleasedEscrows = escrows.Count(e => e.Status == "Released"),
                RefundedEscrows = escrows.Count(e => e.Status == "Refunded"),
                TotalHeldAmount = escrows.Where(e => e.Status == "Held").Sum(e => e.Amount),
                TotalReleasedAmount = escrows.Where(e => e.Status == "Released").Sum(e => e.Amount),
                TotalRefundedAmount = escrows.Where(e => e.Status == "Refunded").Sum(e => e.Amount)
            };
        }

        #endregion
    }
}
