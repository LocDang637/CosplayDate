using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.DTOs.Auth
{
    public class RegisterRequestDto
    {
        [Required(ErrorMessage = "Yêu cầu tên")]
        [StringLength(50, ErrorMessage = "Tên không được quá 50 ký tự")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Yêu cầu họ")]
        [StringLength(50, ErrorMessage = "Họ không được quá 50 ký tự")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Yêu cầu email")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [StringLength(255, ErrorMessage = "Email không được quá 255 ký tự")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Yêu cầu mật khẩu")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Yêu cầu ngày sinh")]
        [DataType(DataType.Date)]
        public DateOnly DateOfBirth { get; set; }

        public string? Location { get; set; }
        public string? Bio { get; set; }

        [Required(ErrorMessage = "Bạn phải đồng ý với các điều khoản")]
        public bool AcceptTerms { get; set; }

        [Required(ErrorMessage = "Yêu cầu loại người dùng")]
        [RegularExpression("Customer|Cosplayer|Khách hàng", ErrorMessage = "Loại người dùng phải là 'Customer', 'Cosplayer' hoặc 'Khách hàng'")]
        public string UserType { get; set; } = "Customer"; // Default to English "Customer"
    }
}
