using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class CosplayerSpecialty
{
    public int Id { get; set; }

    public int CosplayerId { get; set; }

    public string Specialty { get; set; } = null!;

    public virtual Cosplayer Cosplayer { get; set; } = null!;
}
