using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Constants
{
    public static class BookingConstants
    {
        public const int MinBookingDurationMinutes = 60;
        public const int MaxBookingDurationHours = 12;
        public const int MaxAdvanceBookingDays = 90;
        public const int MinAdvanceBookingDays = 1;

        public static readonly TimeOnly BusinessHoursStart = new(8, 0);
        public static readonly TimeOnly BusinessHoursEnd = new(22, 0);

        public static class ServiceTypes
        {
            public const string Photography = "Photography";
            public const string Event = "Event";
            public const string Convention = "Convention";
            public const string Photoshoot = "Photoshoot";
            public const string Performance = "Performance";
            public const string Appearance = "Appearance";
            public const string Workshop = "Workshop";
            public const string Custom = "Custom";
        }

        public static readonly List<string> ValidServiceTypes = new()
        {
            ServiceTypes.Photography,
            ServiceTypes.Event,
            ServiceTypes.Convention,
            ServiceTypes.Photoshoot,
            ServiceTypes.Performance,
            ServiceTypes.Appearance,
            ServiceTypes.Workshop,
            ServiceTypes.Custom
        };

        public static class NotificationTypes
        {
            public const string BookingCreated = "booking_created";
            public const string BookingConfirmed = "booking_confirmed";
            public const string BookingCancelled = "booking_cancelled";
            public const string BookingCompleted = "booking_completed";
            public const string BookingRejected = "booking_rejected";
            public const string PaymentReceived = "payment_received";
            public const string RefundProcessed = "refund_processed";
        }
    }
}
