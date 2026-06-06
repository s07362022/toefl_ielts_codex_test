@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "F:\代碼\英文學習"
python "automation\run_daily_pipeline.py" --push-github %*
if errorlevel 1 (
  echo [ERROR] Daily pipeline failed.
  exit /b 1
)
echo [OK] Daily pipeline finished.
