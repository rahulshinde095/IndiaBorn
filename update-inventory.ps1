Write-Host "Updating product inventory counts..." -ForegroundColor Cyan

$prodApiUrl = "https://indiaborn.onrender.com/api"
$adminEmail = "admin@indiaborn.com"
$adminPassword = "YourSecurePassword123!"

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$prodApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Logged in successfully" -ForegroundColor Green

# Get all products
Write-Host "`nFetching products..." -ForegroundColor Yellow
$products = Invoke-RestMethod -Uri "$prodApiUrl/products" -Method Get
Write-Host "Found $($products.Count) products" -ForegroundColor Green

# Update each product with inventory count
Write-Host "`nUpdating inventory counts..." -ForegroundColor Yellow
$successCount = 0
$failCount = 0

foreach ($product in $products) {
    # Set inventory to 100 for all products (you can adjust this)
    $product.inventoryCount = 100
    
    $productJson = $product | ConvertTo-Json -Depth 10
    $headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
    
    try {
        Invoke-RestMethod -Uri "$prodApiUrl/products/$($product.id)" -Method Put -Body $productJson -Headers $headers | Out-Null
        Write-Host "   $($product.name) - inventory set to 100" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "   $($product.name): $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`nUpdate Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount products" -ForegroundColor Green
Write-Host "  Failed: $failCount products" -ForegroundColor Red
Write-Host "`nProducts now have inventory and can be ordered!" -ForegroundColor Green
