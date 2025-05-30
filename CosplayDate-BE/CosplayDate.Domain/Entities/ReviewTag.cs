using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class ReviewTag
{
    public int Id { get; set; }

    public int ReviewId { get; set; }

    public string Tag { get; set; } = null!;

    public virtual Review Review { get; set; } = null!;
}
