using Amazon.S3;
using Amazon.S3.Model;
using System;
using System.IO;
using System.Threading.Tasks;

namespace otdev.Backend.Services
{
    /// <summary>
    /// Service for handling direct file uploads to Cloudflare R2 (S3-compatible storage).
    /// </summary>
    public class R2Service : IR2Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _publicUrl;

        public R2Service(IAmazonS3 s3Client)
        {
            _s3Client = s3Client;
            _bucketName = Environment.GetEnvironmentVariable("R2_BUCKET_NAME") ?? string.Empty;
            
            _publicUrl = Environment.GetEnvironmentVariable("R2_PUBLIC_URL") ?? string.Empty; 
        }

        /// <summary>
        /// Uploads an image stream to the configured R2 bucket and returns the public access URL.
        /// </summary>
        public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType)
        {
            var key = $"assets/images/{Guid.NewGuid()}-{fileName}"; 
            
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                DisablePayloadSigning = true
            };

            await _s3Client.PutObjectAsync(request);
            return $"{_publicUrl.TrimEnd('/')}/{key}";
        }

        /// <summary>
        /// Deletes an image from the configured R2 bucket given its public URL.
        /// Extracts the S3 Object Key from the URL and removes the file.
        /// </summary>
        public async Task DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl)) return;

            try
            {
                string key = imageUrl;
                var baseUrl = _publicUrl.TrimEnd('/');
                
                if (imageUrl.StartsWith(baseUrl, StringComparison.OrdinalIgnoreCase))
                {
                    key = imageUrl.Substring(baseUrl.Length).TrimStart('/');
                }

                var request = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                await _s3Client.DeleteObjectAsync(request);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Failed to delete image from R2. ImageUrl: {imageUrl}. Error: {ex.Message}");
            }
        }
    }
}