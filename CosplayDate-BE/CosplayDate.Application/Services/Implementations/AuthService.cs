using AutoMapper;
using BCrypt.Net;
using CosplayDate.Application.DTOs.Auth;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace CosplayDate.Application.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        //private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;
        private readonly IJwtService _jwtService;

        public AuthService(
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IJwtService jwtService,
            ILogger<AuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<ApiResponse<RegisterResponseDto>> RegisterAsync(RegisterRequestDto request)
        {
            try
            {
                // Check if email is already registered
                var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return ApiResponse<RegisterResponseDto>.Error("Email này đã được đăng ký.");
                }

                // Validate age (must be at least 18)
                var age = CalculateAge(request.DateOfBirth);
                if (age < 18)
                {
                    return ApiResponse<RegisterResponseDto>.Error("Bạn phải từ 18 tuổi trở lên để đăng ký.");
                }

                // Create new user
                var user = new User
                {
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Email = request.Email.ToLower().Trim(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    DateOfBirth = request.DateOfBirth,
                    Location = request.Location?.Trim(),
                    Bio = request.Bio?.Trim(),
                    UserType = request.UserType,
                    IsVerified = false,
                    
                    IsActive = true,
                    IsOnline = false,
                    ProfileCompleteness = CalculateProfileCompleteness(request),
                    MembershipTier = "Bronze",
                    LoyaltyPoints = 0,
                    WalletBalance = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Add user to database
                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();

                // Generate verification code
                var verificationCode = GenerateVerificationCode();
                var verificationToken = new EmailVerificationToken
                {
                    UserId = user.Id,
                    Token = verificationCode,
                    ExpiresAt = DateTime.UtcNow.AddHours(24), // 24 hours expiry
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.EmailVerificationTokens.AddAsync(verificationToken);
                await _unitOfWork.SaveChangesAsync();

                // Send verification email
                var emailSent = await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    verificationCode,
                    user.FirstName
                );

                if (!emailSent)
                {
                    _logger.LogWarning("Failed to send verification email to {Email}", user.Email);
                }

                var response = new RegisterResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    Message = "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã xác thực.",
                    RequiresEmailVerification = true
                };

                _logger.LogInformation("User registered successfully: {Email}", user.Email);
                return ApiResponse<RegisterResponseDto>.Success(response, "Đăng ký thành công!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration for email: {Email}", request.Email);
                return ApiResponse<RegisterResponseDto>.Error("Đăng ký thất bại. Vui lòng thử lại.");
            }
        }

        public async Task<ApiResponse<VerifyEmailResponseDto>> VerifyEmailAsync(VerifyEmailRequestDto request)
        {
            try
            {
                // Find user by email
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return ApiResponse<VerifyEmailResponseDto>.Error("Không tìm thấy người dùng.");
                }

                if (user.IsVerified)
                {
                    return ApiResponse<VerifyEmailResponseDto>.Error("Email đã được xác thực.");
                }

                // Find valid verification token
                var token = await _unitOfWork.EmailVerificationTokens
                    .GetValidTokenAsync(user.Id, request.Code);

                if (token == null)
                {
                    return ApiResponse<VerifyEmailResponseDto>.Error("Mã xác thực không hợp lệ hoặc đã hết hạn.");
                }

                // Mark email as verified
                user.IsVerified = true;
                user.UpdatedAt = DateTime.UtcNow;
                user.IsVerified = true; // Also mark user as verified
                user.UpdatedAt = DateTime.UtcNow;

                // Mark token as used
                token.IsUsed = true;

                _unitOfWork.Users.Update(user);
                _unitOfWork.EmailVerificationTokens.Update(token);
                await _unitOfWork.SaveChangesAsync();

                // Send welcome email
                await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);

                var response = new VerifyEmailResponseDto
                {
                    IsVerified = true,
                    Message = "Xác thực email thành công! Chào mừng bạn đến với CosplayDate!",
                    VerifiedAt = user.UpdatedAt
                };

                _logger.LogInformation("Email verified successfully for user: {Email}", user.Email);
                return ApiResponse<VerifyEmailResponseDto>.Success(response, "Xác thực email thành công!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during email verification for: {Email}", request.Email);
                return ApiResponse<VerifyEmailResponseDto>.Error("Xác thực email thất bại. Vui lòng thử lại.");
            }
        }

        public async Task<ApiResponse<string>> ResendVerificationCodeAsync(ResendVerificationRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return ApiResponse<string>.Error("Không tìm thấy người dùng.");
                }

                if (user.IsVerified)
                {
                    return ApiResponse<string>.Error("Email đã được xác thực.");
                }

                // Check if there's a recent token (within last 2 minutes)
                var recentToken = await _unitOfWork.EmailVerificationTokens
                    .GetRecentTokenAsync(user.Id, TimeSpan.FromMinutes(2));

                if (recentToken != null)
                {
                    return ApiResponse<string>.Error("Vui lòng đợi trước khi yêu cầu mã xác thực mới.");
                }

                // Generate new verification code
                var verificationCode = GenerateVerificationCode();
                var verificationToken = new EmailVerificationToken
                {
                    UserId = user.Id,
                    Token = verificationCode,
                    ExpiresAt = DateTime.UtcNow.AddHours(24),
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.EmailVerificationTokens.AddAsync(verificationToken);
                await _unitOfWork.SaveChangesAsync();

                // Send verification email
                var emailSent = await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    verificationCode,
                    user.FirstName
                );

                if (!emailSent)
                {
                    return ApiResponse<string>.Error("Không thể gửi email xác thực. Vui lòng thử lại.");
                }

                _logger.LogInformation("Verification code resent to: {Email}", user.Email);
                return ApiResponse<string>.Success("", "Mã xác thực đã được gửi thành công!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending verification code for: {Email}", request.Email);
                return ApiResponse<string>.Error("Không thể gửi lại mã xác thực. Vui lòng thử lại.");
            }
        }

        public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request)
        {
            try
            {
                // Find user by email
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return ApiResponse<LoginResponseDto>.Error("Email hoặc mật khẩu không đúng");
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return ApiResponse<LoginResponseDto>.Error("Email hoặc mật khẩu không đúng");
                }

                // Check if email is verified
                if (!user.IsVerified)
                {
                    // Try to resend verification code
                    var resendResult = await ResendVerificationCodeAsync(new ResendVerificationRequestDto
                    {
                        Email = user.Email
                    });

                    var unverifiedResponse = new UnverifiedAccountResponseDto
                    {
                        Email = user.Email,
                        Message = "Tài khoản chưa được xác thực",
                        CodeResent = resendResult.IsSuccess,
                        ResendMessage = resendResult.IsSuccess
                            ? "Mã xác thực mới đã được gửi đến email của bạn"
                            : "Không thể gửi lại mã xác thực. Vui lòng thử lại sau."
                    };

                    return ApiResponse<LoginResponseDto>.Error(
                        "Tài khoản chưa được xác thực",
                        new List<string> { unverifiedResponse.Message, unverifiedResponse.ResendMessage }
                    );
                }

                // Update last login time and online status
                user.LastLoginAt = DateTime.UtcNow;
                user.IsOnline = true;
                user.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                // Generate JWT tokens using the JWT service
                var token = _jwtService.GenerateToken(user);
                var refreshToken = _jwtService.GenerateRefreshToken(user);
                var tokenExpiration = _jwtService.GetTokenExpiration();

                var response = new LoginResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserType = user.UserType,
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = tokenExpiration,
                    Message = "Đăng nhập thành công"
                };

                _logger.LogInformation("User logged in successfully: {Email}", user.Email);
                return ApiResponse<LoginResponseDto>.Success(response, "Đăng nhập thành công!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return ApiResponse<LoginResponseDto>.Error("Đăng nhập thất bại. Vui lòng thử lại.");
            }
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            return user == null;
        }

        private static string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private static int CalculateAge(DateOnly birthDate)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - birthDate.Year;
            if (birthDate > today.AddYears(-age)) age--;
            return age;
        }

        private static decimal CalculateProfileCompleteness(RegisterRequestDto request)
        {
            var totalFields = 7; // firstName, lastName, email, password, dateOfBirth, location, bio
            var completedFields = 5; // firstName, lastName, email, password, dateOfBirth are required

            if (!string.IsNullOrWhiteSpace(request.Location)) completedFields++;
            if (!string.IsNullOrWhiteSpace(request.Bio)) completedFields++;

            return Math.Round((decimal)completedFields / totalFields * 100, 2);
        }

        public async Task<ApiResponse<string>> LogoutAsync(int userId)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<string>.Error("Không tìm thấy người dùng.");
                }

                // Update user online status
                user.IsOnline = false;
                user.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("User logged out successfully: {UserId}", userId);
                return ApiResponse<string>.Success("", "Đăng xuất thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
                return ApiResponse<string>.Error("Đăng xuất thất bại. Vui lòng thử lại.");
            }
        }

        public async Task<ApiResponse<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(request.RefreshToken);

                var userIdClaim = jsonToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return ApiResponse<RefreshTokenResponseDto>.Error("Token không hợp lệ.");
                }

                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null || !user.IsVerified)
                {
                    return ApiResponse<RefreshTokenResponseDto>.Error("Người dùng không tồn tại hoặc chưa được xác thực.");
                }

                // Generate new tokens
                var newToken = _jwtService.GenerateToken(user);
                var newRefreshToken = GenerateRefreshToken(user);
                var tokenExpiration = _jwtService.GetTokenExpiration();

                var response = new RefreshTokenResponseDto
                {
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = tokenExpiration,
                    Message = "Làm mới token thành công"
                };

                _logger.LogInformation("Token refreshed successfully for user: {UserId}", userId);
                return ApiResponse<RefreshTokenResponseDto>.Success(response, "Làm mới token thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return ApiResponse<RefreshTokenResponseDto>.Error("Làm mới token thất bại. Vui lòng đăng nhập lại.");
            }
        }

        public async Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    // Don't reveal if email exists for security
                    return ApiResponse<string>.Success("", "Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.");
                }

                // Check if there's a recent token (within last 2 minutes)
                var recentToken = await _unitOfWork.PasswordResetTokens
                    .GetRecentTokenAsync(user.Id, TimeSpan.FromMinutes(2));

                if (recentToken != null)
                {
                    return ApiResponse<string>.Error("Vui lòng đợi trước khi yêu cầu mã đặt lại mật khẩu mới.");
                }

                // Generate reset token
                var resetCode = GenerateVerificationCode();
                var resetToken = new PasswordResetToken
                {
                    UserId = user.Id,
                    Token = resetCode,
                    ExpiresAt = DateTime.UtcNow.AddHours(1), // 1 hour expiry
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.PasswordResetTokens.AddAsync(resetToken);
                await _unitOfWork.SaveChangesAsync();

                // Send password reset email
                var emailSent = await _emailService.SendPasswordResetEmailAsync(
                    user.Email,
                    resetCode,
                    user.FirstName
                );

                if (!emailSent)
                {
                    _logger.LogWarning("Failed to send password reset email to {Email}", user.Email);
                }

                _logger.LogInformation("Password reset token generated for user: {Email}", user.Email);
                return ApiResponse<string>.Success("", "Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during forgot password for: {Email}", request.Email);
                return ApiResponse<string>.Error("Không thể gửi mã đặt lại mật khẩu. Vui lòng thử lại.");
            }
        }

        public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return ApiResponse<string>.Error("Thông tin không hợp lệ.");
                }

                // Find valid reset token
                var token = await _unitOfWork.PasswordResetTokens
                    .GetValidTokenAsync(user.Id, request.Token);

                if (token == null)
                {
                    return ApiResponse<string>.Error("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
                }

                // Update password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                // Mark token as used
                token.IsUsed = true;

                _unitOfWork.Users.Update(user);
                _unitOfWork.PasswordResetTokens.Update(token);
                await _unitOfWork.SaveChangesAsync();

                // Send confirmation email
                await _emailService.SendPasswordChangeConfirmationAsync(user.Email, user.FirstName);

                _logger.LogInformation("Password reset successfully for user: {Email}", user.Email);
                return ApiResponse<string>.Success("", "Đặt lại mật khẩu thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset for: {Email}", request.Email);
                return ApiResponse<string>.Error("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
            }
        }

        public async Task<ApiResponse<string>> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse<string>.Error("Không tìm thấy người dùng.");
                }

                // Verify current password
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                {
                    return ApiResponse<string>.Error("Mật khẩu hiện tại không đúng.");
                }

                // Update password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                // Send confirmation email
                await _emailService.SendPasswordChangeConfirmationAsync(user.Email, user.FirstName);

                _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
                return ApiResponse<string>.Success("", "Đổi mật khẩu thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password change for user: {UserId}", userId);
                return ApiResponse<string>.Error("Đổi mật khẩu thất bại. Vui lòng thử lại.");
            }
        }

        private string GenerateRefreshToken(User user)
        {
            // For simplicity, using JWT for refresh token too, but with longer expiry
            // In production, consider using a more secure approach
            return _jwtService.GenerateRefreshToken(user);
        }
    }
}