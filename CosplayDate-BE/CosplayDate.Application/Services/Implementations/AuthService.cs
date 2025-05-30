using AutoMapper;
using BCrypt.Net;
using CosplayDate.Application.DTOs.Auth;
using CosplayDate.Application.Services.Interfaces;
using CosplayDate.Domain.Interfaces;
using CosplayDate.Domain.Entities;
using CosplayDate.Shared.Models;
using Microsoft.Extensions.Logging;

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
                    return ApiResponse<RegisterResponseDto>.Error("An account with this email already exists.");
                }

                // Validate age (must be at least 18)
                var age = CalculateAge(request.DateOfBirth);
                if (age < 18)
                {
                    return ApiResponse<RegisterResponseDto>.Error("You must be at least 18 years old to register.");
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
                    Message = "Registration successful! Please check your email for verification code.",
                    RequiresEmailVerification = true
                };

                _logger.LogInformation("User registered successfully: {Email}", user.Email);
                return ApiResponse<RegisterResponseDto>.Success(response, "Registration successful!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration for email: {Email}", request.Email);
                return ApiResponse<RegisterResponseDto>.Error("Registration failed. Please try again.");
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
                    return ApiResponse<VerifyEmailResponseDto>.Error("User not found.");
                }

                if (user.IsVerified)
                {
                    return ApiResponse<VerifyEmailResponseDto>.Error("Email is already verified.");
                }

                // Find valid verification token
                var token = await _unitOfWork.EmailVerificationTokens
                    .GetValidTokenAsync(user.Id, request.Code);

                if (token == null)
                {
                    return ApiResponse<VerifyEmailResponseDto>.Error("Invalid or expired verification code.");
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
                    Message = "Email verified successfully! Welcome to CosplayDate!",
                    VerifiedAt = user.UpdatedAt
                };

                _logger.LogInformation("Email verified successfully for user: {Email}", user.Email);
                return ApiResponse<VerifyEmailResponseDto>.Success(response, "Email verified successfully!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during email verification for: {Email}", request.Email);
                return ApiResponse<VerifyEmailResponseDto>.Error("Email verification failed. Please try again.");
            }
        }

        public async Task<ApiResponse<string>> ResendVerificationCodeAsync(ResendVerificationRequestDto request)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return ApiResponse<string>.Error("User not found.");
                }

                if (user.IsVerified)
                {
                    return ApiResponse<string>.Error("Email is already verified.");
                }

                // Check if there's a recent token (within last 2 minutes)
                var recentToken = await _unitOfWork.EmailVerificationTokens
                    .GetRecentTokenAsync(user.Id, TimeSpan.FromMinutes(2));

                if (recentToken != null)
                {
                    return ApiResponse<string>.Error("Please wait before requesting a new verification code.");
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
                    return ApiResponse<string>.Error("Failed to send verification email. Please try again.");
                }

                _logger.LogInformation("Verification code resent to: {Email}", user.Email);
                return ApiResponse<string>.Success("", "Verification code sent successfully!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending verification code for: {Email}", request.Email);
                return ApiResponse<string>.Error("Failed to resend verification code. Please try again.");
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
                    return ApiResponse<LoginResponseDto>.Error("Invalid email or password");
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return ApiResponse<LoginResponseDto>.Error("Invalid email or password");
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
                        Message = "Account is not verified",
                        CodeResent = resendResult.IsSuccess,
                        ResendMessage = resendResult.IsSuccess
                            ? "A new verification code has been sent to your email"
                            : "Failed to resend verification code. Please try again later."
                    };

                    return ApiResponse<LoginResponseDto>.Error(
                        "Account is not verified",
                        new List<string> { unverifiedResponse.Message, unverifiedResponse.ResendMessage }
                    );
                }

                // Update last login time and online status
                user.LastLoginAt = DateTime.UtcNow;
                user.IsOnline = true;
                user.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();

                // Generate JWT token using the JWT service
                var token = _jwtService.GenerateToken(user);
                var tokenExpiration = _jwtService.GetTokenExpiration();

                var response = new LoginResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    UserType = user.UserType,
                    Token = token,
                    ExpiresAt = tokenExpiration,
                    Message = "Login successful"
                };

                _logger.LogInformation("User logged in successfully: {Email}", user.Email);
                return ApiResponse<LoginResponseDto>.Success(response, "Login successful!");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return ApiResponse<LoginResponseDto>.Error("Login failed. Please try again.");
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
    }
}
