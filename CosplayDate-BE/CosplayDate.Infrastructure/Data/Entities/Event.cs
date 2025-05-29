using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class Event
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly EventDate { get; set; }

    public TimeOnly? EventTime { get; set; }

    public string? Location { get; set; }

    public string? EventType { get; set; }

    public string? ImageUrl { get; set; }

    public int? MaxParticipants { get; set; }

    public int? CurrentParticipants { get; set; }

    public decimal? EntryFee { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<EventParticipant> EventParticipants { get; set; } = new List<EventParticipant>();
}
