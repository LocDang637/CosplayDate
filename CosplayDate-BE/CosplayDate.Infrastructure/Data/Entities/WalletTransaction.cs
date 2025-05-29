using System;
using System.Collections.Generic;

namespace CosplayDate.Infrastructure.Data.Entities;

public partial class WalletTransaction
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string TransactionCode { get; set; } = null!;

    public string Type { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Description { get; set; } = null!;

    public string? ReferenceId { get; set; }

    public string Status { get; set; } = null!;

    public decimal BalanceAfter { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
