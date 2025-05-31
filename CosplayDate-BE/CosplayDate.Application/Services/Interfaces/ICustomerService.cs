using CosplayDate.Application.DTOs.Customer;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface ICustomerService
    {
        Task<ApiResponse<CustomerProfileResponseDto>> GetCustomerProfileAsync(int customerId, int currentUserId);
        Task<ApiResponse<CustomerProfileResponseDto>> UpdateCustomerProfileAsync(int customerId, UpdateCustomerProfileRequestDto request);
        Task<ApiResponse<BookingHistoryResponseDto>> GetBookingHistoryAsync(int customerId, int page, int pageSize, string? status);
        Task<ApiResponse<WalletInfoResponseDto>> GetWalletInfoAsync(int customerId);
        Task<ApiResponse<CustomerStatsDto>> GetCustomerStatsAsync(int customerId);
        Task<ApiResponse<WalletTopUpResponseDto>> TopUpWalletAsync(int customerId, WalletTopUpRequestDto request);
        Task<ApiResponse<WalletTransactionsResponseDto>> GetWalletTransactionsAsync(int customerId, int page, int pageSize, string? type);
        Task<ApiResponse<ToggleFollowResponseDto>> ToggleFollowAsync(int customerId, int cosplayerId);
        Task<ApiResponse<FavoriteCosplayersResponseDto>> GetFavoriteCosplayersAsync(int customerId, int page, int pageSize);
    }
}
