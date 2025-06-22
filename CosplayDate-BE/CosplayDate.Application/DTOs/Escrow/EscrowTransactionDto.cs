using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowTransactionDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int PaymentId { get; set; }
        public int CustomerId { get; set; }
        public int CosplayerId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty; // "Held", "Released", "Refunded"
        public string TransactionCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ReleasedAt { get; set; }
        public DateTime? RefundedAt { get; set; }

        // Additional info for display
        public string? BookingCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CosplayerName { get; set; }
        public string? ServiceType { get; set; }
        public DateOnly? BookingDate { get; set; }
    }
}
