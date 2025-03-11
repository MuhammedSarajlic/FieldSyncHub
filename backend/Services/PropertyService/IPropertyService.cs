using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;

namespace backend.Services.PropertyService;

public interface IPropertyService
{
    Task<ApiResponse<List<Property>>> GetProperties();
    Task<ApiResponse<Property>> GetPropertyById(Guid id);
    Task AddProperty(AddPropertyDto newProperty, Guid customerId);
    Task UpdateProperty(Property updatedProperty);
    Task DeleteProperty(Guid id);
}