using CosplayDate.Application.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace CosplayDate.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendVerificationEmailAsync(string email, string verificationCode, string firstName)
        {
            try
            {
                var subject = "Verify Your CosplayDate Account";
                var htmlBody = GetVerificationEmailTemplate(firstName, verificationCode);

                return await SendEmailAsync(email, subject, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string firstName)
        {
            try
            {
                var subject = "Welcome to CosplayDate! 🎭";
                var htmlBody = GetWelcomeEmailTemplate(firstName);

                return await SendEmailAsync(email, subject, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", email);
                return false;
            }
        }

        private async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["Email:FromName"],
                    _configuration["Email:FromAddress"]
                ));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["Email:SmtpHost"],
                    int.Parse(_configuration["Email:SmtpPort"]),
                    SecureSocketOptions.StartTls
                );

                await client.AuthenticateAsync(
                    _configuration["Email:Username"],
                    _configuration["Email:Password"]
                );

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                return false;
            }
        }

        private static string GetVerificationEmailTemplate(string firstName, string verificationCode)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Verify Your CosplayDate Account</title>
                </head>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFE8F5;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);'>
                        
                        <!-- Header -->
                        <div style='background: linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%); padding: 30px; text-align: center;'>
                            <h1 style='color: #E91E63; margin: 0; font-size: 28px; font-weight: 700;'>🎭 CosplayDate</h1>
                            <p style='color: #666; margin: 10px 0 0 0; font-size: 16px;'>Welcome to the Cosplay Community!</p>
                        </div>
                        
                        <!-- Content -->
                        <div style='padding: 40px 30px;'>
                            <h2 style='color: #E91E63; margin-bottom: 20px; font-size: 24px;'>Hi {firstName}! 👋</h2>
                            
                            <p style='margin-bottom: 20px; font-size: 16px; line-height: 1.6;'>
                                Thank you for joining CosplayDate! We're excited to have you in our community of cosplay enthusiasts.
                            </p>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                To complete your registration and start exploring, please verify your email address using the code below:
                            </p>
                            
                            <!-- Verification Code -->
                            <div style='text-align: center; margin: 30px 0;'>
                                <div style='background: linear-gradient(45deg, #E91E63, #9C27B0); color: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;'>
                                    {verificationCode}
                                </div>
                            </div>
                            
                            <p style='margin-bottom: 20px; font-size: 14px; color: #666; text-align: center;'>
                                This code will expire in 24 hours for security reasons.
                            </p>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Once verified, you'll be able to:
                            </p>
                            
                            <ul style='margin-bottom: 30px; padding-left: 20px;'>
                                <li style='margin-bottom: 10px;'>🎭 Connect with amazing cosplayers</li>
                                <li style='margin-bottom: 10px;'>📸 Book photoshoots and events</li>
                                <li style='margin-bottom: 10px;'>🌟 Share your cosplay journey</li>
                                <li style='margin-bottom: 10px;'>🎉 Join cosplay events and conventions</li>
                            </ul>
                            
                            <p style='margin-bottom: 20px; font-size: 16px; line-height: 1.6;'>
                                If you didn't create this account, please ignore this email.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style='background-color: #F8BBD9; padding: 20px; text-align: center;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>
                                © 2024 CosplayDate. Made with 💖 for the cosplay community.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private static string GetWelcomeEmailTemplate(string firstName)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Welcome to CosplayDate!</title>
                </head>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFE8F5;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);'>
                        
                        <!-- Header -->
                        <div style='background: linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%); padding: 30px; text-align: center;'>
                            <h1 style='color: #E91E63; margin: 0; font-size: 28px; font-weight: 700;'>🎉 Welcome to CosplayDate!</h1>
                            <p style='color: #666; margin: 10px 0 0 0; font-size: 16px;'>Your cosplay journey starts here!</p>
                        </div>
                        
                        <!-- Content -->
                        <div style='padding: 40px 30px; text-align: center;'>
                            <h2 style='color: #E91E63; margin-bottom: 20px; font-size: 24px;'>Congratulations, {firstName}! 🎭</h2>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Your email has been verified and your account is now active! You're officially part of the CosplayDate community.
                            </p>
                            
                            <div style='background: rgba(233, 30, 99, 0.05); border-radius: 12px; padding: 20px; margin: 30px 0;'>
                                <h3 style='color: #E91E63; margin-top: 0; font-size: 20px;'>What's Next?</h3>
                                <ul style='text-align: left; margin-bottom: 0; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>📝 Complete your profile to get better matches</li>
                                    <li style='margin-bottom: 10px;'>🔍 Explore and discover amazing cosplayers</li>
                                    <li style='margin-bottom: 10px;'>💰 Add funds to your wallet for easy bookings</li>
                                    <li style='margin-bottom: 0;'>🎪 Check out upcoming cosplay events</li>
                                </ul>
                            </div>
                            
                            <a href='https://cosplaydate.com/profile' style='display: inline-block; background: linear-gradient(45deg, #E91E63, #9C27B0); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0;'>
                                Complete Your Profile →
                            </a>
                            
                            <p style='margin-top: 30px; font-size: 14px; color: #666;'>
                                Need help? Contact our support team at support@cosplaydate.com
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style='background-color: #F8BBD9; padding: 20px; text-align: center;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>
                                © 2024 CosplayDate. Made with 💖 for the cosplay community.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }
    }
}
