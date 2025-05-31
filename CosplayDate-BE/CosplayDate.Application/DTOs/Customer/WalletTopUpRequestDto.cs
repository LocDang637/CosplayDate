using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Customer
{
    public class WalletTopUpRequestDto
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(10000, 10000000, ErrorMessage = "Amount must be between 10,000 and 10,000,000 VND")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Payment method is required")]
        [StringLength(50, ErrorMessage = "Payment method cannot exceed 50 characters")]
        public string PaymentMethod { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}
