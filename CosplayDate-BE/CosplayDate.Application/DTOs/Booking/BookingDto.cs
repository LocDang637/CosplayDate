using CosplayDate.Application.DTOs.Cosplayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Booking
{
    public class BookingDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int CosplayerId { get; set; }
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
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Related data
        public CustomerSummaryDto Customer { get; set; } = new();
        public CosplayerSummaryDto Cosplayer { get; set; } = new();
        public List<PaymentSummaryDto> Payments { get; set; } = new();
        public ReviewSummaryDto? Review { get; set; }
    }
}
