# Import products from local MongoDB to production MongoDB Atlas via API
Write-Host "Starting product import to MongoDB Atlas..." -ForegroundColor Cyan

# Configuration
$localApiUrl = "http://localhost:5184/api"
$prodApiUrl = "https://indiaborn.onrender.com/api"
$adminEmail = "admin@indiaborn.com"
$adminPassword = "YourSecurePassword123!"

Write-Host "`nStep 1: Fetching products from local database..." -ForegroundColor Yellow
$localProducts = Invoke-RestMethod -Uri "$localApiUrl/products" -Method Get
Write-Host "Found $($localProducts.Count) products locally" -ForegroundColor Green

Write-Host "`nStep 2: Logging in to production admin..." -ForegroundColor Yellow
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$prodApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Successfully logged in" -ForegroundColor Green

Write-Host "`nStep 3: Uploading products to production..." -ForegroundColor Yellow
$successCount = 0
$failCount = 0

foreach ($product in $localProducts) {
    $productData = @{
        name = $product.name
        description = $product.description
        price = $product.price
        salePrice = $product.salePrice
        category = $product.category
        subCategory = $product.subCategory
        brand = $product.brand
        gender = $product.gender
        sport = $product.sport
        stockQuantity = $product.stockQuantity
        availableSizes = $product.availableSizes
        images = $product.images
        isOnSale = $product.isOnSale
        isBestSeller = $product.isBestSeller
        isNewArrival = $product.isNewArrival
        tags = $product.tags
    }
    
    $productJson = $productData | ConvertTo-Json -Depth 10
    $headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
    
    try {
        Invoke-RestMethod -Uri "$prodApiUrl/products" -Method Post -Body $productJson -Headers $headers | Out-Null
        Write-Host "   $($product.name)" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "   $($product.name): $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`nImport Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount products" -ForegroundColor Green
Write-Host "  Failed: $failCount products" -ForegroundColor Red
Write-Host "`nVisit https://indiaborn.onrender.com/ to see your products!" -ForegroundColor Cyan
