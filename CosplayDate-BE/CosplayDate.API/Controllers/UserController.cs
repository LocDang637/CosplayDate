using CosplayDate.Application.DTOs.User;
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.GetUserProfileAsync(currentUserId, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user's profile");
                return StatusCode(500, "An error occurred while retrieving your profile");
            }
        }

        /// <summary>
        /// Get user profile by ID
        /// </summary>
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetUserProfile(int userId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.GetUserProfileAsync(userId, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for ID: {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving the user profile");
            }
        }

        /// <summary>
        /// Update user profile
        /// </summary>
        [HttpPut("profile")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.UpdateUserProfileAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, "An error occurred while updating your profile");
            }
        }

        /// <summary>
        /// Upload profile avatar to Supabase
        /// </summary>
        [HttpPost("upload-avatar")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest("Only JPEG, PNG, and WebP images are allowed");
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest("File size cannot exceed 5MB");
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.UploadAvatarAsync(currentUserId, file);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading avatar");
                return StatusCode(500, "An error occurred while uploading the avatar");
            }
        }

        /// <summary>
        /// Delete profile avatar
        /// </summary>
        [HttpDelete("avatar")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> DeleteAvatar()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.DeleteAvatarAsync(currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting avatar");
                return StatusCode(500, "An error occurred while deleting the avatar");
            }
        }

        /// <summary>
        /// Get user interests
        /// </summary>
        [HttpGet("interests")]
        public async Task<IActionResult> GetInterests()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.GetUserInterestsAsync(currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user interests");
                return StatusCode(500, "An error occurred while retrieving interests");
            }
        }

        /// <summary>
        /// Update user interests
        /// </summary>
        [HttpPut("interests")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateInterests([FromBody] UpdateUserInterestsRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.UpdateUserInterestsAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user interests");
                return StatusCode(500, "An error occurred while updating interests");
            }
        }

        /// <summary>
        /// Get user settings
        /// </summary>
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.GetUserSettingsAsync(currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user settings");
                return StatusCode(500, "An error occurred while retrieving settings");
            }
        }

        /// <summary>
        /// Update user settings
        /// </summary>
        [HttpPut("settings")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateUserSettingsRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.UpdateUserSettingsAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user settings");
                return StatusCode(500, "An error occurred while updating settings");
            }
        }

        /// <summary>
        /// Follow a user
        /// </summary>
        [HttpPost("follow/{userId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> FollowUser(int userId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                if (currentUserId == userId)
                {
                    return BadRequest("You cannot follow yourself");
                }

                var result = await _userService.FollowUserAsync(currentUserId, userId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error following user: {UserId}", userId);
                return StatusCode(500, "An error occurred while processing the follow request");
            }
        }

        /// <summary>
        /// Unfollow a user
        /// </summary>
        [HttpDelete("follow/{userId}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UnfollowUser(int userId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.UnfollowUserAsync(currentUserId, userId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unfollowing user: {UserId}", userId);
                return StatusCode(500, "An error occurred while processing the unfollow request");
            }
        }

        /// <summary>
        /// Get user followers
        /// </summary>
        [HttpGet("followers")]
        public async Task<IActionResult> GetFollowers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.GetFollowersAsync(currentUserId, page, pageSize);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting followers");
                return StatusCode(500, "An error occurred while retrieving followers");
            }
        }

        /// <summary>
        /// Get users being followed
        /// </summary>
        [HttpGet("following")]
        public async Task<IActionResult> GetFollowing([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _userService.GetFollowingAsync(currentUserId, page, pageSize);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting following");
                return StatusCode(500, "An error occurred while retrieving following list");
            }
        }
    }
}