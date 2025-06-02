// CosplayDate.Application/Services/Implementations/CosplayerMediaService.cs
using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;

namespace CosplayDate.Application.Services.Implementations
{
    public class CosplayerMediaService : ICosplayerMediaService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISupabaseService _supabaseService;
        private readonly ILogger<CosplayerMediaService> _logger;

        // Available photo categories
        private readonly List<string> _availablePhotoCategories = new()
        {
            "Cosplay", "Portrait", "Action", "Group", "Behind the Scenes",
            "Props", "Makeup", "Work in Progress", "Convention", "Photoshoot", "Other"
        };

        // Available video categories
        private readonly List<string> _availableVideoCategories = new()
        {
            "Performance", "Tutorial", "Behind the Scenes", "Transformation",
            "Convention", "Dance", "Skit", "Voice Acting", "Review", "Other"
        };

        public CosplayerMediaService(
            IUnitOfWork unitOfWork,
            ISupabaseService supabaseService,
            ILogger<CosplayerMediaService> logger)
        {
            _unitOfWork = unitOfWork;
            _supabaseService = supabaseService;
            _logger = logger;
        }

        #region Photo Management

        public async Task<ApiResponse<UploadPhotoResponseDto>> UploadPhotoAsync(int userId, UploadCosplayerPhotoRequestDto request)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<UploadPhotoResponseDto>.Error("Cosplayer profile not found.");
                }

                // Validate category if provided
                if (!string.IsNullOrWhiteSpace(request.Category) &&
                    !_availablePhotoCategories.Contains(request.Category))
                {
                    return ApiResponse<UploadPhotoResponseDto>.Error(
                        $"Invalid category. Available categories: {string.Join(", ", _availablePhotoCategories)}");
                }

                // Upload photo to Supabase
                var fileName = $"cosplayers/{cosplayer.Id}/photos/{Guid.NewGuid()}{Path.GetExtension(request.File.FileName)}";
                var photoUrl = await _supabaseService.UploadFileAsync(request.File, fileName);

                // Create photo record
                var photo = new CosplayerPhoto
                {
                    CosplayerId = cosplayer.Id,
                    PhotoUrl = photoUrl,
                    Title = request.Title?.Trim(),
                    Description = request.Description?.Trim(),
                    Category = request.Category?.Trim() ?? "Other",
                    IsPortfolio = request.IsPortfolio,
                    DisplayOrder = request.DisplayOrder,
                    LikesCount = 0,
                    ViewsCount = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<CosplayerPhoto>().AddAsync(photo);
                await _unitOfWork.SaveChangesAsync();

                // Add tags if provided
                if (request.Tags != null && request.Tags.Any())
                {
                    await AddPhotoTagsAsync(photo.Id, request.Tags);
                }

                var response = new UploadPhotoResponseDto
                {
                    PhotoId = photo.Id,
                    PhotoUrl = photoUrl,
                    Title = photo.Title,
                    Message = "Photo uploaded successfully.",
                    UploadedAt = photo.CreatedAt.GetValueOrDefault()
                };

                _logger.LogInformation("Photo uploaded for cosplayer {CosplayerId}: {PhotoId}", cosplayer.Id, photo.Id);
                return ApiResponse<UploadPhotoResponseDto>.Success(response, "Photo uploaded successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading photo for user: {UserId}", userId);
                return ApiResponse<UploadPhotoResponseDto>.Error("An error occurred while uploading the photo.");
            }
        }

        public async Task<ApiResponse<CosplayerPhotoDto>> UpdatePhotoAsync(int userId, int photoId, UpdateCosplayerPhotoRequestDto request)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerPhotoDto>.Error("Cosplayer profile not found.");
                }

                var photo = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FirstOrDefaultAsync(p => p.Id == photoId && p.CosplayerId == cosplayer.Id);

                if (photo == null)
                {
                    return ApiResponse<CosplayerPhotoDto>.Error("Photo not found or you don't have permission to update it.");
                }

                // Validate category if provided
                if (!string.IsNullOrWhiteSpace(request.Category) &&
                    !_availablePhotoCategories.Contains(request.Category))
                {
                    return ApiResponse<CosplayerPhotoDto>.Error(
                        $"Invalid category. Available categories: {string.Join(", ", _availablePhotoCategories)}");
                }

                // Update photo details
                if (request.Title != null)
                    photo.Title = request.Title.Trim();

                if (request.Description != null)
                    photo.Description = request.Description.Trim();

                if (request.Category != null)
                    photo.Category = request.Category.Trim();

                if (request.IsPortfolio.HasValue)
                    photo.IsPortfolio = request.IsPortfolio.Value;

                if (request.DisplayOrder.HasValue)
                    photo.DisplayOrder = request.DisplayOrder.Value;

                // Update tags if provided
                if (request.Tags != null)
                {
                    await UpdatePhotoTagsAsync(photoId, request.Tags);
                }

                _unitOfWork.Repository<CosplayerPhoto>().Update(photo);
                await _unitOfWork.SaveChangesAsync();

                // Get updated photo DTO
                var photoDto = await GetPhotoDetailsDtoAsync(photo);

                _logger.LogInformation("Photo updated for cosplayer {CosplayerId}: {PhotoId}", cosplayer.Id, photoId);
                return ApiResponse<CosplayerPhotoDto>.Success(photoDto, "Photo updated successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating photo {PhotoId} for user: {UserId}", photoId, userId);
                return ApiResponse<CosplayerPhotoDto>.Error("An error occurred while updating the photo.");
            }
        }

        public async Task<ApiResponse<string>> DeletePhotoAsync(int userId, int photoId)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                var photo = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FirstOrDefaultAsync(p => p.Id == photoId && p.CosplayerId == cosplayer.Id);

                if (photo == null)
                {
                    return ApiResponse<string>.Error("Photo not found or you don't have permission to delete it.");
                }

                // Delete from Supabase
                await _supabaseService.DeleteFileAsync(photo.PhotoUrl);

                // Delete related records
                await DeletePhotoRelatedDataAsync(photoId);

                // Delete photo record
                _unitOfWork.Repository<CosplayerPhoto>().Remove(photo);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Photo deleted for cosplayer {CosplayerId}: {PhotoId}", cosplayer.Id, photoId);
                return ApiResponse<string>.Success("", "Photo deleted successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting photo {PhotoId} for user: {UserId}", photoId, userId);
                return ApiResponse<string>.Error("An error occurred while deleting the photo.");
            }
        }

        public async Task<ApiResponse<CosplayerPhotosResponseDto>> GetPhotosAsync(int cosplayerId, int currentUserId, GetCosplayerPhotosRequestDto request)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerPhotosResponseDto>.Error("Cosplayer not found.");
                }

                // Get photos with filters
                var photosQuery = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FindAsync(p => p.CosplayerId == cosplayerId);
                var photosList = photosQuery.ToList();

                // Apply filters
                photosList = ApplyPhotoFilters(photosList, request);

                // Apply sorting
                photosList = ApplyPhotoSorting(photosList, request);

                var totalCount = photosList.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

                // Apply pagination
                var paginatedPhotos = photosList
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                // Convert to DTOs
                var photoDtos = new List<CosplayerPhotoDto>();
                foreach (var photo in paginatedPhotos)
                {
                    var photoDto = await GetPhotoDetailsDtoAsync(photo, currentUserId);
                    photoDtos.Add(photoDto);
                }

                // Get available tags for this cosplayer
                var allPhotoIds = photosList.Select(p => p.Id).ToList();
                var allTags = await _unitOfWork.Repository<PhotoTag>()
                    .FindAsync(pt => allPhotoIds.Contains(pt.PhotoId));

                var response = new CosplayerPhotosResponseDto
                {
                    Photos = photoDtos,
                    TotalCount = totalCount,
                    CurrentPage = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = totalPages,
                    HasNextPage = request.Page < totalPages,
                    HasPreviousPage = request.Page > 1,
                    CosplayerName = cosplayer.DisplayName,
                    AvailableCategories = _availablePhotoCategories,
                    AvailableTags = allTags.Select(t => t.Tag).Distinct().ToList()
                };

                return ApiResponse<CosplayerPhotosResponseDto>.Success(response, "Photos retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting photos for cosplayer: {CosplayerId}", cosplayerId);
                return ApiResponse<CosplayerPhotosResponseDto>.Error("An error occurred while retrieving photos.");
            }
        }

        public async Task<ApiResponse<PhotoLikeResponseDto>> TogglePhotoLikeAsync(int userId, int photoId)
        {
            try
            {
                var photo = await _unitOfWork.Repository<CosplayerPhoto>().GetByIdAsync(photoId);
                if (photo == null)
                {
                    return ApiResponse<PhotoLikeResponseDto>.Error("Photo not found.");
                }

                var existingLike = await _unitOfWork.PhotoLikes
                    .FirstOrDefaultAsync(pl => pl.PhotoId == photoId && pl.UserId == userId);

                bool isLiked;
                if (existingLike != null)
                {
                    // Unlike
                    _unitOfWork.PhotoLikes.Remove(existingLike);
                    photo.LikesCount = Math.Max(0, (photo.LikesCount ?? 0) - 1);
                    isLiked = false;
                }
                else
                {
                    // Like
                    await _unitOfWork.PhotoLikes.AddAsync(new PhotoLike
                    {
                        PhotoId = photoId,
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow
                    });
                    photo.LikesCount = (photo.LikesCount ?? 0) + 1;
                    isLiked = true;
                }

                _unitOfWork.Repository<CosplayerPhoto>().Update(photo);
                await _unitOfWork.SaveChangesAsync();

                var response = new PhotoLikeResponseDto
                {
                    IsLiked = isLiked,
                    TotalLikes = photo.LikesCount ?? 0,
                    Message = isLiked ? "Photo liked!" : "Photo unliked!"
                };

                return ApiResponse<PhotoLikeResponseDto>.Success(response, response.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling photo like for photo {PhotoId} by user {UserId}", photoId, userId);
                return ApiResponse<PhotoLikeResponseDto>.Error("An error occurred while processing the like.");
            }
        }

        public async Task<ApiResponse<string>> ReorderPhotosAsync(int userId, ReorderPhotosRequestDto request)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                // Verify all photos belong to this cosplayer
                var photoIds = request.PhotoOrders.Select(po => po.PhotoId).ToList();
                var photos = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FindAsync(p => photoIds.Contains(p.Id) && p.CosplayerId == cosplayer.Id);

                if (photos.Count() != photoIds.Count)
                {
                    return ApiResponse<string>.Error("Some photos not found or you don't have permission to reorder them.");
                }

                // Update display orders
                foreach (var photoOrder in request.PhotoOrders)
                {
                    var photo = photos.First(p => p.Id == photoOrder.PhotoId);
                    photo.DisplayOrder = photoOrder.DisplayOrder;
                    _unitOfWork.Repository<CosplayerPhoto>().Update(photo);
                }

                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Photos reordered for cosplayer {CosplayerId}", cosplayer.Id);
                return ApiResponse<string>.Success("", "Photos reordered successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering photos for user: {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while reordering photos.");
            }
        }

        #endregion

        #region Video Management

        public async Task<ApiResponse<UploadVideoResponseDto>> UploadVideoAsync(int userId, UploadCosplayerVideoRequestDto request)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<UploadVideoResponseDto>.Error("Cosplayer profile not found.");
                }

                // Validate category if provided
                if (!string.IsNullOrWhiteSpace(request.Category) &&
                    !_availableVideoCategories.Contains(request.Category))
                {
                    return ApiResponse<UploadVideoResponseDto>.Error(
                        $"Invalid category. Available categories: {string.Join(", ", _availableVideoCategories)}");
                }

                // Upload video to Supabase
                var videoFileName = $"cosplayers/{cosplayer.Id}/videos/{Guid.NewGuid()}{Path.GetExtension(request.VideoFile.FileName)}";
                var videoUrl = await _supabaseService.UploadFileAsync(request.VideoFile, videoFileName);

                // Upload thumbnail if provided
                string? thumbnailUrl = null;
                if (request.ThumbnailFile != null)
                {
                    var thumbnailFileName = $"cosplayers/{cosplayer.Id}/thumbnails/{Guid.NewGuid()}{Path.GetExtension(request.ThumbnailFile.FileName)}";
                    thumbnailUrl = await _supabaseService.UploadFileAsync(request.ThumbnailFile, thumbnailFileName);
                }

                // Create video record
                var video = new CosplayerVideo
                {
                    CosplayerId = cosplayer.Id,
                    VideoUrl = videoUrl,
                    ThumbnailUrl = thumbnailUrl,
                    Title = request.Title?.Trim(),
                    Description = request.Description?.Trim(),
                    Category = request.Category?.Trim() ?? "Other",
                    Duration = request.Duration,
                    ViewCount = 0,
                    LikesCount = 0,
                    DisplayOrder = request.DisplayOrder,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<CosplayerVideo>().AddAsync(video);
                await _unitOfWork.SaveChangesAsync();

                var response = new UploadVideoResponseDto
                {
                    VideoId = video.Id,
                    VideoUrl = videoUrl,
                    ThumbnailUrl = thumbnailUrl,
                    Title = video.Title,
                    Message = "Video uploaded successfully.",
                    UploadedAt = video.CreatedAt.GetValueOrDefault()
                };

                _logger.LogInformation("Video uploaded for cosplayer {CosplayerId}: {VideoId}", cosplayer.Id, video.Id);
                return ApiResponse<UploadVideoResponseDto>.Success(response, "Video uploaded successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading video for user: {UserId}", userId);
                return ApiResponse<UploadVideoResponseDto>.Error("An error occurred while uploading the video.");
            }
        }

        public async Task<ApiResponse<CosplayerVideoDto>> UpdateVideoAsync(int userId, int videoId, UpdateCosplayerVideoRequestDto request)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerVideoDto>.Error("Cosplayer profile not found.");
                }

                var video = await _unitOfWork.Repository<CosplayerVideo>()
                    .FirstOrDefaultAsync(v => v.Id == videoId && v.CosplayerId == cosplayer.Id);

                if (video == null)
                {
                    return ApiResponse<CosplayerVideoDto>.Error("Video not found or you don't have permission to update it.");
                }

                // Validate category if provided
                if (!string.IsNullOrWhiteSpace(request.Category) &&
                    !_availableVideoCategories.Contains(request.Category))
                {
                    return ApiResponse<CosplayerVideoDto>.Error(
                        $"Invalid category. Available categories: {string.Join(", ", _availableVideoCategories)}");
                }

                // Update video details
                if (request.Title != null)
                    video.Title = request.Title.Trim();

                if (request.Description != null)
                    video.Description = request.Description.Trim();

                if (request.Category != null)
                    video.Category = request.Category.Trim();

                if (request.Duration.HasValue)
                    video.Duration = request.Duration.Value;

                if (request.DisplayOrder.HasValue)
                    video.DisplayOrder = request.DisplayOrder.Value;

                _unitOfWork.Repository<CosplayerVideo>().Update(video);
                await _unitOfWork.SaveChangesAsync();

                var videoDto = new CosplayerVideoDto
                {
                    Id = video.Id,
                    VideoUrl = video.VideoUrl,
                    ThumbnailUrl = video.ThumbnailUrl,
                    Title = video.Title,
                    Description = video.Description,
                    Category = video.Category,
                    Duration = video.Duration,
                    ViewCount = video.ViewCount,
                    LikesCount = video.LikesCount,
                    DisplayOrder = video.DisplayOrder,
                    CreatedAt = video.CreatedAt
                };

                _logger.LogInformation("Video updated for cosplayer {CosplayerId}: {VideoId}", cosplayer.Id, videoId);
                return ApiResponse<CosplayerVideoDto>.Success(videoDto, "Video updated successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating video {VideoId} for user: {UserId}", videoId, userId);
                return ApiResponse<CosplayerVideoDto>.Error("An error occurred while updating the video.");
            }
        }

        public async Task<ApiResponse<string>> DeleteVideoAsync(int userId, int videoId)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                var video = await _unitOfWork.Repository<CosplayerVideo>()
                    .FirstOrDefaultAsync(v => v.Id == videoId && v.CosplayerId == cosplayer.Id);

                if (video == null)
                {
                    return ApiResponse<string>.Error("Video not found or you don't have permission to delete it.");
                }

                // Delete from Supabase
                await _supabaseService.DeleteFileAsync(video.VideoUrl);
                if (!string.IsNullOrEmpty(video.ThumbnailUrl))
                {
                    await _supabaseService.DeleteFileAsync(video.ThumbnailUrl);
                }

                // Delete video record
                _unitOfWork.Repository<CosplayerVideo>().Remove(video);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Video deleted for cosplayer {CosplayerId}: {VideoId}", cosplayer.Id, videoId);
                return ApiResponse<string>.Success("", "Video deleted successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting video {VideoId} for user: {UserId}", videoId, userId);
                return ApiResponse<string>.Error("An error occurred while deleting the video.");
            }
        }

        public async Task<ApiResponse<CosplayerVideosResponseDto>> GetVideosAsync(int cosplayerId, GetCosplayerVideosRequestDto request)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.GetByIdAsync(cosplayerId);
                if (cosplayer == null)
                {
                    return ApiResponse<CosplayerVideosResponseDto>.Error("Cosplayer not found.");
                }

                // Get videos with filters
                var videosQuery = await _unitOfWork.Repository<CosplayerVideo>()
                    .FindAsync(v => v.CosplayerId == cosplayerId);
                var videosList = videosQuery.ToList();

                // Apply filters
                videosList = ApplyVideoFilters(videosList, request);

                // Apply sorting
                videosList = ApplyVideoSorting(videosList, request);

                var totalCount = videosList.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

                // Apply pagination
                var paginatedVideos = videosList
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToList();

                // Convert to DTOs
                var videoDtos = paginatedVideos.Select(v => new CosplayerVideoDto
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

                var response = new CosplayerVideosResponseDto
                {
                    Videos = videoDtos,
                    TotalCount = totalCount,
                    CurrentPage = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = totalPages,
                    HasNextPage = request.Page < totalPages,
                    HasPreviousPage = request.Page > 1,
                    CosplayerName = cosplayer.DisplayName,
                    AvailableCategories = _availableVideoCategories
                };

                return ApiResponse<CosplayerVideosResponseDto>.Success(response, "Videos retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting videos for cosplayer: {CosplayerId}", cosplayerId);
                return ApiResponse<CosplayerVideosResponseDto>.Error("An error occurred while retrieving videos.");
            }
        }

        public async Task<ApiResponse<string>> ReorderVideosAsync(int userId, ReorderVideosRequestDto request)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                // Verify all videos belong to this cosplayer
                var videoIds = request.VideoOrders.Select(vo => vo.VideoId).ToList();
                var videos = await _unitOfWork.Repository<CosplayerVideo>()
                    .FindAsync(v => videoIds.Contains(v.Id) && v.CosplayerId == cosplayer.Id);

                if (videos.Count() != videoIds.Count)
                {
                    return ApiResponse<string>.Error("Some videos not found or you don't have permission to reorder them.");
                }

                // Update display orders
                foreach (var videoOrder in request.VideoOrders)
                {
                    var video = videos.First(v => v.Id == videoOrder.VideoId);
                    video.DisplayOrder = videoOrder.DisplayOrder;
                    _unitOfWork.Repository<CosplayerVideo>().Update(video);
                }

                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Videos reordered for cosplayer {CosplayerId}", cosplayer.Id);
                return ApiResponse<string>.Success("", "Videos reordered successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering videos for user: {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while reordering videos.");
            }
        }

        #endregion

        #region Private Helper Methods

        private async Task<Cosplayer?> GetCosplayerByUserIdAsync(int userId)
        {
            return await _unitOfWork.Repository<Cosplayer>()
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        private async Task AddPhotoTagsAsync(int photoId, List<string> tags)
        {
            foreach (var tag in tags.Where(t => !string.IsNullOrWhiteSpace(t)).Distinct())
            {
                await _unitOfWork.Repository<PhotoTag>().AddAsync(new PhotoTag
                {
                    PhotoId = photoId,
                    Tag = tag.Trim()
                });
            }
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task UpdatePhotoTagsAsync(int photoId, List<string> tags)
        {
            // Remove existing tags
            var existingTags = await _unitOfWork.Repository<PhotoTag>()
                .FindAsync(pt => pt.PhotoId == photoId);

            foreach (var tag in existingTags)
            {
                _unitOfWork.Repository<PhotoTag>().Remove(tag);
            }

            // Add new tags
            await AddPhotoTagsAsync(photoId, tags);
        }

        private async Task DeletePhotoRelatedDataAsync(int photoId)
        {
            // Delete tags
            var photoTags = await _unitOfWork.Repository<PhotoTag>()
                .FindAsync(pt => pt.PhotoId == photoId);
            foreach (var tag in photoTags)
            {
                _unitOfWork.Repository<PhotoTag>().Remove(tag);
            }

            // Delete likes
            var photoLikes = await _unitOfWork.PhotoLikes
                .FindAsync(pl => pl.PhotoId == photoId);
            foreach (var like in photoLikes)
            {
                _unitOfWork.PhotoLikes.Remove(like);
            }
        }

        private async Task<CosplayerPhotoDto> GetPhotoDetailsDtoAsync(CosplayerPhoto photo, int currentUserId = 0)
        {
            var tags = await _unitOfWork.Repository<PhotoTag>()
                .FindAsync(pt => pt.PhotoId == photo.Id);

            var isLiked = false;
            if (currentUserId > 0)
            {
                var likeRecord = await _unitOfWork.PhotoLikes
                    .FirstOrDefaultAsync(pl => pl.PhotoId == photo.Id && pl.UserId == currentUserId);
                isLiked = likeRecord != null;
            }

            return new CosplayerPhotoDto
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
                Tags = tags.Select(t => t.Tag).ToList(),
                IsLiked = isLiked,
                CreatedAt = photo.CreatedAt
            };
        }

        private List<CosplayerPhoto> ApplyPhotoFilters(List<CosplayerPhoto> photos, GetCosplayerPhotosRequestDto request)
        {
            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                photos = photos.Where(p => p.Category != null &&
                    p.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (request.IsPortfolio.HasValue)
            {
                photos = photos.Where(p => p.IsPortfolio == request.IsPortfolio.Value).ToList();
            }

            // Note: Tag filtering would require additional database queries for performance
            // This is simplified for the example

            return photos;
        }

        private List<CosplayerPhoto> ApplyPhotoSorting(List<CosplayerPhoto> photos, GetCosplayerPhotosRequestDto request)
        {
            return request.SortBy?.ToLower() switch
            {
                "created_date" => request.SortOrder?.ToLower() == "asc"
                    ? photos.OrderBy(p => p.CreatedAt).ToList()
                    : photos.OrderByDescending(p => p.CreatedAt).ToList(),
                "likes_count" => request.SortOrder?.ToLower() == "asc"
                    ? photos.OrderBy(p => p.LikesCount).ToList()
                    : photos.OrderByDescending(p => p.LikesCount).ToList(),
                "views_count" => request.SortOrder?.ToLower() == "asc"
                    ? photos.OrderBy(p => p.ViewsCount).ToList()
                    : photos.OrderByDescending(p => p.ViewsCount).ToList(),
                _ => request.SortOrder?.ToLower() == "asc"
                    ? photos.OrderBy(p => p.DisplayOrder).ToList()
                    : photos.OrderByDescending(p => p.DisplayOrder).ToList()
            };
        }

        private List<CosplayerVideo> ApplyVideoFilters(List<CosplayerVideo> videos, GetCosplayerVideosRequestDto request)
        {
            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                videos = videos.Where(v => v.Category != null &&
                    v.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return videos;
        }

        private List<CosplayerVideo> ApplyVideoSorting(List<CosplayerVideo> videos, GetCosplayerVideosRequestDto request)
        {
            return request.SortBy?.ToLower() switch
            {
                "created_date" => request.SortOrder?.ToLower() == "asc"
                    ? videos.OrderBy(v => v.CreatedAt).ToList()
                    : videos.OrderByDescending(v => v.CreatedAt).ToList(),
                "view_count" => request.SortOrder?.ToLower() == "asc"
                    ? videos.OrderBy(v => v.ViewCount).ToList()
                    : videos.OrderByDescending(v => v.ViewCount).ToList(),
                "likes_count" => request.SortOrder?.ToLower() == "asc"
                    ? videos.OrderBy(v => v.LikesCount).ToList()
                    : videos.OrderByDescending(v => v.LikesCount).ToList(),
                _ => request.SortOrder?.ToLower() == "asc"
                    ? videos.OrderBy(v => v.DisplayOrder).ToList()
                    : videos.OrderByDescending(v => v.DisplayOrder).ToList()
            };
        }

        private static List<string> GetAvailableTags()
        {
            return new List<string>
            {
                "Professional", "Beginner Friendly", "Award Winner", "High Quality",
                "Custom Outfits", "Props Included", "Makeup Included", "Photography",
                "Events", "Conventions", "Photoshoots", "Group Cosplay", "Solo Performance",
                "Interactive", "Creative", "Detailed", "Anime", "Game", "Movie", "Original",
                "Action", "Drama", "Comedy", "Horror", "Fantasy", "Sci-Fi", "Historical",
                "Modern", "Vintage", "Kawaii", "Gothic", "Steampunk", "Cyberpunk",
                "School Uniform", "Military", "Traditional", "Formal", "Casual"
            };
        }

        #endregion

        #region View Count and Analytics Helper Methods

        private async Task IncrementPhotoViewCountAsync(int photoId)
        {
            try
            {
                var photo = await _unitOfWork.Repository<CosplayerPhoto>().GetByIdAsync(photoId);
                if (photo != null)
                {
                    photo.ViewsCount = (photo.ViewsCount ?? 0) + 1;
                    _unitOfWork.Repository<CosplayerPhoto>().Update(photo);
                    await _unitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to increment view count for photo {PhotoId}", photoId);
                // Don't throw - this is not critical functionality
            }
        }

        private async Task IncrementVideoViewCountAsync(int videoId)
        {
            try
            {
                var video = await _unitOfWork.Repository<CosplayerVideo>().GetByIdAsync(videoId);
                if (video != null)
                {
                    video.ViewCount = (video.ViewCount ?? 0) + 1;
                    _unitOfWork.Repository<CosplayerVideo>().Update(video);
                    await _unitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to increment view count for video {VideoId}", videoId);
                // Don't throw - this is not critical functionality
            }
        }

        #endregion

        #region Batch Operations

        public async Task<ApiResponse<string>> DeleteMultiplePhotosAsync(int userId, List<int> photoIds)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                var photos = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FindAsync(p => photoIds.Contains(p.Id) && p.CosplayerId == cosplayer.Id);

                if (photos.Count() != photoIds.Count)
                {
                    return ApiResponse<string>.Error("Some photos not found or you don't have permission to delete them.");
                }

                var deletedCount = 0;
                foreach (var photo in photos)
                {
                    try
                    {
                        // Delete from Supabase
                        await _supabaseService.DeleteFileAsync(photo.PhotoUrl);

                        // Delete related data
                        await DeletePhotoRelatedDataAsync(photo.Id);

                        // Delete photo record
                        _unitOfWork.Repository<CosplayerPhoto>().Remove(photo);
                        deletedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to delete photo {PhotoId}", photo.Id);
                        // Continue with other photos
                    }
                }

                if (deletedCount > 0)
                {
                    await _unitOfWork.SaveChangesAsync();
                }

                _logger.LogInformation("Deleted {Count} photos for cosplayer {CosplayerId}", deletedCount, cosplayer.Id);
                return ApiResponse<string>.Success("", $"Successfully deleted {deletedCount} photos.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting multiple photos for user: {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while deleting photos.");
            }
        }

        public async Task<ApiResponse<string>> DeleteMultipleVideosAsync(int userId, List<int> videoIds)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                var videos = await _unitOfWork.Repository<CosplayerVideo>()
                    .FindAsync(v => videoIds.Contains(v.Id) && v.CosplayerId == cosplayer.Id);

                if (videos.Count() != videoIds.Count)
                {
                    return ApiResponse<string>.Error("Some videos not found or you don't have permission to delete them.");
                }

                var deletedCount = 0;
                foreach (var video in videos)
                {
                    try
                    {
                        // Delete from Supabase
                        await _supabaseService.DeleteFileAsync(video.VideoUrl);
                        if (!string.IsNullOrEmpty(video.ThumbnailUrl))
                        {
                            await _supabaseService.DeleteFileAsync(video.ThumbnailUrl);
                        }

                        // Delete video record
                        _unitOfWork.Repository<CosplayerVideo>().Remove(video);
                        deletedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to delete video {VideoId}", video.Id);
                        // Continue with other videos
                    }
                }

                if (deletedCount > 0)
                {
                    await _unitOfWork.SaveChangesAsync();
                }

                _logger.LogInformation("Deleted {Count} videos for cosplayer {CosplayerId}", deletedCount, cosplayer.Id);
                return ApiResponse<string>.Success("", $"Successfully deleted {deletedCount} videos.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting multiple videos for user: {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while deleting videos.");
            }
        }

        #endregion

        #region Portfolio Management

        public async Task<ApiResponse<string>> SetPortfolioPhotosAsync(int userId, List<int> photoIds)
        {
            try
            {
                var cosplayer = await GetCosplayerByUserIdAsync(userId);
                if (cosplayer == null)
                {
                    return ApiResponse<string>.Error("Cosplayer profile not found.");
                }

                // Verify all photos belong to this cosplayer
                var photos = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FindAsync(p => p.CosplayerId == cosplayer.Id);

                // Reset all portfolio flags
                foreach (var photo in photos)
                {
                    photo.IsPortfolio = photoIds.Contains(photo.Id);
                    _unitOfWork.Repository<CosplayerPhoto>().Update(photo);
                }

                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Portfolio photos updated for cosplayer {CosplayerId}", cosplayer.Id);
                return ApiResponse<string>.Success("", "Portfolio photos updated successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting portfolio photos for user: {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while updating portfolio photos.");
            }
        }

        public async Task<ApiResponse<CosplayerPhotosResponseDto>> GetPortfolioPhotosAsync(int cosplayerId, int currentUserId = 0)
        {
            try
            {
                var request = new GetCosplayerPhotosRequestDto
                {
                    IsPortfolio = true,
                    SortBy = "display_order",
                    SortOrder = "asc",
                    PageSize = 100 // Get all portfolio photos
                };

                return await GetPhotosAsync(cosplayerId, currentUserId, request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting portfolio photos for cosplayer: {CosplayerId}", cosplayerId);
                return ApiResponse<CosplayerPhotosResponseDto>.Error("An error occurred while retrieving portfolio photos.");
            }
        }

        #endregion

        #region Media Statistics

        public async Task<ApiResponse<MediaStatsDto>> GetMediaStatsAsync(int cosplayerId)
        {
            try
            {
                var photos = await _unitOfWork.Repository<CosplayerPhoto>()
                    .FindAsync(p => p.CosplayerId == cosplayerId);

                var videos = await _unitOfWork.Repository<CosplayerVideo>()
                    .FindAsync(v => v.CosplayerId == cosplayerId);

                var photoStats = photos.ToList();
                var videoStats = videos.ToList();

                var stats = new MediaStatsDto
                {
                    TotalPhotos = photoStats.Count,
                    TotalVideos = videoStats.Count,
                    PortfolioPhotos = photoStats.Count(p => p.IsPortfolio == true),
                    TotalPhotoLikes = photoStats.Sum(p => p.LikesCount ?? 0),
                    TotalPhotoViews = photoStats.Sum(p => p.ViewsCount ?? 0),
                    TotalVideoLikes = videoStats.Sum(v => v.LikesCount ?? 0),
                    TotalVideoViews = videoStats.Sum(v => v.ViewCount ?? 0),
                    MostLikedPhoto = photoStats.OrderByDescending(p => p.LikesCount).FirstOrDefault()?.Id,
                    MostViewedVideo = videoStats.OrderByDescending(v => v.ViewCount).FirstOrDefault()?.Id,
                    PhotoCategories = photoStats.Where(p => !string.IsNullOrEmpty(p.Category))
                        .GroupBy(p => p.Category)
                        .ToDictionary(g => g.Key!, g => g.Count()),
                    VideoCategories = videoStats.Where(v => !string.IsNullOrEmpty(v.Category))
                        .GroupBy(v => v.Category)
                        .ToDictionary(g => g.Key!, g => g.Count())
                };

                return ApiResponse<MediaStatsDto>.Success(stats, "Media statistics retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting media stats for cosplayer: {CosplayerId}", cosplayerId);
                return ApiResponse<MediaStatsDto>.Error("An error occurred while retrieving media statistics.");
            }
        }

        #endregion
    }

    // Additional DTO for media statistics
    public class MediaStatsDto
    {
        public int TotalPhotos { get; set; }
        public int TotalVideos { get; set; }
        public int PortfolioPhotos { get; set; }
        public int TotalPhotoLikes { get; set; }
        public int TotalPhotoViews { get; set; }
        public int TotalVideoLikes { get; set; }
        public int TotalVideoViews { get; set; }
        public int? MostLikedPhoto { get; set; }
        public int? MostViewedVideo { get; set; }
        public Dictionary<string, int> PhotoCategories { get; set; } = new();
        public Dictionary<string, int> VideoCategories { get; set; } = new();
    }
}