using CosplayDate.Application.Services.Implementations;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Infrastructure.Data.Context;
using CosplayDate.Infrastructure.Data.Repositories;
using CosplayDate.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ===== ENHANCED CONFIGURATION SETUP =====
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true) // Made optional for production
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Custom configuration processor to handle ${ENV_VAR} syntax in appsettings.Production.json
var configuration = builder.Configuration;
var configurationRoot = configuration as IConfigurationRoot;
if (configurationRoot != null)
{
    foreach (var provider in configurationRoot.Providers.Reverse())
    {
        foreach (var key in provider.GetChildKeys(Enumerable.Empty<string>(), null))
        {
            if (provider.TryGet(key, out var value) && !string.IsNullOrEmpty(value))
            {
                if (value.StartsWith("${") && value.EndsWith("}"))
                {
                    var envVarName = value.Substring(2, value.Length - 3);
                    var envVarValue = Environment.GetEnvironmentVariable(envVarName);
                    if (!string.IsNullOrEmpty(envVarValue))
                    {
                        configuration[key] = envVarValue;
                    }
                }
            }
        }
    }
}

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ===== HEALTH CHECKS =====
builder.Services.AddHealthChecks()
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Application is running"));

// ===== SWAGGER CONFIGURATION =====
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CosplayDate API",
        Version = "v1",
        Description = "API for CosplayDate - Connect with amazing cosplayers!",
        Contact = new OpenApiContact
        {
            Name = "CosplayDate Support",
            Email = "support@cosplaydate.com",
            Url = new Uri("https://cosplaydate.com")
        }
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddHttpClient();

// ===== DATABASE CONFIGURATION =====
builder.Services.AddDbContext<CosplayDateDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                         ?? builder.Configuration["DATABASE_CONNECTION_STRING"]; // Fallback to env var
    options.UseSqlServer(connectionString);

    // Add additional configurations for production
    if (builder.Environment.IsProduction())
    {
        options.EnableSensitiveDataLogging(false);
        options.EnableDetailedErrors(false);
    }
});

// ===== DEPENDENCY INJECTION =====
// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ISupabaseService, SupabaseService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICosplayerService, CosplayerService>();
builder.Services.AddScoped<ICosplayerMediaService, CosplayerMediaService>();
builder.Services.AddScoped<IPayOSService, PayOSService>();
builder.Services.AddScoped<IWalletService, WalletService>();

// ===== JWT AUTHENTICATION CONFIGURATION =====
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"] ?? builder.Configuration["JWT_SECRET_KEY"];
        var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CosplayDate";
        var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CosplayDate";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!)),
            ClockSkew = TimeSpan.Zero
        };

        // Handle JWT authentication events
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    isSuccess = false,
                    message = "You are not authorized to access this resource",
                    data = (object?)null,
                    errors = new[] { "Invalid or expired token" }
                });
                return context.Response.WriteAsync(result);
            }
        };
    });

// ===== AUTHORIZATION POLICIES =====
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireVerifiedUser", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("IsVerified", "True"));

    options.AddPolicy("RequireCosplayer", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("UserType", "Cosplayer")
              .RequireClaim("IsVerified", "True"));

    options.AddPolicy("RequireCustomer", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("UserType", "Customer")
              .RequireClaim("IsVerified", "True"));
});

// ===== RATE LIMITING =====
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("AuthPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = builder.Environment.IsProduction() ? 5 : 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 2;
    });

    options.AddFixedWindowLimiter("ApiPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = builder.Environment.IsProduction() ? 100 : 1000;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 10;
    });
});

// ===== CORS CONFIGURATION =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
    {
        if (builder.Environment.IsProduction())
        {
            // Production CORS - specific origins only
            var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? builder.Configuration["App:FrontendUrl"];
            var allowedOrigins = new List<string>();

            if (!string.IsNullOrEmpty(frontendUrl))
            {
                allowedOrigins.Add(frontendUrl);
            }

            // Add your production domains
            allowedOrigins.AddRange(new[]
            {
                "https://cosplay-date.vercel.app", // Your actual Vercel frontend
                "https://cosplaydate.com",
                "https://www.cosplaydate.com"
            });

            policy.WithOrigins(allowedOrigins.ToArray())
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // Development CORS - more permissive
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:5000",
                    "https://localhost:5001")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

// ===== LOGGING CONFIGURATION =====
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

if (builder.Environment.IsProduction())
{
    builder.Logging.SetMinimumLevel(LogLevel.Warning);
}
else
{
    builder.Logging.SetMinimumLevel(LogLevel.Information);
}

var app = builder.Build();

// ===== MIDDLEWARE PIPELINE =====

// Exception handling
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// ===== SWAGGER CONFIGURATION - ENABLED IN PRODUCTION FOR TESTING =====
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CosplayDate API V1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "CosplayDate API Documentation";
    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    c.DefaultModelsExpandDepth(-1);
});

// Security headers for production
if (app.Environment.IsProduction())
{
    app.Use(async (context, next) =>
    {
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
        await next();
    });
}

// HTTPS redirection
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS
app.UseCors("ProductionPolicy");

// Rate limiting
app.UseRateLimiter();

// Authentication & Authorization (Order is important!)
app.UseAuthentication();
app.UseAuthorization();

// ===== ADDITIONAL ENDPOINTS FOR TESTING =====
// Root endpoint
app.MapGet("/", () => Results.Ok(new
{
    message = "CosplayDate API is running!",
    environment = app.Environment.EnvironmentName,
    endpoints = new
    {
        swagger = "/swagger",
        health = "/health",
        healthReady = "/health/ready",
        testConfig = "/test-config",
        api = "/api"
    },
    timestamp = DateTime.UtcNow
})).AllowAnonymous();

// Test configuration endpoint
app.MapGet("/test-config", () => Results.Ok(new
{
    environment = app.Environment.EnvironmentName,
    configuration = new
    {
        hasSupabaseUrl = !string.IsNullOrEmpty(app.Configuration["SUPABASE_URL"]),
        hasDatabaseConnection = !string.IsNullOrEmpty(app.Configuration["DATABASE_CONNECTION_STRING"]),
        hasJwtSecret = !string.IsNullOrEmpty(app.Configuration["JWT_SECRET_KEY"]),
        frontendUrl = app.Configuration["FRONTEND_URL"],
        backendUrl = app.Configuration["BACKEND_URL"]
    },
    cors = new
    {
        allowedOrigins = app.Configuration["FRONTEND_URL"]
    }
})).AllowAnonymous();

// Health checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

// Controllers
app.MapControllers();

// ===== DATABASE MIGRATION (Production) =====
if (app.Environment.IsProduction())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<CosplayDateDbContext>();

    try
    {
        // Only run migrations if database exists
        if (context.Database.CanConnect())
        {
            context.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
        // Don't throw - let the app start even if migration fails
    }
}

app.Run();