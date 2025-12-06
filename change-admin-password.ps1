Write-Host "Updating admin password..." -ForegroundColor Cyan

$prodApiUrl = "https://indiaborn.onrender.com/api"
$adminEmail = "admin@indiaborn.com"
$currentPassword = "YourSecurePassword123!"
$newPassword = Read-Host "Enter new admin password" -AsSecureString
$newPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword))

Write-Host "`nLogging in with current password..." -ForegroundColor Yellow
try {
    $loginBody = @{ email = $adminEmail; password = $currentPassword } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$prodApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to login with current password. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "`nUpdating password..." -ForegroundColor Yellow
try {
    # This would need a change password endpoint
    Write-Host "Password change endpoint not yet implemented." -ForegroundColor Yellow
    Write-Host "`nTo change the password, you need to:" -ForegroundColor Cyan
    Write-Host "1. Go to MongoDB Atlas: https://cloud.mongodb.com/" -ForegroundColor White
    Write-Host "2. Navigate to your IndiaBorn database" -ForegroundColor White
    Write-Host "3. Find the UserAccounts collection" -ForegroundColor White
    Write-Host "4. Update the admin user password (it should be hashed)" -ForegroundColor White
    Write-Host "`nOR use Option 2 below to update via environment variable" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
