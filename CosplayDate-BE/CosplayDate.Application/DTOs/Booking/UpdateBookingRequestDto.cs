using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Booking
{
    public class UpdateBookingRequestDto
    {
        public DateOnly? BookingDate { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public string? Location { get; set; }
        public string? SpecialNotes { get; set; }
    }
}
