using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace CosplayDate.Infrastructure.Data.Repositories
{
    public class BookingRepository : Repository<Booking>, IBookingRepository
    {
        public BookingRepository(CosplayDateDbContext context) : base(context)
        {
        }

        // Override GetByIdAsync to include Cosplayer relationship
        public override async Task<Booking?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(b => b.Cosplayer)
                .Include(b => b.Customer)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        // Additional method to get booking with all relationships if needed
        public async Task<Booking?> GetBookingWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(b => b.Cosplayer)
                .Include(b => b.Customer)
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == id);
        }
    }
}