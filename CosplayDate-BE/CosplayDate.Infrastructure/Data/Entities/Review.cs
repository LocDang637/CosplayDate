using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class Review
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public int CustomerId { get; set; }

    public int CosplayerId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = null!;

    public bool? IsVerified { get; set; }

    public int? HelpfulCount { get; set; }

    public string? OwnerResponse { get; set; }

    public DateTime? OwnerResponseDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual Cosplayer Cosplayer { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;

    public virtual ICollection<ReviewHelpfulVote> ReviewHelpfulVotes { get; set; } = new List<ReviewHelpfulVote>();

    public virtual ICollection<ReviewTag> ReviewTags { get; set; } = new List<ReviewTag>();
}
