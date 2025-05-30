using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;

public partial class Booking
{
    public int Id { get; set; }

    public string BookingCode { get; set; } = null!;

    public int CustomerId { get; set; }

    public int CosplayerId { get; set; }

    public string ServiceType { get; set; } = null!;

    public DateOnly BookingDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int Duration { get; set; }

    public string Location { get; set; } = null!;

    public decimal TotalPrice { get; set; }

    public string Status { get; set; } = null!;

    public string PaymentStatus { get; set; } = null!;

    public string? SpecialNotes { get; set; }

    public string? CancellationReason { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Cosplayer Cosplayer { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Review? Review { get; set; }
}
