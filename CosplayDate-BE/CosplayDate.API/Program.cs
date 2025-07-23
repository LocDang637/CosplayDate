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
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Enhanced configuration processor to handle ${ENV_VAR} syntax
var configuration = builder.Configuration;
var configurationRoot = configuration as IConfigurationRoot;

if (configurationRoot != null)
{
    // Get all configuration key-value pairs
    var allConfig = configuration.AsEnumerable().ToList();

    foreach (var configItem in allConfig)
    {
        if (!string.IsNullOrEmpty(configItem.Value) &&
            configItem.Value.StartsWith("${") &&
            configItem.Value.EndsWith("}"))
        {
            var envVarName = configItem.Value.Substring(2, configItem.Value.Length - 3);
            var envVarValue = Environment.GetEnvironmentVariable(envVarName);

            if (!string.IsNullOrEmpty(envVarValue))
            {
                configuration[configItem.Key] = envVarValue;
                Console.WriteLine($"✓ Resolved environment variable: {configItem.Key} = {envVarName}");
            }
            else
            {
                Console.WriteLine($"⚠️  Environment variable not found: {envVarName} for key: {configItem.Key}");

                // In development, this might be okay, but in production it's critical
                if (builder.Environment.IsProduction() && configItem.Key.Contains("Connection"))
                {
                    throw new InvalidOperationException($"Required environment variable '{envVarName}' is not set for configuration key '{configItem.Key}'");
                }
            }
        }
    }
}

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ===== ENHANCED HEALTH CHECKS =====
builder.Services.AddHealthChecks()
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Application is running"))
    .AddDbContextCheck<CosplayDateDbContext>("database", failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded);

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

// ===== ENHANCED DATABASE CONFIGURATION WITH RETRY LOGIC =====
builder.Services.AddDbContext<CosplayDateDbContext>(options =>
{
    // Priority order: Environment Variable -> appsettings.json -> fallback
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
                         ?? builder.Configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(connectionString))
    {
        var errorMessage = $"Database connection string is not configured. " +
                          $"Environment: {builder.Environment.EnvironmentName}. " +
                          $"Please set 'DATABASE_CONNECTION_STRING' environment variable " +
                          $"or 'ConnectionStrings:DefaultConnection' in appsettings.json";

        Console.WriteLine($"❌ {errorMessage}");

        // List available environment variables for debugging
        var dbEnvVars = Environment.GetEnvironmentVariables()
            .Cast<System.Collections.DictionaryEntry>()
            .Where(x => x.Key.ToString().Contains("DATABASE", StringComparison.OrdinalIgnoreCase) ||
                       x.Key.ToString().Contains("CONNECTION", StringComparison.OrdinalIgnoreCase))
            .ToList();

        Console.WriteLine($"Available DB-related environment variables: {string.Join(", ", dbEnvVars.Select(x => x.Key))}");

        throw new InvalidOperationException(errorMessage);
    }

    Console.WriteLine($"✓ Using connection string from: {(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") != null ? "Environment Variable" : "appsettings.json")}");

    // Configure SQL Server with comprehensive retry logic for Azure SQL transient errors
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        // Enable retry logic with Azure SQL recommended settings
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 6,           // Retry up to 6 times
            maxRetryDelay: TimeSpan.FromSeconds(30), // Max delay between retries
            errorNumbersToAdd: new int[] {
                // Additional Azure SQL specific transient error codes
                4060,   // Database unavailable
                40197,  // Service busy
                40501,  // Service busy  
                40613,  // Database unavailable (auto-pause)
                49918,  // Cannot process request
                49919,  // Cannot process request
                49920,  // Cannot process request
                11001   // Network error
            }
        );

        // Set command timeout for long-running operations
        sqlOptions.CommandTimeout(60);
    });

    if (builder.Environment.IsProduction())
    {
        options.EnableSensitiveDataLogging(false);
        options.EnableDetailedErrors(false);
    }
    else
    {
        options.EnableSensitiveDataLogging(true);
        options.EnableDetailedErrors(true);
        // Enable detailed logging to see retry attempts
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

// ===== DEPENDENCY INJECTION =====
// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();

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
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IBookingNotificationService, BookingNotificationService>();
builder.Services.AddScoped<BookingValidationService>();
builder.Services.AddScoped<BookingReminderBackgroundService>();
builder.Services.AddScoped<IEscrowService, EscrowService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// ===== ADD ADMIN ANALYTICS SERVICE =====
builder.Services.AddScoped<IAdminAnalyticsService, AdminAnalyticsService>();

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

// ===== ENHANCED AUTHORIZATION POLICIES =====
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

    // ===== NEW ADMIN AUTHORIZATION POLICIES =====
    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("UserType", "Admin")
              .RequireClaim("IsVerified", "True"));

    // Alternative: Role-based authorization for Admin
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("Admin"));
});

