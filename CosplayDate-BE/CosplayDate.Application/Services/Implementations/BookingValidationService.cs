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
    public class BookingValidationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<BookingValidationService> _logger;

        public BookingValidationService(IUnitOfWork unitOfWork, ILogger<BookingValidationService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<(bool IsValid, string ErrorMessage)> ValidateBookingCreationAsync(
            int customerId,
            int cosplayerId,
            DateOnly bookingDate,
            TimeOnly startTime,
            TimeOnly endTime)
        {
            // 1. Validate customer
            var customer = await _unitOfWork.Users.GetByIdAsync(customerId);
            if (customer == null || !customer.IsVerified || customer.UserType != "Customer")
            {
                return (false, "Invalid customer or customer not verified");
            }

            // 2. Validate cosplayer
            var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
            if (cosplayer == null)
            {
                return (false, "Cosplayer not found");
            }

            var cosplayerUser = await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId);
            if (cosplayerUser == null || !cosplayerUser.IsVerified || !cosplayerUser.IsActive.GetValueOrDefault())
            {
                return (false, "Cosplayer account is not active or verified");
            }

            if (cosplayer.IsAvailable != true)
            {
                return (false, "Cosplayer is currently not available for bookings");
            }

            // 3. Validate booking date and time
            if (bookingDate <= DateOnly.FromDateTime(DateTime.Today))
            {
                return (false, "Booking date must be at least tomorrow");
            }

            // Don't allow bookings too far in advance (e.g., more than 6 months)
            if (bookingDate > DateOnly.FromDateTime(DateTime.Today.AddMonths(6)))
            {
                return (false, "Bookings cannot be made more than 6 months in advance");
            }

            if (endTime <= startTime)
            {
                return (false, "End time must be after start time");
            }

            // Minimum booking duration (e.g., 1 hour)
            var duration = endTime.ToTimeSpan() - startTime.ToTimeSpan();
            if (duration.TotalMinutes < 60)
            {
                return (false, "Minimum booking duration is 1 hour");
            }

            // Maximum booking duration (e.g., 12 hours)
            if (duration.TotalHours > 12)
            {
                return (false, "Maximum booking duration is 12 hours");
            }

            // 4. Validate business hours (e.g., 6 AM to 11 PM)
            if (startTime < new TimeOnly(6, 0) || endTime > new TimeOnly(23, 0))
            {
                return (false, "Bookings are only allowed between 6:00 AM and 11:00 PM");
            }

            // 5. Check for customer booking limits
            var customerBookingLimit = await CheckCustomerBookingLimitsAsync(customerId, bookingDate);
            if (!customerBookingLimit.IsValid)
            {
                return (false, customerBookingLimit.ErrorMessage);
            }

            // 6. Check cosplayer's booking capacity
            var cosplayerCapacity = await CheckCosplayerCapacityAsync(cosplayerId, bookingDate, startTime, endTime);
            if (!cosplayerCapacity.IsValid)
            {
                return (false, cosplayerCapacity.ErrorMessage);
            }

            return (true, string.Empty);
        }

        private async Task<(bool IsValid, string ErrorMessage)> CheckCustomerBookingLimitsAsync(int customerId, DateOnly bookingDate)
        {
            // Limit: Max 3 bookings per day
            var bookingsOnDate = await _unitOfWork.Bookings.FindAsync(b =>
                b.CustomerId == customerId &&
                b.BookingDate == bookingDate &&
                b.Status != "Cancelled");

            if (bookingsOnDate.Count() >= 3)
            {
                return (false, "Maximum 3 bookings allowed per day");
            }

            // Limit: Max 10 pending bookings at any time
            var pendingBookings = await _unitOfWork.Bookings.FindAsync(b =>
                b.CustomerId == customerId &&
                b.Status == "Pending" &&
                b.BookingDate >= DateOnly.FromDateTime(DateTime.Today));

            if (pendingBookings.Count() >= 10)
            {
                return (false, "You have too many pending bookings. Please wait for confirmations or cancel some bookings.");
            }

            return (true, string.Empty);
        }

        private async Task<(bool IsValid, string ErrorMessage)> CheckCosplayerCapacityAsync(
            int cosplayerId,
            DateOnly bookingDate,
            TimeOnly startTime,
            TimeOnly endTime)
        {
            // Check for time conflicts
            var conflictingBookings = await _unitOfWork.Bookings.FindAsync(b =>
                b.CosplayerId == cosplayerId &&
                b.BookingDate == bookingDate &&
                b.Status != "Cancelled");

            var hasConflict = conflictingBookings.Any(b =>
                (startTime >= b.StartTime && startTime < b.EndTime) ||
                (endTime > b.StartTime && endTime <= b.EndTime) ||
                (startTime <= b.StartTime && endTime >= b.EndTime));

            if (hasConflict)
            {
                return (false, "The selected time slot conflicts with another booking");
            }

            // Check daily booking limit for cosplayer (e.g., max 8 hours per day)
            var dailyBookings = conflictingBookings.Where(b => b.Status != "Cancelled");
            var totalMinutesBooked = dailyBookings.Sum(b => b.Duration);
            var requestedDuration = (int)(endTime.ToTimeSpan() - startTime.ToTimeSpan()).TotalMinutes;

            if (totalMinutesBooked + requestedDuration > 480) // 8 hours = 480 minutes
            {
                return (false, "This booking would exceed the cosplayer's daily capacity (8 hours)");
            }

            return (true, string.Empty);
        }

        public async Task<(bool IsValid, string ErrorMessage)> ValidateBookingUpdateAsync(
            Booking booking,
            int userId,
            DateOnly? newDate = null,
            TimeOnly? newStartTime = null,
            TimeOnly? newEndTime = null)
        {
            // Only customers can update their own bookings
            if (booking.CustomerId != userId)
            {
                return (false, "You can only update your own bookings");
            }

            // Can only update pending bookings
            if (booking.Status != "Pending")
            {
                return (false, "Only pending bookings can be updated");
            }

            // Cannot update bookings within 24 hours of the booking time
            var bookingDateTime = booking.BookingDate.ToDateTime(booking.StartTime);
            if (bookingDateTime - DateTime.Now < TimeSpan.FromHours(24))
            {
                return (false, "Cannot update bookings within 24 hours of the scheduled time");
            }

            // If time is being changed, validate the new time
            if (newDate.HasValue || newStartTime.HasValue || newEndTime.HasValue)
            {
                var finalDate = newDate ?? booking.BookingDate;
                var finalStartTime = newStartTime ?? booking.StartTime;
                var finalEndTime = newEndTime ?? booking.EndTime;

                var timeValidation = await ValidateBookingCreationAsync(
                    booking.CustomerId,
                    booking.CosplayerId,
                    finalDate,
                    finalStartTime,
                    finalEndTime);

                if (!timeValidation.IsValid)
                {
                    return timeValidation;
                }
            }

            return (true, string.Empty);
        }

        public (bool IsValid, string ErrorMessage) ValidateBookingCancellation(Booking booking, int userId)
        {
            // Both customer and cosplayer can cancel
            bool hasPermission = booking.CustomerId == userId;
            if (!hasPermission)
            {
                // Check if user is the cosplayer
                // This would need to be checked against the cosplayer's user ID
                // For now, we'll assume this check is done in the service layer
            }

            if (!hasPermission)
            {
                return (false, "You don't have permission to cancel this booking");
            }

            if (booking.Status == "Cancelled")
            {
                return (false, "Booking is already cancelled");
            }

            if (booking.Status == "Completed")
            {
                return (false, "Cannot cancel a completed booking");
            }

            return (true, string.Empty);
        }

        public (decimal RefundAmount, string RefundPolicy) CalculateRefundAmount(Booking booking)
        {
            var bookingDateTime = booking.BookingDate.ToDateTime(booking.StartTime);
            var timeUntilBooking = bookingDateTime - DateTime.Now;

            // Refund policy based on cancellation time
            if (timeUntilBooking.TotalHours > 48)
            {
                // More than 48 hours: 100% refund
                return (booking.TotalPrice, "Full refund (cancelled more than 48 hours in advance)");
            }
            else if (timeUntilBooking.TotalHours > 24)
            {
                // 24-48 hours: 75% refund
                var refundAmount = booking.TotalPrice * 0.75m;
                return (refundAmount, "75% refund (cancelled 24-48 hours in advance)");
            }
            else if (timeUntilBooking.TotalHours > 12)
            {
                // 12-24 hours: 50% refund
                var refundAmount = booking.TotalPrice * 0.50m;
                return (refundAmount, "50% refund (cancelled 12-24 hours in advance)");
            }
            else if (timeUntilBooking.TotalHours > 2)
            {
                // 2-12 hours: 25% refund
                var refundAmount = booking.TotalPrice * 0.25m;
                return (refundAmount, "25% refund (cancelled 2-12 hours in advance)");
            }
            else
            {
                // Less than 2 hours or past booking time: No refund
                return (0, "No refund (cancelled less than 2 hours in advance)");
            }
        }

        public async Task<List<(DateOnly Date, List<(TimeOnly Start, TimeOnly End)> AvailableSlots)>>
            GetCosplayerAvailabilityAsync(int cosplayerId, DateOnly startDate, DateOnly endDate)
        {
            var availability = new List<(DateOnly Date, List<(TimeOnly Start, TimeOnly End)> AvailableSlots)>();

            // Get all bookings in the date range
            var bookings = await _unitOfWork.Bookings.FindAsync(b =>
                b.CosplayerId == cosplayerId &&
                b.BookingDate >= startDate &&
                b.BookingDate <= endDate &&
                b.Status != "Cancelled");

            var currentDate = startDate;
            while (currentDate <= endDate)
            {
                var dayBookings = bookings
                    .Where(b => b.BookingDate == currentDate)
                    .OrderBy(b => b.StartTime)
                    .ToList();

                var availableSlots = CalculateAvailableSlots(dayBookings);
                availability.Add((currentDate, availableSlots));

                currentDate = currentDate.AddDays(1);
            }

            return availability;
        }

        private static List<(TimeOnly Start, TimeOnly End)> CalculateAvailableSlots(List<Booking> dayBookings)
        {
            var availableSlots = new List<(TimeOnly Start, TimeOnly End)>();

            // Business hours: 6 AM to 11 PM
            var businessStart = new TimeOnly(6, 0);
            var businessEnd = new TimeOnly(23, 0);

            if (!dayBookings.Any())
            {
                // Entire day is available
                availableSlots.Add((businessStart, businessEnd));
                return availableSlots;
            }

            var currentTime = businessStart;

            foreach (var booking in dayBookings)
            {
                // Add slot before this booking if there's a gap
                if (currentTime < booking.StartTime)
                {
                    availableSlots.Add((currentTime, booking.StartTime));
                }

                // Move current time to after this booking
                currentTime = booking.EndTime;
            }

            // Add remaining time after last booking
            if (currentTime < businessEnd)
            {
                availableSlots.Add((currentTime, businessEnd));
            }

            // Filter out slots shorter than minimum duration (1 hour)
            return availableSlots
                .Where(slot => (slot.End.ToTimeSpan() - slot.Start.ToTimeSpan()).TotalMinutes >= 60)
                .ToList();
        }
    }
}
