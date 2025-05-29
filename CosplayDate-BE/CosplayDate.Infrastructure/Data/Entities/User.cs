using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class User
{
    public int Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    public string? Location { get; set; }

    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    public string UserType { get; set; } = null!;

    public bool? IsVerified { get; set; }

    public bool? IsOnline { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public string? MembershipTier { get; set; }

    public int? LoyaltyPoints { get; set; }

    public decimal? WalletBalance { get; set; }

    public decimal? ProfileCompleteness { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<Conversation> ConversationCosplayers { get; set; } = new List<Conversation>();

    public virtual ICollection<Conversation> ConversationCustomers { get; set; } = new List<Conversation>();

    public virtual Cosplayer? Cosplayer { get; set; }

    public virtual ICollection<EmailVerificationToken> EmailVerificationTokens { get; set; } = new List<EmailVerificationToken>();

    public virtual ICollection<EventParticipant> EventParticipants { get; set; } = new List<EventParticipant>();

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<MessageReadReceipt> MessageReadReceipts { get; set; } = new List<MessageReadReceipt>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();

    public virtual ICollection<PhotoLike> PhotoLikes { get; set; } = new List<PhotoLike>();

    public virtual ICollection<ReviewHelpfulVote> ReviewHelpfulVotes { get; set; } = new List<ReviewHelpfulVote>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<UserFollow> UserFollowFolloweds { get; set; } = new List<UserFollow>();

    public virtual ICollection<UserFollow> UserFollowFollowers { get; set; } = new List<UserFollow>();

    public virtual ICollection<UserInterest> UserInterests { get; set; } = new List<UserInterest>();

    public virtual ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();

    public virtual ICollection<WalletTransaction> WalletTransactions { get; set; } = new List<WalletTransaction>();
}
