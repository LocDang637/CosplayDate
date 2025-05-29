using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class UserFollow
{
    public int Id { get; set; }

    public int FollowerId { get; set; }

    public int FollowedId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Followed { get; set; } = null!;

    public virtual User Follower { get; set; } = null!;
}
