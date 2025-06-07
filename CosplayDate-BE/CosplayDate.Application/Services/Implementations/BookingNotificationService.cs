using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Implementations
{
    public class BookingNotificationService : IBookingNotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<BookingNotificationService> _logger;

        public BookingNotificationService(
            IUnitOfWork unitOfWork,
            ILogger<BookingNotificationService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task SendBookingCreatedNotificationAsync(Booking booking)
        {
            try
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(booking.CustomerId);
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(booking.CosplayerId);
                var cosplayerUser = cosplayer != null ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId) : null;

                if (customer == null || cosplayerUser == null) return;

                // Create in-app notification for cosplayer
                await CreateInAppNotificationAsync(
                    cosplayerUser.Id,
                    "New Booking Request",
                    $"You have a new booking request from {customer.FirstName} {customer.LastName} for {booking.BookingDate:dd/MM/yyyy} at {booking.StartTime:HH:mm}",
                    "booking_request",
                    booking.Id,
                    $"/bookings/{booking.Id}"
                );

                // Create in-app notification for customer (confirmation)
                await CreateInAppNotificationAsync(
                    customer.Id,
                    "Booking Created",
                    $"Your booking request has been sent to {cosplayer?.DisplayName}. Waiting for confirmation.",
                    "booking_created",
                    booking.Id,
                    $"/bookings/{booking.Id}"
                );

                _logger.LogInformation("Booking notifications sent for booking {BookingCode}", booking.BookingCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending booking created notifications for booking {BookingCode}", booking.BookingCode);
            }
        }

        public async Task SendBookingStatusChangeNotificationAsync(Booking booking, string oldStatus, string newStatus)
        {
            try
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(booking.CustomerId);
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(booking.CosplayerId);
                var cosplayerUser = cosplayer != null ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId) : null;

                if (customer == null || cosplayerUser == null) return;

                var notificationData = GetStatusChangeNotificationData(newStatus, customer, cosplayer);

                // Send notification to customer
                await CreateInAppNotificationAsync(
                    customer.Id,
                    notificationData.CustomerTitle,
                    notificationData.CustomerMessage,
                    notificationData.NotificationType,
                    booking.Id,
                    $"/bookings/{booking.Id}"
                );

                // Send notification to cosplayer (except for confirmations since they initiated it)
                if (newStatus != "Confirmed")
                {
                    await CreateInAppNotificationAsync(
                        cosplayerUser.Id,
                        notificationData.CosplayerTitle,
                        notificationData.CosplayerMessage,
                        notificationData.NotificationType,
                        booking.Id,
                        $"/bookings/{booking.Id}"
                    );
                }

                _logger.LogInformation("Status change notifications sent for booking {BookingCode}: {OldStatus} -> {NewStatus}",
                    booking.BookingCode, oldStatus, newStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending status change notifications for booking {BookingCode}", booking.BookingCode);
            }
        }

        public async Task SendBookingReminderNotificationAsync(Booking booking, int hoursBeforeBooking)
        {
            try
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(booking.CustomerId);
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(booking.CosplayerId);
                var cosplayerUser = cosplayer != null ? await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId) : null;

                if (customer == null || cosplayerUser == null) return;

                var reminderMessage = $"Reminder: Your booking is in {hoursBeforeBooking} hours on {booking.BookingDate:dd/MM/yyyy} at {booking.StartTime:HH:mm}";
                var cosplayerReminderMessage = $"Reminder: You have a booking with {customer.FirstName} {customer.LastName} in {hoursBeforeBooking} hours";

                // Send reminder to customer
                await CreateInAppNotificationAsync(
                    customer.Id,
                    "Booking Reminder",
                    reminderMessage,
                    "booking_reminder",
                    booking.Id,
                    $"/bookings/{booking.Id}"
                );

                // Send reminder to cosplayer
                await CreateInAppNotificationAsync(
                    cosplayerUser.Id,
                    "Booking Reminder",
                    cosplayerReminderMessage,
                    "booking_reminder",
                    booking.Id,
                    $"/bookings/{booking.Id}"
                );

                _logger.LogInformation("Booking reminder sent for booking {BookingCode}, {Hours} hours before",
                    booking.BookingCode, hoursBeforeBooking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending booking reminder for booking {BookingCode}", booking.BookingCode);
            }
        }

        public async Task SendPaymentNotificationAsync(int userId, string paymentType, decimal amount, string bookingCode, bool isSuccess)
        {
            try
            {
                var title = paymentType switch
                {
                    "BOOKING_PAYMENT" => isSuccess ? "Payment Successful" : "Payment Failed",
                    "BOOKING_REFUND" => "Refund Processed",
                    "BOOKING_ADJUSTMENT" => "Payment Adjustment",
                    _ => "Payment Update"
                };

                var message = paymentType switch
                {
                    "BOOKING_PAYMENT" when isSuccess => $"Payment of {amount:N0} VND processed for booking {bookingCode}",
                    "BOOKING_PAYMENT" when !isSuccess => $"Payment of {amount:N0} VND failed for booking {bookingCode}",
                    "BOOKING_REFUND" => $"Refund of {amount:N0} VND processed for booking {bookingCode}",
                    "BOOKING_ADJUSTMENT" when amount > 0 => $"Additional payment of {amount:N0} VND processed for booking {bookingCode}",
                    "BOOKING_ADJUSTMENT" when amount < 0 => $"Refund of {Math.Abs(amount):N0} VND processed for booking {bookingCode}",
                    _ => $"Payment update for booking {bookingCode}"
                };

                await CreateInAppNotificationAsync(
                    userId,
                    title,
                    message,
                    "payment",
                    0,
                    "/wallet"
                );

                _logger.LogInformation("Payment notification sent to user {UserId} for {PaymentType}: {Amount}",
                    userId, paymentType, amount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending payment notification to user {UserId}", userId);
            }
        }

        public async Task SendReviewReminderNotificationAsync(Booking booking)
        {
            try
            {
                var customer = await _unitOfWork.Users.GetByIdAsync(booking.CustomerId);
                if (customer == null) return;

                // Check if review already exists
                var existingReview = await _unitOfWork.Reviews
                    .FirstOrDefaultAsync(r => r.BookingId == booking.Id);

                if (existingReview != null) return; // Already reviewed

                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(booking.CosplayerId);

                await CreateInAppNotificationAsync(
                    customer.Id,
                    "Leave a Review",
                    $"How was your experience with {cosplayer?.DisplayName}? Leave a review to help other customers.",
                    "review_reminder",
                    booking.Id,
                    $"/bookings/{booking.Id}/review"
                );

                _logger.LogInformation("Review reminder sent for booking {BookingCode}", booking.BookingCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending review reminder for booking {BookingCode}", booking.BookingCode);
            }
        }

        private async Task CreateInAppNotificationAsync(
            int userId,
            string title,
            string content,
            string type,
            int referenceId,
            string actionUrl)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Type = type,
                    Title = title,
                    Content = content,
                    ReferenceId = referenceId > 0 ? referenceId : null,
                    ReferenceType = referenceId > 0 ? "booking" : null,
                    ActionUrl = actionUrl,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<Notification>().AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating in-app notification for user {UserId}", userId);
            }
        }

        private static (string CustomerTitle, string CustomerMessage, string CosplayerTitle, string CosplayerMessage, string NotificationType)
            GetStatusChangeNotificationData(string newStatus, User customer, Cosplayer? cosplayer)
        {
            return newStatus switch
            {
                "Confirmed" => (
                    CustomerTitle: "Booking Confirmed",
                    CustomerMessage: $"Your booking with {cosplayer?.DisplayName} has been confirmed for {DateTime.Now:dd/MM/yyyy}",
                    CosplayerTitle: "Booking Confirmed",
                    CosplayerMessage: $"You confirmed the booking with {customer.FirstName} {customer.LastName}",
                    NotificationType: "booking_confirmed"
                ),
                "Cancelled" => (
                    CustomerTitle: "Booking Cancelled",
                    CustomerMessage: $"Your booking with {cosplayer?.DisplayName} has been cancelled",
                    CosplayerTitle: "Booking Cancelled",
                    CosplayerMessage: $"Booking with {customer.FirstName} {customer.LastName} has been cancelled",
                    NotificationType: "booking_cancelled"
                ),
                "Completed" => (
                    CustomerTitle: "Booking Completed",
                    CustomerMessage: $"Your booking with {cosplayer?.DisplayName} has been completed. Please leave a review!",
                    CosplayerTitle: "Booking Completed",
                    CosplayerMessage: $"Booking with {customer.FirstName} {customer.LastName} has been completed",
                    NotificationType: "booking_completed"
                ),
                _ => (
                    CustomerTitle: "Booking Updated",
                    CustomerMessage: $"Your booking status has been updated to {newStatus}",
                    CosplayerTitle: "Booking Updated",
                    CosplayerMessage: $"Booking status updated to {newStatus}",
                    NotificationType: "booking_updated"
                )
            };
        }
    }
}
