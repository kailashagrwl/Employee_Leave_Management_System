Write-Host "Starting Employee Leave Management System..." -ForegroundColor Cyan

# Start Backend
Write-Host "Launching Backend on Port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start"

# Start Frontend
Write-Host "Launching Frontend on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "System is starting. Please check the new terminal windows." -ForegroundColor Yellow
