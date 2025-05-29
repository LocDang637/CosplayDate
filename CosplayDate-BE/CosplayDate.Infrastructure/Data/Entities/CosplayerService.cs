using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class CosplayerService
{
    public int Id { get; set; }

    public int CosplayerId { get; set; }

    public string ServiceName { get; set; } = null!;

    public string? ServiceDescription { get; set; }

    public virtual Cosplayer Cosplayer { get; set; } = null!;
}
