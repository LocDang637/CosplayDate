using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class CustomerBookingDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public CosplayerSummaryDto Cosplayer { get; set; } = new();
        public string ServiceType { get; set; } = string.Empty;
        public DateOnly BookingDate { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int Duration { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string? SpecialNotes { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool HasReview { get; set; }
        public CustomerReviewDto? MyReview { get; set; }
        public bool CanCancel { get; set; }
    }
}
