Write-Host "Starting Synco App Services in separate windows..." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot

Write-Host "Starting Prisma DB..."
# Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npx prisma dev"

Write-Host "Starting Express Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "Starting NestJS Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend-nest; npm run start:dev"

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
