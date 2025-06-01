using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UserSettingsResponseDto
    {
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public bool SmsNotifications { get; set; } = false;
        public string Language { get; set; } = "vi";
        public string TimeZone { get; set; } = "Asia/Ho_Chi_Minh";
        public string Currency { get; set; } = "VND";
        public bool PrivateProfile { get; set; } = false;
        public bool ShowOnlineStatus { get; set; } = true;
        public bool AllowDirectMessages { get; set; } = true;
        public bool ShowEmail { get; set; } = false;
        public bool ShowPhoneNumber { get; set; } = false;
        public bool ShowLocation { get; set; } = true;
        public bool AllowSearchByEmail { get; set; } = false;
        public bool TwoFactorEnabled { get; set; } = false;
        public bool MarketingEmails { get; set; } = true;
        public bool EventNotifications { get; set; } = true;
        public bool BookingNotifications { get; set; } = true;
        public bool ReviewNotifications { get; set; } = true;
        public bool FollowerNotifications { get; set; } = true;
    }
}
