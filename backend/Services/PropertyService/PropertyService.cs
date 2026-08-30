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

    public async Task<ApiResponse<Property>> GetPropertyById(Guid id, Guid callerWorkspaceId)
    {
        var property = await _context.Properties.Include(p => p.Customer).FirstOrDefaultAsync(p => p.Id == id);
        if (property == null || property.Customer?.WorkspaceId != callerWorkspaceId)
        {
            return new ApiResponse<Property>()
            {
                Success = false,
                Payload = null,
                ErrorMessage = "Property not found"
            };
        }

        return new ApiResponse<Property>()
        {
            Success = true,
            Payload = property,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Property>> CreateProperty(CreatePropertyDto createPropertyDto)
    {
        var property = createPropertyDto.Adapt<Property>();
        var customer = await _context.Customers.Where(c => c.Id == createPropertyDto.CustomerId)
                                            .Include(c => c.Properties)
                                            .FirstOrDefaultAsync();
        property.Id = Guid.NewGuid();
        property.CustomerId = createPropertyDto.CustomerId;

        await _context.Properties.AddAsync(property);

        if (customer == null)
        {
            return new ApiResponse<Property>
            {
                Success = false,
                ErrorMessage = "Customer not found."
            };
        }

        customer.Properties?.Add(property);
        customer.LastActivity = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new ApiResponse<Property>
        {
            Success = true,
            Payload = property,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Property>> UpdateProperty(UpdatePropertyDto updatePropertyDto, Guid callerWorkspaceId)
    {
        var property = await _context.Properties.Include(p => p.Customer).FirstOrDefaultAsync(p => p.Id == updatePropertyDto.Id);

        if (property == null || property.Customer?.WorkspaceId != callerWorkspaceId)
        {
            return new ApiResponse<Property>
            {
                Success = false,
                Payload = null,
                ErrorMessage = "Property not found"
            };
        }

        property.Street = updatePropertyDto.Street ?? property.Street;
        property.City = updatePropertyDto.City ?? property.City;
        property.State = updatePropertyDto.State ?? property.State;
        property.Country = updatePropertyDto.Country ?? property.Country;
        property.PostalCode = updatePropertyDto.PostalCode ?? property.PostalCode;
        if (updatePropertyDto.IsBillingAddress.HasValue) property.IsBillingAddress = updatePropertyDto.IsBillingAddress.Value;
        property.UpdatedAt = DateTime.UtcNow;

        _context.Update(property);
        await _context.SaveChangesAsync();

        return new ApiResponse<Property>
        {
            Success = true,
            Payload = property,
            ErrorMessage = null
        };
    }

    public async Task UpdateProperties(ICollection<UpdatePropertyDto> updatedPropertiesDto, Guid customerId)
    {
        var existingProperties = await _context.Properties
            .Where(p => p.CustomerId == customerId)
            .ToListAsync();

        foreach (var propertyDto in updatedPropertiesDto)
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
            .Where(ep => !updatedPropertiesDto.Any(p => p.Id == ep.Id))
            .ToList();

        if (removedProperties.Count != 0)
        {
            _context.Properties.RemoveRange(removedProperties);
        }
    }

    public async Task DeleteProperty(Guid id, Guid callerWorkspaceId)
    {
        var property = await _context.Properties.Include(p => p.Customer).FirstOrDefaultAsync(p => p.Id == id);
        if (property == null || property.Customer?.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That property is not in your workspace.");
        }
        _context.Remove(property);
        await _context.SaveChangesAsync();
    }
}
