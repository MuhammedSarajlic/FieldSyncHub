using backend.Data;
using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.PropertyService;

public class PropertyService : IPropertyService
{
    private readonly DataContext _context;
    public PropertyService(DataContext context)
    {
        _context = context;
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

    public async Task CreateProperty(CreatePropertyDto createPropertyDto)
    {
        var property = createPropertyDto.Adapt<Property>();
        var customer = await _context.Customers.Where(c => c.Id == createPropertyDto.CustomerId)
                                            .Include(c => c.Properties)
                                            .FirstOrDefaultAsync();
        property.Id = Guid.NewGuid();
        property.CreatedAt = DateTime.UtcNow;
        property.UpdatedAt = DateTime.UtcNow;
        property.CustomerId = createPropertyDto.CustomerId;

        await _context.Properties.AddAsync(property);

        customer?.Properties?.Add(property);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateProperty(UpdatePropertyDto updatePropertyDto)
    {
        var property = updatePropertyDto.Adapt<Property>();
        property.UpdatedAt = DateTime.UtcNow;

        _context.Update(property);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateProperties(ICollection<UpdatePropertyDto> updatePropertiesDto, Guid customerId)
    {
        var existingProperties = await _context.Properties
            .Where(p => p.CustomerId == customerId)
            .ToListAsync();

        foreach (var propertyDto in updatePropertiesDto)
        {
            var existingProperty = existingProperties.FirstOrDefault(p => p.Id == propertyDto.Id);

            if (existingProperty != null)
            {
                propertyDto.Adapt(existingProperty);
                existingProperty.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newProperty = propertyDto.Adapt<Property>();
                newProperty.CustomerId = customerId;
                _context.Properties.Add(newProperty);
            }
        }

        // Handle deletions
        var removedProperties = existingProperties
            .Where(ep => !updatePropertiesDto.Any(p => p.Id == ep.Id))
            .ToList();

        if (removedProperties.Count != 0)
        {
            _context.Properties.RemoveRange(removedProperties);
        }
    }

    public async Task DeleteProperty(Guid id)
    {
        var property = await _context.Properties.FirstOrDefaultAsync(p => p.Id == id);
        _context.Remove(property);
        await _context.SaveChangesAsync();
    }
}