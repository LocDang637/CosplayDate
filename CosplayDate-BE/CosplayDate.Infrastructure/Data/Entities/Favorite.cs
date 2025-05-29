using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class Favorite
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public int CosplayerId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Cosplayer Cosplayer { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;
}
