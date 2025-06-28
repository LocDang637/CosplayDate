using CosplayDate.Application.DTOs.Escrow;
using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IEscrowService
    {
        Task<EscrowTransaction> CreateEscrowAsync(int bookingId, int paymentId, decimal amount);
        Task<bool> ReleaseEscrowAsync(int bookingId);
        Task<bool> RefundEscrowAsync(int escrowId, string reason);
        Task<EscrowTransaction?> GetEscrowByBookingAsync(int bookingId);
        Task<EscrowTransaction?> GetEscrowByIdAsync(int escrowId);
        Task<List<EscrowTransaction>> GetPendingEscrowsAsync(int cosplayerId);
        Task<List<EscrowTransaction>> GetCustomerEscrowsAsync(int customerId);
        Task<EscrowAnalyticsDto> GetEscrowAnalyticsAsync();
        Task<List<PendingEscrowDto>> GetDetailedPendingEscrowsAsync(int cosplayerId);
        Task<List<EscrowHistoryDto>> GetEscrowHistoryAsync(int userId, bool isCustomer = true);
        Task<EscrowSummaryDto> GetUserEscrowSummaryAsync(int userId, bool isCustomer = true);
    }
}
