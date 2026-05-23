using Amazon.S3;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;
using otdev.Backend.Services;
using otdev.Backend.Services.Domains;
using System;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights()
    .Configure<JsonSerializerOptions>(options =>
    {
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var uri = Environment.GetEnvironmentVariable("MONGODB_URI");
    return new MongoClient(uri);
});

builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var accessKey = Environment.GetEnvironmentVariable("R2_ACCESS_KEY");
    var secretKey = Environment.GetEnvironmentVariable("R2_SECRET_KEY");
    var endpoint = Environment.GetEnvironmentVariable("R2_ENDPOINT");
    
    var config = new AmazonS3Config
    {
        ServiceURL = endpoint,
    };
    return new AmazonS3Client(accessKey, secretKey, config);
});

builder.Services
    .AddSingleton<IBlogService, BlogService>()
    .AddSingleton<IProjectService, ProjectService>()
    .AddSingleton<IProfileService, ProfileService>()
    .AddSingleton<IContactMessageService, ContactMessageService>()
    .AddSingleton<IMediaService, MediaService>()
    .AddSingleton<IR2Service, R2Service>()
    .AddSingleton<ITemplateService, TemplateService>()
    .AddSingleton<ISettingsService, SettingsService>();

builder.Build().Run();
