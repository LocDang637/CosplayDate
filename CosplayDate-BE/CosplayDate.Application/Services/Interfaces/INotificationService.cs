using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface INotificationService
    {
        Task SendBookingCreatedNotificationAsync(Booking booking);
        Task SendBookingConfirmedNotificationAsync(Booking booking);
        Task SendBookingCancelledNotificationAsync(Booking booking, string cancelledBy);
        Task SendBookingCompletedNotificationAsync(Booking booking);
        Task SendBookingRejectedNotificationAsync(Booking booking);
        Task SendPaymentReceivedNotificationAsync(Booking booking);
        Task SendRefundProcessedNotificationAsync(Booking booking, decimal refundAmount);
        Task SendBookingReminderNotificationAsync(Booking booking, int hoursBeforeBooking);
    }
}
