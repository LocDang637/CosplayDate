using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowActionResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? TransactionCode { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string? NewStatus { get; set; }
    }
}