// ===== ENHANCED RATE LIMITING =====
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

    // ===== NEW ADMIN RATE LIMITING POLICY =====
    options.AddFixedWindowLimiter("AdminPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = builder.Environment.IsProduction() ? 200 : 2000;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 20;
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

            // Add your actual Vercel domains from the screenshot
            allowedOrigins.AddRange(new[]
            {
                "https://cosplay-date.vercel.app", // Main Vercel domain
                "https://cosplay-date-kqd598ot3-loc-dangs-projects-ebd5f443.vercel.app", // Deployment domain
                "https://cosplay-date-git-main-loc-dangs-projects-ebd5f443.vercel.app", // Git branch domain (common pattern)
                "https://cosplaydate.com",
                "https://www.cosplaydate.com",
                "http://localhost:3000",
                "http://localhost:5173"
            });

            // Log the allowed origins for debugging
            Console.WriteLine($"🌐 CORS Allowed Origins: {string.Join(", ", allowedOrigins)}");

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

// ===== ENHANCED LOGGING CONFIGURATION =====
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

// ===== ENHANCED ENDPOINTS FOR TESTING AND MONITORING =====
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
        healthDatabase = "/health/database",
        debugConfig = "/debug/config",
        debugEnvironment = "/debug/environment",
        api = "/api",
        adminDashboard = "/api/admin/dashboard/stats" // NEW ADMIN ENDPOINT
    },
    timestamp = DateTime.UtcNow
})).AllowAnonymous();

// Enhanced configuration test endpoint
app.MapGet("/debug/config", () =>
{
    var connectionString = app.Configuration.GetConnectionString("DefaultConnection")
                         ?? app.Configuration["DATABASE_CONNECTION_STRING"];

    return Results.Ok(new
    {
        environment = app.Environment.EnvironmentName,
        hasConnectionString = !string.IsNullOrEmpty(connectionString),
        connectionStringSource = app.Configuration.GetConnectionString("DefaultConnection") != null
            ? "appsettings.json"
            : app.Configuration["DATABASE_CONNECTION_STRING"] != null
                ? "environment variable"
                : "none",
        availableConfigKeys = app.Configuration.AsEnumerable()
            .Where(x => x.Key.Contains("Connection", StringComparison.OrdinalIgnoreCase) ||
                       x.Key.Contains("DATABASE", StringComparison.OrdinalIgnoreCase))
            .Select(x => new { Key = x.Key, HasValue = !string.IsNullOrEmpty(x.Value) })
            .ToList()
    });
}).AllowAnonymous();

