using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string? Content { get; set; }

    public bool? IsRead { get; set; }

    public int? ReferenceId { get; set; }

    public string? ReferenceType { get; set; }

    public string? ActionUrl { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
