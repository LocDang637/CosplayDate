using CosplayDate.Application.DTOs.Review;
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace CosplayDate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        /// <summary>
        /// Tạo review cho booking/cosplayer
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequestDto request)
        {
            var customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.CreateReviewAsync(customerId, request);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Lấy danh sách review của cosplayer (có phân trang)
        /// </summary>
        [HttpGet("cosplayer/{cosplayerId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewsForCosplayer(int cosplayerId, int page = 1, int pageSize = 10)
        {
            var currentUserId = 0;
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out var userId))
                {
                    currentUserId = userId;
                }
            }
            
            var result = await _reviewService.GetReviewsForCosplayerAsync(cosplayerId, currentUserId, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Lấy điểm trung bình rating của cosplayer
        /// </summary>
        [HttpGet("cosplayer/{cosplayerId}/average")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAverageRatingForCosplayer(int cosplayerId)
        {
            var result = await _reviewService.GetAverageRatingForCosplayerAsync(cosplayerId);
            return Ok(result);
        }

        /// <summary>
        /// Cập nhật review (chỉ chủ review)
        /// </summary>
        [HttpPut("{reviewId}")]
        public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] UpdateReviewRequestDto request)
        {
            var customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.UpdateReviewAsync(reviewId, customerId, request);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Xóa review (customer hoặc admin)
        /// </summary>
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin") || User.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
            var result = await _reviewService.DeleteReviewAsync(reviewId, userId, isAdmin);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Cosplayer trả lời review (owner response)
        /// </summary>
        [HttpPost("{reviewId}/owner-response")]
        public async Task<IActionResult> UpdateOwnerResponse(int reviewId, [FromBody] OwnerResponseRequestDto request)
        {
            var cosplayerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.UpdateOwnerResponseAsync(reviewId, cosplayerId, request);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Cosplayer cập nhật trả lời review (owner response)
        /// </summary>
        [HttpPut("{reviewId}/owner-response")]
        public async Task<IActionResult> EditOwnerResponse(int reviewId, [FromBody] OwnerResponseRequestDto request)
        {
            var cosplayerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.EditOwnerResponseAsync(reviewId, cosplayerId, request);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Cosplayer xóa trả lời review (owner response)
        /// </summary>
        [HttpDelete("{reviewId}/owner-response")]
        public async Task<IActionResult> DeleteOwnerResponse(int reviewId)
        {
            var cosplayerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _reviewService.DeleteOwnerResponseAsync(reviewId, cosplayerId);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Lấy review theo booking ID
        /// </summary>
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetReviewByBookingId(int bookingId)
        {
            var result = await _reviewService.GetReviewByBookingIdAsync(bookingId);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Toggle helpful vote on a review
        /// </summary>
        [HttpPost("{reviewId}/helpful")]
        public async Task<IActionResult> ToggleHelpful(int reviewId, [FromBody] ToggleHelpfulRequestDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return BadRequest(new { isSuccess = false, message = "User not found" });
            }

            var result = await _reviewService.ToggleHelpfulAsync(reviewId, userId, request);
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }

        /// <summary>
        /// Lấy tất cả reviews từ tất cả cosplayers (có phân trang)
        /// </summary>
        [HttpGet("all")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllReviews(int page = 1, int pageSize = 10)
        {
            var currentUserId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var userId))
            {
                currentUserId = userId;
            }
            
            var result = await _reviewService.GetAllReviewsAsync(currentUserId, page, pageSize);
            return Ok(result);
        }
    }
}