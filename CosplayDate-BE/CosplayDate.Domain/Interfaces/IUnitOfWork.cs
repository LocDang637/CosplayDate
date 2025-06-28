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
        IPasswordResetTokenRepository PasswordResetTokens { get; }

        IBookingRepository Bookings { get; }
        IRepository<Payment> Payments { get; }              // ADD THIS LINE
        IRepository<EscrowTransaction> EscrowTransactions { get; } // ADD THIS LINE
        IRepository<Review> Reviews { get; }
        IRepository<WalletTransaction> WalletTransactions { get; }
        IRepository<UserFollow> UserFollows { get; }
        IRepository<UserInterest> UserInterests { get; }
        IRepository<Favorite> Favorites { get; }
        IRepository<Cosplayer> Cosplayers { get; }
        IRepository<EventParticipant> EventParticipants { get; }
        IRepository<PhotoLike> PhotoLikes { get; }
        IRepository<T> Repository<T>() where T : class;
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
        void Clear();

    }

}
