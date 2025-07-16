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

        public async Task<ApiResponse<List<ReviewResponseDto>>> GetReviewsForCosplayerAsync(int cosplayerId, int page = 1, int pageSize = 10)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.CosplayerId == cosplayerId);
            var paged = reviews.OrderByDescending(r => r.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToList();
            var result = new List<ReviewResponseDto>();
            
            foreach (var review in paged)
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
                var tags = (await _unitOfWork.ReviewTags.FindAsync(t => t.ReviewId == review.Id)).Select(t => t.Tag).ToList();
                
                // Get booking data to retrieve service type
                var booking = await _unitOfWork.Bookings.GetByIdAsync(review.BookingId);
                
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
                    ServiceType = booking?.ServiceType
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
            if (review.CosplayerId != cosplayerId)
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
    }
}