using CosplayDate.Application.DTOs.Booking;
using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Application.DTOs.Payment;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CosplayDate.Application.Services.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWalletService _walletService;
        private readonly ILogger<BookingService> _logger;

        public BookingService(
            IUnitOfWork unitOfWork,
            IWalletService walletService,
            ILogger<BookingService> logger)
        {
            _unitOfWork = unitOfWork;
            _walletService = walletService;
            _logger = logger;
        }

        public async Task<ApiResponse<CreateBookingResponseDto>> CreateBookingAsync(int customerId, CreateBookingRequestDto request)
        {
            try
            {
                // Validate customer
                var customer = await _unitOfWork.Users.GetByIdAsync(customerId);
                if (customer == null || !customer.IsVerified)
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("Customer not found or not verified");
                }

                // Validate cosplayer
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(request.CosplayerId);
                if (cosplayer == null || cosplayer.IsAvailable != true)
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("Cosplayer not found or not available");
                }

                // Validate booking date (must be in the future)
                if (request.BookingDate <= DateOnly.FromDateTime(DateTime.Today))
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("Booking date must be in the future");
                }

                // Validate time
                if (!TimeOnly.TryParse(request.StartTime, out var startTime))
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("Invalid start time format. Use HH:mm format (e.g., 14:30)");
                }

                if (!TimeOnly.TryParse(request.EndTime, out var endTime))
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("Invalid end time format. Use HH:mm format (e.g., 16:30)");
                }

                // Validate time
                if (endTime <= startTime)
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("End time must be after start time");
                }

                // Calculate duration and price
                var duration = CalculateDuration(startTime, endTime);
                var totalPrice = CalculatePrice(cosplayer.PricePerHour, duration);

                // Check if customer has sufficient wallet balance
                var customerBalance = customer.WalletBalance ?? 0;
                if (customerBalance < totalPrice)
                {
                    return ApiResponse<CreateBookingResponseDto>.Error($"Insufficient wallet balance. Required: {totalPrice:N0} VND, Available: {customerBalance:N0} VND");
                }

                // Check for time conflicts
                var hasConflict = await HasTimeConflictAsync(request.CosplayerId, request.BookingDate, startTime, endTime);
                if (hasConflict)
                {
                    return ApiResponse<CreateBookingResponseDto>.Error("The selected time slot conflicts with another booking");
                }

                // Generate booking code
                var bookingCode = GenerateBookingCode();

                // Create booking
                var booking = new Booking
                {
                    BookingCode = bookingCode,
                    CustomerId = customerId,
                    CosplayerId = request.CosplayerId,
                    ServiceType = request.ServiceType,
                    BookingDate = request.BookingDate,
                    StartTime = startTime,  // Use parsed TimeOnly
                    EndTime = endTime,      // Use parsed TimeOnly
                    Duration = duration,
                    Location = request.Location,
                    TotalPrice = totalPrice,
                    Status = "Pending",
                    PaymentStatus = "Pending",
                    SpecialNotes = request.SpecialNotes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Bookings.AddAsync(booking);
                await _unitOfWork.SaveChangesAsync();

                // Deduct amount from customer wallet
                var deductResult = await _walletService.ProcessWalletTransactionAsync(
                    customerId,
                    -totalPrice,
                    "BOOKING_PAYMENT",
                    $"Payment for booking {bookingCode}",
                    booking.Id.ToString()
                );

                if (!deductResult.IsSuccess)
                {
                    // Remove the booking if payment fails
                    _unitOfWork.Bookings.Remove(booking);
                    await _unitOfWork.SaveChangesAsync();
                    return ApiResponse<CreateBookingResponseDto>.Error("Payment processing failed");
                }

                // Update booking payment status
                //booking.PaymentStatus = "Paid";
                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.SaveChangesAsync();

                var response = new CreateBookingResponseDto
                {
                    BookingId = booking.Id,
                    BookingCode = bookingCode,
                    TotalPrice = totalPrice,
                    PaymentUrl = "", // Not needed since payment is via wallet
                    Message = "Booking created successfully",
                    CreatedAt = booking.CreatedAt ?? DateTime.UtcNow
                };

                _logger.LogInformation("Booking created successfully: {BookingCode} for customer {CustomerId}", bookingCode, customerId);
                return ApiResponse<CreateBookingResponseDto>.Success(response, "Booking created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking for customer {CustomerId}", customerId);
                return ApiResponse<CreateBookingResponseDto>.Error("An error occurred while creating the booking");
            }
        }

        public async Task<ApiResponse<BookingDto>> GetBookingDetailsAsync(int bookingId, int userId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    return ApiResponse<BookingDto>.Error("Booking not found");
                }

                // Check if user has permission to view this booking
                if (booking.CustomerId != userId && booking.Cosplayer?.UserId != userId)
                {
                    return ApiResponse<BookingDto>.Error("You don't have permission to view this booking");
                }

                var bookingDto = await MapToBookingDto(booking);
                return ApiResponse<BookingDto>.Success(bookingDto, "Booking details retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking details for ID: {BookingId}", bookingId);
                return ApiResponse<BookingDto>.Error("An error occurred while retrieving booking details");
            }
        }

        public async Task<ApiResponse<GetBookingsResponseDto>> GetBookingsAsync(int userId, GetBookingsRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<GetBookingsResponseDto>.Error("User not found");
                }

                _logger.LogInformation("Getting bookings for user {UserId} with type {UserType}", userId, user.UserType);

                // Get bookings based on user type
                IEnumerable<Booking> bookings;

                if (user.UserType == "Customer")
                {
                    // For customers: get bookings they created (where they are the customer)
                    bookings = await _unitOfWork.Bookings.FindAsync(b => b.CustomerId == userId);
                    _logger.LogInformation("Found {Count} bookings for customer {UserId}", bookings.Count(), userId);
                }
                else if (user.UserType == "Cosplayer")
                {
                    // For cosplayers: first find their cosplayer profile, then get bookings assigned to them
                    var cosplayerProfile = await _unitOfWork.Repository<Cosplayer>()
                        .FirstOrDefaultAsync(c => c.UserId == userId);

                    if (cosplayerProfile == null)
                    {
                        _logger.LogWarning("Cosplayer profile not found for user {UserId}", userId);
                        return ApiResponse<GetBookingsResponseDto>.Error("Cosplayer profile not found");
                    }

                    // Get bookings where this cosplayer is assigned
                    bookings = await _unitOfWork.Bookings.FindAsync(b => b.CosplayerId == cosplayerProfile.Id);
                    _logger.LogInformation("Found {Count} bookings for cosplayer {CosplayerId} (user {UserId})",
                        bookings.Count(), cosplayerProfile.Id, userId);
                }
                else
                {
                    _logger.LogWarning("Invalid user type {UserType} for user {UserId}", user.UserType, userId);
                    return ApiResponse<GetBookingsResponseDto>.Error("Invalid user type");
                }

                var bookingsList = bookings.ToList();
                _logger.LogInformation("Total bookings before filtering: {Count}", bookingsList.Count);

                // Apply filters
                bookingsList = ApplyBookingFilters(bookingsList, request);
                _logger.LogInformation("Total bookings after filtering: {Count}", bookingsList.Count);

                // Apply sorting
                bookingsList = ApplyBookingSorting(bookingsList, request);

                var totalCount = bookingsList.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

                // Apply pagination
                var paginatedBookings = bookingsList
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                _logger.LogInformation("Returning {Count} bookings on page {Page} of {TotalPages}",
                    paginatedBookings.Count, request.Page, totalPages);

                // Convert to DTOs
                var bookingDtos = new List<BookingDto>();
                foreach (var booking in paginatedBookings)
                {
                    var dto = await MapToBookingDto(booking);
                    bookingDtos.Add(dto);
                }

                // Calculate stats
                var stats = CalculateBookingStats(bookingsList, user.UserType);

                var response = new GetBookingsResponseDto
                {
                    Bookings = bookingDtos,
                    TotalCount = totalCount,
                    CurrentPage = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = totalPages,
                    HasNextPage = request.Page < totalPages,
                    HasPreviousPage = request.Page > 1,
                    Stats = stats
                };

                return ApiResponse<GetBookingsResponseDto>.Success(response, "Bookings retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings for user: {UserId}", userId);
                return ApiResponse<GetBookingsResponseDto>.Error("An error occurred while retrieving bookings");
            }
        }

        public async Task<ApiResponse<BookingDto>> UpdateBookingAsync(int bookingId, int userId, UpdateBookingRequestDto request)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    return ApiResponse<BookingDto>.Error("Booking not found");
                }

                // Only customer can update booking and only if it's still pending
                if (booking.CustomerId != userId)
                {
                    return ApiResponse<BookingDto>.Error("You don't have permission to update this booking");
                }

                if (booking.Status != "Pending")
                {
                    return ApiResponse<BookingDto>.Error("Only pending bookings can be updated");
                }

                bool priceChanged = false;
                decimal oldPrice = booking.TotalPrice;

                // Update booking details
                if (request.BookingDate.HasValue)
                {
                    if (request.BookingDate.Value <= DateOnly.FromDateTime(DateTime.Today))
                    {
                        return ApiResponse<BookingDto>.Error("Booking date must be in the future");
                    }
                    booking.BookingDate = request.BookingDate.Value;
                }

                if (request.StartTime.HasValue)
                {
                    booking.StartTime = request.StartTime.Value;
                    priceChanged = true;
                }

                if (request.EndTime.HasValue)
                {
                    booking.EndTime = request.EndTime.Value;
                    priceChanged = true;
                }

                if (request.StartTime.HasValue || request.EndTime.HasValue)
                {
                    if (booking.EndTime <= booking.StartTime)
                    {
                        return ApiResponse<BookingDto>.Error("End time must be after start time");
                    }

                    // Check for time conflicts
                    var hasConflict = await HasTimeConflictAsync(booking.CosplayerId, booking.BookingDate, booking.StartTime, booking.EndTime, bookingId);
                    if (hasConflict)
                    {
                        return ApiResponse<BookingDto>.Error("The selected time slot conflicts with another booking");
                    }
                }

                if (!string.IsNullOrEmpty(request.Location))
                {
                    booking.Location = request.Location;
                }

                if (request.SpecialNotes != null)
                {
                    booking.SpecialNotes = request.SpecialNotes;
                }

                // Recalculate price if time changed
                if (priceChanged)
                {
                    var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(booking.CosplayerId);
                    if (cosplayer != null)
                    {
                        booking.Duration = CalculateDuration(booking.StartTime, booking.EndTime);
                        booking.TotalPrice = CalculatePrice(cosplayer.PricePerHour, booking.Duration);

                        // Handle price difference
                        var priceDifference = booking.TotalPrice - oldPrice;
                        if (priceDifference != 0)
                        {
                            var customer = await _unitOfWork.Users.GetByIdAsync(booking.CustomerId);
                            if (customer != null)
                            {
                                if (priceDifference > 0 && (customer.WalletBalance ?? 0) < priceDifference)
                                {
                                    return ApiResponse<BookingDto>.Error($"Insufficient wallet balance for price increase. Additional amount needed: {priceDifference:N0} VND");
                                }

                                // Process price difference
                                var transactionResult = await _walletService.ProcessWalletTransactionAsync(
                                    booking.CustomerId,
                                    -priceDifference,
                                    priceDifference > 0 ? "BOOKING_ADJUSTMENT" : "BOOKING_REFUND",
                                    $"Price adjustment for booking {booking.BookingCode}",
                                    booking.Id.ToString()
                                );

                                if (!transactionResult.IsSuccess)
                                {
                                    return ApiResponse<BookingDto>.Error("Failed to process price adjustment");
                                }
                            }
                        }
                    }
                }

                booking.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.SaveChangesAsync();

                var bookingDto = await MapToBookingDto(booking);
                _logger.LogInformation("Booking updated successfully: {BookingCode}", booking.BookingCode);
                return ApiResponse<BookingDto>.Success(bookingDto, "Booking updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking {BookingId}", bookingId);
                return ApiResponse<BookingDto>.Error("An error occurred while updating the booking");
            }
        }

        public async Task<ApiResponse<string>> CancelBookingAsync(int bookingId, int userId, CancelBookingRequestDto request)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    return ApiResponse<string>.Error("Booking not found");
                }

                // Check permissions
                if (booking.CustomerId != userId && booking.Cosplayer?.UserId != userId)
                {
                    return ApiResponse<string>.Error("You don't have permission to cancel this booking");
                }

                if (booking.Status == "Cancelled")
                {
                    return ApiResponse<string>.Error("Booking is already cancelled");
                }

                if (booking.Status == "Completed")
                {
                    return ApiResponse<string>.Error("Cannot cancel a completed booking");
                }

                // Calculate refund amount based on cancellation policy
                var refundAmount = CalculateRefundAmount(booking);

                booking.Status = "Cancelled";
                booking.CancellationReason = request.CancellationReason;
                booking.UpdatedAt = DateTime.UtcNow;

                // Process refund if applicable
                if (refundAmount > 0)
                {
                    var refundResult = await _walletService.ProcessWalletTransactionAsync(
                        booking.CustomerId,
                        refundAmount,
                        "BOOKING_REFUND",
                        $"Refund for cancelled booking {booking.BookingCode}",
                        booking.Id.ToString()
                    );

                    if (!refundResult.IsSuccess)
                    {
                        _logger.LogError("Failed to process refund for booking {BookingCode}", booking.BookingCode);
                    }
                }

                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.SaveChangesAsync();

                var message = refundAmount > 0
                    ? $"Booking cancelled successfully. Refund amount: {refundAmount:N0} VND"
                    : "Booking cancelled successfully";

                _logger.LogInformation("Booking cancelled: {BookingCode} by user {UserId}", booking.BookingCode, userId);
                return ApiResponse<string>.Success("", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling booking {BookingId}", bookingId);
                return ApiResponse<string>.Error("An error occurred while cancelling the booking");
            }
        }

        public async Task<ApiResponse<string>> ConfirmBookingAsync(int bookingId, int cosplayerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    return ApiResponse<string>.Error("Booking not found");
                }

                var cosplayer = await _unitOfWork.Repository<Cosplayer>()
                    .FirstOrDefaultAsync(c => c.UserId == cosplayerId);

                if (cosplayer == null || booking.CosplayerId != cosplayer.Id)
                {
                    return ApiResponse<string>.Error("You don't have permission to confirm this booking");
                }

                if (booking.Status != "Pending")
                {
                    return ApiResponse<string>.Error("Only pending bookings can be confirmed");
                }

                booking.Status = "Confirmed";
                booking.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Booking confirmed: {BookingCode} by cosplayer {CosplayerId}", booking.BookingCode, cosplayerId);
                return ApiResponse<string>.Success("", "Booking confirmed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming booking {BookingId}", bookingId);
                return ApiResponse<string>.Error("An error occurred while confirming the booking");
            }
        }

        public async Task<ApiResponse<string>> CompleteBookingAsync(int bookingId, int userId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    return ApiResponse<string>.Error("Booking not found");
                }

                // Check if user has permission (customer or cosplayer)
                var hasPermission = booking.CustomerId == userId;
                if (!hasPermission)
                {
                    var cosplayer = await _unitOfWork.Repository<Cosplayer>()
                        .FirstOrDefaultAsync(c => c.UserId == userId);
                    hasPermission = cosplayer != null && booking.CosplayerId == cosplayer.Id;
                }

                if (!hasPermission)
                {
                    return ApiResponse<string>.Error("You don't have permission to complete this booking");
                }

                if (booking.Status != "Confirmed")
                {
                    return ApiResponse<string>.Error("Only confirmed bookings can be completed");
                }

                // Check if booking date has passed
                var bookingDateTime = booking.BookingDate.ToDateTime(booking.EndTime);
                if (bookingDateTime > DateTime.Now)
                {
                    return ApiResponse<string>.Error("Cannot complete booking before the scheduled end time");
                }

                booking.Status = "Completed";
                booking.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Booking completed: {BookingCode} by user {UserId}", booking.BookingCode, userId);
                return ApiResponse<string>.Success("", "Booking completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing booking {BookingId}", bookingId);
                return ApiResponse<string>.Error("An error occurred while completing the booking");
            }
        }

        public async Task<ApiResponse<decimal>> CalculateBookingPriceAsync(int cosplayerId, TimeOnly startTime, TimeOnly endTime)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<decimal>.Error("Cosplayer not found");
                }

                if (endTime <= startTime)
                {
                    return ApiResponse<decimal>.Error("End time must be after start time");
                }

                var duration = CalculateDuration(startTime, endTime);
                var totalPrice = CalculatePrice(cosplayer.PricePerHour, duration);

                return ApiResponse<decimal>.Success(totalPrice, "Price calculated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating booking price for cosplayer {CosplayerId}", cosplayerId);
                return ApiResponse<decimal>.Error("An error occurred while calculating the booking price");
            }
        }

        // Private helper methods
        private static int CalculateDuration(TimeOnly startTime, TimeOnly endTime)
        {
            var start = startTime.ToTimeSpan();
            var end = endTime.ToTimeSpan();
            return (int)(end - start).TotalMinutes;
        }

        private static decimal CalculatePrice(decimal pricePerHour, int durationMinutes)
        {
            var hours = (decimal)durationMinutes / 60;
            return Math.Round(pricePerHour * hours, 0); // Round to nearest VND
        }

        private async Task<bool> HasTimeConflictAsync(int cosplayerId, DateOnly bookingDate, TimeOnly startTime, TimeOnly endTime, int? excludeBookingId = null)
        {
            var existingBookings = await _unitOfWork.Bookings.FindAsync(b =>
                b.CosplayerId == cosplayerId &&
                b.BookingDate == bookingDate &&
                b.Status != "Cancelled" &&
                (excludeBookingId == null || b.Id != excludeBookingId));

            return existingBookings.Any(b =>
                (startTime >= b.StartTime && startTime < b.EndTime) ||
                (endTime > b.StartTime && endTime <= b.EndTime) ||
                (startTime <= b.StartTime && endTime >= b.EndTime));
        }

        private static string GenerateBookingCode()
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var random = new Random().Next(1000, 9999);
            return $"BK{timestamp}{random}";
        }

        private decimal CalculateRefundAmount(Booking booking)
        {
            var bookingDateTime = booking.BookingDate.ToDateTime(booking.StartTime);
            var timeUntilBooking = bookingDateTime - DateTime.Now;

            // Refund policy:
            // - More than 24 hours: 100% refund
            // - 12-24 hours: 50% refund
            // - Less than 12 hours: No refund
            if (timeUntilBooking.TotalHours > 24)
            {
                return booking.TotalPrice;
            }
            else if (timeUntilBooking.TotalHours > 12)
            {
                return booking.TotalPrice * 0.5m;
            }
            else
            {
                return 0;
            }
        }

        private async Task<BookingDto> MapToBookingDto(Booking booking)
        {
            var customer = await _unitOfWork.Users.GetByIdAsync(booking.CustomerId);
            var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(booking.CosplayerId);
            var cosplayerUser = cosplayer != null ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId) : null;

            var payments = await _unitOfWork.Repository<Payment>()
                .FindAsync(p => p.BookingId == booking.Id);

            var review = await _unitOfWork.Reviews
                .FirstOrDefaultAsync(r => r.BookingId == booking.Id);

            return new BookingDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                CustomerId = booking.CustomerId,
                CosplayerId = booking.CosplayerId,
                ServiceType = booking.ServiceType,
                BookingDate = booking.BookingDate,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Duration = booking.Duration,
                Location = booking.Location,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status,
                PaymentStatus = booking.PaymentStatus,
                SpecialNotes = booking.SpecialNotes,
                CancellationReason = booking.CancellationReason,
                CreatedAt = booking.CreatedAt,
                UpdatedAt = booking.UpdatedAt,
                Customer = customer != null ? new CustomerSummaryDto
                {
                    Id = customer.Id,
                    Name = $"{customer.FirstName} {customer.LastName}",
                    AvatarUrl = customer.AvatarUrl,
                    Email = customer.Email,
                    IsVerified = customer.IsVerified
                } : new CustomerSummaryDto(),
                Cosplayer = cosplayer != null && cosplayerUser != null ? new CosplayerSummaryDto
                {
                    Id = cosplayer.Id,
                    DisplayName = cosplayer.DisplayName,
                    AvatarUrl = cosplayerUser.AvatarUrl,
                    PricePerHour = cosplayer.PricePerHour,
                    Category = cosplayer.Category,
                    Rating = cosplayer.Rating,
                    TotalReviews = cosplayer.TotalReviews,
                    ResponseTime = cosplayer.ResponseTime
                } : new CosplayerSummaryDto(),
                Payments = payments.Select(p => new PaymentSummaryDto
                {
                    Id = p.Id,
                    PaymentCode = p.PaymentCode,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt
                }).ToList(),
                Review = review != null ? new ReviewSummaryDto
                {
                    Id = review.Id,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                } : null
            };
        }

        private static List<Booking> ApplyBookingFilters(List<Booking> bookings, GetBookingsRequestDto request)
        {
            if (!string.IsNullOrEmpty(request.Status))
            {
                bookings = bookings.Where(b => b.Status.Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (!string.IsNullOrEmpty(request.PaymentStatus))
            {
                bookings = bookings.Where(b => b.PaymentStatus.Equals(request.PaymentStatus, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (request.FromDate.HasValue)
            {
                bookings = bookings.Where(b => b.BookingDate >= request.FromDate.Value).ToList();
            }

            if (request.ToDate.HasValue)
            {
                bookings = bookings.Where(b => b.BookingDate <= request.ToDate.Value).ToList();
            }

            return bookings;
        }

        private static List<Booking> ApplyBookingSorting(List<Booking> bookings, GetBookingsRequestDto request)
        {
            return request.SortBy?.ToLower() switch
            {
                "booking_date" => request.SortOrder?.ToLower() == "asc"
                    ? bookings.OrderBy(b => b.BookingDate).ThenBy(b => b.StartTime).ToList()
                    : bookings.OrderByDescending(b => b.BookingDate).ThenByDescending(b => b.StartTime).ToList(),
                "total_price" => request.SortOrder?.ToLower() == "asc"
                    ? bookings.OrderBy(b => b.TotalPrice).ToList()
                    : bookings.OrderByDescending(b => b.TotalPrice).ToList(),
                _ => request.SortOrder?.ToLower() == "asc"
                    ? bookings.OrderBy(b => b.CreatedAt).ToList()
                    : bookings.OrderByDescending(b => b.CreatedAt).ToList()
            };
        }

        private static BookingStatsDto CalculateBookingStats(List<Booking> bookings, string userType)
        {
            var stats = new BookingStatsDto
            {
                TotalBookings = bookings.Count,
                PendingBookings = bookings.Count(b => b.Status == "Pending"),
                ConfirmedBookings = bookings.Count(b => b.Status == "Confirmed"),
                CompletedBookings = bookings.Count(b => b.Status == "Completed"),
                CancelledBookings = bookings.Count(b => b.Status == "Cancelled"),
                TotalRevenue = bookings.Where(b => b.Status == "Completed").Sum(b => b.TotalPrice),
                PendingPayments = bookings.Where(b => b.PaymentStatus == "Pending").Sum(b => b.TotalPrice)
            };

            return stats;
        }
    }
}