using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Booking
{
    public class CreateBookingRequestDto
    {
        [Required(ErrorMessage = "Cosplayer ID is required")]
        public int CosplayerId { get; set; }

        [Required(ErrorMessage = "Service type is required")]
        [StringLength(100, ErrorMessage = "Service type cannot exceed 100 characters")]
        public string ServiceType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Booking date is required")]
        public DateOnly BookingDate { get; set; }

        [Required(ErrorMessage = "Start time is required")]
        public string StartTime { get; set; } = string.Empty; // Change to string

        [Required(ErrorMessage = "End time is required")]
        public string EndTime { get; set; } = string.Empty; // Change to string

        [Required(ErrorMessage = "Location is required")]
        [StringLength(500, ErrorMessage = "Location cannot exceed 500 characters")]
        public string Location { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Special notes cannot exceed 1000 characters")]
        public string? SpecialNotes { get; set; }

        // Helper properties to convert strings to TimeOnly
        public TimeOnly StartTimeOnly => TimeOnly.Parse(StartTime);
        public TimeOnly EndTimeOnly => TimeOnly.Parse(EndTime);
    }
}
