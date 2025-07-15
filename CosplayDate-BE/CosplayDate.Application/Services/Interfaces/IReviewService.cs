using CosplayDate.Application.DTOs.Review;
using CosplayDate.Shared.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ApiResponse<ReviewResponseDto>> CreateReviewAsync(int customerId, CreateReviewRequestDto request);
        Task<ApiResponse<List<ReviewResponseDto>>> GetReviewsForCosplayerAsync(int cosplayerId, int page = 1, int pageSize = 10);
        Task<ApiResponse<double>> GetAverageRatingForCosplayerAsync(int cosplayerId);
        Task<ApiResponse<ReviewResponseDto>> UpdateReviewAsync(int reviewId, int customerId, UpdateReviewRequestDto request);
        Task<ApiResponse<bool>> DeleteReviewAsync(int reviewId, int userId, bool isAdmin = false);
        Task<ApiResponse<ReviewResponseDto>> UpdateOwnerResponseAsync(int reviewId, int cosplayerId, OwnerResponseRequestDto request);
        Task<ApiResponse<ReviewResponseDto>> GetReviewByBookingIdAsync(int bookingId);
    }
}