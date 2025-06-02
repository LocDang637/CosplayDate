using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/cosplayers")]
    [Authorize(Policy = "RequireCosplayer")]
    public class CosplayerMediaController : ControllerBase
    {
        private readonly ICosplayerMediaService _cosplayerMediaService;
        private readonly ILogger<CosplayerMediaController> _logger;

        public CosplayerMediaController(ICosplayerMediaService cosplayerMediaService, ILogger<CosplayerMediaController> logger)
        {
            _cosplayerMediaService = cosplayerMediaService;
            _logger = logger;
        }

        /// <summary>
        /// Upload cosplayer photo
        /// </summary>
        [HttpPost("photos")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UploadPhoto([FromForm] UploadCosplayerPhotoRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(request.File.ContentType.ToLower()))
            {
                return BadRequest("Only JPEG, PNG, and WebP images are allowed");
            }

            // Validate file size (max 10MB)
            if (request.File.Length > 10 * 1024 * 1024)
            {
                return BadRequest("File size cannot exceed 10MB");
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.UploadPhotoAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading cosplayer photo");
                return StatusCode(500, "An error occurred while uploading the photo");
            }
        }

        /// <summary>
        /// Update cosplayer photo details
        /// </summary>
        [HttpPut("photos/{photoId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdatePhoto(int photoId, [FromBody] UpdateCosplayerPhotoRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.UpdatePhotoAsync(currentUserId, photoId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cosplayer photo {PhotoId}", photoId);
                return StatusCode(500, "An error occurred while updating the photo");
            }
        }

        /// <summary>
        /// Delete cosplayer photo
        /// </summary>
        [HttpDelete("photos/{photoId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> DeletePhoto(int photoId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.DeletePhotoAsync(currentUserId, photoId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cosplayer photo {PhotoId}", photoId);
                return StatusCode(500, "An error occurred while deleting the photo");
            }
        }

        /// <summary>
        /// Get cosplayer photos
        /// </summary>
        [HttpGet("{cosplayerId}/photos")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPhotos(int cosplayerId, [FromQuery] GetCosplayerPhotosRequestDto request)
        {
            try
            {
                var currentUserId = 0;
                if (User.Identity?.IsAuthenticated == true)
                {
                    currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }

                var result = await _cosplayerMediaService.GetPhotosAsync(cosplayerId, currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer photos for {CosplayerId}", cosplayerId);
                return StatusCode(500, "An error occurred while retrieving photos");
            }
        }

        /// <summary>
        /// Upload cosplayer video
        /// </summary>
        [HttpPost("videos")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UploadVideo([FromForm] UploadCosplayerVideoRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.VideoFile == null || request.VideoFile.Length == 0)
            {
                return BadRequest("No video file uploaded");
            }

            // Validate video file type
            var allowedVideoTypes = new[] { "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm" };
            if (!allowedVideoTypes.Contains(request.VideoFile.ContentType.ToLower()))
            {
                return BadRequest("Only MP4, AVI, MOV, WMV, and WebM videos are allowed");
            }

            // Validate video file size (max 100MB)
            if (request.VideoFile.Length > 100 * 1024 * 1024)
            {
                return BadRequest("Video file size cannot exceed 100MB");
            }

            // Validate thumbnail if provided
            if (request.ThumbnailFile != null)
            {
                var allowedImageTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
                if (!allowedImageTypes.Contains(request.ThumbnailFile.ContentType.ToLower()))
                {
                    return BadRequest("Thumbnail must be JPEG, PNG, or WebP");
                }

                if (request.ThumbnailFile.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("Thumbnail file size cannot exceed 5MB");
                }
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.UploadVideoAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading cosplayer video");
                return StatusCode(500, "An error occurred while uploading the video");
            }
        }

        /// <summary>
        /// Update cosplayer video details
        /// </summary>
        [HttpPut("videos/{videoId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateVideo(int videoId, [FromBody] UpdateCosplayerVideoRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.UpdateVideoAsync(currentUserId, videoId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cosplayer video {VideoId}", videoId);
                return StatusCode(500, "An error occurred while updating the video");
            }
        }

        /// <summary>
        /// Delete cosplayer video
        /// </summary>
        [HttpDelete("videos/{videoId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> DeleteVideo(int videoId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.DeleteVideoAsync(currentUserId, videoId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cosplayer video {VideoId}", videoId);
                return StatusCode(500, "An error occurred while deleting the video");
            }
        }

        /// <summary>
        /// Get cosplayer videos
        /// </summary>
        [HttpGet("{cosplayerId}/videos")]
        [AllowAnonymous]
        public async Task<IActionResult> GetVideos(int cosplayerId, [FromQuery] GetCosplayerVideosRequestDto request)
        {
            try
            {
                var result = await _cosplayerMediaService.GetVideosAsync(cosplayerId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer videos for {CosplayerId}", cosplayerId);
                return StatusCode(500, "An error occurred while retrieving videos");
            }
        }

        /// <summary>
        /// Like/Unlike a photo
        /// </summary>
        [HttpPost("photos/{photoId}/like")]
        [Authorize]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> TogglePhotoLike(int photoId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.TogglePhotoLikeAsync(currentUserId, photoId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling photo like for photo {PhotoId}", photoId);
                return StatusCode(500, "An error occurred while processing the like");
            }
        }

        /// <summary>
        /// Reorder photos
        /// </summary>
        [HttpPut("photos/reorder")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> ReorderPhotos([FromBody] ReorderPhotosRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.ReorderPhotosAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering photos");
                return StatusCode(500, "An error occurred while reordering photos");
            }
        }

        /// <summary>
        /// Reorder videos
        /// </summary>
        [HttpPut("videos/reorder")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> ReorderVideos([FromBody] ReorderVideosRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerMediaService.ReorderVideosAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering videos");
                return StatusCode(500, "An error occurred while reordering videos");
            }
        }
    }
}