using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Payment
{
    public class CreatePaymentRequestDto
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(1000, 50000000, ErrorMessage = "Amount must be between 1,000 and 50,000,000 VND")]
        public int Amount { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [StringLength(200, ErrorMessage = "Buyer name cannot exceed 200 characters")]
        public string? BuyerName { get; set; }

        [StringLength(255, ErrorMessage = "Buyer email cannot exceed 255 characters")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? BuyerEmail { get; set; }

        [StringLength(15, ErrorMessage = "Buyer phone cannot exceed 15 characters")]
        public string? BuyerPhone { get; set; }
    }

    public class CreatePaymentResponseDto
    {
        public string PaymentLinkId { get; set; } = string.Empty;
        public long OrderCode { get; set; }
        public string CheckoutUrl { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public long? ExpiredAt { get; set; }
    }
}
