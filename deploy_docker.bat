@echo off
cd /d "%~dp0"
echo =======================================================
echo AutoWorth AI — Building and Launching Docker Containers
echo =======================================================
docker compose down --remove-orphans
docker compose up --build -d
docker compose ps
