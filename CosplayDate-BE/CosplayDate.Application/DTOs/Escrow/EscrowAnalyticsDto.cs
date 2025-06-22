using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowAnalyticsDto
    {
        public decimal TotalVolumeToday { get; set; }
        public decimal TotalVolumeThisWeek { get; set; }
        public decimal TotalVolumeThisMonth { get; set; }

        public int TransactionsToday { get; set; }
        public int TransactionsThisWeek { get; set; }
        public int TransactionsThisMonth { get; set; }

        public decimal AverageEscrowAmount { get; set; }
        public double AverageHoldTime { get; set; } // in hours

        public double ReleaseRate { get; set; } // percentage of escrows that are released vs refunded
        public double RefundRate { get; set; }

        public List<EscrowVolumeByDate> VolumeByDate { get; set; } = new();
        public List<EscrowStatusBreakdown> StatusBreakdown { get; set; } = new();
    }

    public class EscrowVolumeByDate
    {
        public DateTime Date { get; set; }
        public decimal Volume { get; set; }
        public int Count { get; set; }
    }

    public class EscrowStatusBreakdown
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
        public double Percentage { get; set; }
    }
}
