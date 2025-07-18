﻿using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore.Storage;

namespace CosplayDate.Infrastructure.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly CosplayDateDbContext _context;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(CosplayDateDbContext context)
        {
            _context = context;
            Users = new UserRepository(_context);
            EmailVerificationTokens = new EmailVerificationTokenRepository(_context);
            PasswordResetTokens = new PasswordResetTokenRepository(_context);

            Bookings = new BookingRepository(_context);
            Payments = new Repository<Payment>(_context);              // ADD THIS LINE
            EscrowTransactions = new Repository<EscrowTransaction>(_context); // ADD THIS LINE
            Reviews = new Repository<Review>(_context);
            WalletTransactions = new Repository<WalletTransaction>(_context);
            UserFollows = new Repository<UserFollow>(_context);
            UserInterests = new Repository<UserInterest>(_context);
            Favorites = new Repository<Favorite>(_context);
            Cosplayers = new Repository<Cosplayer>(_context);
            EventParticipants = new Repository<EventParticipant>(_context);
            PhotoLikes = new Repository<PhotoLike>(_context);
        }

        public IUserRepository Users { get; private set; }
        public IEmailVerificationTokenRepository EmailVerificationTokens { get; private set; }
        public IPasswordResetTokenRepository PasswordResetTokens { get; private set; }

        public IBookingRepository Bookings { get; private set; }
        public IRepository<Payment> Payments { get; private set; }              // ADD THIS LINE
        public IRepository<EscrowTransaction> EscrowTransactions { get; private set; } // ADD THIS LINE
        public IRepository<Review> Reviews { get; private set; }
        public IRepository<WalletTransaction> WalletTransactions { get; private set; }
        public IRepository<UserFollow> UserFollows { get; private set; }
        public IRepository<UserInterest> UserInterests { get; private set; }
        public IRepository<Favorite> Favorites { get; private set; }
        public IRepository<Cosplayer> Cosplayers { get; private set; }
        public IRepository<EventParticipant> EventParticipants { get; private set; }
        public IRepository<PhotoLike> PhotoLikes { get; private set; }
        public IRepository<ReviewTag> ReviewTags => Repository<ReviewTag>();

        public IRepository<T> Repository<T>() where T : class
        {
            return new Repository<T>(_context);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }

        public void Clear()
        {
            _context.ChangeTracker.Clear();
        }
    }
}