using CosplayDate.Application.DTOs.Payment;
using CosplayDate.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IPayOSService
    {
        Task<ApiResponse<CreatePaymentResponseDto>> CreatePaymentLinkAsync(CreatePaymentRequestDto request);
        Task<ApiResponse<PaymentInfoResponseDto>> GetPaymentInfoAsync(long orderCode);
        Task<ApiResponse<string>> CancelPaymentLinkAsync(long orderCode, string? reason = null);
        Task<ApiResponse<WebhookResponseDto>> VerifyWebhookAsync(WebhookRequestDto webhookData);
        Task<ApiResponse<string>> ConfirmWebhookAsync(string webhookUrl);
    }
}
