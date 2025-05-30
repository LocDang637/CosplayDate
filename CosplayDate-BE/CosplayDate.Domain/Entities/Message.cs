using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class Message
{
    public int Id { get; set; }

    public int ConversationId { get; set; }

    public int SenderId { get; set; }

    public string MessageText { get; set; } = null!;

    public string? MessageType { get; set; }

    public string? AttachmentUrl { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public bool? IsEdited { get; set; }

    public DateTime? EditedAt { get; set; }

    public int? ReplyToMessageId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Conversation Conversation { get; set; } = null!;

    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    public virtual ICollection<Message> InverseReplyToMessage { get; set; } = new List<Message>();

    public virtual ICollection<MessageReadReceipt> MessageReadReceipts { get; set; } = new List<MessageReadReceipt>();

    public virtual Message? ReplyToMessage { get; set; }

    public virtual User Sender { get; set; } = null!;
}
