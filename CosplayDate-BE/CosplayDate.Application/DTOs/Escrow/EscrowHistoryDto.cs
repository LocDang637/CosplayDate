using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowHistoryDto
    {
        public int Id { get; set; }
        public string TransactionCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int DaysToComplete { get; set; }

        // Booking details
        public string BookingCode { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public DateOnly BookingDate { get; set; }

        // Partner info (from customer perspective, this is cosplayer info and vice versa)
        public string PartnerName { get; set; } = string.Empty;
        public string PartnerType { get; set; } = string.Empty; // "Customer" or "Cosplayer"

        // Action details
        public string ActionType { get; set; } = string.Empty; // "Release" or "Refund"
        public string? ActionReason { get; set; }
    }
}
