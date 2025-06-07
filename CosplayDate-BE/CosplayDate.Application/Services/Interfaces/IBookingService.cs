using CosplayDate.Application.DTOs.Booking;
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
    }
}
