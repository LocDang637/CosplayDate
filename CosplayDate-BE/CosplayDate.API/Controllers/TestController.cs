// TestController.cs - Create this to test authentication
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        /// <summary>
        /// Public endpoint - no authentication required
        /// </summary>
        [HttpGet("public")]
        public IActionResult PublicEndpoint()
        {
            return Ok(new { message = "This is a public endpoint", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Protected endpoint - requires valid JWT token
        /// </summary>
        [HttpGet("protected")]
        [Authorize]
        public IActionResult ProtectedEndpoint()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var userType = User.FindFirst("UserType")?.Value;
            var isVerified = User.FindFirst("IsVerified")?.Value;

            return Ok(new
            {
                message = "This is a protected endpoint",
                user = new
                {
                    id = userId,
                    email = email,
                    userType = userType,
                    isVerified = isVerified
                },
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Verified users only endpoint
        /// </summary>
        [HttpGet("verified-only")]
        [Authorize(Policy = "RequireVerifiedUser")]
        public IActionResult VerifiedOnlyEndpoint()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            return Ok(new
            {
                message = "This endpoint is for verified users only",
                email = email,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Cosplayers only endpoint
        /// </summary>
        [HttpGet("cosplayers-only")]
        [Authorize(Policy = "RequireCosplayer")]
        public IActionResult CosplayersOnlyEndpoint()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            return Ok(new
            {
                message = "This endpoint is for verified cosplayers only",
                email = email,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Customers only endpoint
        /// </summary>
        [HttpGet("customers-only")]
        [Authorize(Policy = "RequireCustomer")]
        public IActionResult CustomersOnlyEndpoint()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            return Ok(new
            {
                message = "This endpoint is for verified customers only",
                email = email,
                timestamp = DateTime.UtcNow
            });
        }
    }
}