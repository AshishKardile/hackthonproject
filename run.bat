@echo off
echo Starting EduWell Backend...
start cmd /k "cd server && npm start"

echo Starting EduWell Frontend...
start cmd /k "cd client && npm run dev"

echo Opening Chrome...
timeout /t 5
start chrome http://localhost:3000
