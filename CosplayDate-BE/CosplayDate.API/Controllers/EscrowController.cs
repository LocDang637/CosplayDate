using CosplayDate.Application.DTOs.Escrow;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
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

        public EscrowController(IEscrowService escrowService, ILogger<EscrowController> logger)
        {
            _escrowService = escrowService;
            _logger = logger;
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
                var pendingEscrows = await MapToPendingEscrowDtos(escrows);

                return Ok(pendingEscrows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending escrows");
                return StatusCode(500, new { message = "Failed to retrieve pending escrows" });
            }
        }

        /// <summary>
        /// Get customer's escrow history
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetCustomerEscrows([FromQuery] EscrowListRequestDto request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var escrows = await _escrowService.GetCustomerEscrowsAsync(userId);

                // Apply filtering and pagination
                var filteredEscrows = ApplyFilters(escrows, request);
                var totalCount = filteredEscrows.Count();
                var pagedEscrows = filteredEscrows
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                var escrowDtos = pagedEscrows.Select(e => new EscrowTransactionDto
                {
                    Id = e.Id,
                    BookingId = e.BookingId,
                    PaymentId = e.PaymentId,
                    CustomerId = e.CustomerId,
                    CosplayerId = e.CosplayerId,
                    Amount = e.Amount,
                    Status = e.Status,
                    TransactionCode = e.TransactionCode,
                    CreatedAt = e.CreatedAt,
                    ReleasedAt = e.ReleasedAt,
                    RefundedAt = e.RefundedAt
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
                _logger.LogError(ex, "Error getting customer escrows");
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
            // Implementation depends on your data structure
            // This is a placeholder - you'll need to implement this
            return null;
        }

        private async Task<List<PendingEscrowDto>> MapToPendingEscrowDtos(List<Domain.Entities.EscrowTransaction> escrows)
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
