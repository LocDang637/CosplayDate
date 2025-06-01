using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UpdateUserSettingsRequestDto
    {
        public bool? EmailNotifications { get; set; }
        public bool? PushNotifications { get; set; }
        public bool? SmsNotifications { get; set; }
        public string? Language { get; set; }
        public string? TimeZone { get; set; }
        public string? Currency { get; set; }
        public bool? PrivateProfile { get; set; }
        public bool? ShowOnlineStatus { get; set; }
        public bool? AllowDirectMessages { get; set; }
        public bool? ShowEmail { get; set; }
        public bool? ShowPhoneNumber { get; set; }
        public bool? ShowLocation { get; set; }
        public bool? AllowSearchByEmail { get; set; }
        public bool? TwoFactorEnabled { get; set; }
        public bool? MarketingEmails { get; set; }
        public bool? EventNotifications { get; set; }
        public bool? BookingNotifications { get; set; }
        public bool? ReviewNotifications { get; set; }
        public bool? FollowerNotifications { get; set; }
    }
}
