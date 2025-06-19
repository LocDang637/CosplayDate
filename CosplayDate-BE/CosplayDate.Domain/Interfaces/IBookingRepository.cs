using CosplayDate.Domain.Entities;

namespace CosplayDate.Domain.Interfaces
{
    public interface IBookingRepository : IRepository<Booking>
    {
        Task<Booking?> GetBookingWithDetailsAsync(int id);
    }
}