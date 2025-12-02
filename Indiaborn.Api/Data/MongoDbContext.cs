using Indiaborn.Api.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Indiaborn.Api.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly MongoSettings _settings;

    public MongoDbContext(IOptions<MongoSettings> settings)
    {
        _settings = settings.Value;
        
        // Configure MongoDB client settings for SSL/TLS
        var mongoUrl = MongoUrl.Create(_settings.ConnectionString);
        var clientSettings = MongoClientSettings.FromUrl(mongoUrl);
        
        // Enable TLS 1.2+ for MongoDB Atlas
        clientSettings.SslSettings = new SslSettings
        {
            EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12
        };
        
        // Set longer timeouts for Render's free tier cold starts
        clientSettings.ConnectTimeout = TimeSpan.FromSeconds(30);
        clientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(30);
        
        var client = new MongoClient(clientSettings);
        _database = client.GetDatabase(_settings.DatabaseName);
    }

    public IMongoCollection<T> GetCollection<T>(string? overrideName = null)
    {
        var collectionName = overrideName ?? typeof(T).Name.ToLowerInvariant();
        return _database.GetCollection<T>(collectionName);
    }

    public IMongoCollection<T> GetCollectionFromSetting<T>(string settingName)
    {
        var collectionName = settingName switch
        {
            nameof(MongoSettings.ProductsCollection) => _settings.ProductsCollection,
            nameof(MongoSettings.OrdersCollection) => _settings.OrdersCollection,
            nameof(MongoSettings.UsersCollection) => _settings.UsersCollection,
            _ => typeof(T).Name.ToLowerInvariant()
        };

        return _database.GetCollection<T>(collectionName);
    }
}

