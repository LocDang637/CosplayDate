// CosplayDate.Application/Services/Implementations/CosplayerService.cs
using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CosplayDate.Application.Services.Implementations
{
    public class CosplayerService : ICosplayerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CosplayerService> _logger;

        // Available categories for cosplayers
        private readonly List<string> _availableCategories = new()
        {
            "Anime", "Game", "Movie", "TV Show", "Comic", "Original Character",
            "Fantasy", "Sci-Fi", "Historical", "Gothic", "Kawaii", "Maid",
            "School Uniform", "Traditional", "Modern", "Other"
        };

        // Available specialties
        private readonly List<string> _availableSpecialties = new()
        {
            "Costume Making", "Prop Making", "Wig Styling", "Makeup Artist",
            "Photography", "Performance", "Voice Acting", "Dancing",
            "Singing", "Martial Arts", "Magic Shows", "Comedy",
            "Character Interaction", "Event Hosting", "Workshop Teaching"
        };

        public CosplayerService(IUnitOfWork unitOfWork, ILogger<CosplayerService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<ApiResponse<GetCosplayersResponseDto>> GetCosplayersAsync(GetCosplayersRequestDto request)
        {
            try
            {
                // Get all cosplayers with related data
                var cosplayersQuery = await _unitOfWork.Cosplayers.FindAsync(c => c.User.IsActive == true && c.User.IsVerified);
                var cosplayersList = cosplayersQuery.ToList();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    var searchTerm = request.SearchTerm.ToLower();
                    cosplayersList = cosplayersList.Where(c =>
                        c.DisplayName.ToLower().Contains(searchTerm) ||
                        c.User.FirstName.ToLower().Contains(searchTerm) ||
                        c.User.LastName.ToLower().Contains(searchTerm) ||
                        (c.User.Bio != null && c.User.Bio.ToLower().Contains(searchTerm)) ||
                        (c.CharacterSpecialty != null && c.CharacterSpecialty.ToLower().Contains(searchTerm))
                    ).ToList();
                }

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    cosplayersList = cosplayersList.Where(c => c.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase)).ToList();
                }

                if (!string.IsNullOrWhiteSpace(request.Location))
                {
                    cosplayersList = cosplayersList.Where(c => c.User.Location != null &&
                        c.User.Location.ToLower().Contains(request.Location.ToLower())).ToList();
                }

                if (!string.IsNullOrWhiteSpace(request.Gender))
                {
                    cosplayersList = cosplayersList.Where(c => c.Gender != null &&
                        c.Gender.Equals(request.Gender, StringComparison.OrdinalIgnoreCase)).ToList();
                }

                if (request.MinPrice.HasValue)
                {
                    cosplayersList = cosplayersList.Where(c => c.PricePerHour >= request.MinPrice.Value).ToList();
                }

                if (request.MaxPrice.HasValue)
                {
                    cosplayersList = cosplayersList.Where(c => c.PricePerHour <= request.MaxPrice.Value).ToList();
                }

                if (request.MinRating.HasValue)
                {
                    cosplayersList = cosplayersList.Where(c => c.Rating >= request.MinRating.Value).ToList();
                }

                if (request.IsAvailable.HasValue)
                {
                    cosplayersList = cosplayersList.Where(c => c.IsAvailable == request.IsAvailable.Value).ToList();
                }

                // Apply specialty filter
                if (request.Specialties != null && request.Specialties.Any())
                {
                    var specialtyUserIds = new List<int>();
                    foreach (var specialty in request.Specialties)
                    {
                        var specialtyRecords = await _unitOfWork.Repository<CosplayerSpecialty>()
                            .FindAsync(cs => cs.Specialty.Equals(specialty, StringComparison.OrdinalIgnoreCase));
                        specialtyUserIds.AddRange(specialtyRecords.Select(cs => cs.CosplayerId));
                    }
                    cosplayersList = cosplayersList.Where(c => specialtyUserIds.Contains(c.Id)).ToList();
                }

                // Apply tag filter
                if (request.Tags != null && request.Tags.Any())
                {
                    foreach (var tag in request.Tags)
                    {
                        cosplayersList = cosplayersList.Where(c => c.Tags != null &&
                            c.Tags.ToLower().Contains(tag.ToLower())).ToList();
                    }
                }

                // Apply sorting
                cosplayersList = request.SortBy?.ToLower() switch
                {
                    "price" => request.SortOrder?.ToLower() == "asc"
                        ? cosplayersList.OrderBy(c => c.PricePerHour).ToList()
                        : cosplayersList.OrderByDescending(c => c.PricePerHour).ToList(),
                    "name" => request.SortOrder?.ToLower() == "asc"
                        ? cosplayersList.OrderBy(c => c.DisplayName).ToList()
                        : cosplayersList.OrderByDescending(c => c.DisplayName).ToList(),
                    "created_date" => request.SortOrder?.ToLower() == "asc"
                        ? cosplayersList.OrderBy(c => c.CreatedAt).ToList()
                        : cosplayersList.OrderByDescending(c => c.CreatedAt).ToList(),
                    _ => request.SortOrder?.ToLower() == "asc"
                        ? cosplayersList.OrderBy(c => c.Rating ?? 0).ToList()
                        : cosplayersList.OrderByDescending(c => c.Rating ?? 0).ToList()
                };

                var totalCount = cosplayersList.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

                // Apply pagination
                var paginatedCosplayers = cosplayersList
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                // Convert to DTOs
                var cosplayerDtos = new List<CosplayerSummaryDto>();
                foreach (var cosplayer in paginatedCosplayers)
                {
                    var user = await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId);
                    if (user == null) continue;

                    // Get specialties
                    var specialties = await _unitOfWork.Repository<CosplayerSpecialty>()
                        .FindAsync(cs => cs.CosplayerId == cosplayer.Id);

                    // Get featured photo
                    var featuredPhoto = await _unitOfWork.Repository<CosplayerPhoto>()
                        .FirstOrDefaultAsync(cp => cp.CosplayerId == cosplayer.Id && cp.IsPortfolio == true);

                    var dto = new CosplayerSummaryDto
                    {
                        Id = cosplayer.Id,
                        UserId = cosplayer.UserId,
                        DisplayName = cosplayer.DisplayName,
                        AvatarUrl = user.AvatarUrl,
                        PricePerHour = cosplayer.PricePerHour,
                        Category = cosplayer.Category,
                        Gender = cosplayer.Gender,
                        Rating = cosplayer.Rating,
                        TotalReviews = cosplayer.TotalReviews,
                        FollowersCount = cosplayer.FollowersCount,
                        ResponseTime = cosplayer.ResponseTime,
                        IsAvailable = cosplayer.IsAvailable,
                        Location = user.Location,
                        Bio = user.Bio,
                        Specialties = specialties.Select(s => s.Specialty).ToList(),
                        Tags = cosplayer.Tags?.Split(',').Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList() ?? new List<string>(),
                        FeaturedPhotoUrl = featuredPhoto?.PhotoUrl,
                        IsFollowing = false, // Will be set if currentUserId is provided
                        IsFavorite = false   // Will be set if currentUserId is provided
                    };

                    cosplayerDtos.Add(dto);
                }

                var response = new GetCosplayersResponseDto
                {
                    Cosplayers = cosplayerDtos,
                    TotalCount = totalCount,
                    CurrentPage = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = totalPages,
                    HasNextPage = request.Page < totalPages,
                    HasPreviousPage = request.Page > 1,
                    AvailableCategories = _availableCategories,
                    AvailableSpecialties = _availableSpecialties,
                    AvailableTags = GetAvailableTags()
                };

                return ApiResponse<GetCosplayersResponseDto>.Success(response, "Cosplayers retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayers list");
                return ApiResponse<GetCosplayersResponseDto>.Error("An error occurred while retrieving cosplayers.");
            }
        }

        public async Task<ApiResponse<CosplayerDetailsDto>> GetCosplayerDetailsAsync(int cosplayerId, int currentUserId = 0)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerDetailsDto>.Error("Cosplayer not found.");
                }

                var user = await _unitOfWork.Users.GetByIdAsync(cosplayer.UserId);
                if (user == null || !user.IsActive.GetValueOrDefault() || !user.IsVerified)
                {
                    return ApiResponse<CosplayerDetailsDto>.Error("Cosplayer profile is not available.");
                }

                // Get related data
                var specialties = await _unitOfWork.Repository<CosplayerSpecialty>()
                    .FindAsync(cs => cs.CosplayerId == cosplayer.Id);

                var services = await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>()
                    .FindAsync(cs => cs.CosplayerId == cosplayer.Id);

                var photos = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FindAsync(cp => cp.CosplayerId == cosplayer.Id);

                var videos = await _unitOfWork.Repository<CosplayerVideo>()
                    .FindAsync(cv => cv.CosplayerId == cosplayer.Id);

                var reviews = await _unitOfWork.Reviews
                    .FindAsync(r => r.CosplayerId == cosplayer.Id);

                // Check if current user is following/favoriting this cosplayer
                var isFollowing = false;
                var isFavorite = false;
                if (currentUserId > 0)
                {
                    var followRecord = await _unitOfWork.UserFollows
                        .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowedId == cosplayer.UserId);
                    isFollowing = followRecord != null;

                    var favoriteRecord = await _unitOfWork.Favorites
                        .FirstOrDefaultAsync(f => f.CustomerId == currentUserId && f.CosplayerId == cosplayer.Id);
                    isFavorite = favoriteRecord != null;
                }

                // Convert to DTOs
                var servicesDtos = services.Select(s => new CosplayerServiceDto
                {
                    Id = s.Id,
                    ServiceName = s.ServiceName,
                    ServiceDescription = s.ServiceDescription
                }).ToList();

                var photosDtos = new List<CosplayerPhotoDto>();
                foreach (var photo in photos.OrderBy(p => p.DisplayOrder))
                {
                    var photoTags = await _unitOfWork.Repository<PhotoTag>()
                        .FindAsync(pt => pt.PhotoId == photo.Id);

                    var isLiked = false;
                    if (currentUserId > 0)
                    {
                        var likeRecord = await _unitOfWork.PhotoLikes
                            .FirstOrDefaultAsync(pl => pl.PhotoId == photo.Id && pl.UserId == currentUserId);
                        isLiked = likeRecord != null;
                    }

                    photosDtos.Add(new CosplayerPhotoDto
                    {
                        Id = photo.Id,
                        PhotoUrl = photo.PhotoUrl,
                        Title = photo.Title,
                        Description = photo.Description,
                        Category = photo.Category,
                        IsPortfolio = photo.IsPortfolio,
                        DisplayOrder = photo.DisplayOrder,
                        LikesCount = photo.LikesCount,
                        ViewsCount = photo.ViewsCount,
                        Tags = photoTags.Select(pt => pt.Tag).ToList(),
                        IsLiked = isLiked,
                        CreatedAt = photo.CreatedAt
                    });
                }

                var videosDtos = videos.OrderBy(v => v.DisplayOrder).Select(v => new CosplayerVideoDto
                {
                    Id = v.Id,
                    VideoUrl = v.VideoUrl,
                    ThumbnailUrl = v.ThumbnailUrl,
                    Title = v.Title,
                    Description = v.Description,
                    Category = v.Category,
                    Duration = v.Duration,
                    ViewCount = v.ViewCount,
                    LikesCount = v.LikesCount,
                    DisplayOrder = v.DisplayOrder,
                    CreatedAt = v.CreatedAt
                }).ToList();

                var recentReviewsDtos = new List<ReviewSummaryDto>();
                foreach (var review in reviews.OrderByDescending(r => r.CreatedAt).Take(5))
                {
                    var customer = await _unitOfWork.Users.GetByIdAsync(review.CustomerId);
                    var reviewTags = await _unitOfWork.Repository<ReviewTag>()
                        .FindAsync(rt => rt.ReviewId == review.Id);

                    recentReviewsDtos.Add(new ReviewSummaryDto
                    {
                        Id = review.Id,
                        CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : "Anonymous",
                        CustomerAvatarUrl = customer?.AvatarUrl,
                        Rating = review.Rating,
                        Comment = review.Comment,
                        IsVerified = review.IsVerified,
                        HelpfulCount = review.HelpfulCount,
                        OwnerResponse = review.OwnerResponse,
                        CreatedAt = review.CreatedAt,
                        Tags = reviewTags.Select(rt => rt.Tag).ToList()
                    });
                }

                // Calculate stats
                var stats = await GetCosplayerStatsInternal(cosplayer.Id, cosplayer.UserId);

                var detailsDto = new CosplayerDetailsDto
                {
                    Id = cosplayer.Id,
                    UserId = cosplayer.UserId,
                    DisplayName = cosplayer.DisplayName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    AvatarUrl = user.AvatarUrl,
                    PricePerHour = cosplayer.PricePerHour,
                    Category = cosplayer.Category,
                    Gender = cosplayer.Gender,
                    CharacterSpecialty = cosplayer.CharacterSpecialty,
                    Rating = cosplayer.Rating,
                    TotalReviews = cosplayer.TotalReviews,
                    FollowersCount = cosplayer.FollowersCount,
                    ResponseTime = cosplayer.ResponseTime,
                    SuccessRate = cosplayer.SuccessRate,
                    IsAvailable = cosplayer.IsAvailable,
                    Location = user.Location,
                    Bio = user.Bio,
                    CreatedAt = cosplayer.CreatedAt,
                    Specialties = specialties.Select(s => s.Specialty).ToList(),
                    Tags = cosplayer.Tags?.Split(',').Select(t => t.Trim()).Where(t => !string.IsNullOrEmpty(t)).ToList() ?? new List<string>(),
                    Services = servicesDtos,
                    Photos = photosDtos,
                    Videos = videosDtos,
                    RecentReviews = recentReviewsDtos,
                    IsFollowing = isFollowing,
                    IsFavorite = isFavorite,
                    IsOwnProfile = currentUserId == cosplayer.UserId,
                    Stats = stats
                };

                return ApiResponse<CosplayerDetailsDto>.Success(detailsDto, "Cosplayer details retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer details for ID: {CosplayerId}", cosplayerId);
                return ApiResponse<CosplayerDetailsDto>.Error("An error occurred while retrieving cosplayer details.");
            }
        }

        public async Task<ApiResponse<CosplayerDetailsDto>> UpdateCosplayerProfileAsync(int userId, UpdateCosplayerProfileRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null || user.UserType != "Cosplayer")
                {
                    return ApiResponse<CosplayerDetailsDto>.Error("Cosplayer profile not found.");
                }

                var cosplayer = await _unitOfWork.Repository<Cosplayer>()
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerDetailsDto>.Error("Cosplayer profile not found.");
                }

                // Update cosplayer information
                if (!string.IsNullOrWhiteSpace(request.DisplayName))
                    cosplayer.DisplayName = request.DisplayName.Trim();

                if (request.PricePerHour.HasValue)
                    cosplayer.PricePerHour = request.PricePerHour.Value;

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    if (!_availableCategories.Contains(request.Category))
                    {
                        return ApiResponse<CosplayerDetailsDto>.Error($"Invalid category. Available categories: {string.Join(", ", _availableCategories)}");
                    }
                    cosplayer.Category = request.Category;
                }

                if (request.Gender != null)
                    cosplayer.Gender = request.Gender.Trim();

                if (request.CharacterSpecialty != null)
                    cosplayer.CharacterSpecialty = request.CharacterSpecialty.Trim();

                if (request.Tags != null)
                    cosplayer.Tags = request.Tags.Trim();

                if (request.IsAvailable.HasValue)
                    cosplayer.IsAvailable = request.IsAvailable.Value;

                cosplayer.UpdatedAt = DateTime.UtcNow;

                // Update specialties if provided
                if (request.Specialties != null)
                {
                    // Validate specialties
                    var invalidSpecialties = request.Specialties.Where(s => !_availableSpecialties.Contains(s)).ToList();
                    if (invalidSpecialties.Any())
                    {
                        return ApiResponse<CosplayerDetailsDto>.Error($"Invalid specialties: {string.Join(", ", invalidSpecialties)}");
                    }

                    // Remove existing specialties
                    var existingSpecialties = await _unitOfWork.Repository<CosplayerSpecialty>()
                        .FindAsync(cs => cs.CosplayerId == cosplayer.Id);

                    foreach (var specialty in existingSpecialties)
                    {
                        _unitOfWork.Repository<CosplayerSpecialty>().Remove(specialty);
                    }

                    // Add new specialties
                    foreach (var specialtyName in request.Specialties.Distinct())
                    {
                        if (!string.IsNullOrWhiteSpace(specialtyName))
                        {
                            await _unitOfWork.Repository<CosplayerSpecialty>().AddAsync(new CosplayerSpecialty
                            {
                                CosplayerId = cosplayer.Id,
                                Specialty = specialtyName.Trim()
                            });
                        }
                    }
                }

                _unitOfWork.Cosplayers.Update(cosplayer);
                await _unitOfWork.SaveChangesAsync();

                // Return updated profile
                return await GetCosplayerDetailsAsync(cosplayer.Id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cosplayer profile for user: {UserId}", userId);
                return ApiResponse<CosplayerDetailsDto>.Error("An error occurred while updating the cosplayer profile.");
            }
        }

        public async Task<ApiResponse<BecomeCosplayerResponseDto>> BecomeCosplayerAsync(int userId, BecomeCosplayerRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<BecomeCosplayerResponseDto>.Error("User not found.");
                }

                if (user.UserType == "Cosplayer")
                {
                    return ApiResponse<BecomeCosplayerResponseDto>.Error("User is already a cosplayer.");
                }

                if (!user.IsVerified)
                {
                    return ApiResponse<BecomeCosplayerResponseDto>.Error("User email must be verified before becoming a cosplayer.");
                }

                // Validate category
                if (!_availableCategories.Contains(request.Category))
                {
                    return ApiResponse<BecomeCosplayerResponseDto>.Error($"Invalid category. Available categories: {string.Join(", ", _availableCategories)}");
                }

                // Validate specialties if provided
                if (request.Specialties != null && request.Specialties.Any())
                {
                    var invalidSpecialties = request.Specialties.Where(s => !_availableSpecialties.Contains(s)).ToList();
                    if (invalidSpecialties.Any())
                    {
                        return ApiResponse<BecomeCosplayerResponseDto>.Error($"Invalid specialties: {string.Join(", ", invalidSpecialties)}");
                    }
                }

                // Create cosplayer profile
                var cosplayer = new Cosplayer
                {
                    UserId = userId,
                    DisplayName = request.DisplayName.Trim(),
                    PricePerHour = request.PricePerHour,
                    Category = request.Category,
                    Gender = request.Gender?.Trim(),
                    CharacterSpecialty = request.CharacterSpecialty?.Trim(),
                    Tags = request.Tags?.Trim(),
                    Rating = 0,
                    TotalReviews = 0,
                    FollowersCount = 0,
                    ResponseTime = "< 1 hour",
                    SuccessRate = 0,
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Cosplayers.AddAsync(cosplayer);

                // Update user type
                user.UserType = "Cosplayer";
                user.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(user);

                await _unitOfWork.SaveChangesAsync();

                // Add specialties if provided
                if (request.Specialties != null && request.Specialties.Any())
                {
                    foreach (var specialtyName in request.Specialties.Distinct())
                    {
                        if (!string.IsNullOrWhiteSpace(specialtyName))
                        {
                            await _unitOfWork.Repository<CosplayerSpecialty>().AddAsync(new CosplayerSpecialty
                            {
                                CosplayerId = cosplayer.Id,
                                Specialty = specialtyName.Trim()
                            });
                        }
                    }
                    await _unitOfWork.SaveChangesAsync();
                }

                var response = new BecomeCosplayerResponseDto
                {
                    CosplayerId = cosplayer.Id,
                    DisplayName = cosplayer.DisplayName,
                    Message = "Congratulations! You are now a cosplayer on CosplayDate!",
                    RequiresApproval = false,
                    CreatedAt = cosplayer.CreatedAt.GetValueOrDefault()
                };

                _logger.LogInformation("User {UserId} successfully became a cosplayer with ID {CosplayerId}", userId, cosplayer.Id);
                return ApiResponse<BecomeCosplayerResponseDto>.Success(response, "Successfully became a cosplayer!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting user {UserId} to cosplayer", userId);
                return ApiResponse<BecomeCosplayerResponseDto>.Error("An error occurred while converting to cosplayer.");
            }
        }

        public async Task<ApiResponse<CosplayerServicesResponseDto>> GetCosplayerServicesAsync(int cosplayerId)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerServicesResponseDto>.Error("Cosplayer not found.");
                }

                var services = await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>()
                    .FindAsync(cs => cs.CosplayerId == cosplayerId);

                var serviceDtos = services.Select(s => new CosplayerServiceDto
                {
                    Id = s.Id,
                    ServiceName = s.ServiceName,
                    ServiceDescription = s.ServiceDescription
                }).ToList();

                var response = new CosplayerServicesResponseDto
                {
                    Services = serviceDtos,
                    TotalCount = serviceDtos.Count,
                    CosplayerName = cosplayer.DisplayName
                };

                return ApiResponse<CosplayerServicesResponseDto>.Success(response, "Cosplayer services retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cosplayer services for ID: {CosplayerId}", cosplayerId);
                return ApiResponse<CosplayerServicesResponseDto>.Error("An error occurred while retrieving cosplayer services.");
            }
        }

        public async Task<ApiResponse<CosplayerServiceDto>> AddServiceAsync(int userId, AddCosplayerServiceRequestDto request)
        {
            try
            {
                var cosplayer = await _unitOfWork.Repository<Cosplayer>()
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerServiceDto>.Error("Cosplayer profile not found.");
                }

                // Check if service already exists
                var existingService = await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>()
                    .FirstOrDefaultAsync(cs => cs.CosplayerId == cosplayer.Id &&
                        cs.ServiceName.ToLower() == request.ServiceName.ToLower());

                if (existingService != null)
                {
                    return ApiResponse<CosplayerServiceDto>.Error("A service with this name already exists.");
                }

                var service = new CosplayDate.Domain.Entities.CosplayerService
                {
                    CosplayerId = cosplayer.Id,
                    ServiceName = request.ServiceName.Trim(),
                    ServiceDescription = request.ServiceDescription?.Trim()
                };

                await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>().AddAsync(service);
                await _unitOfWork.SaveChangesAsync();

                var serviceDto = new CosplayerServiceDto
                {
                    Id = service.Id,
                    ServiceName = service.ServiceName,
                    ServiceDescription = service.ServiceDescription
                };

                _logger.LogInformation("Service added for cosplayer {CosplayerId}: {ServiceName}", cosplayer.Id, service.ServiceName);
                return ApiResponse<CosplayerServiceDto>.Success(serviceDto, "Service added successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding service for user: {UserId}", userId);
                return ApiResponse<CosplayerServiceDto>.Error("An error occurred while adding the service.");
            }
        }

        public async Task<ApiResponse<CosplayerServiceDto>> UpdateServiceAsync(int userId, int serviceId, UpdateCosplayerServiceRequestDto request)
        {
            try
            {
                var cosplayer = await _unitOfWork.Repository<Cosplayer>()
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerServiceDto>.Error("Cosplayer profile not found.");
                }

                var service = await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>()
                    .FirstOrDefaultAsync(cs => cs.Id == serviceId && cs.CosplayerId == cosplayer.Id);

                if (service == null)
                {
                    return ApiResponse<CosplayerServiceDto>.Error("Service not found or you don't have permission to update it.");
                }

                // Check if another service with the same name exists (excluding current service)
                var existingService = await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>()
                    .FirstOrDefaultAsync(cs => cs.CosplayerId == cosplayer.Id &&
                        cs.Id != serviceId &&
                        cs.ServiceName.ToLower() == request.ServiceName.ToLower());

                if (existingService != null)
                {
                    return ApiResponse<CosplayerServiceDto>.Error("A service with this name already exists.");
                }

                service.ServiceName = request.ServiceName.Trim();
                service.ServiceDescription = request.ServiceDescription?.Trim();

                _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>().Update(service);
                await _unitOfWork.SaveChangesAsync();

                var serviceDto = new CosplayerServiceDto
                {
                    Id = service.Id,
                    ServiceName = service.ServiceName,
                    ServiceDescription = service.ServiceDescription
                };

                _logger.LogInformation("Service updated for cosplayer {CosplayerId}: {ServiceName}", cosplayer.Id, service.ServiceName);
                return ApiResponse<CosplayerServiceDto>.Success(serviceDto, "Service updated successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service {ServiceId} for user: {UserId}", serviceId, userId);
                return ApiResponse<CosplayerServiceDto>.Error("An error occurred while updating the service.");
            }
        }

        public async Task<ApiResponse<string>> DeleteServiceAsync(int userId, int serviceId)
        {
            try
            {
                var cosplayer = await _unitOfWork.Repository<Cosplayer>()
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                var service = await _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>()
                    .FirstOrDefaultAsync(cs => cs.Id == serviceId && cs.CosplayerId == cosplayer.Id);

                if (service == null)
                {
                    return ApiResponse<string>.Error("Service not found or you don't have permission to delete it.");
                }

                _unitOfWork.Repository<CosplayDate.Domain.Entities.CosplayerService>().Remove(service);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Service deleted for cosplayer {CosplayerId}: {ServiceName}", cosplayer.Id, service.ServiceName);
                return ApiResponse<string>.Success("", "Service deleted successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting service {ServiceId} for user: {UserId}", serviceId, userId);
                return ApiResponse<string>.Error("An error occurred while deleting the service.");
            }
        }

        // Private helper methods
        private async Task<CosplayerStatsDto> GetCosplayerStatsInternal(int cosplayerId, int userId)
        {
            try
            {
                var bookings = await _unitOfWork.Bookings.FindAsync(b => b.CosplayerId == cosplayerId);
                var completedBookings = bookings.Where(b => b.Status == "Completed").Count();

                var followers = await _unitOfWork.UserFollows.CountAsync(f => f.FollowedId == userId);

                var photos = await _unitOfWork.Repository<CosplayerPhoto>().CountAsync(cp => cp.CosplayerId == cosplayerId);
                var videos = await _unitOfWork.Repository<CosplayerVideo>().CountAsync(cv => cv.CosplayerId == cosplayerId);

                var photoLikes = await _unitOfWork.PhotoLikes.FindAsync(pl => pl.Photo.CosplayerId == cosplayerId);

                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);

                return new CosplayerStatsDto
                {
                    TotalBookings = bookings.Count(),
                    CompletedBookings = completedBookings,
                    TotalFollowers = followers,
                    TotalPhotos = photos,
                    TotalVideos = videos,
                    TotalLikes = photoLikes.Count(),
                    ProfileViews = 0, // Would need a ProfileViews table
                    MemberSince = cosplayer?.CreatedAt ?? DateTime.UtcNow,
                    SuccessRate = cosplayer?.SuccessRate ?? 0,
                    ResponseTime = cosplayer?.ResponseTime ?? "< 1 hour"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating cosplayer stats for: {CosplayerId}", cosplayerId);
                return new CosplayerStatsDto();
            }
        }

        private static List<string> GetAvailableTags()
        {
            return new List<string>
            {
                "Beginner Friendly", "Professional", "Affordable", "Premium", "Quick Response",
                "Custom Outfits", "Props Included", "Makeup Included", "Photography", "Events",
                "Conventions", "Photoshoots", "Group Cosplay", "Solo Performance", "Interactive",
                "High Quality", "Award Winner", "Experienced", "Creative", "Detailed"
            };
        }
    }
}