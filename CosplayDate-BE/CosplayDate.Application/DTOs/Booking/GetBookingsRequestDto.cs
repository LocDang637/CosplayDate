using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Booking
{
    public class GetBookingsRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
        public int PageSize { get; set; } = 20;

        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
        public string? SortBy { get; set; } = "created_date"; // created_date, booking_date, total_price
        public string? SortOrder { get; set; } = "desc"; // asc, desc
    }
}
