using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowListRequestDto
    {
        public int Page { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 20;

        public string? Status { get; set; } // "Held", "Released", "Refunded", or null for all

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }

        public string? SearchTerm { get; set; } // Search in booking code, customer name, etc.

        public string SortBy { get; set; } = "CreatedAt"; // "CreatedAt", "Amount", "Status"
        public string SortDirection { get; set; } = "DESC"; // "ASC" or "DESC"
    }

}
