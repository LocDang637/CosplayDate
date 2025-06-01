using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.User
{
    public class UpdateUserInterestsRequestDto
    {
        [Required(ErrorMessage = "Interests list is required")]
        public List<string> Interests { get; set; } = new();
    }
}
