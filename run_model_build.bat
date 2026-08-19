@echo off
cd /d "%~dp0"
".venv\Scripts\python.exe" create_dummy_model.py
if not exist "backend\models" mkdir "backend\models"
copy models\* backend\models\ /Y
