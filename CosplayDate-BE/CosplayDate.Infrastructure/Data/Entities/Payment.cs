using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class Payment
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public string PaymentCode { get; set; } = null!;

    public decimal Amount { get; set; }

    public string PaymentMethod { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? TransactionId { get; set; }

    public decimal? ProcessingFee { get; set; }

    public decimal NetAmount { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Booking Booking { get; set; } = null!;
}
