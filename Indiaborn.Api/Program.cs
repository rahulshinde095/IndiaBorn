using System.Text;
using Indiaborn.Api.Configuration;
using Indiaborn.Api.Data;
using Indiaborn.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SendGrid;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("Mongo"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
builder.Services.Configure<NotificationSettings>(builder.Configuration.GetSection("Notifications"));

builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<ProductService>();
builder.Services.AddSingleton<OrderService>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<PaymentService>();
builder.Services.AddSingleton<InvoiceService>();
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton(sp =>
{
    var settings = sp.GetRequiredService<IOptions<NotificationSettings>>().Value;
    // Use placeholder if API key is not configured (NotificationService will skip email sending)
    var apiKey = string.IsNullOrWhiteSpace(settings.Email.SendGridApiKey) 
        ? "dummy-key-for-development" 
        : settings.Email.SendGridApiKey;
    return new SendGridClient(apiKey);
});

builder.Services.AddHttpClient("messenger");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Only redirect to HTTPS in production (hosting platforms handle this)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

using (var scope = app.Services.CreateScope())
{
    var productService = scope.ServiceProvider.GetRequiredService<ProductService>();
    var userService = scope.ServiceProvider.GetRequiredService<UserService>();
    await productService.SeedDefaultsAsync();
    var adminEmail = builder.Configuration["Admin:Email"] ?? "admin@indiaborn.com";
    var adminPassword = builder.Configuration["Admin:Password"] ?? "ChangeMe123!";
    await userService.EnsureAdminAsync(adminEmail, adminPassword);
}

app.Run();
