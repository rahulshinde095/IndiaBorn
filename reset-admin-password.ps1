# Script to reset admin password via API
Write-Host "Resetting Admin Password on Production" -ForegroundColor Cyan

$prodApiUrl = "https://indiaborn.onrender.com/api"
$adminEmail = "admin@indiaborn.com"
$oldPassword = "ChangeMe123!"
$newPassword = "Devika@2501"

Write-Host "`nStep 1: Trying to login with old password..." -ForegroundColor Yellow
try {
    $loginBody = @{ 
        email = $adminEmail
        password = $oldPassword 
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$prodApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Success: Login works with old password" -ForegroundColor Green
    Write-Host "Token received: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    
    Write-Host "`nNote: There is currently no change-password endpoint." -ForegroundColor Yellow
    Write-Host "The admin password needs to be updated directly in MongoDB Atlas." -ForegroundColor Yellow
    
} catch {
    Write-Host "Failed: Login failed with old password" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host "`nTrying with new password..." -ForegroundColor Yellow
    try {
        $loginBody2 = @{ 
            email = $adminEmail
            password = $newPassword 
        } | ConvertTo-Json
        
        $loginResponse2 = Invoke-RestMethod -Uri "$prodApiUrl/auth/login" -Method Post -Body $loginBody2 -ContentType "application/json"
        Write-Host "Success: Login successful with new password" -ForegroundColor Green
    } catch {
        Write-Host "Failed: Login also failed with new password" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TO UPDATE PASSWORD IN MONGODB ATLAS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Go to: https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "2. Navigate to your IndiabornDb database" -ForegroundColor White
Write-Host "3. Go to Collections -> users" -ForegroundColor White
Write-Host "4. Find the admin user (email: admin@indiaborn.com)" -ForegroundColor White
Write-Host "5. Delete the existing admin user document" -ForegroundColor White
Write-Host "6. Redeploy on Render with Admin__Password=Devika@2501" -ForegroundColor White
Write-Host "7. The EnsureAdminAsync will recreate it with new password" -ForegroundColor White
Write-Host "`nOR just use the old password for now: ChangeMe123!" -ForegroundColor Yellow

