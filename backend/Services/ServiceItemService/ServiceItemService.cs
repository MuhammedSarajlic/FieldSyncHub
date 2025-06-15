using System.Text;
using backend.Data;
using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.ServiceItemService;

public class ServiceItemService : IServiceItemService
{
    private readonly DataContext _context;
    public ServiceItemService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<GetServiceItemDto>>> GetServiceItems()
    {
        var serviceItems = await _context.ServiceItems.ToListAsync();
        var getServiceItemsDto = serviceItems.Adapt<List<GetServiceItemDto>>();
        return new ApiResponse<List<GetServiceItemDto>>()
        {
            Success = true,
            Payload = getServiceItemsDto,
            ErrorMessage = null
        };
    }

    public async Task<GetServiceItemDto> GetServiceItemById(Guid id)
    {
        var serviceItem = await _context.ServiceItems.FindAsync(id);
        var getServiceItemDto = serviceItem.Adapt<GetServiceItemDto>();
        return getServiceItemDto ?? throw new KeyNotFoundException("Service item not found");
    }

    public async Task<ApiResponse<List<GetServiceItemDto>>> GetServiceItemsByWorkspace(Guid workspaceId)
    {
        var items = await _context.ServiceItems
            .Where(s => s.IsActive && s.Category != null && s.Category.ToLower() != "archived")
            .ToListAsync();
        var itemsDto = items.Adapt<List<GetServiceItemDto>>();
        return new ApiResponse<List<GetServiceItemDto>> { Success = true, Payload = itemsDto };
    }

    public async Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter(ServiceItemFilterDto filterDto, Guid workspaceId)
    {
        var queryable = _context.ServiceItems.Where(s => s.WorkspaceId == workspaceId)
                                            .AsQueryable();

        // 🔍 Search by name
        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            queryable = queryable.Where(s => s.Name.Contains(filterDto.Q));
        }

        // 🔍 Category
        if (!string.IsNullOrWhiteSpace(filterDto.Category))
        {
            queryable = queryable.Where(s => s.Category == filterDto.Category);
        }

        // 🔍 Price range
        if (filterDto.PriceMin.HasValue)
        {
            queryable = queryable.Where(s => s.UnitPrice >= filterDto.PriceMin.Value);
        }

        if (filterDto.PriceMax.HasValue)
        {
            queryable = queryable.Where(s => s.UnitPrice <= filterDto.PriceMax.Value);
        }

        // 🔍 IsActive
        if (filterDto.IsActive.HasValue)
        {
            queryable = queryable.Where(s => s.IsActive == filterDto.IsActive.Value);
        }

        // 🔍 Has Image
        if (filterDto.HasImage.HasValue)
        {
            queryable = filterDto.HasImage.Value
                ? queryable.Where(s => !string.IsNullOrEmpty(s.ImageUrl))
                : queryable.Where(s => string.IsNullOrEmpty(s.ImageUrl));
        }

        // 🔍 Description search
        if (!string.IsNullOrWhiteSpace(filterDto.Description))
        {
            queryable = queryable.Where(s => s.Description.Contains(filterDto.Description));
        }

        // 🔄 Sorting
        queryable = filterDto.SortBy?.ToLower() switch
        {
            "name" => filterDto.Sort == "desc" ? queryable.OrderByDescending(s => s.Name) : queryable.OrderBy(s => s.Name),
            "price" => filterDto.Sort == "desc" ? queryable.OrderByDescending(s => s.UnitPrice) : queryable.OrderBy(s => s.UnitPrice),
            _ => queryable.OrderBy(s => s.Name)
        };

        var result = await queryable.ToListAsync();

