using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class WalletInfoResponseDto
    {
        public decimal Balance { get; set; }
        public int LoyaltyPoints { get; set; }
        public string MembershipTier { get; set; } = string.Empty;
        public List<WalletTransactionDto> RecentTransactions { get; set; } = new();
        public WalletStatsDto Stats { get; set; } = new();
    }
}
