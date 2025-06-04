# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file first (if exists)
COPY CosplayDate-BE/*.sln ./CosplayDate-BE/ 2>/dev/null || true

# Copy csproj files and restore dependencies
COPY CosplayDate-BE/CosplayDate.API/*.csproj ./CosplayDate-BE/CosplayDate.API/
COPY CosplayDate-BE/CosplayDate.Application/*.csproj ./CosplayDate-BE/CosplayDate.Application/
COPY CosplayDate-BE/CosplayDate.Domain/*.csproj ./CosplayDate-BE/CosplayDate.Domain/
COPY CosplayDate-BE/CosplayDate.Infrastructure/*.csproj ./CosplayDate-BE/CosplayDate.Infrastructure/

# Restore dependencies
RUN dotnet restore ./CosplayDate-BE/CosplayDate.API/CosplayDate.API.csproj

# Copy the rest of the source code
COPY CosplayDate-BE/ ./CosplayDate-BE/

# Create a minimal appsettings.json file
RUN echo '{"Logging":{"LogLevel":{"Default":"Information","Microsoft.AspNetCore":"Warning"}},"AllowedHosts":"*"}' > /src/CosplayDate-BE/CosplayDate.API/appsettings.json

# Build the application
WORKDIR /src/CosplayDate-BE/CosplayDate.API
RUN dotnet build -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish --no-restore

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=publish /app/publish .

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "CosplayDate.API.dll"]