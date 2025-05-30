using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CosplayDate.Domain.Interfaces;

namespace CosplayDate.Infrastructure.Data.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(CosplayDateDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> ExistsAsync(string email)
        {
            return await _dbSet
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User?> GetUserWithTokensAsync(int userId)
        {
            return await _dbSet
                .Include(u => u.EmailVerificationTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}
