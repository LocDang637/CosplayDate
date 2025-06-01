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
                var subject = "Xác thực tài khoản CosplayDate của bạn";
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
                var subject = "Chào mừng đến với CosplayDate! 🎭";
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
                    <title>Xác thực tài khoản CosplayDate của bạn</title>
                </head>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFE8F5;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);'>
                        
                        <!-- Header -->
                        <div style='background: linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%); padding: 30px; text-align: center;'>
                            <h1 style='color: #E91E63; margin: 0; font-size: 28px; font-weight: 700;'>🎭 CosplayDate</h1>
                            <p style='color: #666; margin: 10px 0 0 0; font-size: 16px;'>Chào mừng đến với cộng đồng Cosplay!</p>
                        </div>
                        
                        <!-- Content -->
                        <div style='padding: 40px 30px;'>
                            <h2 style='color: #E91E63; margin-bottom: 20px; font-size: 24px;'>Xin chào {firstName}! 👋</h2>
                            
                            <p style='margin-bottom: 20px; font-size: 16px; line-height: 1.6;'>
                                Cảm ơn bạn đã tham gia CosplayDate! Chúng tôi rất vui khi có bạn trong cộng đồng những người đam mê cosplay.
                            </p>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Để hoàn tất đăng ký và bắt đầu khám phá, vui lòng xác thực địa chỉ email của bạn bằng mã dưới đây:
                            </p>
                            
                            <!-- Verification Code -->
                            <div style='text-align: center; margin: 30px 0;'>
                                <div style='background: linear-gradient(45deg, #E91E63, #9C27B0); color: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;'>
                                    {verificationCode}
                                </div>
                            </div>
                            
                            <p style='margin-bottom: 20px; font-size: 14px; color: #666; text-align: center;'>
                                Mã này sẽ hết hạn sau 24 giờ vì lý do bảo mật.
                            </p>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Sau khi xác thực, bạn sẽ có thể:
                            </p>
                            
                            <ul style='margin-bottom: 30px; padding-left: 20px;'>
                                <li style='margin-bottom: 10px;'>🎭 Kết nối với các cosplayer tuyệt vời</li>
                                <li style='margin-bottom: 10px;'>📸 Đặt lịch chụp ảnh và sự kiện</li>
                                <li style='margin-bottom: 10px;'>🌟 Chia sẻ hành trình cosplay của bạn</li>
                                <li style='margin-bottom: 10px;'>🎉 Tham gia các sự kiện và hội chợ cosplay</li>
                            </ul>
                            
                            <p style='margin-bottom: 20px; font-size: 16px; line-height: 1.6;'>
                                Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style='background-color: #F8BBD9; padding: 20px; text-align: center;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>
                                © 2024 CosplayDate. Được tạo với 💖 cho cộng đồng cosplay.
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
                    <title>Chào mừng đến với CosplayDate!</title>
                </head>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFE8F5;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);'>
                        
                        <!-- Header -->
                        <div style='background: linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%); padding: 30px; text-align: center;'>
                            <h1 style='color: #E91E63; margin: 0; font-size: 28px; font-weight: 700;'>🎉 Chào mừng đến với CosplayDate!</h1>
                            <p style='color: #666; margin: 10px 0 0 0; font-size: 16px;'>Hành trình cosplay của bạn bắt đầu từ đây!</p>
                        </div>
                        
                        <!-- Content -->
                        <div style='padding: 40px 30px; text-align: center;'>
                            <h2 style='color: #E91E63; margin-bottom: 20px; font-size: 24px;'>Chúc mừng bạn, {firstName}! 🎭</h2>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Email của bạn đã được xác thực và tài khoản hiện đã hoạt động! Bạn chính thức là thành viên của cộng đồng CosplayDate.
                            </p>
                            
                            <div style='background: rgba(233, 30, 99, 0.05); border-radius: 12px; padding: 20px; margin: 30px 0;'>
                                <h3 style='color: #E91E63; margin-top: 0; font-size: 20px;'>Tiếp theo là gì?</h3>
                                <ul style='text-align: left; margin-bottom: 0; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>📝 Hoàn thiện hồ sơ để có kết nối tốt hơn</li>
                                    <li style='margin-bottom: 10px;'>🔍 Khám phá và tìm kiếm các cosplayer tuyệt vời</li>
                                    <li style='margin-bottom: 10px;'>💰 Nạp tiền vào ví để dễ dàng đặt lịch</li>
                                    <li style='margin-bottom: 0;'>🎪 Xem các sự kiện cosplay sắp tới</li>
                                </ul>
                            </div>
                            
                            <a href='https://cosplaydate.com/profile' style='display: inline-block; background: linear-gradient(45deg, #E91E63, #9C27B0); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0;'>
                                Hoàn thiện hồ sơ →
                            </a>
                            
                            <p style='margin-top: 30px; font-size: 14px; color: #666;'>
                                Cần hỗ trợ? Liên hệ với đội ngũ hỗ trợ tại support@cosplaydate.com
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style='background-color: #F8BBD9; padding: 20px; text-align: center;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>
                                © 2024 CosplayDate. Được tạo với 💖 cho cộng đồng cosplay.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        public async Task<bool> SendPasswordResetEmailAsync(string email, string resetCode, string firstName)
        {
            try
            {
                var subject = "Đặt lại mật khẩu CosplayDate";
                var htmlBody = GetPasswordResetEmailTemplate(firstName, resetCode);

                return await SendEmailAsync(email, subject, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
                return false;
            }
        }

        public async Task<bool> SendPasswordChangeConfirmationAsync(string email, string firstName)
        {
            try
            {
                var subject = "Mật khẩu CosplayDate đã được thay đổi";
                var htmlBody = GetPasswordChangeConfirmationTemplate(firstName);

                return await SendEmailAsync(email, subject, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password change confirmation email to {Email}", email);
                return false;
            }
        }

        private static string GetPasswordResetEmailTemplate(string firstName, string resetCode)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Đặt lại mật khẩu CosplayDate</title>
                </head>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFE8F5;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);'>
                        
                        <!-- Header -->
                        <div style='background: linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%); padding: 30px; text-align: center;'>
                            <h1 style='color: #E91E63; margin: 0; font-size: 28px; font-weight: 700;'>🔐 Đặt lại mật khẩu</h1>
                            <p style='color: #666; margin: 10px 0 0 0; font-size: 16px;'>CosplayDate</p>
                        </div>
                        
                        <!-- Content -->
                        <div style='padding: 40px 30px;'>
                            <h2 style='color: #E91E63; margin-bottom: 20px; font-size: 24px;'>Xin chào {firstName}! 👋</h2>
                            
                            <p style='margin-bottom: 20px; font-size: 16px; line-height: 1.6;'>
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CosplayDate của bạn.
                            </p>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Vui lòng sử dụng mã dưới đây để đặt lại mật khẩu:
                            </p>
                            
                            <!-- Reset Code -->
                            <div style='text-align: center; margin: 30px 0;'>
                                <div style='background: linear-gradient(45deg, #E91E63, #9C27B0); color: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;'>
                                    {resetCode}
                                </div>
                            </div>
                            
                            <p style='margin-bottom: 20px; font-size: 14px; color: #666; text-align: center;'>
                                Mã này sẽ hết hạn sau 1 giờ vì lý do bảo mật.
                            </p>
                            
                            <div style='background: rgba(255, 193, 7, 0.1); border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; font-size: 14px; color: #856404;'>
                                    ⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không bị thay đổi.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style='background-color: #F8BBD9; padding: 20px; text-align: center;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>
                                © 2024 CosplayDate. Được tạo với 💖 cho cộng đồng cosplay.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }

        private static string GetPasswordChangeConfirmationTemplate(string firstName)
        {
            return $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Mật khẩu đã được thay đổi</title>
                </head>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #FFE8F5;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.1);'>
                        
                        <!-- Header -->
                        <div style='background: linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%); padding: 30px; text-align: center;'>
                            <h1 style='color: #E91E63; margin: 0; font-size: 28px; font-weight: 700;'>✅ Mật khẩu đã được thay đổi</h1>
                            <p style='color: #666; margin: 10px 0 0 0; font-size: 16px;'>CosplayDate</p>
                        </div>
                        
                        <!-- Content -->
                        <div style='padding: 40px 30px; text-align: center;'>
                            <h2 style='color: #E91E63; margin-bottom: 20px; font-size: 24px;'>Xin chào {firstName}! 👋</h2>
                            
                            <p style='margin-bottom: 30px; font-size: 16px; line-height: 1.6;'>
                                Mật khẩu cho tài khoản CosplayDate của bạn đã được thay đổi thành công vào lúc {DateTime.UtcNow.AddHours(7):dd/MM/yyyy HH:mm} (GMT+7).
                            </p>
                            
                            <div style='background: rgba(40, 167, 69, 0.1); border-radius: 12px; padding: 20px; margin: 30px 0;'>
                                <h3 style='color: #28a745; margin-top: 0; font-size: 20px;'>🔒 Tài khoản của bạn đã được bảo mật</h3>
                                <p style='margin-bottom: 0; font-size: 16px; color: #155724;'>
                                    Mật khẩu mới đã có hiệu lực ngay lập tức. Bạn có thể đăng nhập bằng mật khẩu mới.
                                </p>
                            </div>
                            
                            <div style='background: rgba(255, 193, 7, 0.1); border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; font-size: 14px; color: #856404;'>
                                    ⚠️ Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với đội ngũ hỗ trợ ngay lập tức tại support@cosplaydate.com
                                </p>
                            </div>
                            
                            <p style='margin-top: 30px; font-size: 14px; color: #666;'>
                                Cảm ơn bạn đã giữ an toàn cho tài khoản CosplayDate!
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style='background-color: #F8BBD9; padding: 20px; text-align: center;'>
                            <p style='margin: 0; font-size: 14px; color: #666;'>
                                © 2024 CosplayDate. Được tạo với 💖 cho cộng đồng cosplay.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";
        }
    }
}