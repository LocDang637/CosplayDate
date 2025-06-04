using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Payment
{
    public class VerifyTransactionResponseDto
    {
        public bool IsVerified { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public long? OrderCode { get; set; }
        public int? Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? VerifiedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
