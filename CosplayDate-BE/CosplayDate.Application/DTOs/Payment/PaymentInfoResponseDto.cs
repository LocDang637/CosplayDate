using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Payment
{
    public class PaymentInfoResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public int AmountPaid { get; set; }
        public int AmountRemaining { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public List<TransactionDto> Transactions { get; set; } = new();
        public string? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
    }

    public class TransactionDto
    {
        public string Reference { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TransactionDateTime { get; set; } = string.Empty;
        public string? VirtualAccountName { get; set; }
        public string? VirtualAccountNumber { get; set; }
        public string? CounterAccountBankId { get; set; }
        public string? CounterAccountBankName { get; set; }
        public string? CounterAccountName { get; set; }
        public string? CounterAccountNumber { get; set; }
    }
}
