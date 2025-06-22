using CosplayDate.Application.DTOs.Payment;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IWalletService
    {
        Task<ApiResponse<WalletTopUpResponseDto>> CreateTopUpRequestAsync(int userId, WalletTopUpRequestDto request);
        Task<ApiResponse<WalletBalanceResponseDto>> GetWalletBalanceAsync(int userId);
        Task<ApiResponse<string>> ProcessPaymentWebhookAsync(WebhookDataDto webhookData);
        Task<ApiResponse<string>> ProcessWalletTransactionAsync(int userId, decimal amount, string type, string description, string? referenceId = null);
        Task<ApiResponse<List<RecentTransactionDto>>> GetTransactionHistoryAsync(int userId, int page = 1, int pageSize = 20);
        Task<ApiResponse<string>> AddToWalletAsync(int userId, decimal amount, string type, string description, string? referenceId = null);
    }
}
