using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Indiaborn.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<UploadController> _logger;

    public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
    {
        _env = env;
        _logger = logger;
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken token)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest("Invalid file type. Only JPG, PNG, and WebP are allowed.");

        if (file.Length > 5 * 1024 * 1024) // 5MB limit
            return BadRequest("File size exceeds 5MB limit.");

        var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        string uploadsDir;
        bool isUsingTmp = false;

        // Try wwwroot first, fallback to /tmp if it fails
        try
        {
            uploadsDir = Path.Combine(webRoot, "assets", "products");
            Directory.CreateDirectory(uploadsDir);
            _logger.LogInformation("Using wwwroot directory: {Path}", uploadsDir);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Cannot create directory in wwwroot, using /tmp");
            uploadsDir = Path.Combine("/tmp", "assets", "products");
            Directory.CreateDirectory(uploadsDir);
            isUsingTmp = true;
            _logger.LogInformation("Using /tmp directory: {Path}", uploadsDir);
        }

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        try
        {
            _logger.LogInformation("Saving file to: {Path}", filePath);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, token);
            }

            _logger.LogInformation("File saved successfully: {FileName}", fileName);

            // If using /tmp, return API endpoint URL, otherwise return static file path
            var url = isUsingTmp 
                ? $"/api/upload/image/{fileName}" 
                : $"/assets/products/{fileName}";
            
            _logger.LogInformation("Returning URL: {Url}", url);
            
            return Ok(new { url, fileName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {FileName} to {Path}", file.FileName, filePath);
            return StatusCode(500, $"Error saving file: {ex.Message}");
        }
    }

    [HttpGet("image/{fileName}")]
    [AllowAnonymous]
    public IActionResult GetImage(string fileName)
    {
        // Try /tmp first (production), then wwwroot (local)
        var tmpPath = Path.Combine("/tmp", "assets", "products", fileName);
        if (System.IO.File.Exists(tmpPath))
        {
            var contentType = GetContentType(fileName);
            return PhysicalFile(tmpPath, contentType);
        }

        var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        var wwwrootPath = Path.Combine(webRoot, "assets", "products", fileName);
        if (System.IO.File.Exists(wwwrootPath))
        {
            var contentType = GetContentType(fileName);
            return PhysicalFile(wwwrootPath, contentType);
        }

        return NotFound();
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}

