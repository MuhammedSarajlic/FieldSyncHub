# Build context is the backend/ folder itself.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore first for better layer caching
COPY backend.csproj ./
RUN dotnet restore

# Copy the rest of the source and publish
COPY . .
RUN dotnet publish backend.csproj -c Release -o /app/publish

# Use a smaller runtime image to run the application
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER app

# Expose the port your application listens on (default for ASP.NET is 8080)
EXPOSE 8080

# The command to run the application
ENTRYPOINT ["dotnet", "backend.dll"]
