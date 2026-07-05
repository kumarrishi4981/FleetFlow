# FleetFlow Monolith Package Script
# This script builds the React frontend and packages it inside the Spring Boot backend JAR,
# creating a single executable deployable artifact with zero CORS issues!

Write-Host "=== 1. Building React Frontend ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot/frontend"
npm install
npm run build

Write-Host "`n=== 2. Copying static files to Spring Boot resources ===" -ForegroundColor Cyan
$staticDir = "$PSScriptRoot/backend/src/main/resources/static"
if (Test-Path $staticDir) {
    Remove-Item -Path "$staticDir/*" -Recurse -Force -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $staticDir -Force
}
Copy-Item -Path "$PSScriptRoot/frontend/dist/*" -Destination $staticDir -Recurse -Force

Write-Host "`n=== 3. Packaging Spring Boot Backend JAR ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot/backend"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
.\mvnw.cmd clean package -DskipTests

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "Success! Single executable JAR created at:" -ForegroundColor Green
Write-Host "C:\FleetFlow\backend\target\fleetflow-backend-1.0.0.jar" -ForegroundColor Yellow
Write-Host "You can deploy this single JAR directly to Render or Railway!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Set-Location $PSScriptRoot
