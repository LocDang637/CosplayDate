using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IBookingNotificationService
    {
        Task SendBookingCreatedNotificationAsync(Booking booking);
        Task SendBookingStatusChangeNotificationAsync(Booking booking, string oldStatus, string newStatus);
        Task SendBookingReminderNotificationAsync(Booking booking, int hoursBeforeBooking);
        Task SendPaymentNotificationAsync(int userId, string paymentType, decimal amount, string bookingCode, bool isSuccess);
        Task SendReviewReminderNotificationAsync(Booking booking);
    }
}
