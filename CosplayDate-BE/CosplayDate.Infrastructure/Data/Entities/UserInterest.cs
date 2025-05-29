using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class UserInterest
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Interest { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
