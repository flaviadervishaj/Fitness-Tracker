@echo off
echo Starting Fitness Tracker...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause

