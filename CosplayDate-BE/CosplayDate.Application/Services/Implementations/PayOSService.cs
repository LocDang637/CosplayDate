// CosplayDate.Infrastructure/Services/PayOSService.cs (FIXED VERSION)
using CosplayDate.Application.DTOs.Payment;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Net.payOS;
using Net.payOS.Types;
using System.Text.Json;

namespace CosplayDate.Infrastructure.Services
{
    public class PayOSService : IPayOSService
    {
        private readonly PayOS _payOS;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PayOSService> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public PayOSService(
    IConfiguration configuration,
    ILogger<PayOSService> logger,
    IUnitOfWork unitOfWork)
        {
            _configuration = configuration;
            _logger = logger;
            _unitOfWork = unitOfWork;

            var clientId = _configuration["PayOS:ClientId"] ?? throw new ArgumentNullException("PayOS:ClientId");
            var apiKey = _configuration["PayOS:ApiKey"] ?? throw new ArgumentNullException("PayOS:ApiKey");
            var checksumKey = _configuration["PayOS:ChecksumKey"] ?? throw new ArgumentNullException("PayOS:ChecksumKey");

            _payOS = new PayOS(clientId, apiKey, checksumKey);

            _logger.LogInformation("✅ PayOS service initialized successfully. Webhook configured via dashboard.");

            // REMOVED: All automatic webhook configuration code
            // Webhook is now configured via PayOS dashboard: https://cosplaydate-production-aa2c.up.railway.app/api/payment/webhook
        }

        private static string TruncateForPayOS(string? input, int maxLength)
        {
            if (string.IsNullOrEmpty(input))
                return "";

            return input.Length <= maxLength ? input : input.Substring(0, maxLength);
        }

        private static string SanitizeForPayOS(string? input, int maxLength)
        {
            if (string.IsNullOrEmpty(input))
                return "";

            // Remove Vietnamese characters for PayOS compatibility
            var sanitized = input
                .Replace("ạ", "a").Replace("á", "a").Replace("à", "a").Replace("ả", "a").Replace("ã", "a")
                .Replace("ă", "a").Replace("ắ", "a").Replace("ằ", "a").Replace("ẳ", "a").Replace("ẵ", "a")
                .Replace("â", "a").Replace("ấ", "a").Replace("ầ", "a").Replace("ẩ", "a").Replace("ẫ", "a")
                .Replace("ê", "e").Replace("é", "e").Replace("è", "e").Replace("ẻ", "e").Replace("ẽ", "e")
                .Replace("ế", "e").Replace("ề", "e").Replace("ể", "e").Replace("ễ", "e")
                .Replace("ô", "o").Replace("ó", "o").Replace("ò", "o").Replace("ỏ", "o").Replace("õ", "o")
                .Replace("ơ", "o").Replace("ớ", "o").Replace("ờ", "o").Replace("ở", "o").Replace("ỡ", "o")
                .Replace("ư", "u").Replace("ú", "u").Replace("ù", "u").Replace("ủ", "u").Replace("ũ", "u")
                .Replace("ứ", "u").Replace("ừ", "u").Replace("ử", "u").Replace("ữ", "u")
                .Replace("ý", "y").Replace("ỳ", "y").Replace("ỷ", "y").Replace("ỹ", "y")
                .Replace("đ", "d").Replace("Đ", "D")
                .Replace("Ạ", "A").Replace("Á", "A").Replace("À", "A").Replace("Ả", "A").Replace("Ã", "A")
                .Replace("Ă", "A").Replace("Ắ", "A").Replace("Ằ", "A").Replace("Ẳ", "A").Replace("Ẵ", "A")
                .Replace("Â", "A").Replace("Ấ", "A").Replace("Ầ", "A").Replace("Ẩ", "A").Replace("Ẫ", "A")
                .Replace("Ê", "E").Replace("É", "E").Replace("È", "E").Replace("Ẻ", "E").Replace("Ẽ", "E")
                .Replace("Ế", "E").Replace("Ề", "E").Replace("Ể", "E").Replace("Ễ", "E")
                .Replace("Ô", "O").Replace("Ó", "O").Replace("Ò", "O").Replace("Ỏ", "O").Replace("Õ", "O")
                .Replace("Ơ", "O").Replace("Ớ", "O").Replace("Ờ", "O").Replace("Ở", "O").Replace("Ỡ", "O")
                .Replace("Ư", "U").Replace("Ú", "U").Replace("Ù", "U").Replace("Ủ", "U").Replace("Ũ", "U")
                .Replace("Ứ", "U").Replace("Ừ", "U").Replace("Ử", "U").Replace("Ữ", "U")
                .Replace("Ý", "Y").Replace("Ỳ", "Y").Replace("Ỷ", "Y").Replace("Ỹ", "Y");

            return sanitized.Length <= maxLength ? sanitized : sanitized.Substring(0, maxLength);
        }

