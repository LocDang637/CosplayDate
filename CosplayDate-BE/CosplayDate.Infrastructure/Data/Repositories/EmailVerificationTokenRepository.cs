using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Infrastructure.Data.Repositories
{
    public class EmailVerificationTokenRepository : Repository<EmailVerificationToken>, IEmailVerificationTokenRepository
    {
        public EmailVerificationTokenRepository(CosplayDateDbContext context) : base(context)
        {
        }

        public async Task<EmailVerificationToken?> GetValidTokenAsync(int userId, string token)
        {
            return await _dbSet
                .FirstOrDefaultAsync(t =>
                    t.UserId == userId &&
                    t.Token == token &&
                    !t.IsUsed.HasValue || !t.IsUsed.Value &&
                    t.ExpiresAt > DateTime.UtcNow);
        }

        public async Task<EmailVerificationToken?> GetRecentTokenAsync(int userId, TimeSpan timeSpan)
        {
            var cutoffTime = DateTime.UtcNow.Subtract(timeSpan);
            return await _dbSet
                .Where(t => t.UserId == userId && t.CreatedAt > cutoffTime)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task InvalidateUserTokensAsync(int userId)
        {
            var tokens = await _dbSet
                .Where(t => t.UserId == userId && (!t.IsUsed.HasValue || !t.IsUsed.Value))
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsUsed = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
