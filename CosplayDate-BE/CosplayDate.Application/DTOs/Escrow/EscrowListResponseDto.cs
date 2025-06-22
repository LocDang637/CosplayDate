using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Escrow
{
    public class EscrowListResponseDto
    {
        public List<EscrowTransactionDto> Escrows { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }

        // Summary for current filter
        public EscrowSummaryDto Summary { get; set; } = new();
    }
}
