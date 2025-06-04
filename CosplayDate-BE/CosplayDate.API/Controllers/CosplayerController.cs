using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/cosplayers")]
    public class CosplayerController : ControllerBase
    {
        private readonly ICosplayerService _cosplayerService;
        private readonly ILogger<CosplayerController> _logger;

        public CosplayerController(ICosplayerService cosplayerService, ILogger<CosplayerController> logger)
        {
            _cosplayerService = cosplayerService;
            _logger = logger;
        }

        /// <summary>
        /// Get all cosplayers with optional filters
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCosplayers([FromQuery] GetCosplayersRequestDto request)
        {
            try
            {
                var result = await _cosplayerService.GetCosplayersAsync(request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayers list");
                return StatusCode(500, "An error occurred while retrieving cosplayers");
            }
        }

        /// <summary>
        /// Get cosplayer details by ID - FIXED to handle both cosplayer ID and user ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCosplayerDetails(int id)
        {
            try
            {
                var currentUserId = 0;
                if (User.Identity?.IsAuthenticated == true)
                {
                    currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                }

                // FIXED: Try to get cosplayer details by cosplayer ID first
                var result = await _cosplayerService.GetCosplayerDetailsAsync(id, currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                // FIXED: If not found by cosplayer ID, try to find by user ID
                // This handles cases where frontend passes user ID instead of cosplayer ID
                var resultByUserId = await _cosplayerService.GetCosplayerDetailsByUserIdAsync(id, currentUserId);

                if (resultByUserId.IsSuccess)
                {
                    return Ok(resultByUserId);
                }

                // Return the original error if both attempts fail
                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer details for ID: {Id}", id);
                return StatusCode(500, "An error occurred while retrieving cosplayer details");
            }
        }

        /// <summary>
        /// Update cosplayer profile (authenticated cosplayers only)
        /// </summary>
        [HttpPut("profile")]
        [Authorize(Policy = "RequireCosplayer")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateCosplayerProfile([FromBody] UpdateCosplayerProfileRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerService.UpdateCosplayerProfileAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cosplayer profile");
                return StatusCode(500, "An error occurred while updating cosplayer profile");
            }
        }

        /// <summary>
        /// Convert customer account to cosplayer
        /// </summary>
        [HttpPost("become-cosplayer")]
        [Authorize(Policy = "RequireVerifiedUser")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> BecomeCosplayer([FromBody] BecomeCosplayerRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userType = User.FindFirst("UserType")?.Value;

                if (userType == "Cosplayer")
                {
                    return BadRequest("You are already a cosplayer");
                }

                var result = await _cosplayerService.BecomeCosplayerAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting to cosplayer");
                return StatusCode(500, "An error occurred while converting to cosplayer");
            }
        }

        /// <summary>
        /// Get cosplayer services
        /// </summary>
        [HttpGet("{id}/services")]
        public async Task<IActionResult> GetCosplayerServices(int id)
        {
            try
            {
                var result = await _cosplayerService.GetCosplayerServicesAsync(id);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer services for ID: {CosplayerId}", id);
                return StatusCode(500, "An error occurred while retrieving cosplayer services");
            }
        }

        /// <summary>
        /// Add new service (authenticated cosplayers only)
        /// </summary>
        [HttpPost("services")]
        [Authorize(Policy = "RequireCosplayer")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> AddService([FromBody] AddCosplayerServiceRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerService.AddServiceAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetCosplayerServices), new { id = currentUserId }, result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding cosplayer service");
                return StatusCode(500, "An error occurred while adding the service");
            }
        }

        /// <summary>
        /// Update existing service (authenticated cosplayers only)
        /// </summary>
        [HttpPut("services/{serviceId}")]
        [Authorize(Policy = "RequireCosplayer")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> UpdateService(int serviceId, [FromBody] UpdateCosplayerServiceRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerService.UpdateServiceAsync(currentUserId, serviceId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cosplayer service {ServiceId}", serviceId);
                return StatusCode(500, "An error occurred while updating the service");
            }
        }

        /// <summary>
        /// Delete service (authenticated cosplayers only)
        /// </summary>
        [HttpDelete("services/{serviceId}")]
        [Authorize(Policy = "RequireCosplayer")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> DeleteService(int serviceId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _cosplayerService.DeleteServiceAsync(currentUserId, serviceId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting cosplayer service {ServiceId}", serviceId);
                return StatusCode(500, "An error occurred while deleting the service");
            }
        }
    }
}