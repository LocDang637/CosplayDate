using CosplayDate.Application.DTOs.Escrow;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Implementations
{
    public class EscrowService : IEscrowService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWalletService _walletService;
        private readonly IBookingNotificationService _notificationService;
        private readonly ILogger<EscrowService> _logger;

        public EscrowService(
            IUnitOfWork unitOfWork,
            IWalletService walletService,
            IBookingNotificationService notificationService,
            ILogger<EscrowService> logger)
        {
            _unitOfWork = unitOfWork;
            _walletService = walletService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<EscrowTransaction> CreateEscrowAsync(int bookingId, int paymentId, decimal amount)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                    throw new ArgumentException("Booking not found");

                var payment = await _unitOfWork.Payments.GetByIdAsync(paymentId);
                if (payment == null)
                    throw new ArgumentException("Payment not found");

                var transactionCode = GenerateTransactionCode();
                var escrow = new EscrowTransaction
                {
                    BookingId = bookingId,
                    PaymentId = paymentId,
                    CustomerId = booking.CustomerId,
                    CosplayerId = booking.CosplayerId,
                    Amount = amount,
                    Status = "Held",
                    TransactionCode = transactionCode,
                    CreatedAt = DateTime.UtcNow
                };


                await _unitOfWork.EscrowTransactions.AddAsync(escrow);
                //await _unitOfWork.SaveChangesAsync();

                var holdResult = await _walletService.HoldEscrowAsync(booking.CustomerId, amount, escrow.Id, transactionCode);
                if (!holdResult.IsSuccess)
                {
                    //await _unitOfWork.RollbackTransactionAsync();
                    _logger.LogError("Failed to hold escrow for booking {BookingId}: {Error}", bookingId, holdResult.Message ?? string.Join(", ", holdResult.Errors));
                    throw new InvalidOperationException(holdResult.Message ?? string.Join(", ", holdResult.Errors));
                }

                await _unitOfWork.SaveChangesAsync();
                //await _unitOfWork.CommitTransactionAsync();


                _logger.LogInformation("Escrow created: {TransactionCode} for booking {BookingId}", escrow.TransactionCode, bookingId);

                // Send notification to customer
                await _notificationService.SendPaymentNotificationAsync(
                    escrow.CustomerId,
                    "ESCROW_HOLD",
                    escrow.Amount,
                    booking.BookingCode,
                    true);

                return escrow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating escrow for booking {BookingId}", bookingId);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        //public async Task<bool> ReleaseEscrowAsync(int escrowId, int userId)
        //{
        //    //await _unitOfWork.BeginTransactionAsync();

        //    try
        //    {
        //        var escrow = await _unitOfWork.EscrowTransactions.GetByIdAsync(escrowId);
        //        if (escrow == null || escrow.Status != "Held")
        //        {
        //            _logger.LogWarning("Cannot release escrow {EscrowId} - not found or not held", escrowId);
        //            return false;
        //        }

        //        var booking = await _unitOfWork.Bookings.GetByIdAsync(escrow.BookingId);
        //        if (booking == null)
        //        {
        //            _logger.LogError("Booking not found for escrow {EscrowId}", escrowId);
        //            return false;
        //        }

        //        // Only customer can release escrow when service is completed
        //        //if (userId != escrow.CustomerId)
        //        //{
        //        //    _logger.LogWarning("User {UserId} not authorized to release escrow {EscrowId}", userId, escrowId);
        //        //    return false;
        //        //}

        //        // Transfer money to cosplayer's wallet
        //        var releaseResult = await _walletService.ReleaseEscrowAsync(
        //            escrow.CosplayerId,
        //            escrow.Amount,
        //            escrow.Id,
        //            escrow.TransactionCode);

        //        if (!releaseResult.IsSuccess)
        //        {
        //            _logger.LogError("Failed to release escrow {EscrowId}: {Error}", escrowId, releaseResult.Message ?? string.Join(", ", releaseResult.Errors));
        //         //   await _unitOfWork.RollbackTransactionAsync();
        //            return false;
        //        }

        //        // Update escrow status
        //        escrow.Status = "Released";
        //        escrow.ReleasedAt = DateTime.UtcNow;
        //        _unitOfWork.EscrowTransactions.Update(escrow);

        //        // Update booking status
        //        booking.Status = "Completed";
        //        booking.PaymentStatus = "Completed";
        //        _unitOfWork.Bookings.Update(booking);

        //        await _unitOfWork.SaveChangesAsync();
        //        //await _unitOfWork.CommitTransactionAsync();
        //        _unitOfWork.Clear();

        //        // Send notifications
        //        await _notificationService.SendPaymentNotificationAsync(
        //            escrow.CosplayerId,
        //            "ESCROW_RELEASE",
        //            escrow.Amount,
        //            booking.BookingCode,
        //            true);

        //        _logger.LogInformation("Escrow released: {TransactionCode} for booking {BookingCode}",
        //            escrow.TransactionCode, booking.BookingCode);

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        //await _unitOfWork.RollbackTransactionAsync();
        //        _logger.LogError(ex, "Error releasing escrow {EscrowId}", escrowId);
        //        throw;
        //    }
        //}

        public async Task<bool> ReleaseEscrowAsync(int bookingId)
        {
            try
            {
                // 1. Check booking
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    _logger.LogWarning("Booking not found: {BookingId}", bookingId);
                    return false;
                }

                // 2. Check EscrowTransaction by booking
                var escrow = await _unitOfWork.EscrowTransactions.FirstOrDefaultAsync(e => e.BookingId == bookingId);
                if (escrow == null)
                {
                    _logger.LogWarning("Escrow transaction not found for booking: {BookingId}", bookingId);
                    return false;
                }

                var userId = escrow.CustomerId;
                var amount = escrow.Amount;

                // 3. Check WalletTransaction and deduct amount
                var walletResult = await _walletService.ReleaseEscrowAsync(
                    userId, // Deduct from this user
                    amount,
                    escrow.Id
                );

                if (!walletResult.IsSuccess)
                {
                    _logger.LogError("Failed to deduct wallet for user {UserId}: {Error}", userId, walletResult.Message);
                    return false;
                }

                // Update escrow status
                escrow.Status = "Released";
                escrow.ReleasedAt = DateTime.UtcNow;
                _unitOfWork.EscrowTransactions.Update(escrow);

                // Update booking status
                booking.Status = "Completed";
                booking.PaymentStatus = "Completed";
                _unitOfWork.Bookings.Update(booking);

                await _unitOfWork.SaveChangesAsync();
                _unitOfWork.Clear();

                _logger.LogInformation("Escrow released and wallet deducted for booking {BookingId}", bookingId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ReleaseEscrowByBookingAsync for booking {BookingId}", bookingId);
                throw;
            }
        }


        public async Task<bool> RefundEscrowAsync(int escrowId, string reason)
        {
            try
            {
                var escrow = await _unitOfWork.EscrowTransactions.GetByIdAsync(escrowId);
                if (escrow == null || escrow.Status != "Held")
                {
                    _logger.LogWarning("Cannot refund escrow {EscrowId} - not found or not held", escrowId);
                    return false;
                }

                var booking = await _unitOfWork.Bookings.GetByIdAsync(escrow.BookingId);
                if (booking == null)
                {
                    _logger.LogError("Booking not found for escrow {EscrowId}", escrowId);
                    return false;
                }

                // Refund money to customer's wallet
                var refundResult = await _walletService.RefundEscrowAsync(
                    escrow.CustomerId,
                    escrow.Amount,
                    escrow.Id,
                    escrow.TransactionCode);

                if (!refundResult.IsSuccess)
                {
                    // Nếu lỗi là "đã refund rồi" thì bỏ qua
                    if (refundResult.Message?.Contains("already processed") == true)
                    {
                        _logger.LogWarning("Refund already processed for escrow {EscrowId}. Continuing.", escrowId);
                    }
                    else
                    {
                        _logger.LogError("Failed to refund escrow {EscrowId}: {Error}", escrowId, refundResult.Message ?? string.Join(", ", refundResult.Errors));
                        return false;
                    }
                }

                // Update escrow status
                escrow.Status = "Refunded";
                escrow.RefundedAt = DateTime.UtcNow;
                _unitOfWork.EscrowTransactions.Update(escrow);

                // Update booking status
                booking.Status = "Cancelled";
                booking.PaymentStatus = "Refunded";
                booking.CancellationReason = reason;
                _unitOfWork.Bookings.Update(booking);

                await _unitOfWork.SaveChangesAsync();

                // Send notifications
                await _notificationService.SendPaymentNotificationAsync(
                    escrow.CustomerId,
                    "ESCROW_REFUND",
                    escrow.Amount,
                    booking.BookingCode,
                    true);

                await _notificationService.SendPaymentNotificationAsync(
                    escrow.CosplayerId,
                    "ESCROW_REFUND",
                    escrow.Amount,
                    booking.BookingCode,
                    false);

                _logger.LogInformation("Escrow refunded: {TransactionCode} for booking {BookingCode}",
                    escrow.TransactionCode, booking.BookingCode);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refunding escrow {EscrowId}", escrowId);
                throw;
            }
        }


        public async Task<EscrowTransaction?> GetEscrowByBookingAsync(int bookingId)
        {
            try
            {
                return await _unitOfWork.EscrowTransactions
                    .FirstOrDefaultAsync(e => e.BookingId == bookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow for booking {BookingId}", bookingId);
                throw;
            }
        }

        public async Task<List<EscrowTransaction>> GetPendingEscrowsAsync(int cosplayerId)
        {
            try
            {
                var escrows = await _unitOfWork.EscrowTransactions
                    .FindAsync(e => e.CosplayerId == cosplayerId && e.Status == "Held");
                return escrows.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending escrows for cosplayer {CosplayerId}", cosplayerId);
                throw;
            }
        }

        public async Task<List<EscrowTransaction>> GetCustomerEscrowsAsync(int customerId)
        {
            try
            {
                var escrows = await _unitOfWork.EscrowTransactions
                    .FindAsync(e => e.CustomerId == customerId);
                return escrows.OrderByDescending(e => e.CreatedAt).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrows for customer {CustomerId}", customerId);
                throw;
            }
        }

        private string GenerateTransactionCode()
        {
            return $"ESC{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(1000, 9999)}";
        }

        public async Task<EscrowTransaction?> GetEscrowByIdAsync(int escrowId)
        {
            try
            {
                return await _unitOfWork.EscrowTransactions.GetByIdAsync(escrowId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow by ID {EscrowId}", escrowId);
                throw;
            }
        }

        public async Task<EscrowAnalyticsDto> GetEscrowAnalyticsAsync()
        {
            try
            {
                var allEscrows = await _unitOfWork.EscrowTransactions.GetAllAsync();
                var escrowList = allEscrows.ToList();

                var today = DateTime.Today;
                var thisWeek = today.AddDays(-(int)today.DayOfWeek);
                var thisMonth = new DateTime(today.Year, today.Month, 1);

                var analytics = new EscrowAnalyticsDto
                {
                    TotalVolumeToday = escrowList
                        .Where(e => e.CreatedAt.Date == today)
                        .Sum(e => e.Amount),

                    TotalVolumeThisWeek = escrowList
                        .Where(e => e.CreatedAt >= thisWeek)
                        .Sum(e => e.Amount),

                    TotalVolumeThisMonth = escrowList
                        .Where(e => e.CreatedAt >= thisMonth)
                        .Sum(e => e.Amount),

                    TransactionsToday = escrowList.Count(e => e.CreatedAt.Date == today),
                    TransactionsThisWeek = escrowList.Count(e => e.CreatedAt >= thisWeek),
                    TransactionsThisMonth = escrowList.Count(e => e.CreatedAt >= thisMonth),

                    AverageEscrowAmount = escrowList.Any() ? escrowList.Average(e => e.Amount) : 0,

                    AverageHoldTime = escrowList
                        .Where(e => e.Status != "Held")
                        .Select(e => e.ReleasedAt ?? e.RefundedAt ?? DateTime.UtcNow)
                        .Zip(escrowList.Where(e => e.Status != "Held").Select(e => e.CreatedAt))
                        .Average(pair => (pair.First - pair.Second).TotalHours),

                    ReleaseRate = escrowList.Any()
                        ? (double)escrowList.Count(e => e.Status == "Released") / escrowList.Count * 100
                        : 0,

                    RefundRate = escrowList.Any()
                        ? (double)escrowList.Count(e => e.Status == "Refunded") / escrowList.Count * 100
                        : 0,

                    VolumeByDate = escrowList
                        .GroupBy(e => e.CreatedAt.Date)
                        .OrderBy(g => g.Key)
                        .Select(g => new EscrowVolumeByDate
                        {
                            Date = g.Key,
                            Volume = g.Sum(e => e.Amount),
                            Count = g.Count()
                        }).ToList(),

                    StatusBreakdown = escrowList
                        .GroupBy(e => e.Status)
                        .Select(g => new EscrowStatusBreakdown
                        {
                            Status = g.Key,
                            Count = g.Count(),
                            TotalAmount = g.Sum(e => e.Amount),
                            Percentage = escrowList.Any() ? (double)g.Count() / escrowList.Count * 100 : 0
                        }).ToList()
                };

                return analytics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow analytics");
                throw;
            }
        }

        public async Task<List<PendingEscrowDto>> GetDetailedPendingEscrowsAsync(int cosplayerId)
        {
            try
            {
                var escrows = await _unitOfWork.EscrowTransactions
                    .FindAsync(e => e.CosplayerId == cosplayerId && e.Status == "Held");

                var pendingEscrows = new List<PendingEscrowDto>();

                foreach (var escrow in escrows)
                {
                    var booking = await _unitOfWork.Bookings.GetByIdAsync(escrow.BookingId);
                    var customer = await _unitOfWork.Users.GetByIdAsync(escrow.CustomerId);

                    if (booking != null && customer != null)
                    {
                        pendingEscrows.Add(new PendingEscrowDto
                        {
                            Id = escrow.Id,
                            BookingId = escrow.BookingId,
                            BookingCode = booking.BookingCode,
                            Amount = escrow.Amount,
                            TransactionCode = escrow.TransactionCode,
                            CreatedAt = escrow.CreatedAt,
                            DaysHeld = (DateTime.UtcNow - escrow.CreatedAt).Days,
                            CustomerName = $"{customer.FirstName} {customer.LastName}",
                            CustomerEmail = customer.Email,
                            ServiceType = booking.ServiceType ?? "Unknown",
                            BookingDate = booking.BookingDate,
                            StartTime = booking.StartTime,
                            EndTime = booking.EndTime,
                            Location = booking.Location ?? "Not specified"
                        });
                    }
                }

                return pendingEscrows.OrderByDescending(p => p.CreatedAt).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting detailed pending escrows for cosplayer {CosplayerId}", cosplayerId);
                throw;
            }
        }

        public async Task<List<EscrowHistoryDto>> GetEscrowHistoryAsync(int userId, bool isCustomer = true)
        {
            try
            {
                var escrows = isCustomer
                    ? await _unitOfWork.EscrowTransactions.FindAsync(e => e.CustomerId == userId)
                    : await _unitOfWork.EscrowTransactions.FindAsync(e => e.CosplayerId == userId);

                var historyList = new List<EscrowHistoryDto>();

                foreach (var escrow in escrows.OrderByDescending(e => e.CreatedAt))
                {
                    var booking = await _unitOfWork.Bookings.GetByIdAsync(escrow.BookingId);

                    // Get partner info (opposite user)
                    var partnerId = isCustomer ? escrow.CosplayerId : escrow.CustomerId;
                    var partnerUser = isCustomer
                        ? (await _unitOfWork.Cosplayers.GetByIdAsync(escrow.CosplayerId))?.User
                        : await _unitOfWork.Users.GetByIdAsync(escrow.CustomerId);

                    if (booking != null)
                    {
                        var completedAt = escrow.ReleasedAt ?? escrow.RefundedAt;

                        historyList.Add(new EscrowHistoryDto
                        {
                            Id = escrow.Id,
                            TransactionCode = escrow.TransactionCode,
                            Amount = escrow.Amount,
                            Status = escrow.Status,
                            CreatedAt = escrow.CreatedAt,
                            CompletedAt = completedAt,
                            DaysToComplete = completedAt.HasValue
                                ? (completedAt.Value - escrow.CreatedAt).Days
                                : (DateTime.UtcNow - escrow.CreatedAt).Days,
                            BookingCode = booking.BookingCode,
                            ServiceType = booking.ServiceType ?? "Unknown",
                            BookingDate = booking.BookingDate,
                            PartnerName = partnerUser != null
                                ? $"{partnerUser.FirstName} {partnerUser.LastName}"
                                : "Unknown",
                            PartnerType = isCustomer ? "Cosplayer" : "Customer",
                            ActionType = escrow.Status == "Released" ? "Release" : "Refund",
                            ActionReason = escrow.Status == "Refunded" ? booking.CancellationReason : null
                        });
                    }
                }

                return historyList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow history for user {UserId}", userId);
                throw;
            }
        }

        public async Task<EscrowSummaryDto> GetUserEscrowSummaryAsync(int userId, bool isCustomer = true)
        {
            try
            {
                var escrows = isCustomer
                    ? await _unitOfWork.EscrowTransactions.FindAsync(e => e.CustomerId == userId)
                    : await _unitOfWork.EscrowTransactions.FindAsync(e => e.CosplayerId == userId);

                var escrowList = escrows.ToList();

                return new EscrowSummaryDto
                {
                    TotalEscrows = escrowList.Count,
                    HeldEscrows = escrowList.Count(e => e.Status == "Held"),
                    ReleasedEscrows = escrowList.Count(e => e.Status == "Released"),
                    RefundedEscrows = escrowList.Count(e => e.Status == "Refunded"),
                    TotalHeldAmount = escrowList.Where(e => e.Status == "Held").Sum(e => e.Amount),
                    TotalReleasedAmount = escrowList.Where(e => e.Status == "Released").Sum(e => e.Amount),
                    TotalRefundedAmount = escrowList.Where(e => e.Status == "Refunded").Sum(e => e.Amount)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting escrow summary for user {UserId}", userId);
                throw;
            }
        }
    }
}
