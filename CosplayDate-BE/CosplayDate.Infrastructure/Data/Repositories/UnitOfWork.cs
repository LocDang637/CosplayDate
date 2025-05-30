using CosplayDate.Domain.Interfaces;
using CosplayDate.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        }

        public IUserRepository Users { get; private set; }
        public IEmailVerificationTokenRepository EmailVerificationTokens { get; private set; }

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
    }
}
