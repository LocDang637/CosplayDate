using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class PhotoLike
{
    public int Id { get; set; }

    public int PhotoId { get; set; }

    public int UserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual CosplayerPhoto Photo { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
