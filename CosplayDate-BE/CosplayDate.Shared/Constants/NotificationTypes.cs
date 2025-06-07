using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Shared.Constants
{
    public static class NotificationTypes
    {
        public const string BookingRequest = "booking_request";
        public const string BookingCreated = "booking_created";
        public const string BookingConfirmed = "booking_confirmed";
        public const string BookingCancelled = "booking_cancelled";
        public const string BookingCompleted = "booking_completed";
        public const string BookingUpdated = "booking_updated";
        public const string BookingReminder = "booking_reminder";
        public const string Payment = "payment";
        public const string ReviewReminder = "review_reminder";
    }
}
