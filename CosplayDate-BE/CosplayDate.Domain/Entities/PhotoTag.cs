using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class PhotoTag
{
    public int Id { get; set; }

    public int PhotoId { get; set; }

    public string Tag { get; set; } = null!;

    public virtual CosplayerPhoto Photo { get; set; } = null!;
}
