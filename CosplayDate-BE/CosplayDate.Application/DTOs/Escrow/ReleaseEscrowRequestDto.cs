using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class ReleaseEscrowRequestDto
    {
        [Required]
        public int EscrowId { get; set; }

        public string? CompletionNotes { get; set; }
    }
}
