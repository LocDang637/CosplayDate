using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface ICosplayerMediaService
    {
        // Photo management
        Task<ApiResponse<UploadPhotoResponseDto>> UploadPhotoAsync(int userId, UploadCosplayerPhotoRequestDto request);
        Task<ApiResponse<CosplayerPhotoDto>> UpdatePhotoAsync(int userId, int photoId, UpdateCosplayerPhotoRequestDto request);
        Task<ApiResponse<string>> DeletePhotoAsync(int userId, int photoId);
        Task<ApiResponse<CosplayerPhotosResponseDto>> GetPhotosAsync(int cosplayerId, int currentUserId, GetCosplayerPhotosRequestDto request);
        Task<ApiResponse<PhotoLikeResponseDto>> TogglePhotoLikeAsync(int userId, int photoId);
        Task<ApiResponse<string>> ReorderPhotosAsync(int userId, ReorderPhotosRequestDto request);

        // Video management
        Task<ApiResponse<UploadVideoResponseDto>> UploadVideoAsync(int userId, UploadCosplayerVideoRequestDto request);
        Task<ApiResponse<CosplayerVideoDto>> UpdateVideoAsync(int userId, int videoId, UpdateCosplayerVideoRequestDto request);
        Task<ApiResponse<string>> DeleteVideoAsync(int userId, int videoId);
        Task<ApiResponse<CosplayerVideosResponseDto>> GetVideosAsync(int cosplayerId, GetCosplayerVideosRequestDto request);
        Task<ApiResponse<string>> ReorderVideosAsync(int userId, ReorderVideosRequestDto request);
    }
}
