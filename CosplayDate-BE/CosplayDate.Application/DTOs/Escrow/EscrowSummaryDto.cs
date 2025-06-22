using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowSummaryDto
    {
        public int TotalEscrows { get; set; }
        public int HeldEscrows { get; set; }
        public int ReleasedEscrows { get; set; }
        public int RefundedEscrows { get; set; }
        public decimal TotalHeldAmount { get; set; }
        public decimal TotalReleasedAmount { get; set; }
        public decimal TotalRefundedAmount { get; set; }
    }
}
