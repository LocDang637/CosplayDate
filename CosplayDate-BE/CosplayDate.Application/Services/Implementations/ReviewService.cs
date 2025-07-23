using CosplayDate.Application.DTOs.Review;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Implementations
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(IUnitOfWork unitOfWork, ILogger<ReviewService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        // Helper method to update cosplayer's rating and total reviews
        private async Task UpdateCosplayerRatingAndTotalReviewsAsync(int cosplayerId)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    _logger.LogWarning($"Cosplayer with ID {cosplayerId} not found when updating rating");
                    return;
                }

                // Get all reviews for this cosplayer
                var reviews = await _unitOfWork.Reviews.FindAsync(r => r.CosplayerId == cosplayerId);
                
                // Update total reviews count
                cosplayer.TotalReviews = reviews.Count();
                
                // Update average rating
                if (reviews.Any())
                {
                    cosplayer.Rating = (decimal)reviews.Average(r => r.Rating);
                }
                else
                {
                    cosplayer.Rating = 0;
                }

                _unitOfWork.Cosplayers.Update(cosplayer);
                await _unitOfWork.SaveChangesAsync();
                
                _logger.LogInformation($"Updated cosplayer {cosplayerId}: Rating = {cosplayer.Rating}, TotalReviews = {cosplayer.TotalReviews}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating cosplayer rating and total reviews for cosplayer {cosplayerId}");
            }
        }

        public async Task<ApiResponse<ReviewResponseDto>> CreateReviewAsync(int customerId, CreateReviewRequestDto request)
        {
            // Kiểm tra booking tồn tại và đã completed chưa
            var booking = await _unitOfWork.Bookings.GetByIdAsync(request.BookingId);
            if (booking == null || booking.Status != "Completed")
            {
                return ApiResponse<ReviewResponseDto>.Error("Booking not found or not completed");
            }
            // Kiểm tra quyền
            if (booking.CustomerId != customerId)
            {
                return ApiResponse<ReviewResponseDto>.Error("You don't have permission to review this booking");
            }
            // Kiểm tra đã review chưa
            var existingReview = await _unitOfWork.Reviews.FirstOrDefaultAsync(r => r.BookingId == request.BookingId);
            if (existingReview != null)
            {
                return ApiResponse<ReviewResponseDto>.Error("This booking has already been reviewed");
            }
            // Tạo review mới
            var review = new Review
            {
                BookingId = request.BookingId,
                CustomerId = customerId,
                CosplayerId = booking.CosplayerId,
                Rating = request.Rating,
                Comment = request.Comment ?? string.Empty,
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.SaveChangesAsync();
            // Thêm tags nếu có
            if (request.Tags != null && request.Tags.Any())
            {
                foreach (var tag in request.Tags)
                {
                    await _unitOfWork.ReviewTags.AddAsync(new ReviewTag
                    {
                        ReviewId = review.Id,
                        Tag = tag
                    });
                }
                await _unitOfWork.SaveChangesAsync();
            }
            // Lấy thông tin user
            var customer = await _unitOfWork.Users.GetByIdAsync(customerId);
            // Lấy tags
            var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
            
            // Update cosplayer's rating and total reviews
            await UpdateCosplayerRatingAndTotalReviewsAsync(booking.CosplayerId);
            
            // Trả về response
            var response = new ReviewResponseDto
            {
                Id = review.Id,
                BookingId = review.BookingId,
                CustomerId = review.CustomerId,
                CosplayerId = review.CosplayerId,
                Rating = review.Rating,
                Comment = review.Comment,
                IsVerified = review.IsVerified,
                HelpfulCount = review.HelpfulCount,
                OwnerResponse = review.OwnerResponse,
                CreatedAt = review.CreatedAt,
                Tags = tags,
                CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
                CustomerAvatarUrl = customer?.AvatarUrl,
                ServiceType = booking?.ServiceType
            };
            return ApiResponse<ReviewResponseDto>.Success(response, "Review created successfully");
        }

        public async Task<ApiResponse<List<ReviewResponseDto>>> GetAllReviewsAsync(int currentUserId = 0, int page = 1, int pageSize = 10)
        {
            var reviews = await _unitOfWork.Reviews.GetAllAsync();
            var paged = reviews.OrderByDescending(r => r.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToList();
            var result = new List<ReviewResponseDto>();
            
            foreach (var review in paged)
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(review.CosplayerId);
                var cosplayerUser = cosplayer != null ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId) : null;
                var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
                
                // Get booking data to retrieve service type
                var booking = await _unitOfWork.Bookings.GetByIdAsync(review.BookingId);
                
                // Check if current user has voted on this review
                bool? isHelpfulByCurrentUser = null;
                if (currentUserId > 0)
                {
                    var userVote = await _unitOfWork.Repository<ReviewHelpfulVote>()
                        .FirstOrDefaultAsync(v => v.ReviewId == review.Id && v.UserId == currentUserId);
                    if (userVote != null)
                    {
                        isHelpfulByCurrentUser = userVote.IsHelpful;
                    }
                }
                
                result.Add(new ReviewResponseDto
                {
                    Id = review.Id,
                    BookingId = review.BookingId,
                    CustomerId = review.CustomerId,
                    CosplayerId = review.CosplayerId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    IsVerified = review.IsVerified,
                    HelpfulCount = review.HelpfulCount,
                    OwnerResponse = review.OwnerResponse,
                    CreatedAt = review.CreatedAt,
                    Tags = tags,
                    CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
                    CustomerAvatarUrl = customer?.AvatarUrl,
                    CosplayerName = cosplayerUser != null ? $"{cosplayerUser.FirstName} {cosplayerUser.LastName}" : cosplayer?.DisplayName ?? string.Empty,
                    CosplayerAvatarUrl = cosplayerUser?.AvatarUrl,
                    ServiceType = booking?.ServiceType,
                    IsHelpfulByCurrentUser = isHelpfulByCurrentUser
                });
            }
            return ApiResponse<List<ReviewResponseDto>>.Success(result, "All reviews loaded successfully");
        }

        public async Task<ApiResponse<List<ReviewResponseDto>>> GetReviewsForCosplayerAsync(int cosplayerId, int currentUserId = 0, int page = 1, int pageSize = 10)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.CosplayerId == cosplayerId);
            var paged = reviews.OrderByDescending(r => r.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToList();
            var result = new List<ReviewResponseDto>();
            
            // Get cosplayer info once since all reviews are for the same cosplayer
            var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
            var cosplayerUser = cosplayer != null ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId) : null;
            
            foreach (var review in paged)
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
                var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
                
                // Get booking data to retrieve service type
                var booking = await _unitOfWork.Bookings.GetByIdAsync(review.BookingId);
                
                // Check if current user has voted on this review
                bool? isHelpfulByCurrentUser = null;
                if (currentUserId > 0)
                {
                    var userVote = await _unitOfWork.Repository<ReviewHelpfulVote>()
                        .FirstOrDefaultAsync(v => v.ReviewId == review.Id && v.UserId == currentUserId);
                    if (userVote != null)
                    {
                        isHelpfulByCurrentUser = userVote.IsHelpful;
                    }
                }
                
                result.Add(new ReviewResponseDto
                {
                    Id = review.Id,
                    BookingId = review.BookingId,
                    CustomerId = review.CustomerId,
                    CosplayerId = review.CosplayerId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    IsVerified = review.IsVerified,
                    HelpfulCount = review.HelpfulCount,
                    OwnerResponse = review.OwnerResponse,
                    CreatedAt = review.CreatedAt,
                    Tags = tags,
                    CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
                    CustomerAvatarUrl = customer?.AvatarUrl,
                    CosplayerName = cosplayerUser != null ? $"{cosplayerUser.FirstName} {cosplayerUser.LastName}" : cosplayer?.DisplayName ?? string.Empty,
                    CosplayerAvatarUrl = cosplayerUser?.AvatarUrl,
                    ServiceType = booking?.ServiceType,
                    IsHelpfulByCurrentUser = isHelpfulByCurrentUser
                });
            }
            return ApiResponse<List<ReviewResponseDto>>.Success(result, "Reviews loaded successfully");
        }

        public async Task<ApiResponse<double>> GetAverageRatingForCosplayerAsync(int cosplayerId)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.CosplayerId == cosplayerId);
            if (!reviews.Any())
                return ApiResponse<double>.Success(0, "No reviews yet");
            var avg = reviews.Average(r => r.Rating);
            return ApiResponse<double>.Success(avg, "Average rating calculated");
        }

        public async Task<ApiResponse<ReviewResponseDto>> UpdateReviewAsync(int reviewId, int customerId, UpdateReviewRequestDto request)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
            if (review == null)
                return ApiResponse<ReviewResponseDto>.Error("Review not found");
            if (review.CustomerId != customerId)
                return ApiResponse<ReviewResponseDto>.Error("You don't have permission to update this review");
            // Cập nhật rating, comment
            review.Rating = request.Rating;
            review.Comment = request.Comment ?? string.Empty;
            _unitOfWork.Reviews.Update(review);
            // Cập nhật tags
            var oldTags = await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == reviewId);
            foreach (var tag in oldTags) _unitOfWork.ReviewTags.Remove(tag);
            if (request.Tags != null && request.Tags.Any())
            {
                foreach (var tag in request.Tags)
                {
                    await _unitOfWork.ReviewTags.AddAsync(new ReviewTag { ReviewId = reviewId, Tag = tag });
                }
            }
            await _unitOfWork.SaveChangesAsync();
            
            // Update cosplayer's rating and total reviews after updating the review
            await UpdateCosplayerRatingAndTotalReviewsAsync(review.CosplayerId);
            
            // Lấy lại thông tin user và tags
            var customer = await _unitOfWork.Users.GetByIdAsync(customerId);
            var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
            var response = new ReviewResponseDto
            {
                Id = review.Id,
                BookingId = review.BookingId,
                CustomerId = review.CustomerId,
                CosplayerId = review.CosplayerId,
                Rating = review.Rating,
                Comment = review.Comment,
                IsVerified = review.IsVerified,
                HelpfulCount = review.HelpfulCount,
                OwnerResponse = review.OwnerResponse,
                CreatedAt = review.CreatedAt,
                Tags = tags,
                CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
                CustomerAvatarUrl = customer?.AvatarUrl
            };
            return ApiResponse<ReviewResponseDto>.Success(response, "Review updated successfully");
        }

        public async Task<ApiResponse<ReviewResponseDto>> UpdateOwnerResponseAsync(int reviewId, int cosplayerId, OwnerResponseRequestDto request)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
            if (review == null)
                return ApiResponse<ReviewResponseDto>.Error("Review not found");
            var cosplayer = await _unitOfWork.Cosplayers.FirstOrDefaultAsync(c => c.UserId == cosplayerId);
            if (cosplayer == null || review.CosplayerId != cosplayer.Id)
                return ApiResponse<ReviewResponseDto>.Error("You don't have permission to respond to this review");
            review.OwnerResponse = request.Response;
            review.OwnerResponseDate = DateTime.UtcNow;
            _unitOfWork.Reviews.Update(review);
            await _unitOfWork.SaveChangesAsync();
            // Lấy lại thông tin user và tags
            var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
            var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
            var response = new ReviewResponseDto
            {
                Id = review.Id,
                BookingId = review.BookingId,
                CustomerId = review.CustomerId,
                CosplayerId = review.CosplayerId,
                Rating = review.Rating,
                Comment = review.Comment,
                IsVerified = review.IsVerified,
                HelpfulCount = review.HelpfulCount,
                OwnerResponse = review.OwnerResponse,
                CreatedAt = review.CreatedAt,
                Tags = tags,
                CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
                CustomerAvatarUrl = customer?.AvatarUrl
            };
            return ApiResponse<ReviewResponseDto>.Success(response, "Owner response updated successfully");
        }

        public async Task<ApiResponse<ReviewResponseDto>> EditOwnerResponseAsync(int reviewId, int cosplayerId, OwnerResponseRequestDto request)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
            if (review == null)
                return ApiResponse<ReviewResponseDto>.Error("Review not found");
            if (review.CosplayerId != cosplayerId)
                return ApiResponse<ReviewResponseDto>.Error("You don't have permission to edit this owner response");
            
            // Check if owner response exists
            if (string.IsNullOrEmpty(review.OwnerResponse))
                return ApiResponse<ReviewResponseDto>.Error("No owner response found to edit");

            review.OwnerResponse = request.Response;
            review.OwnerResponseDate = DateTime.UtcNow;
            _unitOfWork.Reviews.Update(review);
            await _unitOfWork.SaveChangesAsync();
            
            // Get customer information and tags
            var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
            var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
            
            var response = new ReviewResponseDto
            {
                Id = review.Id,
                BookingId = review.BookingId,
                CustomerId = review.CustomerId,
                CosplayerId = review.CosplayerId,
                Rating = review.Rating,
                Comment = review.Comment,
                IsVerified = review.IsVerified,
                HelpfulCount = review.HelpfulCount,
                OwnerResponse = review.OwnerResponse,
                CreatedAt = review.CreatedAt,
                Tags = tags,
                CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : string.Empty,
                CustomerAvatarUrl = customer?.AvatarUrl
            };
            return ApiResponse<ReviewResponseDto>.Success(response, "Owner response edited successfully");
        }

        public async Task<ApiResponse<bool>> DeleteOwnerResponseAsync(int reviewId, int cosplayerId)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
            if (review == null)
                return ApiResponse<bool>.Error("Review not found");
            if (review.CosplayerId != cosplayerId)
                return ApiResponse<bool>.Error("You don't have permission to delete this owner response");
            
            // Check if owner response exists
            if (string.IsNullOrEmpty(review.OwnerResponse))
                return ApiResponse<bool>.Error("No owner response found to delete");

            review.OwnerResponse = null;
            review.OwnerResponseDate = null;
            _unitOfWork.Reviews.Update(review);
            await _unitOfWork.SaveChangesAsync();
            
            return ApiResponse<bool>.Success(true, "Owner response deleted successfully");
        }

        public async Task<ApiResponse<bool>> DeleteReviewAsync(int reviewId, int userId, bool isAdmin = false)
        {
            var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
            if (review == null)
                return ApiResponse<bool>.Error("Review not found");

            // Nếu không phải admin thì chỉ cho xóa review của chính mình
            if (!isAdmin && review.CustomerId != userId)
                return ApiResponse<bool>.Error("You don't have permission to delete this review");

            // Store cosplayerId before deleting the review to update rating later
            var cosplayerId = review.CosplayerId;

            // Xóa các tag liên quan
            var tags = await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == reviewId);
            foreach (var tag in tags)
                _unitOfWork.ReviewTags.Remove(tag);

            // Xóa các helpful vote liên quan
            var votes = await _unitOfWork.Repository<ReviewHelpfulVote>().FindAsync(v => v.ReviewId == reviewId);
            foreach (var vote in votes)
                _unitOfWork.Repository<ReviewHelpfulVote>().Remove(vote);

            // Xóa review
            _unitOfWork.Reviews.Remove(review);
            await _unitOfWork.SaveChangesAsync();
            
            // Update cosplayer's rating and total reviews after deleting the review
            await UpdateCosplayerRatingAndTotalReviewsAsync(cosplayerId);
            
            return ApiResponse<bool>.Success(true, "Review deleted successfully");
        }

        public async Task<ApiResponse<ReviewResponseDto>> GetReviewByBookingIdAsync(int bookingId)
        {
            try
            {
                var review = await _unitOfWork.Reviews.FirstOrDefaultAsync(r => r.BookingId == bookingId);
                if (review == null)
                {
                    return ApiResponse<ReviewResponseDto>.Error("Review not found for this booking");
                }

                // Get customer information
                var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
                
                // Get review tags
                var reviewTags = await _unitOfWork.ReviewTags.FindAsync(rt => rt.ReviewId == review.Id);
                var tags = reviewTags.Select(rt => rt.Tag).ToList();

                // Get booking data to retrieve service type
                var booking = await _unitOfWork.Bookings.GetByIdAsync(review.BookingId);

                var reviewDto = new ReviewResponseDto
                {
                    Id = review.Id,
                    BookingId = review.BookingId,
                    CustomerId = review.CustomerId,
                    CosplayerId = review.CosplayerId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    IsVerified = review.IsVerified,
                    HelpfulCount = review.HelpfulCount,
                    OwnerResponse = review.OwnerResponse,
                    CreatedAt = review.CreatedAt,
                    Tags = tags,
                    CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : "Unknown",
                    CustomerAvatarUrl = customer?.AvatarUrl,
                    ServiceType = booking?.ServiceType
                };

                return ApiResponse<ReviewResponseDto>.Success(reviewDto, "Review retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review by booking ID {BookingId}", bookingId);
                return ApiResponse<ReviewResponseDto>.Error("An error occurred while retrieving the review");
            }
        }

        public async Task<ApiResponse<ToggleHelpfulResponseDto>> ToggleHelpfulAsync(int reviewId, int userId, ToggleHelpfulRequestDto request)
        {
            try
            {
                var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
                if (review == null)
                {
                    return ApiResponse<ToggleHelpfulResponseDto>.Error("Review not found");
                }

                // Check if user is trying to vote on their own review
                if (review.CustomerId == userId)
                {
                    return ApiResponse<ToggleHelpfulResponseDto>.Error("You cannot vote on your own review");
                }

                // Check if user has already voted on this review
                var existingVote = await _unitOfWork.Repository<ReviewHelpfulVote>()
                    .FirstOrDefaultAsync(v => v.ReviewId == reviewId && v.UserId == userId);

                bool isToggled = false;
                int newHelpfulCount = review.HelpfulCount ?? 0;

                if (existingVote != null)
                {
                    // User has already voted
                    if (existingVote.IsHelpful == request.IsHelpful)
                    {
                        // Same vote - remove it (toggle off)
                        _unitOfWork.Repository<ReviewHelpfulVote>().Remove(existingVote);
                        if (existingVote.IsHelpful)
                        {
                            newHelpfulCount = Math.Max(0, newHelpfulCount - 1);
                        }
                        isToggled = false;
                    }
                    else
                    {
                        // Different vote - update it
                        existingVote.IsHelpful = request.IsHelpful;
                        existingVote.CreatedAt = DateTime.UtcNow;
                        _unitOfWork.Repository<ReviewHelpfulVote>().Update(existingVote);
                        
                        // Update count: if changing from unhelpful to helpful, +1; if changing from helpful to unhelpful, -1
                        if (request.IsHelpful)
                        {
                            newHelpfulCount += 1;
                        }
                        else
                        {
                            newHelpfulCount = Math.Max(0, newHelpfulCount - 1);
                        }
                        isToggled = true;
                    }
                }
                else
                {
                    // New vote
                    var newVote = new ReviewHelpfulVote
                    {
                        ReviewId = reviewId,
                        UserId = userId,
                        IsHelpful = request.IsHelpful,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Repository<ReviewHelpfulVote>().AddAsync(newVote);
                    
                    if (request.IsHelpful)
                    {
                        newHelpfulCount += 1;
                    }
                    isToggled = true;
                }

                // Update the review's helpful count
                review.HelpfulCount = newHelpfulCount;
                _unitOfWork.Reviews.Update(review);
                
                await _unitOfWork.SaveChangesAsync();

                var response = new ToggleHelpfulResponseDto
                {
                    ReviewId = reviewId,
                    IsHelpful = request.IsHelpful,
                    IsToggled = isToggled,
                    HelpfulCount = newHelpfulCount
                };

                return ApiResponse<ToggleHelpfulResponseDto>.Success(response, 
                    isToggled ? "Vote recorded successfully" : "Vote removed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling helpful vote for review {ReviewId} by user {UserId}", reviewId, userId);
                return ApiResponse<ToggleHelpfulResponseDto>.Error("An error occurred while processing your vote");
            }
        }
    }
}