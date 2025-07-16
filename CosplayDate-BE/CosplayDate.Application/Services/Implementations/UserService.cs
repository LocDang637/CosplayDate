using CosplayDate.Application.DTOs.User;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace CosplayDate.Application.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISupabaseService _supabaseService;
        private readonly ILogger<UserService> _logger;

        // Available interests for the platform
        private readonly List<string> _availableInterests = new()
        {
            "Anime", "Manga", "Gaming", "Photography", "Cosplay Making", "Prop Making",
            "Sewing", "Makeup", "Wig Styling", "Convention", "Photography", "Video Making",
            "Dancing", "Acting", "Singing", "Streaming", "Art", "Digital Art", "3D Printing",
            "Crafting", "Fashion", "Design", "Music", "Movies", "TV Shows", "Books",
            "Fantasy", "Sci-Fi", "Horror", "Romance", "Action", "Adventure", "Comedy",
            "Drama", "Historical", "Mecha", "Magical Girl", "Shounen", "Shoujo", "Seinen",
            "Josei", "Yaoi", "Yuri", "Isekai", "Slice of Life", "Sports", "Racing",
            "Fighting Games", "RPG", "MMORPG", "Strategy", "Simulation", "Puzzle",
            "Visual Novel", "Mobile Games", "Indie Games", "Retro Gaming"
        };

        public UserService(IUnitOfWork unitOfWork, ISupabaseService supabaseService, ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _supabaseService = supabaseService;
            _logger = logger;
        }

        public async Task<ApiResponse<UserProfileResponseDto>> GetUserProfileAsync(int userId, int currentUserId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserProfileResponseDto>.Error("User not found.");
                }

                // Get user stats
                var stats = await GetUserStatsInternal(userId);

                // Check if current user is following this user (if different users)
                var isFollowing = false;
                if (currentUserId != userId)
                {
                    var followRecord = await _unitOfWork.UserFollows
                        .FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowedId == userId);
                    isFollowing = followRecord != null;
                }

                // Get user interests
                var interests = await _unitOfWork.UserInterests
                    .FindAsync(ui => ui.UserId == userId);

                var response = new UserProfileResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    AvatarUrl = user.AvatarUrl,
                    DateOfBirth = user.DateOfBirth,
                    Location = user.Location,
                    Bio = user.Bio,
                    UserType = user.UserType,
                    IsVerified = user.IsVerified,
                    IsOnline = user.IsOnline ?? false,
                    LastLoginAt = user.LastLoginAt,
                    MembershipTier = user.MembershipTier ?? "Bronze",
                    LoyaltyPoints = user.LoyaltyPoints ?? 0,
                    WalletBalance = user.WalletBalance ?? 0,
                    ProfileCompleteness = user.ProfileCompleteness ?? 0,
                    CreatedAt = user.CreatedAt ?? DateTime.UtcNow,
                    Interests = interests.Select(i => i.Interest).ToList(),
                    IsOwnProfile = currentUserId == userId,
                    IsFollowing = isFollowing,
                    Stats = stats
                };

                return ApiResponse<UserProfileResponseDto>.Success(response, "User profile retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for ID: {UserId}", userId);
                return ApiResponse<UserProfileResponseDto>.Error("An error occurred while retrieving the user profile.");
            }
        }

        public async Task<ApiResponse<UserProfileResponseDto>> UpdateUserProfileAsync(int userId, UpdateUserProfileRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserProfileResponseDto>.Error("User not found.");
                }

                // Update user information
                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    user.FirstName = request.FirstName.Trim();

                if (!string.IsNullOrWhiteSpace(request.LastName))
                    user.LastName = request.LastName.Trim();

                if (request.Location != null)
                    user.Location = request.Location.Trim();

                if (request.Bio != null)
                    user.Bio = request.Bio.Trim();

                if (request.DateOfBirth.HasValue)
                {
                    // Validate age (must be at least 18)
                    var age = CalculateAge(request.DateOfBirth.Value);
                    if (age < 18)
                    {
                        return ApiResponse<UserProfileResponseDto>.Error("You must be at least 18 years old.");
                    }
                    user.DateOfBirth = request.DateOfBirth.Value;
                }

                // Update profile completeness
                user.ProfileCompleteness = CalculateProfileCompleteness(user);
                user.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                // Return updated profile
                return await GetUserProfileAsync(userId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile for ID: {UserId}", userId);
                return ApiResponse<UserProfileResponseDto>.Error("An error occurred while updating the user profile.");
            }
        }

        public async Task<ApiResponse<UploadAvatarResponseDto>> UploadAvatarAsync(int userId, IFormFile file)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UploadAvatarResponseDto>.Error("User not found.");
                }

                // Delete old avatar if exists
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    await _supabaseService.DeleteFileAsync(user.AvatarUrl);
                }

                // Upload new avatar
                var fileName = $"avatars/{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var avatarUrl = await _supabaseService.UploadFileAsync(file, fileName);

                // Update user avatar URL
                user.AvatarUrl = avatarUrl;
                user.UpdatedAt = DateTime.UtcNow;
                user.ProfileCompleteness = CalculateProfileCompleteness(user);

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                var response = new UploadAvatarResponseDto
                {
                    AvatarUrl = avatarUrl,
                    Message = "Avatar uploaded successfully.",
                    UploadedAt = DateTime.UtcNow
                };

                return ApiResponse<UploadAvatarResponseDto>.Success(response, "Avatar uploaded successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading avatar for user: {UserId}", userId);
                return ApiResponse<UploadAvatarResponseDto>.Error("An error occurred while uploading the avatar.");
            }
        }

        public async Task<ApiResponse<string>> DeleteAvatarAsync(int userId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<string>.Error("User not found.");
                }

                if (string.IsNullOrEmpty(user.AvatarUrl))
                {
                    return ApiResponse<string>.Error("No avatar to delete.");
                }

                // Delete avatar from Supabase
                await _supabaseService.DeleteFileAsync(user.AvatarUrl);

                // Update user record
                user.AvatarUrl = null;
                user.UpdatedAt = DateTime.UtcNow;
                user.ProfileCompleteness = CalculateProfileCompleteness(user);

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse<string>.Success("", "Avatar deleted successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting avatar for user: {UserId}", userId);
                return ApiResponse<string>.Error("An error occurred while deleting the avatar.");
            }
        }

        public async Task<ApiResponse<UserInterestsResponseDto>> GetUserInterestsAsync(int userId)
        {
            try
            {
                var interests = await _unitOfWork.UserInterests
                    .FindAsync(ui => ui.UserId == userId);

                var response = new UserInterestsResponseDto
                {
                    Interests = interests.Select(i => i.Interest).ToList(),
                    AvailableInterests = _availableInterests
                };

                return ApiResponse<UserInterestsResponseDto>.Success(response, "User interests retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user interests for: {UserId}", userId);
                return ApiResponse<UserInterestsResponseDto>.Error("An error occurred while retrieving user interests.");
            }
        }

        public async Task<ApiResponse<UserInterestsResponseDto>> UpdateUserInterestsAsync(int userId, UpdateUserInterestsRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserInterestsResponseDto>.Error("User not found.");
                }

                // Validate interests
                var invalidInterests = request.Interests.Where(i => !_availableInterests.Contains(i)).ToList();
                if (invalidInterests.Any())
                {
                    return ApiResponse<UserInterestsResponseDto>.Error($"Invalid interests: {string.Join(", ", invalidInterests)}");
                }

                // Remove existing interests
                var existingInterests = await _unitOfWork.UserInterests
                    .FindAsync(ui => ui.UserId == userId);

                foreach (var interest in existingInterests)
                {
                    _unitOfWork.UserInterests.Remove(interest);
                }

                // Add new interests
                foreach (var interestName in request.Interests.Distinct())
                {
                    if (!string.IsNullOrWhiteSpace(interestName))
                    {
                        await _unitOfWork.UserInterests.AddAsync(new UserInterest
                        {
                            UserId = userId,
                            Interest = interestName.Trim()
                        });
                    }
                }

                // Update profile completeness
                user.ProfileCompleteness = CalculateProfileCompleteness(user);
                user.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(user);

                await _unitOfWork.SaveChangesAsync();

                // Return updated interests
                return await GetUserInterestsAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user interests for: {UserId}", userId);
                return ApiResponse<UserInterestsResponseDto>.Error("An error occurred while updating user interests.");
            }
        }

        public async Task<ApiResponse<UserSettingsResponseDto>> GetUserSettingsAsync(int userId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserSettingsResponseDto>.Error("User not found.");
                }

                // For now, return default settings since we don't have a UserSettings table
                // In a real application, you would create a UserSettings table and store these preferences
                var response = new UserSettingsResponseDto();

                return ApiResponse<UserSettingsResponseDto>.Success(response, "User settings retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user settings for: {UserId}", userId);
                return ApiResponse<UserSettingsResponseDto>.Error("An error occurred while retrieving user settings.");
            }
        }

        public async Task<ApiResponse<UserSettingsResponseDto>> UpdateUserSettingsAsync(int userId, UpdateUserSettingsRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<UserSettingsResponseDto>.Error("User not found.");
                }

                // For now, just return success since we don't have a UserSettings table
                // In a real application, you would update the UserSettings table
                user.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                return await GetUserSettingsAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user settings for: {UserId}", userId);
                return ApiResponse<UserSettingsResponseDto>.Error("An error occurred while updating user settings.");
            }
        }

        public async Task<ApiResponse<FollowUserResponseDto>> FollowUserAsync(int followerId, int followedId)
        {
            try
            {
                // Check if users exist
                var follower = await _unitOfWork.Users.GetByIdAsync(followerId);
                var followed = await _unitOfWork.Users.GetByIdAsync(followedId);

                if (follower == null || followed == null)
                {
                    return ApiResponse<FollowUserResponseDto>.Error("User not found.");
                }

                // Check if already following
                var existingFollow = await _unitOfWork.UserFollows
                    .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowedId == followedId);

                if (existingFollow != null)
                {
                    return ApiResponse<FollowUserResponseDto>.Error("You are already following this user.");
                }

                // Create follow relationship
                var follow = new UserFollow
                {
                    FollowerId = followerId,
                    FollowedId = followedId,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.UserFollows.AddAsync(follow);
                await _unitOfWork.SaveChangesAsync();

                // Update FollowersCount in Cosplayer table if the followed user is a cosplayer
                await UpdateCosplayerFollowersCountAsync(followedId);

                // Get total followers count
                var totalFollowers = await _unitOfWork.UserFollows
                    .CountAsync(f => f.FollowedId == followedId);

                var response = new FollowUserResponseDto
                {
                    IsFollowing = true,
                    Message = "Successfully followed user.",
                    TotalFollowers = totalFollowers
                };

                return ApiResponse<FollowUserResponseDto>.Success(response, "Successfully followed user.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error following user {FollowedId} by {FollowerId}", followedId, followerId);
                return ApiResponse<FollowUserResponseDto>.Error("An error occurred while processing the follow request.");
            }
        }

        public async Task<ApiResponse<FollowUserResponseDto>> UnfollowUserAsync(int followerId, int followedId)
        {
            try
            {
                var existingFollow = await _unitOfWork.UserFollows
                    .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowedId == followedId);

                if (existingFollow == null)
                {
                    return ApiResponse<FollowUserResponseDto>.Error("You are not following this user.");
                }

                _unitOfWork.UserFollows.Remove(existingFollow);
                await _unitOfWork.SaveChangesAsync();

                // Update FollowersCount in Cosplayer table if the followed user is a cosplayer
                await UpdateCosplayerFollowersCountAsync(followedId);

                // Get total followers count
                var totalFollowers = await _unitOfWork.UserFollows
                    .CountAsync(f => f.FollowedId == followedId);

                var response = new FollowUserResponseDto
                {
                    IsFollowing = false,
                    Message = "Successfully unfollowed user.",
                    TotalFollowers = totalFollowers
                };

                return ApiResponse<FollowUserResponseDto>.Success(response, "Successfully unfollowed user.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unfollowing user {FollowedId} by {FollowerId}", followedId, followerId);
                return ApiResponse<FollowUserResponseDto>.Error("An error occurred while processing the unfollow request.");
            }
        }

        public async Task<ApiResponse<UserFollowersResponseDto>> GetFollowersAsync(int userId, int page, int pageSize)
        {
            try
            {
                var followers = await _unitOfWork.UserFollows
                    .FindAsync(f => f.FollowedId == userId);

                var totalCount = followers.Count();

                // Apply pagination
                var paginatedFollowers = followers
                    .OrderByDescending(f => f.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var followerDtos = new List<UserSummaryDto>();

                foreach (var follow in paginatedFollowers)
                {
                    var followerUser = await _unitOfWork.Users.GetByIdAsync(follow.FollowerId);
                    if (followerUser != null)
                    {
                        var dto = new UserSummaryDto
                        {
                            Id = followerUser.Id,
                            Name = $"{followerUser.FirstName} {followerUser.LastName}",
                            AvatarUrl = followerUser.AvatarUrl,
                            UserType = followerUser.UserType,
                            IsVerified = followerUser.IsVerified,
                            IsOnline = followerUser.IsOnline ?? false,
                            LastLoginAt = followerUser.LastLoginAt,
                            Location = followerUser.Location,
                            FollowDate = follow.CreatedAt ?? DateTime.UtcNow
                        };

                        followerDtos.Add(dto);
                    }
                }

                var response = new UserFollowersResponseDto
                {
                    Followers = followerDtos,
                    TotalCount = totalCount,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return ApiResponse<UserFollowersResponseDto>.Success(response, "Followers retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting followers for user: {UserId}", userId);
                return ApiResponse<UserFollowersResponseDto>.Error("An error occurred while retrieving followers.");
            }
        }

        public async Task<ApiResponse<UserFollowingResponseDto>> GetFollowingAsync(int userId, int page, int pageSize)
        {
            try
            {
                var following = await _unitOfWork.UserFollows
                    .FindAsync(f => f.FollowerId == userId);

                var totalCount = following.Count();

                // Apply pagination
                var paginatedFollowing = following
                    .OrderByDescending(f => f.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var followingDtos = new List<UserSummaryDto>();

                foreach (var follow in paginatedFollowing)
                {
                    var followedUser = await _unitOfWork.Users.GetByIdAsync(follow.FollowedId);
                    if (followedUser != null)
                    {
                        var dto = new UserSummaryDto
                        {
                            Id = followedUser.Id,
                            Name = $"{followedUser.FirstName} {followedUser.LastName}",
                            AvatarUrl = followedUser.AvatarUrl,
                            UserType = followedUser.UserType,
                            IsVerified = followedUser.IsVerified,
                            IsOnline = followedUser.IsOnline ?? false,
                            LastLoginAt = followedUser.LastLoginAt,
                            Location = followedUser.Location,
                            FollowDate = follow.CreatedAt ?? DateTime.UtcNow
                        };

                        followingDtos.Add(dto);
                    }
                }

                var response = new UserFollowingResponseDto
                {
                    Following = followingDtos,
                    TotalCount = totalCount,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return ApiResponse<UserFollowingResponseDto>.Success(response, "Following list retrieved successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting following for user: {UserId}", userId);
                return ApiResponse<UserFollowingResponseDto>.Error("An error occurred while retrieving following list.");
            }
        }

        // Private helper methods
        private async Task<UserStatsDto> GetUserStatsInternal(int userId)
        {
            try
            {
                var followersCount = await _unitOfWork.UserFollows
                    .CountAsync(f => f.FollowedId == userId);

                var followingCount = await _unitOfWork.UserFollows
                    .CountAsync(f => f.FollowerId == userId);

                var eventParticipants = await _unitOfWork.Repository<EventParticipant>()
                    .FindAsync(ep => ep.UserId == userId);

                var photoLikes = await _unitOfWork.Repository<PhotoLike>()
                    .FindAsync(pl => pl.UserId == userId);

                var user = await _unitOfWork.Users.GetByIdAsync(userId);

                return new UserStatsDto
                {
                    TotalFollowers = followersCount,
                    TotalFollowing = followingCount,
                    TotalPosts = 0, // Would need a Posts table
                    TotalLikes = photoLikes.Count(),
                    MemberSince = user?.CreatedAt ?? DateTime.UtcNow,
                    EventsAttended = eventParticipants.Count(),
                    ProfileViews = 0 // Would need a ProfileViews table
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating user stats for: {UserId}", userId);
                return new UserStatsDto();
            }
        }

        private static int CalculateAge(DateOnly birthDate)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - birthDate.Year;
            if (birthDate > today.AddYears(-age)) age--;
            return age;
        }

        private static decimal CalculateProfileCompleteness(User user)
        {
            var totalFields = 8; // firstName, lastName, email, dateOfBirth, location, bio, avatarUrl, interests
            var completedFields = 4; // firstName, lastName, email, dateOfBirth are required

            if (!string.IsNullOrWhiteSpace(user.Location)) completedFields++;
            if (!string.IsNullOrWhiteSpace(user.Bio)) completedFields++;
            if (!string.IsNullOrWhiteSpace(user.AvatarUrl)) completedFields++;

            // Note: Interests would need to be checked separately as it's in a related table

            return Math.Round((decimal)completedFields / totalFields * 100, 2);
        }

        /// <summary>
        /// Updates the FollowersCount in the Cosplayer table for the given user ID if they are a cosplayer
        /// </summary>
        /// <param name="userId">The user ID to update the followers count for</param>
        private async Task UpdateCosplayerFollowersCountAsync(int userId)
        {
            try
            {
                var cosplayer = await _unitOfWork.Cosplayers.FirstOrDefaultAsync(c => c.UserId == userId);
                if (cosplayer != null)
                {
                    var followersCount = await _unitOfWork.UserFollows.CountAsync(f => f.FollowedId == userId);
                    cosplayer.FollowersCount = followersCount;
                    cosplayer.UpdatedAt = DateTime.UtcNow;
                    
                    _unitOfWork.Cosplayers.Update(cosplayer);
                    await _unitOfWork.SaveChangesAsync();
                    
                    _logger.LogInformation("Updated followers count for cosplayer {CosplayerId} to {Count}", cosplayer.Id, followersCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating followers count for user {UserId}", userId);
                // Don't throw exception here as it's a supplementary operation
            }
        }
    }
}