        return new ApiResponse<List<ServiceItem>>
        {
            Success = true,
            Payload = result
        };
    }

    public async Task<GetServiceItemDto> CreateServiceItem(CreateServiceItemDto createServiceItemDto)
    {
        var item = createServiceItemDto.Adapt<ServiceItem>();
        item.Id = Guid.NewGuid();
        _context.ServiceItems.Add(item);
        await _context.SaveChangesAsync();
        return createServiceItemDto.Adapt<GetServiceItemDto>();
    }

    public async Task<GetServiceItemDto> UpdateServiceItem(UpdateServiceItemDto updateServiceItemDto)
    {
        var existingServiceItem = await _context.ServiceItems.FindAsync(updateServiceItemDto.Id) ?? throw new Exception("Service item not found");
        updateServiceItemDto.Adapt(existingServiceItem);
        existingServiceItem.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return existingServiceItem.Adapt<GetServiceItemDto>();
    }

    public async Task<ApiResponse<object>> ImportServiceItemsAsync(List<ImportedServiceItemDto> serviceItems, Guid workspaceId)
    {
        if (serviceItems == null || !serviceItems.Any())
        {
            return new ApiResponse<object>
            {
                Success = false,
                ErrorMessage = "No service items provided for import.",
                Payload = new { Imported = 0, Skipped = 0 }
            };
        }

        var existingServiceItems = await _context.ServiceItems
            .Where(si => si.WorkspaceId == workspaceId)
            .ToListAsync();

        var normalizedExisting = existingServiceItems.Select(si => new
        {
            Key = $"{si.Name.Trim().ToLower()}|{si.Type.ToString().Trim().ToLower()}|{si.SKU.Trim().ToLower()}",
            si.Id
        }).ToHashSet();

        var toImport = new List<ServiceItem>();
        int skippedCount = 0;

        foreach (var dto in serviceItems)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.SKU))
            {
                skippedCount++;
                continue;
            }

            ServiceItemType itemTypeParsed;
            if (!Enum.TryParse<ServiceItemType>(dto.Type, true, out itemTypeParsed))
            {
                itemTypeParsed = ServiceItemType.Service;
            }

            var key = $"{dto.Name.Trim().ToLower()}|{itemTypeParsed.ToString().Trim().ToLower()}|{dto.SKU.Trim().ToLower()}";

            if (normalizedExisting.Any(si => si.Key == key))
            {
                skippedCount++;
                continue;
            }

            var serviceItem = new ServiceItem
            {
                WorkspaceId = workspaceId,
                Name = dto.Name.Trim(),
                Description = dto.Description,
                Type = itemTypeParsed,
                Category = dto.Category,
                SKU = dto.SKU.Trim(),
                UnitPrice = dto.UnitPrice,
                Cost = dto.Cost,
                TaxRate = dto.TaxRate,
                IsTaxable = dto.IsTaxable,
                IsActive = dto.IsActive,
                ImageUrl = dto.ImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            toImport.Add(serviceItem);
        }

        if (toImport.Any())
        {
            await _context.ServiceItems.AddRangeAsync(toImport);
            await _context.SaveChangesAsync();
        }

        return new ApiResponse<object>
        {
            Success = true,
            Payload = new
            {
                Imported = toImport.Count,
                Skipped = skippedCount
            },
        };
    }

    public async Task<IActionResult> ExportServiceItemsToCsvAsync(Guid workspaceId)
    {
        var serviceItems = await _context.ServiceItems
            .Where(si => si.WorkspaceId == workspaceId)
            .ToListAsync();

        if (serviceItems == null || !serviceItems.Any())
        {
            return new NotFoundResult();
        }

        var sb = new StringBuilder();

        sb.AppendLine("Id,WorkspaceId,Name,Description,Type,Category,SKU,UnitPrice,Cost,TaxRate,IsTaxable,IsActive,ImageUrl");

        foreach (var item in serviceItems)
        {
            sb.AppendLine($"{item.Id},{item.WorkspaceId},{EscapeCsvField(item.Name)},{EscapeCsvField(item.Description)},{item.Type},{EscapeCsvField(item.Category)},{EscapeCsvField(item.SKU)},{item.UnitPrice},{item.Cost},{item.TaxRate},{item.IsTaxable},{item.IsActive},{EscapeCsvField(item.ImageUrl)}");
        }

        var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
        return new FileContentResult(csvBytes, "text/csv")
        {
            FileDownloadName = $"service_items_workspace_{workspaceId}.csv"
        };
    }

    private string EscapeCsvField(string? field)
    {
        if (string.IsNullOrEmpty(field))
        {
            return "";
        }
        if (field.Contains(",") || field.Contains("\"") || field.Contains("\n") || field.Contains("\r"))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }
        return field;
    }
}