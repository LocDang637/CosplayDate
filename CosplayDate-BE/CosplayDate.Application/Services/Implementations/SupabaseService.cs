using CosplayDate.Application.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace CosplayDate.Infrastructure.Services
{
    public class SupabaseService : ISupabaseService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SupabaseService> _logger;
        private readonly string _supabaseUrl;
        private readonly string _supabaseKey;

        public SupabaseService(HttpClient httpClient, IConfiguration configuration, ILogger<SupabaseService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            _supabaseUrl = _configuration["Supabase:Url"] ?? throw new ArgumentNullException("Supabase:Url");
            _supabaseKey = _configuration["Supabase:ServiceKey"] ?? throw new ArgumentNullException("Supabase:ServiceKey");

            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_supabaseKey}");
            _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string fileName, string bucket = "cosplaydate-media")
        {
            try
            {
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();

                return await UploadFileAsync(fileBytes, fileName, file.ContentType, bucket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file {FileName} to bucket {Bucket}", fileName, bucket);
                throw;
            }
        }

        public async Task<string> UploadFileAsync(byte[] fileBytes, string fileName, string contentType, string bucket = "cosplaydate-media")
        {
            try
            {
                var url = $"{_supabaseUrl}/storage/v1/object/{bucket}/{fileName}";

                using var content = new ByteArrayContent(fileBytes);
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<SupabaseUploadResponse>(responseContent);

                    if (result?.Key != null)
                    {
                        var publicUrl = GetPublicUrl(fileName, bucket);
                        _logger.LogInformation("File uploaded successfully: {FileName} to {PublicUrl}", fileName, publicUrl);
                        return publicUrl;
                    }
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to upload file {FileName}. Status: {StatusCode}, Response: {Response}",
                    fileName, response.StatusCode, errorContent);
                throw new Exception($"Failed to upload file. Status: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file {FileName} to bucket {Bucket}", fileName, bucket);
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(string fileUrl, string bucket = "cosplaydate-media")
        {
            try
            {
                // Extract file name from URL
                var fileName = ExtractFileNameFromUrl(fileUrl, bucket);
                if (string.IsNullOrEmpty(fileName))
                {
                    _logger.LogWarning("Could not extract file name from URL: {FileUrl}", fileUrl);
                    return false;
                }

                var url = $"{_supabaseUrl}/storage/v1/object/{bucket}/{fileName}";
                var response = await _httpClient.DeleteAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("File deleted successfully: {FileName}", fileName);
                    return true;
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to delete file {FileName}. Status: {StatusCode}, Response: {Response}",
                    fileName, response.StatusCode, errorContent);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {FileUrl}", fileUrl);
                return false;
            }
        }

        public async Task<string> GetSignedUrlAsync(string fileName, int expiresInSeconds = 3600, string bucket = "cosplaydate-media")
        {
            try
            {
                var url = $"{_supabaseUrl}/storage/v1/object/sign/{bucket}/{fileName}";

                var requestBody = new
                {
                    expiresIn = expiresInSeconds
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<SupabaseSignedUrlResponse>(responseContent);

                    if (!string.IsNullOrEmpty(result?.SignedUrl))
                    {
                        return $"{_supabaseUrl}{result.SignedUrl}";
                    }
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to get signed URL for {FileName}. Status: {StatusCode}, Response: {Response}",
                    fileName, response.StatusCode, errorContent);
                throw new Exception($"Failed to get signed URL for {fileName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting signed URL for {FileName}", fileName);
                throw;
            }
        }

        public async Task<bool> FileExistsAsync(string fileName, string bucket = "cosplaydate-media")
        {
            try
            {
                var url = $"{_supabaseUrl}/storage/v1/object/info/{bucket}/{fileName}";
                var response = await _httpClient.GetAsync(url);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if file exists: {FileName}", fileName);
                return false;
            }
        }

        public string GetPublicUrl(string fileName, string bucket = "cosplaydate-media")
        {
            return $"{_supabaseUrl}/storage/v1/object/public/{bucket}/{fileName}";
        }

        private string ExtractFileNameFromUrl(string fileUrl, string bucket)
        {
            try
            {
                var pattern = $"/storage/v1/object/public/{bucket}/";
                var index = fileUrl.IndexOf(pattern);

                if (index >= 0)
                {
                    return fileUrl.Substring(index + pattern.Length);
                }

                // Try alternative pattern
                var altPattern = $"/{bucket}/";
                var altIndex = fileUrl.LastIndexOf(altPattern);

                if (altIndex >= 0)
                {
                    return fileUrl.Substring(altIndex + altPattern.Length);
                }

                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting file name from URL: {FileUrl}", fileUrl);
                return string.Empty;
            }
        }
    }

    // Response models for Supabase API
    public class SupabaseUploadResponse
    {
        public string? Key { get; set; }
        public string? Id { get; set; }
    }

    public class SupabaseSignedUrlResponse
    {
        public string? SignedUrl { get; set; }
    }
}