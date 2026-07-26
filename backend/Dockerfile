# Start with the official .NET SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy the project files and restore dependencies
COPY backend.csproj ./backend/
WORKDIR /app/backend
RUN dotnet restore

# Copy all the remaining files and build the application
WORKDIR /app
COPY . .
RUN dotnet publish "backend/backend.csproj" -c Release -o /app/publish

# Use a smaller runtime image to run the application
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port your application listens on (default for ASP.NET is 8080)
EXPOSE 8080

# The command to run the application
ENTRYPOINT ["dotnet", "backend.dll"]