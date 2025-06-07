using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Booking
{
    public class CancelBookingRequestDto
    {
        [Required(ErrorMessage = "Cancellation reason is required")]
        [StringLength(500, ErrorMessage = "Cancellation reason cannot exceed 500 characters")]
        public string CancellationReason { get; set; } = string.Empty;
    }
}
