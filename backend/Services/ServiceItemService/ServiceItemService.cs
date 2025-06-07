using backend.Data;
using backend.Dtos.ServiceItemDto;
using backend.Models;
using backend.Response;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.ServiceItemService;

public class ServiceItemService : IServiceItemService
{
    private readonly DataContext _context;
    public ServiceItemService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ServiceItem>>> GetServiceItems()
    {
        var serviceItems = await _context.ServiceItems.ToListAsync();
        return new ApiResponse<List<ServiceItem>>()
        {
            Success = true,
            Payload = serviceItems,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<ServiceItem>>> GetServiceItemsByFilter(
        string? q, string? sortBy, string? sort, string? category,
        string? priceMin, string? priceMax, string? hoursMin, string? hoursMax,
        string? status, string? images, string? description
    )
    {
        var queryable = _context.ServiceItems.AsQueryable();

        // 🔎 Search by name (q)
        if (!string.IsNullOrWhiteSpace(q))
        {
            queryable = queryable.Where(s => s.Name.Contains(q));
        }

        // 🔎 Filter: Category
        if (!string.IsNullOrWhiteSpace(category))
        {
            queryable = queryable.Where(s => s.Category == category);
        }

        // 🔎 Filter: Price Range
        if (decimal.TryParse(priceMin, out var minPrice))
        {
            queryable = queryable.Where(s => s.UnitPrice >= minPrice);
        }
        if (decimal.TryParse(priceMax, out var maxPrice))
        {
            queryable = queryable.Where(s => s.UnitPrice <= maxPrice);
        }

        // 🔎 Filter: Hours Range
        if (decimal.TryParse(hoursMin, out var minHours))
        {
            queryable = queryable.Where(s => s.Hours >= minHours);
        }
        if (decimal.TryParse(hoursMax, out var maxHours))
        {
            queryable = queryable.Where(s => s.Hours <= maxHours);
        }

        // 🔎 Filter: Status
        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (status == "active")
            {
                queryable = queryable.Where(s => s.IsActive == true);
            }
            else if (status == "inactive")
            {
                queryable = queryable.Where(s => s.IsActive == false);
            }
        }


        // 🔎 Filter: Images
        if (!string.IsNullOrWhiteSpace(images) && images != "any")
        {
            if (images == "has")
            {
                queryable = queryable.Where(s => !string.IsNullOrEmpty(s.ImageUrl));
            }
            else if (images == "none")
            {
                queryable = queryable.Where(s => string.IsNullOrEmpty(s.ImageUrl));
            }
        }

        // 🔎 Filter: Description search
        if (!string.IsNullOrWhiteSpace(description))
        {
            queryable = queryable.Where(s => s.Description.Contains(description));
        }

        // 🔄 Sorting
        queryable = sortBy switch
        {
            "name" => sort == "desc" ? queryable.OrderByDescending(s => s.Name) : queryable.OrderBy(s => s.Name),
            "price" => sort == "desc" ? queryable.OrderByDescending(s => s.UnitPrice) : queryable.OrderBy(s => s.UnitPrice),
            _ => queryable.OrderBy(s => s.Name) // default
        };

        var filteredItems = await queryable.ToListAsync();

        return new ApiResponse<List<ServiceItem>>
        {
            Success = true,
            Payload = filteredItems,
            ErrorMessage = null
        };
    }


    public async Task CreateServiceItem(ServiceItem serviceItem)
    {
        serviceItem.ServiceItemId = Guid.NewGuid();

        _context.ServiceItems.Add(serviceItem);
        await _context.SaveChangesAsync();
    }

    public async Task<ApiResponse<List<ImportedServiceItemDto>>> ExportServiceItems()
    {
        var items = await _context.ServiceItems.ToListAsync();

        var exported = items.Select(i => new ImportedServiceItemDto
        {
            Name = i.Name,
            Description = i.Description,
            Type = i.Type,
            Category = i.Category,
            SKU = i.SKU,
            Hours = i.Hours,
            UnitPrice = i.UnitPrice,
            Cost = i.Cost,
            TaxRate = i.TaxRate,
            IsTaxable = i.IsTaxable,
            IsActive = i.IsActive,
            ImageUrl = i.ImageUrl
        }).ToList();

        return new ApiResponse<List<ImportedServiceItemDto>>
        {
            Success = true,
            Payload = exported
        };
    }

    public async Task<ApiResponse<object>> ImportServiceItems(List<ImportedServiceItemDto> items)
    {
        var existingItems = await _context.ServiceItems.ToListAsync();

        var normalizedExisting = existingItems.Select(i =>
            $"{i.Name.Trim().ToLower()}|{i.SKU.Trim().ToLower()}"
        ).ToHashSet();

        var toImport = new List<ServiceItem>();

        foreach (var dto in items)
        {
            var key = $"{dto.Name.Trim().ToLower()}|{dto.SKU.Trim().ToLower()}";

            if (normalizedExisting.Contains(key)) continue;

            var item = new ServiceItem
            {
                ServiceItemId = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                Description = dto.Description,
                Type = dto.Type,
                Category = dto.Category,
                SKU = dto.SKU,
                Hours = dto.Hours,
                UnitPrice = dto.UnitPrice,
                Cost = dto.Cost,
                TaxRate = dto.TaxRate,
                IsTaxable = dto.IsTaxable,
                IsActive = dto.IsActive,
                ImageUrl = dto.ImageUrl
            };

            toImport.Add(item);
        }

        await _context.ServiceItems.AddRangeAsync(toImport);
        await _context.SaveChangesAsync();

        return new ApiResponse<object>
        {
            Success = true,
            Payload = new
            {
                Imported = toImport.Count,
                Skipped = items.Count - toImport.Count
            }
        };
    }


}