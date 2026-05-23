using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using otdev.Backend.Services;
using otdev.Backend.Services.Domains;
using System;
using System.Threading.Tasks;

namespace otdev.AzFunctionApp
{
    public class MediaGarbageCollector
    {
        private readonly IMediaService _mediaService;
        private readonly IR2Service _r2Service;
        private readonly ILogger _logger;

        public MediaGarbageCollector(IMediaService mediaService, IR2Service r2Service, ILoggerFactory loggerFactory)
        {
            _mediaService = mediaService;
            _r2Service = r2Service;
            _logger = loggerFactory.CreateLogger<MediaGarbageCollector>();
        }

        // Runs once a week on Sunday at midnight UTC
        [Function("MediaGarbageCollector")]
        public async Task Run([TimerTrigger("0 0 * * 0")] TimerInfo myTimer)
        {
            _logger.LogInformation($"MediaGarbageCollector executed at: {DateTime.UtcNow}");

            var thresholdDate = DateTime.UtcNow.AddDays(-7);
            var orphanedAssets = await _mediaService.GetOrphanedMediaAsync(thresholdDate);

            if (orphanedAssets.Count == 0)
            {
                _logger.LogInformation("No orphaned media assets found. Janitor duty complete.");
                return;
            }

            _logger.LogInformation($"Found {orphanedAssets.Count} orphaned media assets older than 7 days. Beginning purge...");

            int purgedCount = 0;
            foreach (var asset in orphanedAssets)
            {
                try
                {
                    if (!string.IsNullOrEmpty(asset.Url))
                    {
                        await _r2Service.DeleteImageAsync(asset.Url);
                    }

                    if (!string.IsNullOrEmpty(asset.Id))
                    {
                        await _mediaService.DeleteMediaAssetAsync(asset.Id);
                    }
                    purgedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to purge asset {asset.Id} with URL {asset.Url}");
                }
            }

            _logger.LogInformation($"MediaGarbageCollector successfully purged {purgedCount} assets.");
        }
    }
}
