using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class CosplayerVideo
{
    public int Id { get; set; }

    public int CosplayerId { get; set; }

    public string VideoUrl { get; set; } = null!;

    public string? ThumbnailUrl { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Category { get; set; }

    public int? Duration { get; set; }

    public int? ViewCount { get; set; }

    public int? LikesCount { get; set; }

    public int? DisplayOrder { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Cosplayer Cosplayer { get; set; } = null!;
}