        // ===== FIXED: Add webhook URL configuration =====
        public async Task<ApiResponse<CreatePaymentResponseDto>> CreatePaymentLinkAsync(CreatePaymentRequestDto request)
        {
            try
            {
                // Generate unique order code
                var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

                // ✅ FIX: Set proper expiration with validation
                var expiredAtTime = DateTimeOffset.UtcNow.AddHours(1); // 1 hour from now
                var expiredAtUnix = expiredAtTime.ToUnixTimeSeconds();

                // Validate expiration time
                if (expiredAtTime <= DateTimeOffset.UtcNow)
                {
                    _logger.LogError("❌ Invalid expiration time");
                    return ApiResponse<CreatePaymentResponseDto>.Error("Invalid expiration time");
                }

                _logger.LogInformation("🕐 Creating payment with expiration: {ExpiredAt} (Unix: {ExpiredAtUnix})",
                    expiredAtTime, expiredAtUnix);

                // Sanitize and truncate descriptions for PayOS limits
                var itemDescription = SanitizeForPayOS("Nap tien CosplayDate", 25); // Max 25 chars
                var paymentDescription = SanitizeForPayOS(request.Description ?? "Nap tien CosplayDate", 25); // Max 25 chars

                // Create payment items
                var items = new List<ItemData>
                {
                    new ItemData(itemDescription, 1, request.Amount)
                };

                // ===== FIXED: Configure URLs properly =====
                var frontendBaseUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5173";
                var backendBaseUrl = _configuration["App:BackendUrl"] ?? "http://localhost:5068";

                // ===== CRITICAL FIX: Configure webhook URL for PayOS =====
                try
                {
                    var webhookUrl = $"{backendBaseUrl}/api/payment/webhook";

                    _logger.LogInformation("🔧 Configuring PayOS webhook URL: {WebhookUrl}", webhookUrl);

                    // Set webhook URL for this PayOS instance
                    await _payOS.confirmWebhook(webhookUrl);

                    _logger.LogInformation("✅ PayOS webhook configured successfully");
                }
                catch (Exception webhookError)
                {
                    _logger.LogWarning("⚠️ Failed to configure webhook (continuing anyway): {Error}", webhookError.Message);
                    _logger.LogWarning("Current URL: " + backendBaseUrl);
                    // Don't fail the payment creation if webhook config fails
                }

                // Create payment data with all required URLs
                var paymentData = new PaymentData(
                    orderCode: orderCode,
                    amount: request.Amount,
                    description: paymentDescription,
                    items: items,
                    // Frontend URLs for user redirects
                    cancelUrl: $"{frontendBaseUrl}/payment/cancel?orderCode={orderCode}",
                    returnUrl: $"{frontendBaseUrl}/payment/success?orderCode={orderCode}",
                    buyerName: TruncateForPayOS(request.BuyerName, 50),
                    buyerEmail: TruncateForPayOS(request.BuyerEmail, 50),
                    buyerPhone: TruncateForPayOS(request.BuyerPhone, 15),
                    expiredAt: expiredAtUnix
                );

                var result = await _payOS.createPaymentLink(paymentData);

                var response = new CreatePaymentResponseDto
                {
                    PaymentLinkId = result.paymentLinkId,
                    OrderCode = result.orderCode,
                    CheckoutUrl = result.checkoutUrl,
                    QrCode = result.qrCode,
                    Amount = result.amount,
                    Description = result.description,
                    Status = result.status,
                    CreatedAt = DateTime.UtcNow,
                    ExpiredAt = result.expiredAt
                };

                _logger.LogInformation("💳 Payment link created successfully: OrderCode={OrderCode}, PaymentLinkId={PaymentLinkId}, WebhookConfigured=True",
                    orderCode, result.paymentLinkId);

                return ApiResponse<CreatePaymentResponseDto>.Success(response, "Payment link created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creating payment link for amount: {Amount}", request.Amount);
                return ApiResponse<CreatePaymentResponseDto>.Error($"Failed to create payment link: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PaymentInfoResponseDto>> GetPaymentInfoAsync(long orderCode)
        {
            try
            {
                var paymentInfo = await _payOS.getPaymentLinkInformation(orderCode);

                var response = new PaymentInfoResponseDto
                {
                    Id = paymentInfo.id,
                    OrderCode = paymentInfo.orderCode,
                    Amount = paymentInfo.amount,
                    AmountPaid = paymentInfo.amountPaid,
                    AmountRemaining = paymentInfo.amountRemaining,
                    Status = paymentInfo.status,
                    CreatedAt = paymentInfo.createdAt,
                    CancelledAt = paymentInfo.canceledAt,
                    CancellationReason = paymentInfo.cancellationReason,
                    Transactions = paymentInfo.transactions.Select(t => new TransactionDto
                    {
                        Reference = t.reference,
                        Amount = t.amount,
                        AccountNumber = t.accountNumber,
                        Description = t.description,
                        TransactionDateTime = t.transactionDateTime,
                        VirtualAccountName = t.virtualAccountName,
                        VirtualAccountNumber = t.virtualAccountNumber,
                        CounterAccountBankId = t.counterAccountBankId,
                        CounterAccountBankName = t.counterAccountBankName,
                        CounterAccountName = t.counterAccountName,
                        CounterAccountNumber = t.counterAccountNumber
                    }).ToList()
                };

                return ApiResponse<PaymentInfoResponseDto>.Success(response, "Payment information retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting payment info for order code: {OrderCode}", orderCode);
                return ApiResponse<PaymentInfoResponseDto>.Error("Failed to get payment information");
            }
        }

        public async Task<ApiResponse<string>> CancelPaymentLinkAsync(long orderCode, string? reason = null)
        {
            try
            {
                await _payOS.cancelPaymentLink(orderCode, reason);

                _logger.LogInformation("Payment link cancelled: OrderCode={OrderCode}, Reason={Reason}",
                    orderCode, reason ?? "No reason provided");

                return ApiResponse<string>.Success("", "Payment link cancelled successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling payment link for order code: {OrderCode}", orderCode);
                return ApiResponse<string>.Error("Failed to cancel payment link");
            }
        }

        // ===== ENHANCED: Better webhook verification =====
        public async Task<ApiResponse<WebhookResponseDto>> VerifyWebhookAsync(WebhookRequestDto webhookData)
        {
            try
            {
                _logger.LogInformation("🔍 Verifying webhook: Code={Code}, Desc={Desc}, Success={Success}, OrderCode={OrderCode}",
                    webhookData.Code, webhookData.Desc, webhookData.Success, webhookData.Data?.OrderCode);

                // Enhanced webhook verification
                if (string.IsNullOrEmpty(webhookData.Signature))
                {
                    _logger.LogWarning("❌ Webhook missing signature");
                    return ApiResponse<WebhookResponseDto>.Success(new WebhookResponseDto
                    {
                        IsValid = false,
                        Message = "Missing webhook signature"
                    }, "Invalid webhook - missing signature");
                }

                // Verify webhook data structure
                if (webhookData.Data == null || webhookData.Data.OrderCode <= 0)
                {
                    _logger.LogWarning("❌ Webhook missing or invalid data");
                    return ApiResponse<WebhookResponseDto>.Success(new WebhookResponseDto
                    {
                        IsValid = false,
                        Message = "Invalid webhook data"
                    }, "Invalid webhook data");
                }

                // Check if it's a successful payment webhook
                var isValidWebhook = webhookData.Code == "00" &&
                                   webhookData.Desc.ToLower() == "success" &&
                                   webhookData.Success;

                var response = new WebhookResponseDto
                {
                    IsValid = isValidWebhook,
                    Message = isValidWebhook ? "Webhook verified successfully" : "Webhook verification failed",
                    Data = webhookData.Data
                };

                _logger.LogInformation("🔍 Webhook verification result: Valid={IsValid}, OrderCode={OrderCode}, Amount={Amount}",
                    isValidWebhook, webhookData.Data.OrderCode, webhookData.Data.Amount);

                return ApiResponse<WebhookResponseDto>.Success(response, response.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error verifying webhook data");

                var response = new WebhookResponseDto
                {
                    IsValid = false,
                    Message = "Webhook verification failed due to error"
                };

                return ApiResponse<WebhookResponseDto>.Success(response, "Webhook verification failed");
            }
        }

        public async Task<ApiResponse<string>> ConfirmWebhookAsync(string webhookUrl)
        {
            try
            {
                await _payOS.confirmWebhook(webhookUrl);

                _logger.LogInformation("🎯 Webhook confirmed successfully: {WebhookUrl}", webhookUrl);

                return ApiResponse<string>.Success("", "Webhook confirmed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error confirming webhook URL: {WebhookUrl}", webhookUrl);
                return ApiResponse<string>.Error("Failed to confirm webhook URL");
            }
        }

        // Also add this method to manually configure webhook via API endpoint
        public async Task<ApiResponse<string>> ConfigureWebhookAsync()
        {
            try
            {
                // Try multiple configuration key formats for Railway compatibility
                var backendBaseUrl = _configuration["App:BackendUrl"]
                                  ?? _configuration["App__BackendUrl"]
                                  ?? _configuration["BACKEND_URL"]
                                  ?? Environment.GetEnvironmentVariable("BACKEND_URL")
                                  ?? "https://cosplaydate-production-aa2c.up.railway.app";

                var webhookUrl = $"{backendBaseUrl}/api/payment/webhook";

                _logger.LogInformation("🔧 Manual webhook configuration requested");
                _logger.LogInformation("🔧 Backend base URL resolved to: {BackendBaseUrl}", backendBaseUrl);
                _logger.LogInformation("🔧 Webhook URL: {WebhookUrl}", webhookUrl);

                await _payOS.confirmWebhook(webhookUrl);

                _logger.LogInformation("✅ Webhook configured manually to: {WebhookUrl}", webhookUrl);

                return ApiResponse<string>.Success("", $"Webhook configured to: {webhookUrl}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Manual webhook configuration failed");
                return ApiResponse<string>.Error($"Failed to configure webhook: {ex.Message}");
            }
        }
    }
}