using CosplayDate.Application.DTOs.Cosplayer;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface ICosplayerService
    {
        Task<ApiResponse<GetCosplayersResponseDto>> GetCosplayersAsync(GetCosplayersRequestDto request);
        Task<ApiResponse<CosplayerDetailsDto>> GetCosplayerDetailsAsync(int cosplayerId, int currentUserId = 0);
        Task<ApiResponse<CosplayerDetailsDto>> GetCosplayerDetailsByUserIdAsync(int userId, int currentUserId = 0);
        Task<ApiResponse<CosplayerDetailsDto>> UpdateCosplayerProfileAsync(int userId, UpdateCosplayerProfileRequestDto request);
        Task<ApiResponse<BecomeCosplayerResponseDto>> BecomeCosplayerAsync(int userId, BecomeCosplayerRequestDto request);
        Task<ApiResponse<CosplayerServicesResponseDto>> GetCosplayerServicesAsync(int cosplayerId);
        Task<ApiResponse<CosplayerServiceDto>> AddServiceAsync(int userId, AddCosplayerServiceRequestDto request);
        Task<ApiResponse<CosplayerServiceDto>> UpdateServiceAsync(int userId, int serviceId, UpdateCosplayerServiceRequestDto request);
        Task<ApiResponse<string>> DeleteServiceAsync(int userId, int serviceId);
    }
}