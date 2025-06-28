using CosplayDate.Application.DTOs.Booking;
using CosplayDate.Application.DTOs.Escrow;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IBookingService
    {
        Task<ApiResponse<CreateBookingResponseDto>> CreateBookingAsync(int customerId, CreateBookingRequestDto request);
        Task<ApiResponse<BookingDto>> GetBookingDetailsAsync(int bookingId, int userId);
        Task<ApiResponse<GetBookingsResponseDto>> GetBookingsAsync(int userId, GetBookingsRequestDto request);
        Task<ApiResponse<BookingDto>> UpdateBookingAsync(int bookingId, int userId, UpdateBookingRequestDto request);
        Task<ApiResponse<string>> CancelBookingAsync(int bookingId, int userId, CancelBookingRequestDto request);
        Task<ApiResponse<string>> ConfirmBookingAsync(int bookingId, int cosplayerId);
        Task<ApiResponse<string>> CompleteBookingAsync(int bookingId, int userId);
        Task<ApiResponse<decimal>> CalculateBookingPriceAsync(int cosplayerId, TimeOnly startTime, TimeOnly endTime);

        // Thêm mới: Lấy thông tin escrow liên quan đến một booking
        Task<ApiResponse<EscrowTransactionDto>> GetEscrowByBookingAsync(int bookingId);

        // Thêm mới: Lấy lịch sử escrow của người dùng
        Task<ApiResponse<List<EscrowHistoryDto>>> GetEscrowHistoryAsync(int userId, bool isCustomer = true);

        // Thêm mới: Lấy chi tiết escrow của một booking
        Task<ApiResponse<EscrowSummaryDto>> GetBookingEscrowDetailsAsync(int bookingId, int userId);
    }
}
