using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class ReviewHelpfulVote
{
    public int Id { get; set; }

    public int ReviewId { get; set; }

    public int UserId { get; set; }

    public bool IsHelpful { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Review Review { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
