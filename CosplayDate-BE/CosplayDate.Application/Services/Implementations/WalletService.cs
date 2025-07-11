// CosplayDate.Application/Services/Implementations/WalletService.cs (ENHANCED)
using CosplayDate.Application.DTOs.Payment;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Implementations
{
    public class WalletService : IWalletService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPayOSService _payOSService;
        private readonly ILogger<WalletService> _logger;

        // Digital wallet packages: payment amount -> digital amount
        private readonly Dictionary<string, (int PaymentAmount, int DigitalAmount)> _packages = new()
        {
            { "20K", (2000, 20000) },       // Pay 2K, get 20K digital
            { "50K", (5000, 50000) },       // Pay 5K, get 50K digital  
            { "100K", (10000, 100000) },    // Pay 10K, get 100K digital
            { "200K", (20000, 200000) },    // Pay 20K, get 200K digital
            { "500K", (50000, 500000) },    // Pay 50K, get 500K digital
            { "1M", (100000, 1000000) }     // Pay 100K, get 1M digital
        };

        public WalletService(
            IUnitOfWork unitOfWork,
            IPayOSService payOSService,
            ILogger<WalletService> logger)
        {
            _unitOfWork = unitOfWork;
            _payOSService = payOSService;
            _logger = logger;
        }

        public async Task<ApiResponse<WalletTopUpResponseDto>> CreateTopUpRequestAsync(int userId, WalletTopUpRequestDto request)
        {
            try
            {
                // Validate user
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<WalletTopUpResponseDto>.Error("User not found");
                }

                // Validate package
                if (!_packages.ContainsKey(request.Package))
                {
                    return ApiResponse<WalletTopUpResponseDto>.Error($"Invalid package. Available packages: {string.Join(", ", _packages.Keys)}");
                }

                var package = _packages[request.Package];

                // Create payment request
                var paymentRequest = new CreatePaymentRequestDto
                {
                    Amount = package.PaymentAmount,
                    Description = $"Nạp {request.Package} vào ví CosplayDate - {user.FirstName} {user.LastName}",
                    BuyerName = $"{user.FirstName} {user.LastName}",
                    BuyerEmail = user.Email,
                    BuyerPhone = null // You might want to add phone to user profile
                };

                var paymentResult = await _payOSService.CreatePaymentLinkAsync(paymentRequest);

                if (!paymentResult.IsSuccess || paymentResult.Data == null)
                {
                    return ApiResponse<WalletTopUpResponseDto>.Error("Failed to create payment link");
                }

                // Create a pending wallet transaction to track this payment
                var transactionCode = GenerateTransactionCode();
                var walletTransaction = new WalletTransaction
                {
                    UserId = userId,
                    TransactionCode = transactionCode,
                    Type = "TOPUP_PENDING",
                    Amount = package.DigitalAmount,
                    Description = $"Pending top-up {request.Package} (Order: {paymentResult.Data.OrderCode})",
                    ReferenceId = paymentResult.Data.OrderCode.ToString(),
                    Status = "Pending",
                    BalanceAfter = user.WalletBalance ?? 0, // Will be updated when payment completes
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.WalletTransactions.AddAsync(walletTransaction);
                await _unitOfWork.SaveChangesAsync();

                var response = new WalletTopUpResponseDto
                {
                    PaymentLinkId = paymentResult.Data.PaymentLinkId,
                    OrderCode = paymentResult.Data.OrderCode,
                    CheckoutUrl = paymentResult.Data.CheckoutUrl,
                    QrCode = paymentResult.Data.QrCode,
                    PaymentAmount = package.PaymentAmount,
                    DigitalAmount = package.DigitalAmount,
                    Package = request.Package,
                    Message = $"Pay {package.PaymentAmount:N0} VND to receive {package.DigitalAmount:N0} digital balance",
                    CreatedAt = paymentResult.Data.CreatedAt
                };

                _logger.LogInformation("💰 Top-up request created for user {UserId}: Package={Package}, OrderCode={OrderCode}",
                    userId, request.Package, paymentResult.Data.OrderCode);

                return ApiResponse<WalletTopUpResponseDto>.Success(response, "Top-up request created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creating top-up request for user {UserId}", userId);
                return ApiResponse<WalletTopUpResponseDto>.Error("An error occurred while creating top-up request");
            }
        }

        public async Task<ApiResponse<WalletBalanceResponseDto>> GetWalletBalanceAsync(int userId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<WalletBalanceResponseDto>.Error("User not found");
                }

                // Get recent transactions
                var recentTransactions = await _unitOfWork.WalletTransactions
                    .FindAsync(wt => wt.UserId == userId);

                var recentTransactionDtos = recentTransactions
                    .OrderByDescending(wt => wt.CreatedAt)
                    .Take(10)
                    .Select(wt => new RecentTransactionDto
                    {
                        TransactionCode = wt.TransactionCode,
                        Type = wt.Type,
                        Amount = wt.Amount,
                        Description = wt.Description,
                        Status = wt.Status,
                        CreatedAt = wt.CreatedAt ?? DateTime.UtcNow
                    })
                    .ToList();

                var response = new WalletBalanceResponseDto
                {
                    Balance = user.WalletBalance ?? 0,
                    Currency = "VND",
                    LoyaltyPoints = user.LoyaltyPoints ?? 0,
                    MembershipTier = user.MembershipTier ?? "Bronze",
                    RecentTransactions = recentTransactionDtos
                };

                return ApiResponse<WalletBalanceResponseDto>.Success(response, "Wallet balance retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting wallet balance for user {UserId}", userId);
                return ApiResponse<WalletBalanceResponseDto>.Error("An error occurred while retrieving wallet balance");
            }
        }

        public async Task<ApiResponse<string>> AddToWalletAsync(int userId, decimal amount, string type, string description, string? referenceId = null)
        {
            // This is just a wrapper around ProcessWalletTransactionAsync for cleaner API
            return await ProcessWalletTransactionAsync(userId, amount, type, description, referenceId);
        }

        // ===== ENHANCED: Better webhook processing with more logging =====
        //public async Task<ApiResponse<string>> ProcessPaymentWebhookAsync(WebhookDataDto webhookData)
        //{
        //    try
        //    {
        //        _logger.LogInformation("🔄 Processing webhook for OrderCode: {OrderCode}, Amount: {Amount}, Code: {Code}, Desc: {Desc}",
        //            webhookData.OrderCode, webhookData.Amount, webhookData.Code, webhookData.Desc);

        //        // Find the pending transaction
        //        var pendingTransaction = await _unitOfWork.WalletTransactions
        //            .FirstOrDefaultAsync(wt => wt.ReferenceId == webhookData.OrderCode.ToString() && wt.Status == "Pending");

        //        if (pendingTransaction == null)
        //        {
        //            _logger.LogWarning("⚠️ No pending transaction found for OrderCode: {OrderCode}", webhookData.OrderCode);

        //            // ===== ENHANCED: Check if this transaction was already processed =====
        //            var completedTransaction = await _unitOfWork.WalletTransactions
        //                .FirstOrDefaultAsync(wt => wt.ReferenceId == webhookData.OrderCode.ToString() && wt.Status == "Completed");

        //            if (completedTransaction != null)
        //            {
        //                _logger.LogInformation("✅ Transaction already processed: {OrderCode}", webhookData.OrderCode);
        //                return ApiResponse<string>.Success("", "Transaction already processed");
        //            }

        //            // ===== ENHANCED: Try to find by transaction reference if available =====
        //            if (!string.IsNullOrEmpty(webhookData.Reference))
        //            {
        //                pendingTransaction = await _unitOfWork.WalletTransactions
        //                    .FirstOrDefaultAsync(wt => wt.ReferenceId == webhookData.Reference && wt.Status == "Pending");

        //                if (pendingTransaction != null)
        //                {
        //                    _logger.LogInformation("🔍 Found pending transaction by reference: {Reference}", webhookData.Reference);
        //                }
        //            }

        //            if (pendingTransaction == null)
        //            {
        //                _logger.LogError("❌ Could not find any pending transaction for OrderCode: {OrderCode}, Reference: {Reference}",
        //                    webhookData.OrderCode, webhookData.Reference);
        //                return ApiResponse<string>.Error("No pending transaction found");
        //            }
        //        }

        //        var user = await _unitOfWork.Users.GetByIdAsync(pendingTransaction.UserId);
        //        if (user == null)
        //        {
        //            _logger.LogError("❌ User not found for transaction: {TransactionCode}", pendingTransaction.TransactionCode);
        //            return ApiResponse<string>.Error("User not found");
        //        }

        //        // Check if payment was successful
        //        if (webhookData.Code == "00" && webhookData.Desc.ToLower() == "success")
        //        {
        //            _logger.LogInformation("✅ Payment successful, updating user balance for UserId: {UserId}, Amount: {Amount}",
        //                user.Id, pendingTransaction.Amount);

        //            // Update user wallet balance
        //            var oldBalance = user.WalletBalance ?? 0;
        //            var newBalance = oldBalance + pendingTransaction.Amount;
        //            user.WalletBalance = newBalance;
        //            user.UpdatedAt = DateTime.UtcNow;

        //            // Update pending transaction to completed
        //            pendingTransaction.Status = "Completed";
        //            pendingTransaction.Type = "TOPUP";
        //            pendingTransaction.Description = pendingTransaction.Description.Replace("Pending ", "");
        //            pendingTransaction.BalanceAfter = newBalance;

        //            // Add loyalty points (1 point per 1000 VND spent)
        //            var pointsToAdd = (int)(webhookData.Amount / 1000);
        //            var oldPoints = user.LoyaltyPoints ?? 0;
        //            user.LoyaltyPoints = oldPoints + pointsToAdd;

        //            // Update membership tier if needed
        //            user.MembershipTier = CalculateMembershipTier(user.LoyaltyPoints ?? 0);

        //            // Create a successful transaction record
        //            var completedTransaction = new WalletTransaction
        //            {
        //                UserId = pendingTransaction.UserId,
        //                TransactionCode = GenerateTransactionCode(),
        //                Type = "TOPUP",
        //                Amount = pendingTransaction.Amount,
        //                Description = $"Top-up completed via PayOS (Ref: {webhookData.Reference})",
        //                ReferenceId = webhookData.Reference,
        //                Status = "Completed",
        //                BalanceAfter = newBalance,
        //                CreatedAt = DateTime.UtcNow
        //            };

        //            _unitOfWork.Users.Update(user);
        //            _unitOfWork.WalletTransactions.Update(pendingTransaction);
        //            await _unitOfWork.WalletTransactions.AddAsync(completedTransaction);
        //            await _unitOfWork.SaveChangesAsync();

        //            _logger.LogInformation("🎉 Payment webhook processed successfully: User={UserId}, Amount={Amount}, OldBalance={OldBalance}, NewBalance={NewBalance}, PointsAdded={PointsAdded}",
        //                user.Id, pendingTransaction.Amount, oldBalance, newBalance, pointsToAdd);

        //            return ApiResponse<string>.Success("", "Payment processed successfully");
        //        }
        //        else
        //        {
        //            _logger.LogWarning("❌ Payment failed for OrderCode: {OrderCode}, Code: {Code}, Desc: {Desc}",
        //                webhookData.OrderCode, webhookData.Code, webhookData.Desc);

        //            // Payment failed - update transaction status
        //            pendingTransaction.Status = "Failed";
        //            pendingTransaction.Description += $" - Failed: {webhookData.Desc}";

        //            _unitOfWork.WalletTransactions.Update(pendingTransaction);
        //            await _unitOfWork.SaveChangesAsync();

        //            return ApiResponse<string>.Success("", "Payment failed");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "❌ Error processing payment webhook for OrderCode: {OrderCode}", webhookData.OrderCode);
        //        return ApiResponse<string>.Error("An error occurred while processing payment webhook");
        //    }
        //}
        public async Task<ApiResponse<string>> ProcessPaymentWebhookAsync(WebhookDataDto webhookData)
        {
            try
            {
                _logger.LogInformation("🔄 Processing webhook for OrderCode: {OrderCode}, Amount: {Amount}, Code: {Code}, Desc: {Desc}",
                    webhookData.OrderCode, webhookData.Amount, webhookData.Code, webhookData.Desc);

                // ===== CRITICAL: Detect and handle test webhooks first =====
                var isTestWebhook = IsTestWebhook(webhookData);
                if (isTestWebhook)
                {
                    _logger.LogInformation("🧪 Test webhook detected for OrderCode: {OrderCode}, Reference: {Reference} - Processing successfully",
                        webhookData.OrderCode, webhookData.Reference);

                    return ApiResponse<string>.Success("", "Test webhook processed successfully");
                }

                // Find the pending transaction
                var pendingTransaction = await _unitOfWork.WalletTransactions
                    .FirstOrDefaultAsync(wt => wt.ReferenceId == webhookData.OrderCode.ToString() && wt.Status == "Pending");

                if (pendingTransaction == null)
                {
                    _logger.LogWarning("⚠️ No pending transaction found for OrderCode: {OrderCode}", webhookData.OrderCode);

                    // Check if this transaction was already processed
                    var completedTransaction = await _unitOfWork.WalletTransactions
                        .FirstOrDefaultAsync(wt => wt.ReferenceId == webhookData.OrderCode.ToString() && wt.Status == "Completed");

                    if (completedTransaction != null)
                    {
                        _logger.LogInformation("✅ Transaction already processed: {OrderCode}", webhookData.OrderCode);
                        return ApiResponse<string>.Success("", "Transaction already processed");
                    }

                    // Try to find by transaction reference if available
                    if (!string.IsNullOrEmpty(webhookData.Reference))
                    {
                        pendingTransaction = await _unitOfWork.WalletTransactions
                            .FirstOrDefaultAsync(wt => wt.ReferenceId == webhookData.Reference && wt.Status == "Pending");

                        if (pendingTransaction != null)
                        {
                            _logger.LogInformation("🔍 Found pending transaction by reference: {Reference}", webhookData.Reference);
                        }
                    }

                    if (pendingTransaction == null)
                    {
                        // Handle orphaned successful payments
                        if (webhookData.Code == "00" && webhookData.Desc.ToLower() == "success" && webhookData.Amount > 0)
                        {
                            _logger.LogInformation("💡 Creating manual transaction for valid payment without pending record");
                            return await HandleOrphanedSuccessfulPayment(webhookData);
                        }

                        _logger.LogError("❌ Could not find any pending transaction for OrderCode: {OrderCode}, Reference: {Reference}",
                            webhookData.OrderCode, webhookData.Reference);
                        return ApiResponse<string>.Success("", "No pending transaction found - webhook acknowledged");
                    }
                }

                var user = await _unitOfWork.Users.GetByIdAsync(pendingTransaction.UserId);
                if (user == null)
                {
                    _logger.LogError("❌ User not found for transaction: {TransactionCode}", pendingTransaction.TransactionCode);
                    return ApiResponse<string>.Success("", "User not found - webhook acknowledged");
                }

                // Check if payment was successful
                if (webhookData.Code == "00" && webhookData.Desc.ToLower() == "success")
                {
                    _logger.LogInformation("✅ Payment successful, updating user balance for UserId: {UserId}, Amount: {Amount}",
                        user.Id, pendingTransaction.Amount);

                    // Update user wallet balance
                    var oldBalance = user.WalletBalance ?? 0;
                    var newBalance = oldBalance + pendingTransaction.Amount;
                    user.WalletBalance = newBalance;
                    user.UpdatedAt = DateTime.UtcNow;

                    // Update pending transaction to completed
                    pendingTransaction.Status = "Completed";
                    pendingTransaction.Type = "TOPUP";
                    pendingTransaction.Description = pendingTransaction.Description.Replace("Pending ", "");
                    pendingTransaction.BalanceAfter = newBalance;

                    // Add loyalty points (1 point per 1000 VND spent)
                    var pointsToAdd = (int)(webhookData.Amount / 1000);
                    var oldPoints = user.LoyaltyPoints ?? 0;
                    user.LoyaltyPoints = oldPoints + pointsToAdd;

                    // Update membership tier if needed
                    user.MembershipTier = CalculateMembershipTier(user.LoyaltyPoints ?? 0);

                    // Create a successful transaction record
                    var completedTransaction = new WalletTransaction
                    {
                        UserId = pendingTransaction.UserId,
                        TransactionCode = GenerateTransactionCode(),
                        Type = "TOPUP",
                        Amount = pendingTransaction.Amount,
                        Description = $"Top-up completed via PayOS (Ref: {webhookData.Reference})",
                        ReferenceId = webhookData.Reference,
                        Status = "Completed",
                        BalanceAfter = newBalance,
                        CreatedAt = DateTime.UtcNow
                    };

                    _unitOfWork.Users.Update(user);
                    _unitOfWork.WalletTransactions.Update(pendingTransaction);
                    await _unitOfWork.WalletTransactions.AddAsync(completedTransaction);
                    await _unitOfWork.SaveChangesAsync();

                    _logger.LogInformation("🎉 Payment webhook processed successfully: User={UserId}, Amount={Amount}, OldBalance={OldBalance}, NewBalance={NewBalance}, PointsAdded={PointsAdded}",
                        user.Id, pendingTransaction.Amount, oldBalance, newBalance, pointsToAdd);

                    return ApiResponse<string>.Success("", "Payment processed successfully");
                }
                else
                {
                    _logger.LogWarning("❌ Payment failed for OrderCode: {OrderCode}, Code: {Code}, Desc: {Desc}",
                        webhookData.OrderCode, webhookData.Code, webhookData.Desc);

                    // Payment failed - update transaction status
                    pendingTransaction.Status = "Failed";
                    pendingTransaction.Description += $" - Failed: {webhookData.Desc}";

                    _unitOfWork.WalletTransactions.Update(pendingTransaction);
                    await _unitOfWork.SaveChangesAsync();

                    return ApiResponse<string>.Success("", "Payment failed - webhook acknowledged");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error processing payment webhook for OrderCode: {OrderCode}", webhookData.OrderCode);
                // Always return success to prevent PayOS retries
                return ApiResponse<string>.Success("", "Webhook error handled");
            }
        }

        // Add these helper methods at the bottom of WalletService class
        private bool IsTestWebhook(WebhookDataDto webhookData)
        {
            // Comprehensive test detection patterns
            var testIndicators = new[]
            {
        "123", "TF230204212323", "test", "demo", "sample", "example"
    };

            var orderCodeStr = webhookData.OrderCode.ToString();
            var reference = webhookData.Reference ?? "";

            // Check order code patterns
            var isTestOrderCode = testIndicators.Any(pattern =>
                orderCodeStr.Equals(pattern, StringComparison.OrdinalIgnoreCase) ||
                orderCodeStr.Contains(pattern, StringComparison.OrdinalIgnoreCase));

            // Check reference patterns  
            var isTestReference = testIndicators.Any(pattern =>
                reference.Contains(pattern, StringComparison.OrdinalIgnoreCase));

            // Check for very low order codes (likely tests)
            var isLowOrderCode = webhookData.OrderCode < 1000;

            // Check for specific test amounts
            var isTestAmount = webhookData.Amount <= 1000;

            var isTest = isTestOrderCode || isTestReference || isLowOrderCode || isTestAmount;

            if (isTest)
            {
                _logger.LogInformation("🧪 Test webhook indicators: OrderCode={OrderCode}, Reference={Reference}, Amount={Amount}, IsLowCode={IsLowCode}, IsTestAmount={IsTestAmount}",
                    orderCodeStr, reference, webhookData.Amount, isLowOrderCode, isTestAmount);
            }

            return isTest;
        }

        private async Task<ApiResponse<string>> HandleOrphanedSuccessfulPayment(WebhookDataDto webhookData)
        {
            try
            {
                _logger.LogInformation("🔄 Handling orphaned successful payment for OrderCode: {OrderCode}", webhookData.OrderCode);

                // This is a successful payment but we don't have a pending transaction
                // This could happen if:
                // 1. User paid directly through PayOS without going through our flow
                // 2. There was a timing issue
                // 3. Database was reset but PayOS still has the payment

                // For now, just log it and return success to prevent PayOS retries
                _logger.LogWarning("⚠️ Orphaned successful payment detected - no user to credit: OrderCode={OrderCode}, Amount={Amount}",
                    webhookData.OrderCode, webhookData.Amount);

                // You might want to:
                // 1. Create an admin notification
                // 2. Store this in a separate "orphaned payments" table
                // 3. Send an email to support team

                return ApiResponse<string>.Success("", "Orphaned payment logged for manual review");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error handling orphaned payment for OrderCode: {OrderCode}", webhookData.OrderCode);
                return ApiResponse<string>.Error("Error processing orphaned payment");
            }
        }

        public async Task<ApiResponse<string>> ProcessWalletTransactionAsync(int userId, decimal amount, string type, string description, string? referenceId = null)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<string>.Error("User not found");
                }

                // Calculate new balance
                var currentBalance = user.WalletBalance ?? 0;
                var newBalance = currentBalance + amount;

                // Check if user has sufficient balance for negative transactions
                if (newBalance < 0)
                {
                    return ApiResponse<string>.Error("Insufficient wallet balance");
                }

                // Update user balance
                user.WalletBalance = newBalance;
                user.UpdatedAt = DateTime.UtcNow;

                // Create transaction record
                var transaction = new WalletTransaction
                {
                    UserId = userId,
                    TransactionCode = GenerateTransactionCode(),
                    Type = type,
                    Amount = amount,
                    Description = description,
                    ReferenceId = referenceId,
                    Status = "Completed",
                    BalanceAfter = newBalance,
                    CreatedAt = DateTime.UtcNow
                };

                _unitOfWork.Users.Update(user);
                await _unitOfWork.WalletTransactions.AddAsync(transaction);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Wallet transaction processed: User={UserId}, Type={Type}, Amount={Amount}, NewBalance={NewBalance}",
                    userId, type, amount, newBalance);

                return ApiResponse<string>.Success("", "Transaction processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing wallet transaction for user {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while processing transaction");
            }
        }

        public async Task<ApiResponse<List<RecentTransactionDto>>> GetTransactionHistoryAsync(int userId, int page = 1, int pageSize = 20)
        {
            try
            {
                var transactions = await _unitOfWork.WalletTransactions
                    .FindAsync(wt => wt.UserId == userId);

                var totalCount = transactions.Count();
                var paginatedTransactions = transactions
                    .OrderByDescending(wt => wt.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(wt => new RecentTransactionDto
                    {
                        TransactionCode = wt.TransactionCode,
                        Type = wt.Type,
                        Amount = wt.Amount,
                        Description = wt.Description,
                        Status = wt.Status,
                        CreatedAt = wt.CreatedAt ?? DateTime.UtcNow
                    })
                    .ToList();

                return ApiResponse<List<RecentTransactionDto>>.Success(paginatedTransactions,
                    $"Retrieved {paginatedTransactions.Count} transactions (Page {page} of {Math.Ceiling((double)totalCount / pageSize)})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction history for user {UserId}", userId);
                return ApiResponse<List<RecentTransactionDto>>.Error("An error occurred while retrieving transaction history");
            }
        }

        private static string GenerateTransactionCode()
        {
            // Đảm bảo TransactionCode luôn <= 100 ký tự
            // ESC + 17 (datetime) + '-' + 32 (guid) = 53 ký tự
            // Nếu format thay đổi, vẫn không vượt quá 100
            return $"ESC{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid().ToString("N").Substring(0, 8)}";
        }

        private static string CalculateMembershipTier(int loyaltyPoints)
        {
            return loyaltyPoints switch
            {
                >= 10000 => "Diamond",
                >= 5000 => "Platinum",
                >= 2000 => "Gold",
                >= 500 => "Silver",
                _ => "Bronze"
            };
        }

        public async Task<ApiResponse<string>> HoldEscrowAsync(int userId, decimal amount, int escrowId, string transactionCode)
        {
            try
            {
                //await _unitOfWork.BeginTransactionAsync();

                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<string>.Error("User not found");
                }

                // Check if user has sufficient balance
                var currentBalance = user.WalletBalance ?? 0;
                if (currentBalance < amount)
                {
                    return ApiResponse<string>.Error("Insufficient wallet balance");
                }

                // Update user balance
                user.WalletBalance = currentBalance - amount;
                user.UpdatedAt = DateTime.UtcNow;

                // Create transaction record
                var transaction = new WalletTransaction
                {
                    UserId = userId,
                    TransactionCode = transactionCode,
                    Type = "EscrowHold",
                    Amount = -amount,
                    Description = $"Hold for escrow #{escrowId}",
                    ReferenceId = escrowId.ToString(),
                    Status = "Completed",
                    BalanceAfter = user.WalletBalance ?? 0,
                    CreatedAt = DateTime.UtcNow
                };

                _unitOfWork.Users.Update(user);
                await _unitOfWork.WalletTransactions.AddAsync(transaction);
                await _unitOfWork.SaveChangesAsync();
                
                await _unitOfWork.CommitTransactionAsync();

                _logger.LogInformation("Escrow hold processed: User={UserId}, Amount={Amount}, EscrowId={EscrowId}, NewBalance={NewBalance}",
                    userId, amount, escrowId, user.WalletBalance);

                return ApiResponse<string>.Success(transaction.TransactionCode, "Escrow hold processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error holding escrow for user {UserId}, escrow {EscrowId}", userId, escrowId);
                await _unitOfWork.RollbackTransactionAsync();
                return ApiResponse<string>.Error("Failed to hold escrow");
            }
        }

   
        public async Task<ApiResponse<string>> ReleaseEscrowAsync(int cosplayerId, decimal amount, int escrowId)
        {
            try
            {
                var cosplayer = await _unitOfWork.Users.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer not found");
                }

                var currentBalance = cosplayer.WalletBalance ?? 0;
                cosplayer.WalletBalance = currentBalance + amount;
                cosplayer.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(cosplayer);
                await _unitOfWork.SaveChangesAsync();
                _unitOfWork.Clear();

                var transaction = new WalletTransaction
                {
                    UserId = cosplayerId,
                    TransactionCode = GenerateTransactionCode(), // Always unique
                    Type = "EscrowRelease",
                    Amount = amount,
                    Description = $"Release from escrow #{escrowId}",
                    ReferenceId = escrowId.ToString(),
                    Status = "Completed",
                    BalanceAfter = cosplayer.WalletBalance ?? 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.WalletTransactions.AddAsync(transaction);
                await _unitOfWork.SaveChangesAsync();
                _unitOfWork.Clear();

                _logger.LogInformation("Escrow release processed: Cosplayer={CosplayerId}, Amount={Amount}, EscrowId={EscrowId}, NewBalance={NewBalance}",
                    cosplayerId, amount, escrowId, cosplayer.WalletBalance);

                return ApiResponse<string>.Success(transaction.TransactionCode, "Escrow release processed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error releasing escrow for cosplayer {CosplayerId}, escrow {EscrowId}", cosplayerId, escrowId);
                return ApiResponse<string>.Error("Failed to release escrow");
            }
        }

        // Refactored: RefundEscrowAsync always generates a unique transactionCode internally and retries if duplicate
        public async Task<ApiResponse<string>> RefundEscrowAsync(int userId, decimal amount, int escrowId)
        {
            int retry = 0;
            while (retry < 3)
            {
                // Always generate a new, unique transaction code
                var transactionCode = GenerateTransactionCode();

                try
                {
                    _logger.LogInformation("Attempting to refund escrow #{EscrowId} for user #{UserId}, amount: {Amount}, transactionCode: {TransactionCode}",
                        escrowId, userId, amount, transactionCode);

                    // Check if escrow was already refunded
                    var escrow = await _unitOfWork.EscrowTransactions.GetByIdAsync(escrowId);
                    if (escrow == null)
                    {
                        _logger.LogError("Escrow #{EscrowId} not found", escrowId);
                        return ApiResponse<string>.Error("Escrow not found");
                    }

                    if (escrow.Status == "Refunded")
                    {
                        _logger.LogWarning("Escrow #{EscrowId} was already refunded.", escrowId);
                        return ApiResponse<string>.Error("Escrow already refunded");
                    }

                    // Check if a WalletTransaction with this code already exists
                    var existingTransaction = await _unitOfWork.WalletTransactions
                        .FirstOrDefaultAsync(wt => wt.TransactionCode == transactionCode && wt.Type == "EscrowRefund");

                    if (existingTransaction != null)
                    {
                        _logger.LogWarning("Refund transaction with code {TransactionCode} already exists, retrying...", transactionCode);
                        retry++;
                        continue; // Generate new code and retry
                    }

                    // Fetch user
                    var user = await _unitOfWork.Users.GetByIdAsync(userId);
                    if (user == null)
                    {
                        _logger.LogError("User #{UserId} not found for escrow #{EscrowId}", userId, escrowId);
                        return ApiResponse<string>.Error("User not found");
                    }

                    // TEST MODE: Always add refund to wallet
                    var currentBalance = user.WalletBalance ?? 0;
                    _logger.LogInformation("[REFUND] Before refund: UserId={UserId}, Balance={Balance}", userId, user.WalletBalance);
                    user.WalletBalance = currentBalance + amount;
                    user.UpdatedAt = DateTime.UtcNow;
                    _logger.LogInformation("[REFUND] After refund: UserId={UserId}, Balance={Balance}", userId, user.WalletBalance);

                    // Create new WalletTransaction
                    var transaction = new WalletTransaction
                    {
                        UserId = userId,
                        TransactionCode = transactionCode,
                        Type = "EscrowRefund",
                        Amount = amount,
                        Description = $"Refund from escrow #{escrowId}",
                        ReferenceId = escrowId.ToString(),
                        Status = "Completed",
                        BalanceAfter = user.WalletBalance ?? 0,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Log độ dài TransactionCode trước khi insert
                    _logger.LogInformation("[DEBUG] TransactionCode: {Code}, Length: {Length}", transactionCode, transactionCode.Length);

                    // Apply updates
                    _unitOfWork.Users.Update(user);
                    await _unitOfWork.WalletTransactions.AddAsync(transaction);

                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation("Saved refund transaction for escrow #{EscrowId}, UserId: {UserId}, Amount: {Amount}, NewBalance: {NewBalance}",
                        escrowId, userId, amount, user.WalletBalance);

                    _unitOfWork.Clear();

                    _logger.LogInformation("Refunded escrow #{EscrowId} to user #{UserId} amount {Amount}, new balance: {Balance}",
                        escrowId, userId, amount, user.WalletBalance);

                    return ApiResponse<string>.Success(transaction.TransactionCode, "Escrow refund processed successfully");
                }
                catch (Exception ex)
                {
                    // If duplicate key, retry
                    if (ex.InnerException?.Message.Contains("UNIQUE KEY constraint") == true ||
                        ex.Message.Contains("UNIQUE KEY constraint"))
                    {
                        _logger.LogWarning("Duplicate TransactionCode detected: {TransactionCode}, retrying... (attempt {Retry})", transactionCode, retry + 1);
                        retry++;
                        continue;
                    }

                    _logger.LogError(ex, "[WALLET] Error processing escrow refund #{EscrowId} for user #{UserId}", escrowId, userId);
                    return ApiResponse<string>.Error($"Exception: {ex.Message}");
                }
            }

            return ApiResponse<string>.Error("Failed to create unique refund transaction after 3 attempts.");
        }

    }
}