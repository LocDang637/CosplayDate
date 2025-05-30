using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class EventParticipant
{
    public int Id { get; set; }

    public int EventId { get; set; }

    public int UserId { get; set; }

    public string? ParticipationType { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
