using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Implementations
{
    public class BookingReminderBackgroundService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBookingNotificationService _notificationService;
        private readonly ILogger<BookingReminderBackgroundService> _logger;

        public BookingReminderBackgroundService(
            IUnitOfWork unitOfWork,
            IBookingNotificationService notificationService,
            ILogger<BookingReminderBackgroundService> logger)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task ProcessBookingRemindersAsync()
        {
            try
            {
                var tomorrow = DateOnly.FromDateTime(DateTime.Today.AddDays(1));

                // Get bookings for tomorrow (24-hour reminder)
                var tomorrowBookings = await _unitOfWork.Bookings.FindAsync(b =>
                    b.BookingDate == tomorrow &&
                    b.Status == "Confirmed");

                foreach (var booking in tomorrowBookings)
                {
                    await _notificationService.SendBookingReminderNotificationAsync(booking, 24);
                }

                // Get bookings starting in 2 hours (2-hour reminder)
                var twoHoursFromNow = DateTime.Now.AddHours(2);
                var todayBookings = await _unitOfWork.Bookings.FindAsync(b =>
                    b.BookingDate == DateOnly.FromDateTime(DateTime.Today) &&
                    b.Status == "Confirmed");

                foreach (var booking in todayBookings)
                {
                    var bookingDateTime = booking.BookingDate.ToDateTime(booking.StartTime);
                    var timeDifference = bookingDateTime - DateTime.Now;

                    // Send 2-hour reminder if within 2-3 hour window
                    if (timeDifference.TotalHours >= 2 && timeDifference.TotalHours <= 3)
                    {
                        await _notificationService.SendBookingReminderNotificationAsync(booking, 2);
                    }
                }

                _logger.LogInformation("Processed booking reminders: {TomorrowCount} 24h reminders, checked today's bookings for 2h reminders",
                    tomorrowBookings.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing booking reminders");
            }
        }

        public async Task ProcessCompletedBookingReviewRemindersAsync()
        {
            try
            {
                var yesterday = DateOnly.FromDateTime(DateTime.Today.AddDays(-1));

                // Get completed bookings from yesterday that don't have reviews
                var completedBookings = await _unitOfWork.Bookings.FindAsync(b =>
                    b.BookingDate == yesterday &&
                    b.Status == "Completed");

                foreach (var booking in completedBookings)
                {
                    await _notificationService.SendReviewReminderNotificationAsync(booking);
                }

                _logger.LogInformation("Processed review reminders for {Count} completed bookings", completedBookings.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing review reminders");
            }
        }
    }
}
