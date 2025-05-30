using System;
using System.Collections.Generic;

namespace CosplayDate.Domain.Entities;


public partial class News
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Content { get; set; }

    public string? Summary { get; set; }

    public string? ImageUrl { get; set; }

    public string? Author { get; set; }

    public string? Category { get; set; }

    public int? ViewCount { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? PublishedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
