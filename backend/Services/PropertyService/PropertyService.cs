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
    private readonly IGeocodingService? _geocodingService;

    public PropertyService(DataContext context, IGeocodingService? geocodingService = null)
    {
        _context = context;
        _geocodingService = geocodingService;
    }

    public async Task<ApiResponse<Property>> GetPropertyById(Guid id, Guid callerWorkspaceId)
    {
        var property = await _context.Properties.Include(p => p.Customer).ThenInclude(c => c!.EmailRecords).FirstOrDefaultAsync(p => p.Id == id);
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

        if (customer == null)
        {
            return new ApiResponse<Property>
            {
                Success = false,
                ErrorMessage = "Customer not found."
            };
        }

        await ApplyCoordinatesAsync(property, createPropertyDto.Latitude, createPropertyDto.Longitude);
        await _context.Properties.AddAsync(property);
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
        var property = await _context.Properties.Include(p => p.Customer).ThenInclude(c => c!.EmailRecords).FirstOrDefaultAsync(p => p.Id == updatePropertyDto.Id);

        if (property == null || property.Customer?.WorkspaceId != callerWorkspaceId)
        {
            return new ApiResponse<Property>
            {
                Success = false,
                Payload = null,
                ErrorMessage = "Property not found"
            };
        }

        var oldStreet = property.Street;
        var oldCity = property.City;
        var oldState = property.State;
        var oldCountry = property.Country;
        var oldPostalCode = property.PostalCode;
        property.Street = updatePropertyDto.Street ?? property.Street;
        property.City = updatePropertyDto.City ?? property.City;
        property.State = updatePropertyDto.State ?? property.State;
        property.Country = updatePropertyDto.Country ?? property.Country;
        property.PostalCode = updatePropertyDto.PostalCode ?? property.PostalCode;
        var addressChanged = property.Street != oldStreet
            || property.City != oldCity
            || property.State != oldState
            || property.Country != oldCountry
            || property.PostalCode != oldPostalCode;
        if (updatePropertyDto.Latitude.HasValue && updatePropertyDto.Longitude.HasValue)
        {
            property.Latitude = updatePropertyDto.Latitude;
            property.Longitude = updatePropertyDto.Longitude;
        }
        else if (addressChanged)
        {
            await ApplyCoordinatesAsync(property, null, null);
        }
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

    private async Task ApplyCoordinatesAsync(Property property, decimal? latitude, decimal? longitude)
    {
        if (latitude.HasValue && longitude.HasValue)
        {
            property.Latitude = latitude;
            property.Longitude = longitude;
            return;
        }

        var coordinates = _geocodingService == null
            ? null
            : await _geocodingService.GeocodeAsync(property.Address);
        if (coordinates != null)
        {
            property.Latitude = coordinates.Latitude;
            property.Longitude = coordinates.Longitude;
        }
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
        var property = await _context.Properties.Include(p => p.Customer).ThenInclude(c => c!.EmailRecords).FirstOrDefaultAsync(p => p.Id == id);
        if (property == null || property.Customer?.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That property is not in your workspace.");
        }
        _context.Remove(property);
        await _context.SaveChangesAsync();
    }
}
