using System;
using System.Collections.Generic;
using CosplayDate.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CosplayDate.Infrastructure.Data.Context;

public partial class CosplayDateDbContext : DbContext
{
    public CosplayDateDbContext()
    {
    }

    public CosplayDateDbContext(DbContextOptions<CosplayDateDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<Cosplayer> Cosplayers { get; set; }

    public virtual DbSet<CosplayerPhoto> CosplayerPhotos { get; set; }

    public virtual DbSet<CosplayerService> CosplayerServices { get; set; }

    public virtual DbSet<CosplayerSpecialty> CosplayerSpecialties { get; set; }

    public virtual DbSet<CosplayerVideo> CosplayerVideos { get; set; }

    public virtual DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<EventParticipant> EventParticipants { get; set; }

    public virtual DbSet<Favorite> Favorites { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<MessageReadReceipt> MessageReadReceipts { get; set; }

    public virtual DbSet<News> News { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PhotoLike> PhotoLikes { get; set; }

    public virtual DbSet<PhotoTag> PhotoTags { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<ReviewHelpfulVote> ReviewHelpfulVotes { get; set; }

    public virtual DbSet<ReviewTag> ReviewTags { get; set; }

    public virtual DbSet<SystemSetting> SystemSettings { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserFollow> UserFollows { get; set; }

    public virtual DbSet<UserInterest> UserInterests { get; set; }

    public virtual DbSet<UserSession> UserSessions { get; set; }

    public virtual DbSet<WalletTransaction> WalletTransactions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=(local);Database=CosplayDateDB;User Id=sa;Password=12345;TrustServerCertificate=true;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Bookings__3214EC07CD603422");

            entity.HasIndex(e => e.BookingDate, "IX_Bookings_BookingDate");

            entity.HasIndex(e => e.CosplayerId, "IX_Bookings_CosplayerId");

            entity.HasIndex(e => e.CustomerId, "IX_Bookings_CustomerId");

            entity.HasIndex(e => e.Status, "IX_Bookings_Status");

            entity.HasIndex(e => e.BookingCode, "UQ__Bookings__C6E56BD511E8ACFC").IsUnique();

            entity.Property(e => e.BookingCode).HasMaxLength(20);
            entity.Property(e => e.CancellationReason).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Location).HasMaxLength(500);
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.ServiceType).HasMaxLength(100);
            entity.Property(e => e.SpecialNotes).HasMaxLength(1000);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__Cospla__1F98B2C1");

            entity.HasOne(d => d.Customer).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookings__Custom__1EA48E88");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Conversa__3214EC07E2AB6803");

            entity.HasIndex(e => e.CosplayerId, "IX_Conversations_CosplayerId");

            entity.HasIndex(e => e.CustomerId, "IX_Conversations_CustomerId");

            entity.HasIndex(e => e.LastMessageAt, "IX_Conversations_LastMessageAt").IsDescending();

            entity.HasIndex(e => new { e.CustomerId, e.CosplayerId }, "UQ__Conversa__0C14540A7F1AC4CD").IsUnique();

            entity.Property(e => e.CosplayerUnreadCount).HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CustomerUnreadCount).HasDefaultValue(0);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.ConversationCosplayers)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Conversat__Cospl__08B54D69");

            entity.HasOne(d => d.Customer).WithMany(p => p.ConversationCustomers)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Conversat__Custo__07C12930");

