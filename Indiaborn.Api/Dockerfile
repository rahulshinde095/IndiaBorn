# Multi-stage Dockerfile for .NET 9.0 API
FROM mcr.microsoft.com/dotnet/aspnet:9.0.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Indiaborn.Api.csproj", "./"]
RUN dotnet restore "Indiaborn.Api.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Indiaborn.Api.csproj" -c "$BUILD_CONFIGURATION" -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Indiaborn.Api.csproj" -c "$BUILD_CONFIGURATION" -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create directory for uploaded images
RUN mkdir -p /app/wwwroot/assets/products

# Use non-root user for security
USER app

ENTRYPOINT ["dotnet", "Indiaborn.Api.dll"]




