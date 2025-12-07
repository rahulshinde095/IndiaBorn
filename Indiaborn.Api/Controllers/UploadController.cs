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
        var fileName = $"{Guid.NewGuid()}{extension}";
        string uploadsDir;
        string filePath;
        bool isUsingTmp = false;

        // Try to save to wwwroot first
        uploadsDir = Path.Combine(webRoot, "assets", "products");
        Directory.CreateDirectory(uploadsDir);
        filePath = Path.Combine(uploadsDir, fileName);

        try
        {
            _logger.LogInformation("Attempting to save file to wwwroot: {Path}", filePath);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, token);
            }

            _logger.LogInformation("File saved successfully to wwwroot: {FileName}", fileName);
            var url = $"/assets/products/{fileName}";
            return Ok(new { url, fileName });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Cannot write to wwwroot (read-only), trying /tmp");
            
            // Retry with /tmp
            uploadsDir = Path.Combine("/tmp", "assets", "products");
            Directory.CreateDirectory(uploadsDir);
            filePath = Path.Combine(uploadsDir, fileName);
            isUsingTmp = true;

            try
            {
                _logger.LogInformation("Saving file to /tmp: {Path}", filePath);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream, token);
                }

                _logger.LogInformation("File saved successfully to /tmp: {FileName}", fileName);
                
                // Return API endpoint URL for /tmp files
                var url = $"/api/upload/image/{fileName}";
                return Ok(new { url, fileName });
            }
            catch (Exception tmpEx)
            {
                _logger.LogError(tmpEx, "Error saving file to /tmp: {Path}", filePath);
                return StatusCode(500, $"Error saving file: {tmpEx.Message}");
            }
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

