// TestController.cs - Create this to test authentication
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IPayOSService _payOSService;
        private readonly IWalletService _walletService;
        private readonly ILogger<TestController> _logger;

        public TestController(
            IPayOSService payOSService,
            IWalletService walletService,
            ILogger<TestController> logger)
        {
            _payOSService = payOSService;
            _walletService = walletService;
            _logger = logger;
        }
        /// <summary>
        /// Public endpoint - no authentication required
        /// </summary>
        [HttpGet("public")]
        public IActionResult PublicEndpoint()
        {
            return Ok(new { message = "Đây là điểm truy cập công khai", timestamp = DateTime.UtcNow });
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
                message = "Đây là điểm truy cập được bảo vệ",
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
                message = "Điểm truy cập này chỉ dành cho người dùng đã xác thực",
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
                message = "Điểm truy cập này chỉ dành cho cosplayer đã xác thực",
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
                message = "Điểm truy cập này chỉ dành cho khách hàng đã xác thực",
                email = email,
                timestamp = DateTime.UtcNow
            });
        }

        
    }
}