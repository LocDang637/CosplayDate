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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Verify webhook signature
                var verificationResult = await _payOSService.VerifyWebhookAsync(webhookData);

                if (!verificationResult.IsSuccess || verificationResult.Data?.IsValid != true)
                {
                    _logger.LogWarning("Invalid webhook signature received");
                    return BadRequest("Invalid webhook signature");
                }

                // Process the payment
                var processResult = await _walletService.ProcessPaymentWebhookAsync(webhookData.Data);

                if (processResult.IsSuccess)
                {
                    return Ok(new { message = "Webhook processed successfully" });
                }

                return StatusCode(500, "Failed to process webhook");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment webhook");
                return StatusCode(500, "An error occurred while processing webhook");
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

                _logger.LogInformation("Transaction verification requested: TransactionId={TransactionId}, UserId={UserId}",
                    request.TransactionId, currentUserId);

                // Get payment info from PayOS to verify
                if (long.TryParse(request.TransactionId, out long orderCode))
                {
                    var paymentInfoResult = await _payOSService.GetPaymentInfoAsync(orderCode);

                    if (paymentInfoResult.IsSuccess && paymentInfoResult.Data != null)
                    {
                        var paymentInfo = paymentInfoResult.Data;

                        // Check if payment is actually completed
                        if (paymentInfo.Status.ToUpper() == "PAID" || paymentInfo.Status.ToUpper() == "COMPLETED")
                        {
                            // Payment is verified as successful
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
                _logger.LogError(ex, "Error verifying transaction: {TransactionId}", request.TransactionId);
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

                _logger.LogInformation("Balance refresh requested for user: {UserId}", currentUserId);

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
                _logger.LogError(ex, "Error refreshing balance");
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "An error occurred while refreshing balance",
                    errors = new { }
                });
            }
        }
    }
}
