using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class CosplayerPhoto
{
    public int Id { get; set; }

    public int CosplayerId { get; set; }

    public string PhotoUrl { get; set; } = null!;

    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Category { get; set; }

    public bool? IsPortfolio { get; set; }

    public int? DisplayOrder { get; set; }

    public int? LikesCount { get; set; }

    public int? ViewsCount { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Cosplayer Cosplayer { get; set; } = null!;

    public virtual ICollection<PhotoLike> PhotoLikes { get; set; } = new List<PhotoLike>();

    public virtual ICollection<PhotoTag> PhotoTags { get; set; } = new List<PhotoTag>();
}
