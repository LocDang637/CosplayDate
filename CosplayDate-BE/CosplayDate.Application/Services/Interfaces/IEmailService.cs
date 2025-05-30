using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendVerificationEmailAsync(string email, string verificationCode, string firstName);
        Task<bool> SendWelcomeEmailAsync(string email, string firstName);
    }
}
