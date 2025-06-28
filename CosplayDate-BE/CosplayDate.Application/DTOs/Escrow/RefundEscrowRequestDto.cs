using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class RefundEscrowRequestDto
    {
        [Required]
        public int EscrowId { get; set; }

        [Required]
        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string Reason { get; set; } = string.Empty;

        public string? AdminNotes { get; set; }
    }

}
