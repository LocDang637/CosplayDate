using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class WalletTransactionDto
    {
        public int Id { get; set; }
        public string TransactionCode { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? ReferenceId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal BalanceAfter { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CosplayerName { get; set; }
    }
}
