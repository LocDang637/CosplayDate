using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IEmailVerificationTokenRepository EmailVerificationTokens { get; }
        // ... other repositories

        IRepository<Booking> Bookings { get; }
        IRepository<Review> Reviews { get; }
        IRepository<WalletTransaction> WalletTransactions { get; }
        IRepository<UserFollow> UserFollows { get; }
        IRepository<UserInterest> UserInterests { get; }
        IRepository<Favorite> Favorites { get; }
        IRepository<Cosplayer> Cosplayers { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