            entity.HasOne(d => d.LastMessage).WithMany(p => p.Conversations)
                .HasForeignKey(d => d.LastMessageId)
                .HasConstraintName("FK_Conversations_LastMessage");
        });

        modelBuilder.Entity<Cosplayer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cosplaye__3214EC07ADCE4DE7");

            entity.HasIndex(e => e.Category, "IX_Cosplayers_Category");

            entity.HasIndex(e => e.CharacterSpecialty, "IX_Cosplayers_CharacterSpecialty");

            entity.HasIndex(e => e.IsAvailable, "IX_Cosplayers_IsAvailable");

            entity.HasIndex(e => e.Rating, "IX_Cosplayers_Rating").IsDescending();

            entity.HasIndex(e => e.UserId, "UQ__Cosplaye__1788CC4DC8B670FC").IsUnique();

            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CharacterSpecialty).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.DisplayName).HasMaxLength(100);
            entity.Property(e => e.FollowersCount).HasDefaultValue(0);
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.PricePerHour).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Rating)
                .HasDefaultValue(0.0m)
                .HasColumnType("decimal(3, 2)");
            entity.Property(e => e.ResponseTime)
                .HasMaxLength(50)
                .HasDefaultValue("< 1 hour");
            entity.Property(e => e.SuccessRate)
                .HasDefaultValue(0.0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.TotalReviews).HasDefaultValue(0);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithOne(p => p.Cosplayer)
                .HasForeignKey<Cosplayer>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Cosplayer__UserI__5AEE82B9");
        });

        modelBuilder.Entity<CosplayerPhoto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cosplaye__3214EC07ABCF1D15");

            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
            entity.Property(e => e.IsPortfolio).HasDefaultValue(false);
            entity.Property(e => e.LikesCount).HasDefaultValue(0);
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.ViewsCount).HasDefaultValue(0);

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.CosplayerPhotos)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Cosplayer__Cospl__693CA210");
        });

        modelBuilder.Entity<CosplayerService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cosplaye__3214EC0721A51E0C");

            entity.Property(e => e.ServiceDescription).HasMaxLength(500);
            entity.Property(e => e.ServiceName).HasMaxLength(100);

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.CosplayerServices)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Cosplayer__Cospl__619B8048");
        });

        modelBuilder.Entity<CosplayerSpecialty>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cosplaye__3214EC075D47F902");

            entity.HasIndex(e => new { e.CosplayerId, e.Specialty }, "UQ__Cosplaye__79169320E3619B50").IsUnique();

            entity.Property(e => e.Specialty).HasMaxLength(100);

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.CosplayerSpecialties)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Cosplayer__Cospl__5EBF139D");
        });

        modelBuilder.Entity<CosplayerVideo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cosplaye__3214EC07E4899EBE");

            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.DisplayOrder).HasDefaultValue(0);
            entity.Property(e => e.LikesCount).HasDefaultValue(0);
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.VideoUrl).HasMaxLength(500);
            entity.Property(e => e.ViewCount).HasDefaultValue(0);

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.CosplayerVideos)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Cosplayer__Cospl__787EE5A0");
        });

        modelBuilder.Entity<EmailVerificationToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__EmailVer__3214EC0734806215");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.Token).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.EmailVerificationTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__EmailVeri__UserI__4F7CD00D");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Events__3214EC072B3F73D6");

            entity.HasIndex(e => e.EventDate, "IX_Events_EventDate");

            entity.HasIndex(e => e.EventType, "IX_Events_EventType");

            entity.HasIndex(e => e.IsActive, "IX_Events_IsActive");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CurrentParticipants).HasDefaultValue(0);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.EntryFee)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.EventType).HasMaxLength(50);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<EventParticipant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__EventPar__3214EC0781E7CCD3");

            entity.HasIndex(e => new { e.EventId, e.UserId }, "UQ__EventPar__A83C44D55825C1F9").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ParticipationType)
                .HasMaxLength(50)
                .HasDefaultValue("attendee");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("registered");

            entity.HasOne(d => d.Event).WithMany(p => p.EventParticipants)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__EventPart__Event__59C55456");

            entity.HasOne(d => d.User).WithMany(p => p.EventParticipants)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__EventPart__UserI__5AB9788F");
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Favorite__3214EC0782589EAE");

            entity.HasIndex(e => e.CustomerId, "IX_Favorites_CustomerId");

            entity.HasIndex(e => new { e.CustomerId, e.CosplayerId }, "UQ__Favorite__0C14540AAEBD8AFD").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.Favorites)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Favorites__Cospl__43D61337");

            entity.HasOne(d => d.Customer).WithMany(p => p.Favorites)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Favorites__Custo__42E1EEFE");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Messages__3214EC076252B8DF");

            entity.ToTable(tb => tb.HasTrigger("TR_Messages_UpdateConversation"));

            entity.HasIndex(e => e.ConversationId, "IX_Messages_ConversationId");

            entity.HasIndex(e => e.CreatedAt, "IX_Messages_CreatedAt").IsDescending();

            entity.HasIndex(e => e.IsRead, "IX_Messages_IsRead");

            entity.HasIndex(e => e.SenderId, "IX_Messages_SenderId");

            entity.Property(e => e.AttachmentUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsEdited).HasDefaultValue(false);
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.MessageText).HasMaxLength(2000);
            entity.Property(e => e.MessageType)
                .HasMaxLength(20)
                .HasDefaultValue("text");

            entity.HasOne(d => d.Conversation).WithMany(p => p.Messages)
                .HasForeignKey(d => d.ConversationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Messages__Conver__0F624AF8");

            entity.HasOne(d => d.ReplyToMessage).WithMany(p => p.InverseReplyToMessage)
                .HasForeignKey(d => d.ReplyToMessageId)
                .HasConstraintName("FK__Messages__ReplyT__114A936A");

            entity.HasOne(d => d.Sender).WithMany(p => p.Messages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Messages__Sender__10566F31");
        });

        modelBuilder.Entity<MessageReadReceipt>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__MessageR__3214EC074E95A8E2");

            entity.HasIndex(e => new { e.MessageId, e.UserId }, "UQ__MessageR__190480590BB02837").IsUnique();

            entity.Property(e => e.ReadAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Message).WithMany(p => p.MessageReadReceipts)
                .HasForeignKey(d => d.MessageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__MessageRe__Messa__160F4887");

            entity.HasOne(d => d.User).WithMany(p => p.MessageReadReceipts)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__MessageRe__UserI__17036CC0");
        });

        modelBuilder.Entity<News>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__News__3214EC07946F66D4");

            entity.Property(e => e.Author).HasMaxLength(100);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PublishedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Summary).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ViewCount).HasDefaultValue(0);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Notifica__3214EC074D223B82");

            entity.HasIndex(e => e.CreatedAt, "IX_Notifications_CreatedAt").IsDescending();

            entity.HasIndex(e => e.IsRead, "IX_Notifications_IsRead");

            entity.HasIndex(e => e.UserId, "IX_Notifications_UserId");

            entity.Property(e => e.ActionUrl).HasMaxLength(500);
            entity.Property(e => e.Content).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificat__UserI__4C6B5938");
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Password__3214EC07B55EE026");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.Token).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResetTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PasswordR__UserI__4AB81AF0");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Payments__3214EC07BD379C51");

            entity.HasIndex(e => e.BookingId, "IX_Payments_BookingId");

            entity.HasIndex(e => e.Status, "IX_Payments_Status");

            entity.HasIndex(e => e.PaymentCode, "UQ__Payments__106D3BA8672B5F6A").IsUnique();

            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.NetAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PaymentCode).HasMaxLength(50);
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.ProcessingFee)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.TransactionId).HasMaxLength(200);

            entity.HasOne(d => d.Booking).WithMany(p => p.Payments)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__Bookin__3864608B");
        });

        modelBuilder.Entity<PhotoLike>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PhotoLik__3214EC079683F376");

            entity.ToTable(tb => tb.HasTrigger("TR_PhotoLikes_UpdateCount"));

            entity.HasIndex(e => e.PhotoId, "IX_PhotoLikes_PhotoId");

            entity.HasIndex(e => e.UserId, "IX_PhotoLikes_UserId");

            entity.HasIndex(e => new { e.PhotoId, e.UserId }, "UQ__PhotoLik__F0CF392760E4DD51").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Photo).WithMany(p => p.PhotoLikes)
                .HasForeignKey(d => d.PhotoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PhotoLike__Photo__70DDC3D8");

            entity.HasOne(d => d.User).WithMany(p => p.PhotoLikes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PhotoLike__UserI__71D1E811");
        });

        modelBuilder.Entity<PhotoTag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PhotoTag__3214EC07BF6915E4");

            entity.Property(e => e.Tag).HasMaxLength(50);

            entity.HasOne(d => d.Photo).WithMany(p => p.PhotoTags)
                .HasForeignKey(d => d.PhotoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PhotoTags__Photo__6C190EBB");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reviews__3214EC076A65565C");

            entity.HasIndex(e => e.CosplayerId, "IX_Reviews_CosplayerId");

            entity.HasIndex(e => e.CreatedAt, "IX_Reviews_CreatedAt").IsDescending();

            entity.HasIndex(e => e.Rating, "IX_Reviews_Rating");

            entity.HasIndex(e => e.BookingId, "UQ__Reviews__73951AECBBF74741").IsUnique();

            entity.Property(e => e.Comment).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.HelpfulCount).HasDefaultValue(0);
            entity.Property(e => e.IsVerified).HasDefaultValue(true);
            entity.Property(e => e.OwnerResponse).HasMaxLength(1000);

            entity.HasOne(d => d.Booking).WithOne(p => p.Review)
                .HasForeignKey<Review>(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__Booking__2739D489");

            entity.HasOne(d => d.Cosplayer).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.CosplayerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__Cosplay__29221CFB");

            entity.HasOne(d => d.Customer).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Reviews__Custome__282DF8C2");
        });

        modelBuilder.Entity<ReviewHelpfulVote>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ReviewHe__3214EC076BDAAFB6");

            entity.HasIndex(e => new { e.ReviewId, e.UserId }, "UQ__ReviewHe__A5C4F50B83500551").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Review).WithMany(p => p.ReviewHelpfulVotes)
                .HasForeignKey(d => d.ReviewId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReviewHel__Revie__30C33EC3");

            entity.HasOne(d => d.User).WithMany(p => p.ReviewHelpfulVotes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReviewHel__UserI__31B762FC");
        });

        modelBuilder.Entity<ReviewTag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ReviewTa__3214EC072AD54D7F");

            entity.Property(e => e.Tag).HasMaxLength(50);

            entity.HasOne(d => d.Review).WithMany(p => p.ReviewTags)
                .HasForeignKey(d => d.ReviewId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReviewTag__Revie__2BFE89A6");
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SystemSe__3214EC070067C527");

            entity.HasIndex(e => e.SettingKey, "UQ__SystemSe__01E719AD5519F677").IsUnique();

            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.SettingKey).HasMaxLength(100);
            entity.Property(e => e.SettingValue).HasMaxLength(1000);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3214EC0797384CF7");

            entity.HasIndex(e => e.Email, "IX_Users_Email");

            entity.HasIndex(e => e.IsOnline, "IX_Users_IsOnline");

            entity.HasIndex(e => e.UserType, "IX_Users_UserType");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053448C6A63F").IsUnique();

            entity.Property(e => e.AvatarUrl).HasMaxLength(500);
            entity.Property(e => e.Bio).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsOnline).HasDefaultValue(false);
            entity.Property(e => e.IsVerified).HasDefaultValue(false);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.LoyaltyPoints).HasDefaultValue(0);
            entity.Property(e => e.MembershipTier)
                .HasMaxLength(20)
                .HasDefaultValue("Bronze");
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.ProfileCompleteness)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(5, 2)");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UserType)
                .HasMaxLength(20)
                .HasDefaultValue("Customer");
            entity.Property(e => e.WalletBalance)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserFoll__3214EC07697D9CEF");

            entity.HasIndex(e => e.FollowedId, "IX_UserFollows_FollowedId");

            entity.HasIndex(e => e.FollowerId, "IX_UserFollows_FollowerId");

            entity.HasIndex(e => new { e.FollowerId, e.FollowedId }, "UQ__UserFoll__F7A5FC9EC9A8DB8D").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Followed).WithMany(p => p.UserFollowFolloweds)
                .HasForeignKey(d => d.FollowedId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserFollo__Follo__7E37BEF6");

            entity.HasOne(d => d.Follower).WithMany(p => p.UserFollowFollowers)
                .HasForeignKey(d => d.FollowerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserFollo__Follo__7D439ABD");
        });

        modelBuilder.Entity<UserInterest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserInte__3214EC077213D4D2");

            entity.HasIndex(e => new { e.UserId, e.Interest }, "UQ__UserInte__7B88AA10BE90D834").IsUnique();

            entity.Property(e => e.Interest).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.UserInterests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserInter__UserI__47A6A41B");
        });

        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserSess__3214EC07E22530D5");

            entity.HasIndex(e => e.Token, "IX_UserSessions_Token");

            entity.HasIndex(e => e.UserId, "IX_UserSessions_UserId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Token).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.UserSessions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserSessi__UserI__45F365D3");
        });

        modelBuilder.Entity<WalletTransaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__WalletTr__3214EC076EFFC5CF");

            entity.HasIndex(e => e.CreatedAt, "IX_WalletTransactions_CreatedAt").IsDescending();

            entity.HasIndex(e => e.UserId, "IX_WalletTransactions_UserId");

            entity.HasIndex(e => e.TransactionCode, "UQ__WalletTr__D85E70267043D040").IsUnique();

            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BalanceAfter).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ReferenceId).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Completed");
            entity.Property(e => e.TransactionCode).HasMaxLength(50);
            entity.Property(e => e.Type).HasMaxLength(30);

            entity.HasOne(d => d.User).WithMany(p => p.WalletTransactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__WalletTra__UserI__3E1D39E1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
