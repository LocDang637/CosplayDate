using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class Cosplayer
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string DisplayName { get; set; } = null!;

    public decimal PricePerHour { get; set; }

    public string Category { get; set; } = null!;

    public string? Gender { get; set; }

    public string? CharacterSpecialty { get; set; }

    public string? Tags { get; set; }

    public decimal? Rating { get; set; }

    public int? TotalReviews { get; set; }

    public int? FollowersCount { get; set; }

    public string? ResponseTime { get; set; }

    public decimal? SuccessRate { get; set; }

    public bool? IsAvailable { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<CosplayerPhoto> CosplayerPhotos { get; set; } = new List<CosplayerPhoto>();

    public virtual ICollection<CosplayerService> CosplayerServices { get; set; } = new List<CosplayerService>();

    public virtual ICollection<CosplayerSpecialty> CosplayerSpecialties { get; set; } = new List<CosplayerSpecialty>();

    public virtual ICollection<CosplayerVideo> CosplayerVideos { get; set; } = new List<CosplayerVideo>();

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; } = null!;
}
