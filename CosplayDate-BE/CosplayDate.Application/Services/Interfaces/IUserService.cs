using CosplayDate.Application.DTOs.User;
using CosplayDate.Shared.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse<UserProfileResponseDto>> GetUserProfileAsync(int userId, int currentUserId);
        Task<ApiResponse<UserProfileResponseDto>> UpdateUserProfileAsync(int userId, UpdateUserProfileRequestDto request);
        Task<ApiResponse<UploadAvatarResponseDto>> UploadAvatarAsync(int userId, IFormFile file);
        Task<ApiResponse<string>> DeleteAvatarAsync(int userId);
        Task<ApiResponse<UserInterestsResponseDto>> GetUserInterestsAsync(int userId);
        Task<ApiResponse<UserInterestsResponseDto>> UpdateUserInterestsAsync(int userId, UpdateUserInterestsRequestDto request);
        Task<ApiResponse<UserSettingsResponseDto>> GetUserSettingsAsync(int userId);
        Task<ApiResponse<UserSettingsResponseDto>> UpdateUserSettingsAsync(int userId, UpdateUserSettingsRequestDto request);
        Task<ApiResponse<FollowUserResponseDto>> FollowUserAsync(int followerId, int followedId);
        Task<ApiResponse<FollowUserResponseDto>> UnfollowUserAsync(int followerId, int followedId);
        Task<ApiResponse<UserFollowersResponseDto>> GetFollowersAsync(int userId, int page, int pageSize);
        Task<ApiResponse<UserFollowingResponseDto>> GetFollowingAsync(int userId, int page, int pageSize);
    }
}
