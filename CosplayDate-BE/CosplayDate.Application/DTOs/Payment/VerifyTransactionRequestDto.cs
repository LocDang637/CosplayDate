using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Payment
{
    public class VerifyTransactionRequestDto
    {
        [Required]
        [StringLength(50)]
        public string TransactionId { get; set; } = string.Empty;

        public string? OrderCode { get; set; }
    }
}
