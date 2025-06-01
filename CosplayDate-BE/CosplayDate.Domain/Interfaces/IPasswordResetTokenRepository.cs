using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Domain.Interfaces
{
    public interface IPasswordResetTokenRepository : IRepository<PasswordResetToken>
    {
        Task<PasswordResetToken?> GetValidTokenAsync(int userId, string token);
        Task<PasswordResetToken?> GetRecentTokenAsync(int userId, TimeSpan timeSpan);
        Task InvalidateUserTokensAsync(int userId);
    }
}
