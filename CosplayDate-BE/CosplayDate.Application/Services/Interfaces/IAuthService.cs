using CosplayDate.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CosplayDate.Shared.Models;
namespace CosplayDate.Application.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<RegisterResponseDto>> RegisterAsync(RegisterRequestDto request);
        Task<ApiResponse<VerifyEmailResponseDto>> VerifyEmailAsync(VerifyEmailRequestDto request);
        Task<ApiResponse<string>> ResendVerificationCodeAsync(ResendVerificationRequestDto request);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request);
        Task<ApiResponse<string>> LogoutAsync(int userId);
        Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request);
        Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequestDto request);
        Task<ApiResponse<string>> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);
    }
}
