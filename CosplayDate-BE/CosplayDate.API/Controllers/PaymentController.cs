using CosplayDate.Application.DTOs.Payment;
using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace CosplayDate.API.Controllers
{
    [ApiController]
    [Route("api/payment")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPayOSService _payOSService;
        private readonly IWalletService _walletService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            IPayOSService payOSService,
            IWalletService walletService,
            ILogger<PaymentController> logger)
        {
            _payOSService = payOSService;
            _walletService = walletService;
            _logger = logger;
        }

        /// <summary>
        /// Get available wallet top-up packages
        /// </summary>
        [HttpGet("packages")]
        public IActionResult GetTopUpPackages()
        {
            var packages = new[]
            {
                new { Package = "20K", PayAmount = 2000, ReceiveAmount = 20000, Bonus = "10x bonus!", Popular = false },
                new { Package = "50K", PayAmount = 5000, ReceiveAmount = 50000, Bonus = "10x bonus!", Popular = false },
                new { Package = "100K", PayAmount = 10000, ReceiveAmount = 100000, Bonus = "10x bonus!", Popular = true },
                new { Package = "200K", PayAmount = 20000, ReceiveAmount = 200000, Bonus = "10x bonus!", Popular = false },
                new { Package = "500K", PayAmount = 50000, ReceiveAmount = 500000, Bonus = "10x bonus!", Popular = false },
                new { Package = "1M", PayAmount = 100000, ReceiveAmount = 1000000, Bonus = "10x bonus!", Popular = false }
            };

            return Ok(new
            {
                isSuccess = true,
                message = "Top-up packages retrieved successfully",
                data = packages
            });
        }

        /// <summary>
        /// Create wallet top-up payment link
        /// </summary>
        [HttpPost("topup")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> CreateTopUpPayment([FromBody] WalletTopUpRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _walletService.CreateTopUpRequestAsync(currentUserId, request);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating top-up payment for package: {Package}", request.Package);
                return StatusCode(500, "An error occurred while creating payment");
            }
        }

        /// <summary>
        /// Get current wallet balance and recent transactions
        /// </summary>
        [HttpGet("wallet/balance")]
        public async Task<IActionResult> GetWalletBalance()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _walletService.GetWalletBalanceAsync(currentUserId);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wallet balance");
                return StatusCode(500, "An error occurred while retrieving wallet balance");
            }
        }

        /// <summary>
        /// Get wallet transaction history
        /// </summary>
        [HttpGet("wallet/transactions")]
        public async Task<IActionResult> GetTransactionHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _walletService.GetTransactionHistoryAsync(currentUserId, page, pageSize);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction history");
                return StatusCode(500, "An error occurred while retrieving transaction history");
            }
        }

        /// <summary>
        /// Get payment information by order code
        /// </summary>
        [HttpGet("info/{orderCode}")]
        public async Task<IActionResult> GetPaymentInfo(long orderCode)
        {
            try
            {
                var result = await _payOSService.GetPaymentInfoAsync(orderCode);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment info for order: {OrderCode}", orderCode);
                return StatusCode(500, "An error occurred while retrieving payment information");
            }
        }

        /// <summary>
        /// Cancel a payment link
        /// </summary>
        [HttpPost("cancel/{orderCode}")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> CancelPayment(long orderCode, [FromBody] CancelPaymentRequestDto? request = null)
        {
            try
            {
                var result = await _payOSService.CancelPaymentLinkAsync(orderCode, request?.Reason);

                if (result.IsSuccess)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling payment for order: {OrderCode}", orderCode);
                return StatusCode(500, "An error occurred while cancelling payment");
            }
        }

        /// <summary>
        /// PayOS webhook endpoint for payment notifications
        /// </summary>
        [HttpPost("webhook")]
        [AllowAnonymous]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> PaymentWebhook([FromBody] WebhookRequestDto webhookData)
        {
            // ===== ENHANCED: Better logging and validation =====
            _logger.LogInformation("🔔 Webhook received: Code={Code}, Desc={Desc}, Success={Success}, OrderCode={OrderCode}, Amount={Amount}",
                webhookData?.Code, webhookData?.Desc, webhookData?.Success, webhookData?.Data?.OrderCode, webhookData?.Data?.Amount);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("❌ Webhook validation failed: {ValidationErrors}",
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            if (webhookData?.Data == null)
            {
                _logger.LogWarning("❌ Webhook data is null");
                return BadRequest("Webhook data is required");
            }

            try
            {
                // ===== ENHANCED: Better signature verification with detailed logging =====
                var verificationResult = await _payOSService.VerifyWebhookAsync(webhookData);

                _logger.LogInformation("🔍 Webhook verification result: IsSuccess={IsSuccess}, IsValid={IsValid}",
                    verificationResult.IsSuccess, verificationResult.Data?.IsValid);

                if (!verificationResult.IsSuccess || verificationResult.Data?.IsValid != true)
                {
                    _logger.LogWarning("❌ Invalid webhook signature or verification failed: {Message}",
                        verificationResult.Message);

                    // Still return 200 to prevent PayOS from retrying invalid webhooks
                    return Ok(new { message = "Webhook verification failed", processed = false });
                }

                _logger.LogInformation("✅ Webhook verification successful, processing payment...");

                // ===== ENHANCED: Process the payment with better error handling =====
                var processResult = await _walletService.ProcessPaymentWebhookAsync(webhookData.Data);

                if (processResult.IsSuccess)
                {
                    _logger.LogInformation("🎉 Webhook processed successfully for OrderCode: {OrderCode}",
                        webhookData.Data.OrderCode);

                    return Ok(new
                    {
                        message = "Webhook processed successfully",
                        processed = true,
                        orderCode = webhookData.Data.OrderCode
                    });
                }
                else
                {
                    _logger.LogError("❌ Failed to process webhook for OrderCode: {OrderCode}, Error: {Error}",
                        webhookData.Data.OrderCode, processResult.Message);

                    // Return 200 but indicate processing failed
                    return Ok(new
                    {
                        message = "Webhook received but processing failed",
                        processed = false,
                        error = processResult.Message,
                        orderCode = webhookData.Data.OrderCode
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Exception processing payment webhook for OrderCode: {OrderCode}",
                    webhookData?.Data?.OrderCode);

                // ===== CRITICAL: Always return 200 to PayOS to prevent infinite retries =====
                return Ok(new
                {
                    message = "Webhook received but error occurred",
                    processed = false,
                    error = "Internal server error",
                    orderCode = webhookData?.Data?.OrderCode
                });
            }
        }

        /// <summary>
        /// Payment success callback (for user interface)
        /// </summary>
        [HttpGet("success")]
        [AllowAnonymous]
        public IActionResult PaymentSuccess([FromQuery] long? orderCode, [FromQuery] string? status)
        {
            try
            {
                _logger.LogInformation("Payment success callback: OrderCode={OrderCode}, Status={Status}", orderCode, status);

                // Return a simple HTML page or redirect to frontend
                var html = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <title>Payment Successful - CosplayDate</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f8ff; }}
                        .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                        .success {{ color: #28a745; font-size: 24px; margin-bottom: 20px; }}
                        .order-code {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                        .btn {{ background: #E91E63; color: white; padding: 12px 24px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <h1 class='success'>✅ Payment Successful!</h1>
                        <p>Your wallet has been topped up successfully.</p>
                        {(orderCode.HasValue ? $"<div class='order-code'><strong>Order Code:</strong> {orderCode}</div>" : "")}
                        <p>Your digital balance has been updated and you can now use it for bookings!</p>
                        <a href='http://localhost:5173/wallet' class='btn'>View Wallet</a>
                    </div>
                </body>
                </html>";

                return Content(html, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in payment success callback");
                return Content("Payment processed. Please check your wallet.", "text/plain");
            }
        }

        /// <summary>
        /// Payment cancel callback (for user interface)
        /// </summary>
        [HttpGet("cancel")]
        [AllowAnonymous]
        public IActionResult PaymentCancel([FromQuery] long? orderCode, [FromQuery] string? status)
        {
            try
            {
                _logger.LogInformation("Payment cancel callback: OrderCode={OrderCode}, Status={Status}", orderCode, status);

                var html = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <title>Payment Cancelled - CosplayDate</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fff5f5; }}
                        .container {{ max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                        .cancel {{ color: #dc3545; font-size: 24px; margin-bottom: 20px; }}
                        .order-code {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                        .btn {{ background: #E91E63; color: white; padding: 12px 24px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <h1 class='cancel'>❌ Payment Cancelled</h1>
                        <p>Your payment was cancelled. No charges were made to your account.</p>
                        {(orderCode.HasValue ? $"<div class='order-code'><strong>Order Code:</strong> {orderCode}</div>" : "")}
                        <p>You can try again or choose a different payment method.</p>
                        <a href='http://localhost:5173/wallet' class='btn'>Try Again</a>
                    </div>
                </body>
                </html>";

                return Content(html, "text/html");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in payment cancel callback");
                return Content("Payment was cancelled.", "text/plain");
            }
        }

        [HttpPost("verify")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> VerifyTransaction([FromBody] VerifyTransactionRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                _logger.LogInformation("🔍 Transaction verification requested: TransactionId={TransactionId}, UserId={UserId}",
                    request.TransactionId, currentUserId);

                // Get payment info from PayOS to verify
                if (long.TryParse(request.TransactionId, out long orderCode))
                {
                    var paymentInfoResult = await _payOSService.GetPaymentInfoAsync(orderCode);

                    if (paymentInfoResult.IsSuccess && paymentInfoResult.Data != null)
                    {
                        var paymentInfo = paymentInfoResult.Data;

                        _logger.LogInformation("💳 PayOS payment status: {Status}, AmountPaid: {AmountPaid}",
                            paymentInfo.Status, paymentInfo.AmountPaid);

                        // Check if payment is actually completed
                        if (paymentInfo.Status.ToUpper() == "PAID" || paymentInfo.Status.ToUpper() == "COMPLETED")
                        {
                            // Payment is verified as successful - trigger webhook processing if needed
                            await TriggerManualWebhookProcessing(orderCode, paymentInfo.AmountPaid);

                            var response = new VerifyTransactionResponseDto
                            {
                                IsVerified = true,
                                TransactionId = request.TransactionId,
                                OrderCode = paymentInfo.OrderCode,
                                Amount = paymentInfo.Amount,
                                Status = paymentInfo.Status,
                                VerifiedAt = DateTime.UtcNow,
                                Message = "Payment verified successfully"
                            };

                            return Ok(new
                            {
                                isSuccess = true,
                                message = "Transaction verified successfully",
                                data = response
                            });
                        }
                        else
                        {
                            // Payment not completed yet
                            return Ok(new
                            {
                                isSuccess = false,
                                message = $"Payment not completed. Current status: {paymentInfo.Status}",
                                data = new VerifyTransactionResponseDto
                                {
                                    IsVerified = false,
                                    TransactionId = request.TransactionId,
                                    Status = paymentInfo.Status,
                                    Message = "Payment verification failed - not completed"
                                }
                            });
                        }
                    }
                    else
                    {
                        return BadRequest(new
                        {
                            isSuccess = false,
                            message = "Payment information not found",
                            errors = new { }
                        });
                    }
                }
                else
                {
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Invalid transaction ID format",
                        errors = new { }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error verifying transaction: {TransactionId}", request.TransactionId);
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "An error occurred while verifying transaction",
                    errors = new { }
                });
            }
        }

        /// <summary>
        /// Manual balance refresh (alternative to verification)
        /// </summary>
        [HttpPost("refresh-balance")]
        [EnableRateLimiting("ApiPolicy")]
        public async Task<IActionResult> RefreshBalance()
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                _logger.LogInformation("💰 Balance refresh requested for user: {UserId}", currentUserId);

                // Get current wallet balance
                var balanceResult = await _walletService.GetWalletBalanceAsync(currentUserId);

                if (balanceResult.IsSuccess)
                {
                    return Ok(balanceResult);
                }

                return BadRequest(balanceResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error refreshing balance");
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "An error occurred while refreshing balance",
                    errors = new { }
                });
            }
        }

        private async Task TriggerManualWebhookProcessing(long orderCode, int amount)
        {
            try
            {
                _logger.LogInformation("🔄 Triggering manual webhook processing for OrderCode: {OrderCode}", orderCode);

                // Create manual webhook data
                var manualWebhookData = new WebhookDataDto
                {
                    OrderCode = orderCode,
                    Amount = amount,
                    Code = "00",
                    Desc = "success",
                    Reference = $"MANUAL_{orderCode}_{DateTime.UtcNow:yyyyMMddHHmmss}"
                };

                // Process as if it came from PayOS webhook
                var result = await _walletService.ProcessPaymentWebhookAsync(manualWebhookData);

                if (result.IsSuccess)
                {
                    _logger.LogInformation("✅ Manual webhook processing successful for OrderCode: {OrderCode}", orderCode);
                }
                else
                {
                    _logger.LogWarning("⚠️ Manual webhook processing failed for OrderCode: {OrderCode}, Error: {Error}",
                        orderCode, result.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in manual webhook processing for OrderCode: {OrderCode}", orderCode);
            }
        }

        /// <summary>
        /// Configure PayOS webhook URL manually
        /// </summary>
        [HttpPost("configure-webhook")]
        [AllowAnonymous] // No auth needed for webhook config
        public async Task<IActionResult> ConfigureWebhook()
        {
            try
            {
                _logger.LogInformation("🔧 Manual webhook configuration requested");

                var result = await _payOSService.ConfigureWebhookAsync();

                if (result.IsSuccess)
                {
                    var webhookUrl = $"{Request.Scheme}://{Request.Host}/api/payment/webhook";
                    _logger.LogInformation("✅ Webhook configured to: {WebhookUrl}", webhookUrl);

                    return Ok(new
                    {
                        isSuccess = true,
                        message = "Webhook configured successfully",
                        data = new
                        {
                            webhookUrl = webhookUrl,
                            timestamp = DateTime.UtcNow,
                            host = Request.Host.ToString()
                        }
                    });
                }

                _logger.LogError("❌ Webhook configuration failed: {Message}", result.Message);
                return BadRequest(new
                {
                    isSuccess = false,
                    message = result.Message,
                    data = new { }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error configuring webhook");
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Internal server error",
                    data = new { }
                });
            }
        }

        /// <summary>
        /// Test webhook endpoint - GET method
        /// </summary>
        [HttpGet("webhook")]
        [AllowAnonymous] // PayOS needs to access this without auth
        public IActionResult TestWebhookGet()
        {
            try
            {
                _logger.LogInformation("🎯 Webhook GET accessed from {IP} at {Timestamp}",
                    Request.HttpContext.Connection.RemoteIpAddress, DateTime.UtcNow);

                return Ok(new
                {
                    isSuccess = true,
                    message = "PayOS webhook endpoint is working",
                    data = new
                    {
                        method = "GET",
                        timestamp = DateTime.UtcNow,
                        host = Request.Host.ToString(),
                        path = Request.Path.ToString(),
                        userAgent = Request.Headers.UserAgent.ToString(),
                        remoteIp = Request.HttpContext.Connection.RemoteIpAddress?.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in webhook GET test");
                return StatusCode(500, new { message = "Webhook test failed" });
            }
        }

        /// <summary>
        /// Get webhook configuration status
        /// </summary>
        [HttpGet("webhook-status")]
        [AllowAnonymous]
        public IActionResult GetWebhookStatus()
        {
            try
            {
                var webhookUrl = $"{Request.Scheme}://{Request.Host}/api/payment/webhook";

                _logger.LogInformation("📊 Webhook status check requested");

                return Ok(new
                {
                    isSuccess = true,
                    message = "Webhook status retrieved",
                    data = new
                    {
                        webhookUrl = webhookUrl,
                        isReachable = true,
                        timestamp = DateTime.UtcNow,
                        environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                        host = Request.Host.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting webhook status");
                return StatusCode(500, new { message = "Failed to get webhook status" });
            }
        }
    }
}