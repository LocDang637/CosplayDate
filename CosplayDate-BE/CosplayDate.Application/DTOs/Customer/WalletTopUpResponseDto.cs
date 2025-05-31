using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class WalletTopUpResponseDto
    {
        public string TransactionCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal NewBalance { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? PaymentUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
