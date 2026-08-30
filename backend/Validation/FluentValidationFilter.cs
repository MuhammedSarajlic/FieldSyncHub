using backend.Response;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Validation;

public sealed class FluentValidationFilter(IServiceProvider services) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var failures = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        foreach (var argument in context.ActionArguments.Values.Where(value => value != null))
        {
            var validatorType = typeof(IValidator<>).MakeGenericType(argument!.GetType());
            if (services.GetService(validatorType) is not IValidator validator)
            {
                continue;
            }

            var result = await validator.ValidateAsync(new ValidationContext<object>(argument));
            foreach (var group in result.Errors.GroupBy(error => error.PropertyName))
            {
                failures[group.Key] = group.Select(error => error.ErrorMessage).Distinct().ToArray();
            }
        }

        if (failures.Count > 0)
        {
            context.Result = new BadRequestObjectResult(new ApiResponse<object>
            {
                Success = false,
                ErrorMessage = "One or more validation errors occurred.",
                Payload = failures
            });
            return;
        }

        await next();
    }
}
