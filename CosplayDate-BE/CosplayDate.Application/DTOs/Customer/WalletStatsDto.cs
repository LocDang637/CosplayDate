using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class WalletStatsDto
    {
        public decimal TotalTopUps { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal TotalRefunds { get; set; }
        public int TransactionCount { get; set; }
    }
}
