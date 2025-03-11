using backend.Data;
using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.PropertyService
{
    public class PropertyService : IPropertyService
    {
        private readonly DataContext _context;
        public PropertyService(DataContext context)
        {
            _context = context;
        }
        public async Task AddProperty(AddPropertyDto newProperty, Guid customerId)
        {
            var property = newProperty.Adapt<Property>();
            var customer = await _context.Customers.Where(c => c.CustomerId == customerId).Include(c => c.Properties).FirstOrDefaultAsync();
            newProperty.Id = Guid.NewGuid();
            property.CustomerId = customerId;
            await _context.Properties.AddAsync(property);
            customer?.Properties?.Add(property);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteProperty(Guid id)
        {
            var property = await _context.Properties.FirstOrDefaultAsync(p => p.Id == id);
            _context.Remove(property);
            await _context.SaveChangesAsync();
        }

        public async Task<ApiResponse<List<Property>>> GetProperties()
        {
            var properties = await _context.Properties.ToListAsync();
            return new ApiResponse<List<Property>>()
            {
                Success = true,
                Payload = properties,
                ErrorMessage = null
            };
        }

        public async Task<ApiResponse<Property>> GetPropertyById(Guid id)
        {
            var property = await _context.Properties.FirstOrDefaultAsync(p => p.Id == id);
            return new ApiResponse<Property>()
            {
                Success = true,
                Payload = property,
                ErrorMessage = null
            };
        }

        public async Task UpdateProperty(Property updatedProperty)
        {
            _context.Update(updatedProperty);
            await _context.SaveChangesAsync();
        }
    }
}