// Environment variables debug endpoint
app.MapGet("/debug/environment", () =>
{
    var envVars = Environment.GetEnvironmentVariables()
        .Cast<System.Collections.DictionaryEntry>()
        .Where(x => x.Key.ToString().Contains("DATABASE", StringComparison.OrdinalIgnoreCase) ||
                   x.Key.ToString().Contains("CONNECTION", StringComparison.OrdinalIgnoreCase) ||
                   x.Key.ToString().Contains("JWT", StringComparison.OrdinalIgnoreCase) ||
                   x.Key.ToString().Contains("SUPABASE", StringComparison.OrdinalIgnoreCase))
        .ToDictionary(x => x.Key.ToString(), x => string.IsNullOrEmpty(x.Value?.ToString()) ? "NULL/EMPTY" : "HAS_VALUE");

    var configValues = new Dictionary<string, object>
    {
        { "ConnectionStrings:DefaultConnection", app.Configuration.GetConnectionString("DefaultConnection") ?? "NULL" },
        { "DATABASE_CONNECTION_STRING (direct)", app.Configuration["DATABASE_CONNECTION_STRING"] ?? "NULL" },
        { "DATABASE_CONNECTION_STRING (env)", Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING") ?? "NULL" },
        { "JWT_SECRET_KEY", app.Configuration["JWT_SECRET_KEY"] != null ? "HAS_VALUE" : "NULL" },
        { "Jwt:Key", app.Configuration["Jwt:Key"] != null ? "HAS_VALUE" : "NULL" }
    };

    return Results.Ok(new
    {
        environment = app.Environment.EnvironmentName,
        environmentVariables = envVars,
        configurationValues = configValues,
        allConfigKeys = app.Configuration.AsEnumerable()
            .Select(x => new { x.Key, HasValue = !string.IsNullOrEmpty(x.Value) })
            .Where(x => x.Key.Contains("Connection", StringComparison.OrdinalIgnoreCase) ||
                       x.Key.Contains("DATABASE", StringComparison.OrdinalIgnoreCase) ||
                       x.Key.Contains("JWT", StringComparison.OrdinalIgnoreCase))
            .ToList()
    });
}).AllowAnonymous();

// Enhanced database health check endpoint
app.MapGet("/health/database", async (CosplayDateDbContext context, ILogger<Program> logger) =>
{
    try
    {
        var startTime = DateTime.UtcNow;
        var canConnect = await context.Database.CanConnectAsync();
        var duration = DateTime.UtcNow - startTime;

        logger.LogInformation("Database connectivity check: {CanConnect}, Duration: {Duration}ms",
            canConnect, duration.TotalMilliseconds);

        return Results.Ok(new
        {
            canConnect,
            responseTimeMs = duration.TotalMilliseconds,
            timestamp = DateTime.UtcNow,
            database = context.Database.GetDbConnection().Database,
            server = context.Database.GetDbConnection().DataSource,
            connectionString = context.Database.GetConnectionString()?.Substring(0, Math.Min(50, context.Database.GetConnectionString()?.Length ?? 0)) + "..."
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database health check failed");
        return Results.Ok(new
        {
            canConnect = false,
            error = ex.Message,
            timestamp = DateTime.UtcNow,
            errorType = ex.GetType().Name
        });
    }
}).AllowAnonymous();

// ===== NEW ADMIN DASHBOARD QUICK ACCESS ENDPOINT =====
app.MapGet("/admin/quick-stats", async (IServiceProvider serviceProvider) =>
{
    try
    {
        using var scope = serviceProvider.CreateScope();
        var analyticsService = scope.ServiceProvider.GetRequiredService<IAdminAnalyticsService>();

        var result = await analyticsService.GetDashboardStatsAsync();

        if (result.IsSuccess && result.Data != null)
        {
            return Results.Ok(new
            {
                message = "Admin Quick Stats",
                totalUsers = result.Data.UserStats.TotalUsers,
                onlineUsers = result.Data.UserStats.OnlineUsers,
                onlineCosplayers = result.Data.UserStats.OnlineCosplayers,
                completedBookings = result.Data.BookingStats.CompletedBookings,
                totalRevenue = result.Data.RevenueStats.TotalRevenue,
                revenueThisMonth = result.Data.RevenueStats.RevenueThisMonth,
                generatedAt = result.Data.GeneratedAt
            });
        }

        return Results.Problem("Failed to retrieve admin statistics");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error: {ex.Message}");
    }
}).AllowAnonymous(); // For quick testing - remove in production!

// Health checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

// Controllers
app.MapControllers();

// ===== DATABASE MIGRATION WITH RETRY LOGIC (Production) =====
if (app.Environment.IsProduction())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<CosplayDateDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    const int maxRetries = 3;
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            // Only run migrations if database exists
            if (await context.Database.CanConnectAsync())
            {
                logger.LogInformation("Running database migrations (attempt {Attempt}/{MaxRetries})", attempt, maxRetries);
                await context.Database.MigrateAsync();
                logger.LogInformation("Database migrations completed successfully");
                break;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database migration failed on attempt {Attempt}/{MaxRetries}", attempt, maxRetries);

            if (attempt == maxRetries)
            {
                logger.LogCritical("Database migration failed after {MaxRetries} attempts. Application will continue but database may not be up to date.", maxRetries);
            }
            else
            {
                await Task.Delay(TimeSpan.FromSeconds(5 * attempt)); // Progressive delay
            }
        }
    }
}

Console.WriteLine("🎭 CosplayDate API is ready!");
Console.WriteLine($"📊 Admin Dashboard: {(app.Environment.IsDevelopment() ? "http://localhost:5000" : "https://yourdomain.com")}/api/admin/dashboard/stats");
Console.WriteLine($"🔍 Quick Stats: {(app.Environment.IsDevelopment() ? "http://localhost:5000" : "https://yourdomain.com")}/admin/quick-stats");

app.Run();