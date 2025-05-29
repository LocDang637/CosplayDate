using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class Conversation
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public int CosplayerId { get; set; }

    public int? LastMessageId { get; set; }

    public DateTime? LastMessageAt { get; set; }

    public int? CustomerUnreadCount { get; set; }

    public int? CosplayerUnreadCount { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Cosplayer { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;

    public virtual Message? LastMessage { get; set; }

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
