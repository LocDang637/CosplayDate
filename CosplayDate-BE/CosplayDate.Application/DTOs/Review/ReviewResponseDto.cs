using System;
using System.Collections.Generic;

namespace CosplayDate.Application.DTOs.Review
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public int CosplayerId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public bool? IsVerified { get; set; }
        public int? HelpfulCount { get; set; }
        public string? OwnerResponse { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<string> Tags { get; set; } = new();
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerAvatarUrl { get; set; }
        public string? ServiceType { get; set; }
    }
}