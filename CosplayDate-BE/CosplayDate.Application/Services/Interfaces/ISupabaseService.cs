using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
namespace CosplayDate.Application.Services.Interfaces
{
    public interface ISupabaseService
    {
        Task<string> UploadFileAsync(IFormFile file, string fileName, string bucket = "cosplaydate-media");
        Task<string> UploadFileAsync(byte[] fileBytes, string fileName, string contentType, string bucket = "cosplaydate-media");
        Task<bool> DeleteFileAsync(string fileUrl, string bucket = "cosplaydate-media");
        Task<string> GetSignedUrlAsync(string fileName, int expiresInSeconds = 3600, string bucket = "cosplaydate-media");
        Task<bool> FileExistsAsync(string fileName, string bucket = "cosplaydate-media");
        string GetPublicUrl(string fileName, string bucket = "cosplaydate-media");
    }
}
