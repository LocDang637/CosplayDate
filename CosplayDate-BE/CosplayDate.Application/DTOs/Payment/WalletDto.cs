using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Payment
{
    public class WalletTopUpRequestDto
    {
        [Required(ErrorMessage = "Package is required")]
        [StringLength(50, ErrorMessage = "Package cannot exceed 50 characters")]
        public string Package { get; set; } = string.Empty; // "20K", "50K", "100K", "200K", "500K"
    }

    public class WalletTopUpResponseDto
    {
        public string PaymentLinkId { get; set; } = string.Empty;
        public long OrderCode { get; set; }
        public string CheckoutUrl { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty;
        public int PaymentAmount { get; set; } // Amount user pays in VND
        public int DigitalAmount { get; set; } // Digital balance user receives
        public string Package { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class WalletBalanceResponseDto
    {
        public decimal Balance { get; set; }
        public string Currency { get; set; } = "VND";
        public int LoyaltyPoints { get; set; }
        public string MembershipTier { get; set; } = string.Empty;
        public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    }

    public class RecentTransactionDto
    {
        public string TransactionCode { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
