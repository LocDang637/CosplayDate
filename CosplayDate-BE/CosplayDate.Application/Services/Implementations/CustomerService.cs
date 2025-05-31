using CosplayDate.Application.DTOs.Customer;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace CosplayDate.Application.Services.Implementations
{
    public class CustomerService : ICustomerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(IUnitOfWork unitOfWork, ILogger<CustomerService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<ApiResponse<CustomerProfileResponseDto>> GetCustomerProfileAsync(int customerId, int currentUserId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(customerId);
                if (user == null)
                {
                    return ApiResponse<CustomerProfileResponseDto>.Error("Customer not found.");
                }

                // Get customer stats
                var stats = await GetCustomerStatsInternal(customerId);

                // Check if current user is following this customer (if different users)
                var isFollowing = false;
                if (currentUserId != customerId)
                {
                    var followRecord = await _unitOfWork.UserFollows
                        .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowedId == customerId);
                    isFollowing = followRecord != null;
                }

                // Get user interests
                var interests = await _unitOfWork.UserInterests
                    .FindAsync(ui => ui.UserId == customerId);

                var response = new CustomerProfileResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    DateOfBirth = user.DateOfBirth,
                    Location = user.Location,
                    Bio = user.Bio,
                    UserType = user.UserType,
                    IsVerified = user.IsVerified,
                    IsOnline = user.IsOnline ?? false,
                    LastLoginAt = user.LastLoginAt,
                    MembershipTier = user.MembershipTier ?? "Bronze",
                    LoyaltyPoints = user.LoyaltyPoints ?? 0,
                    WalletBalance = user.WalletBalance ?? 0,
                    ProfileCompleteness = user.ProfileCompleteness ?? 0,
                    CreatedAt = user.CreatedAt ?? DateTime.UtcNow,
                    Interests = interests.Select(i => i.Interest).ToList(),
                    IsOwnProfile = currentUserId == customerId,
                    IsFollowing = isFollowing,
                    Stats = stats
                };

                return ApiResponse<CustomerProfileResponseDto>.Success(response, "Customer profile retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer profile for ID: {CustomerId}", customerId);
                return ApiResponse<CustomerProfileResponseDto>.Error("An error occurred while retrieving the customer profile.");
            }
        }

        public async Task<ApiResponse<CustomerProfileResponseDto>> UpdateCustomerProfileAsync(int customerId, UpdateCustomerProfileRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(customerId);
                if (user == null)
                {
                    return ApiResponse<CustomerProfileResponseDto>.Error("Customer not found.");
                }

                // Update user information
                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    user.FirstName = request.FirstName.Trim();

                if (!string.IsNullOrWhiteSpace(request.LastName))
                    user.LastName = request.LastName.Trim();

                if (request.Location != null)
                    user.Location = request.Location.Trim();

                if (request.Bio != null)
                    user.Bio = request.Bio.Trim();

                user.UpdatedAt = DateTime.UtcNow;

                // Update interests if provided
                if (request.Interests != null)
                {
                    // Remove existing interests
                    var existingInterests = await _unitOfWork.UserInterests
                        .FindAsync(ui => ui.UserId == customerId);

                    foreach (var interest in existingInterests)
                    {
                        _unitOfWork.UserInterests.Remove(interest);
                    }

                    // Add new interests
                    foreach (var interestName in request.Interests.Distinct())
                    {
                        if (!string.IsNullOrWhiteSpace(interestName))
                        {
                            await _unitOfWork.UserInterests.AddAsync(new UserInterest
                            {
                                UserId = customerId,
                                Interest = interestName.Trim()
                            });
                        }
                    }
                }

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                // Return updated profile
                return await GetCustomerProfileAsync(customerId, customerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer profile for ID: {CustomerId}", customerId);
                return ApiResponse<CustomerProfileResponseDto>.Error("An error occurred while updating the customer profile.");
            }
        }

        public async Task<ApiResponse<BookingHistoryResponseDto>> GetBookingHistoryAsync(int customerId, int page, int pageSize, string? status)
        {
            try
            {
                var query = _unitOfWork.Bookings
                    .FindAsync(b => b.CustomerId == customerId);

                // Apply status filter if provided
                if (!string.IsNullOrWhiteSpace(status) && status != "all")
                {
                    query = _unitOfWork.Bookings
                        .FindAsync(b => b.CustomerId == customerId && b.Status == status);
                }

                var bookings = await query;
                var totalCount = bookings.Count();

                // Apply pagination
                var paginatedBookings = bookings
                    .OrderByDescending(b => b.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var bookingDtos = new List<CustomerBookingDto>();

                foreach (var booking in paginatedBookings)
                {
                    var cosplayer = await _unitOfWork.Cosplayers
                        .FirstOrDefaultAsync(c => c.Id == booking.CosplayerId);

                    var cosplayerUser = cosplayer != null
                        ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId)
                        : null;

                    // Check if customer has reviewed this booking
                    var review = await _unitOfWork.Reviews
                        .FirstOrDefaultAsync(r => r.BookingId == booking.Id);

                    var bookingDto = new CustomerBookingDto
                    {
                        Id = booking.Id,
                        BookingCode = booking.BookingCode,
                        Cosplayer = new CosplayerSummaryDto
                        {
                            Id = cosplayer?.Id ?? 0,
                            Name = cosplayerUser?.FirstName + " " + cosplayerUser?.LastName ?? "Unknown",
                            AvatarUrl = cosplayerUser?.AvatarUrl,
                            Rating = cosplayer?.Rating ?? 0,
                            Specialty = cosplayer?.CharacterSpecialty ?? ""
                        },
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
                        CreatedAt = booking.CreatedAt ?? DateTime.UtcNow,
                        HasReview = review != null,
                        MyReview = review != null ? new CustomerReviewDto
                        {
                            Rating = review.Rating,
                            Comment = review.Comment,
                            Date = review.CreatedAt ?? DateTime.UtcNow
                        } : null,
                        CanCancel = CanCancelBooking(booking)
                    };

                    bookingDtos.Add(bookingDto);
                }

                var response = new BookingHistoryResponseDto
                {
                    Bookings = bookingDtos,
                    TotalCount = totalCount,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return ApiResponse<BookingHistoryResponseDto>.Success(response, "Booking history retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking history for customer: {CustomerId}", customerId);
                return ApiResponse<BookingHistoryResponseDto>.Error("An error occurred while retrieving booking history.");
            }
        }

        public async Task<ApiResponse<WalletInfoResponseDto>> GetWalletInfoAsync(int customerId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(customerId);
                if (user == null)
                {
                    return ApiResponse<WalletInfoResponseDto>.Error("Customer not found.");
                }

                // Get recent transactions (last 5)
                var recentTransactions = await _unitOfWork.WalletTransactions
                    .FindAsync(wt => wt.UserId == customerId);

                var recentTransactionDtos = recentTransactions
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(5)
                    .Select(t => new WalletTransactionDto
                    {
                        Id = t.Id,
                        TransactionCode = t.TransactionCode,
                        Type = t.Type,
                        Amount = t.Amount,
                        Description = t.Description,
                        ReferenceId = t.ReferenceId,
                        Status = t.Status,
                        BalanceAfter = t.BalanceAfter,
                        CreatedAt = t.CreatedAt ?? DateTime.UtcNow
                    })
                    .ToList();

                // Calculate wallet stats
                var allTransactions = await _unitOfWork.WalletTransactions
                    .FindAsync(wt => wt.UserId == customerId);

                var stats = new WalletStatsDto
                {
                    TotalTopUps = allTransactions.Where(t => t.Type == "top_up").Sum(t => t.Amount),
                    TotalSpent = allTransactions.Where(t => t.Type == "booking_payment").Sum(t => Math.Abs(t.Amount)),
                    TotalRefunds = allTransactions.Where(t => t.Type == "refund").Sum(t => t.Amount),
                    TransactionCount = allTransactions.Count()
                };

                var response = new WalletInfoResponseDto
                {
                    Balance = user.WalletBalance ?? 0,
                    LoyaltyPoints = user.LoyaltyPoints ?? 0,
                    MembershipTier = user.MembershipTier ?? "Bronze",
                    RecentTransactions = recentTransactionDtos,
                    Stats = stats
                };

                return ApiResponse<WalletInfoResponseDto>.Success(response, "Wallet information retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wallet info for customer: {CustomerId}", customerId);
                return ApiResponse<WalletInfoResponseDto>.Error("An error occurred while retrieving wallet information.");
            }
        }

        public async Task<ApiResponse<CustomerStatsDto>> GetCustomerStatsAsync(int customerId)
        {
            try
            {
                var stats = await GetCustomerStatsInternal(customerId);
                return ApiResponse<CustomerStatsDto>.Success(stats, "Customer statistics retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer stats for: {CustomerId}", customerId);
                return ApiResponse<CustomerStatsDto>.Error("An error occurred while retrieving customer statistics.");
            }
        }

        public async Task<ApiResponse<WalletTopUpResponseDto>> TopUpWalletAsync(int customerId, WalletTopUpRequestDto request)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var user = await _unitOfWork.Users.GetByIdAsync(customerId);
                if (user == null)
                {
                    return ApiResponse<WalletTopUpResponseDto>.Error("Customer not found.");
                }

                // Generate transaction code
                var transactionCode = GenerateTransactionCode("TP");

                // Create wallet transaction record
                var transaction = new WalletTransaction
                {
                    UserId = customerId,
                    TransactionCode = transactionCode,
                    Type = "top_up",
                    Amount = request.Amount,
                    Description = request.Description ?? $"Top up via {request.PaymentMethod}",
                    Status = "completed", // In real scenario, this would be "pending" until payment confirmation
                    BalanceAfter = (user.WalletBalance ?? 0) + request.Amount,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.WalletTransactions.AddAsync(transaction);

                // Update user wallet balance
                user.WalletBalance = (user.WalletBalance ?? 0) + request.Amount;
                user.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(user);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                var response = new WalletTopUpResponseDto
                {
                    TransactionCode = transactionCode,
                    Amount = request.Amount,
                    NewBalance = user.WalletBalance.Value,
                    Status = "completed",
                    CreatedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Wallet top up successful for customer {CustomerId}, Amount: {Amount}",
                    customerId, request.Amount);

                return ApiResponse<WalletTopUpResponseDto>.Success(response, "Wallet top up successful.");
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                _logger.LogError(ex, "Error topping up wallet for customer: {CustomerId}", customerId);
                return ApiResponse<WalletTopUpResponseDto>.Error("An error occurred while processing the transaction.");
            }
        }

        public async Task<ApiResponse<WalletTransactionsResponseDto>> GetWalletTransactionsAsync(int customerId, int page, int pageSize, string? type)
        {
            try
            {
                var query = _unitOfWork.WalletTransactions
                    .FindAsync(wt => wt.UserId == customerId);

                // Apply type filter if provided
                if (!string.IsNullOrWhiteSpace(type) && type != "all")
                {
                    query = _unitOfWork.WalletTransactions
                        .FindAsync(wt => wt.UserId == customerId && wt.Type == type);
                }

                var transactions = await query;
                var totalCount = transactions.Count();

                // Apply pagination
                var paginatedTransactions = transactions
                    .OrderByDescending(t => t.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var transactionDtos = new List<WalletTransactionDto>();

                foreach (var transaction in paginatedTransactions)
                {
                    var dto = new WalletTransactionDto
                    {
                        Id = transaction.Id,
                        TransactionCode = transaction.TransactionCode,
                        Type = transaction.Type,
                        Amount = transaction.Amount,
                        Description = transaction.Description,
                        ReferenceId = transaction.ReferenceId,
                        Status = transaction.Status,
                        BalanceAfter = transaction.BalanceAfter,
                        CreatedAt = transaction.CreatedAt ?? DateTime.UtcNow
                    };

                    // If this is a booking payment, get cosplayer name
                    if (transaction.Type == "booking_payment" && !string.IsNullOrEmpty(transaction.ReferenceId))
                    {
                        if (transaction.ReferenceId.StartsWith("BK"))
                        {
                            var booking = await _unitOfWork.Bookings
                                .FirstOrDefaultAsync(b => b.BookingCode == transaction.ReferenceId);

                            if (booking != null)
                            {
                                var cosplayer = await _unitOfWork.Cosplayers
                                    .FirstOrDefaultAsync(c => c.Id == booking.CosplayerId);

                                if (cosplayer != null)
                                {
                                    var cosplayerUser = await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId);
                                    dto.CosplayerName = $"{cosplayerUser?.FirstName} {cosplayerUser?.LastName}";
                                }
                            }
                        }
                    }

                    transactionDtos.Add(dto);
                }

                var response = new WalletTransactionsResponseDto
                {
                    Transactions = transactionDtos,
                    TotalCount = totalCount,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return ApiResponse<WalletTransactionsResponseDto>.Success(response, "Wallet transactions retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wallet transactions for customer: {CustomerId}", customerId);
                return ApiResponse<WalletTransactionsResponseDto>.Error("An error occurred while retrieving wallet transactions.");
            }
        }

        public async Task<ApiResponse<ToggleFollowResponseDto>> ToggleFollowAsync(int customerId, int cosplayerId)
        {
            try
            {
                // Check if cosplayer exists
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<ToggleFollowResponseDto>.Error("Cosplayer not found.");
                }

                // Check if customer exists
                var customer = await _unitOfWork.Users.GetByIdAsync(customerId);
                if (customer == null)
                {
                    return ApiResponse<ToggleFollowResponseDto>.Error("Customer not found.");
                }

                // Check current follow status
                var existingFollow = await _unitOfWork.UserFollows
                    .FirstOrDefaultAsync(f => f.FollowerId == customerId && f.FollowedId == cosplayer.UserId);

                bool isFollowing;
                string message;

                if (existingFollow != null)
                {
                    // Unfollow
                    _unitOfWork.UserFollows.Remove(existingFollow);

                    // Update cosplayer followers count
                    if (cosplayer.FollowersCount > 0)
                    {
                        cosplayer.FollowersCount = (cosplayer.FollowersCount ?? 0) - 1;
                        _unitOfWork.Cosplayers.Update(cosplayer);
                    }

                    isFollowing = false;
                    message = "Successfully unfollowed cosplayer.";
                }
                else
                {
                    // Follow
                    var newFollow = new UserFollow
                    {
                        FollowerId = customerId,
                        FollowedId = cosplayer.UserId,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.UserFollows.AddAsync(newFollow);

                    // Update cosplayer followers count
                    cosplayer.FollowersCount = (cosplayer.FollowersCount ?? 0) + 1;
                    _unitOfWork.Cosplayers.Update(cosplayer);

                    isFollowing = true;
                    message = "Successfully followed cosplayer.";
                }

                await _unitOfWork.SaveChangesAsync();

                var response = new ToggleFollowResponseDto
                {
                    IsFollowing = isFollowing,
                    Message = message,
                    TotalFollowers = cosplayer.FollowersCount ?? 0
                };

                return ApiResponse<ToggleFollowResponseDto>.Success(response, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling follow for customer {CustomerId} and cosplayer {CosplayerId}",
                    customerId, cosplayerId);
                return ApiResponse<ToggleFollowResponseDto>.Error("An error occurred while processing the follow request.");
            }
        }

        public async Task<ApiResponse<FavoriteCosplayersResponseDto>> GetFavoriteCosplayersAsync(int customerId, int page, int pageSize)
        {
            try
            {
                var favorites = await _unitOfWork.Favorites
                    .FindAsync(f => f.CustomerId == customerId);

                var totalCount = favorites.Count();

                // Apply pagination
                var paginatedFavorites = favorites
                    .OrderByDescending(f => f.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var favoriteDtos = new List<FavoriteCosplayerDto>();

                foreach (var favorite in paginatedFavorites)
                {
                    var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(favorite.CosplayerId);
                    if (cosplayer != null)
                    {
                        var cosplayerUser = await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId);

                        var dto = new FavoriteCosplayerDto
                        {
                            Id = cosplayer.Id,
                            Name = $"{cosplayerUser?.FirstName} {cosplayerUser?.LastName}",
                            DisplayName = cosplayer.DisplayName,
                            AvatarUrl = cosplayerUser?.AvatarUrl,
                            Rating = cosplayer.Rating ?? 0,
                            TotalReviews = cosplayer.TotalReviews ?? 0,
                            PricePerHour = cosplayer.PricePerHour,
                            Category = cosplayer.Category,
                            CharacterSpecialty = cosplayer.CharacterSpecialty,
                            IsAvailable = cosplayer.IsAvailable ?? false,
                            FavoriteDate = favorite.CreatedAt ?? DateTime.UtcNow
                        };

                        favoriteDtos.Add(dto);
                    }
                }

                var response = new FavoriteCosplayersResponseDto
                {
                    Cosplayers = favoriteDtos,
                    TotalCount = totalCount,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return ApiResponse<FavoriteCosplayersResponseDto>.Success(response, "Favorite cosplayers retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite cosplayers for customer: {CustomerId}", customerId);
                return ApiResponse<FavoriteCosplayersResponseDto>.Error("An error occurred while retrieving favorite cosplayers.");
            }
        }

        // Private helper methods
        private async Task<CustomerStatsDto> GetCustomerStatsInternal(int customerId)
        {
            var bookings = await _unitOfWork.Bookings
                .FindAsync(b => b.CustomerId == customerId);

            var reviews = await _unitOfWork.Reviews
                .FindAsync(r => r.CustomerId == customerId);

            var favorites = await _unitOfWork.Favorites
                .FindAsync(f => f.CustomerId == customerId);

            var completedBookings = bookings.Where(b => b.Status == "completed").ToList();
            var cancelledBookings = bookings.Where(b => b.Status == "cancelled").ToList();
            var activeBookings = bookings.Where(b => b.Status == "confirmed" || b.Status == "upcoming").ToList();

            return new CustomerStatsDto
            {
                TotalBookings = bookings.Count(),
                TotalSpent = completedBookings.Sum(b => b.TotalPrice),
                FavoriteCosplayers = favorites.Count(),
                ReviewsGiven = reviews.Count(),
                CompletedBookings = completedBookings.Count,
                CancelledBookings = cancelledBookings.Count,
                AvgBookingValue = completedBookings.Any() ? completedBookings.Average(b => b.TotalPrice) : 0,
                AvgRatingGiven = reviews.Any() ? (decimal)reviews.Average(r => r.Rating) : 0,
                ActiveBookings = activeBookings.Count
            };
        }

        private static bool CanCancelBooking(Booking booking)
        {
            if (booking.Status != "confirmed" && booking.Status != "upcoming")
                return false;

            var bookingDateTime = booking.BookingDate.ToDateTime(booking.StartTime);
            var timeDifference = bookingDateTime - DateTime.Now;

            return timeDifference.TotalHours > 24; // Can cancel if more than 24 hours before booking
        }

        private static string GenerateTransactionCode(string prefix)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"{prefix}{timestamp}{random}";
        }
    }
}