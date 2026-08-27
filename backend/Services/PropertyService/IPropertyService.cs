using backend.Dtos.PropertyDto;
using backend.Models;
using backend.Response;

namespace backend.Services.PropertyService;

public interface IPropertyService
{
    Task<ApiResponse<Property>> GetPropertyById(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<Property>> CreateProperty(CreatePropertyDto createPropertyDto);
    Task<ApiResponse<Property>> UpdateProperty(UpdatePropertyDto updatePropertyDto, Guid callerWorkspaceId);
    Task UpdateProperties(ICollection<UpdatePropertyDto> updatedPropertiesDto, Guid customerId);
    Task DeleteProperty(Guid id, Guid callerWorkspaceId);
}