# Script to update product images
Write-Host "Updating Product Images" -ForegroundColor Cyan

$prodApiUrl = "https://indiaborn.onrender.com/api"
$adminEmail = "admin@indiaborn.com"
$adminPassword = "Devika@2501"

# Default fallback image (your brand logo)
$defaultImage = "/assets/brand-logo.jpeg"

Write-Host "`nStep 1: Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{ 
        email = $adminEmail
        password = $adminPassword 
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$prodApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful!" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Fetching all products..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $products = Invoke-RestMethod -Uri "$prodApiUrl/products" -Method Get
    Write-Host "Found $($products.Count) products" -ForegroundColor Green
} catch {
    Write-Host "Failed to fetch products: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 3: Updating product images..." -ForegroundColor Yellow
$updated = 0
$failed = 0

foreach ($product in $products) {
    # Check if image URL is broken (404)
    $needsUpdate = $false
    
    if ($product.images -and $product.images.Count -gt 0) {
        $imageUrl = $product.images[0].url
        
        # Check if it's a relative URL that might be broken
        if ($imageUrl -match "^/assets/products/") {
            $needsUpdate = $true
        }
    } else {
        $needsUpdate = $true
    }
    
    if ($needsUpdate) {
        Write-Host "  Updating: $($product.name)" -ForegroundColor Cyan
        
        # Update product with default image
        $updateData = @{
            name = $product.name
            description = $product.description
            price = $product.price
            salePrice = $product.salePrice
            inventoryCount = $product.inventoryCount
            category = $product.category
            subCategory = $product.subCategory
            productType = $product.productType
            gender = $product.gender
            sport = $product.sport
            material = $product.material
            brand = $product.brand
            availableSizes = @($product.availableSizes)
            availableColors = @($product.availableColors)
            isBestSeller = $product.isBestSeller
            isNewArrival = $product.isNewArrival
            isOnSale = $product.isOnSale
            images = @(
                @{
                    url = $defaultImage
                    altText = $product.name
                    isPrimary = $true
                }
            )
        } | ConvertTo-Json -Depth 10
        
        try {
            $null = Invoke-RestMethod -Uri "$prodApiUrl/products/$($product.id)" -Method Put -Headers $headers -Body $updateData -ContentType "application/json"
            Write-Host "    Updated successfully!" -ForegroundColor Green
            $updated++
        } catch {
            Write-Host "    Failed: $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total products: $($products.Count)" -ForegroundColor White
Write-Host "Updated: $updated" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "`nAll products now use the brand logo as fallback." -ForegroundColor Yellow
Write-Host "You can upload custom images via Admin Panel." -ForegroundColor Yellow
