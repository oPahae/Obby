@echo off
cd ./OBSIDIAN/app
start npm run dev
timeout /t 12
start chrome http://localhost:3000/
exit