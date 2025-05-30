using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Domain.Interfaces
{
    public interface IEmailVerificationTokenRepository : IRepository<EmailVerificationToken>
    {
        Task<EmailVerificationToken?> GetValidTokenAsync(int userId, string token);
        Task<EmailVerificationToken?> GetRecentTokenAsync(int userId, TimeSpan timeSpan);
        Task InvalidateUserTokensAsync(int userId);
    }
}
