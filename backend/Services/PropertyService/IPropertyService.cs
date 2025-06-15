using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;

namespace backend.Services.PropertyService;

public interface IPropertyService
{
    Task<ApiResponse<List<Property>>> GetProperties();
    Task<ApiResponse<Property>> GetPropertyById(Guid id);
    Task CreateProperty(CreatePropertyDto createPropertyDto);
    Task UpdateProperty(UpdatePropertyDto updatePropertyDto);
    Task UpdateProperties(ICollection<UpdatePropertyDto> updatedPropertiesDto, Guid customerId);
    Task DeleteProperty(Guid id);
}