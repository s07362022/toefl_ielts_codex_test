#Requires -Version 5.1
<#
.SYNOPSIS
  註冊 Windows 工作排程：每日 09:00 執行英文學習管線（產生 JSON、複製至網頁、寄 Gmail）。

.EXAMPLE
  Set-Location "F:\代碼\英文學習"
  .\register_daily_task.ps1
#>

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$batPath = Join-Path $projectRoot "run_daily_pipeline.bat"
$taskName = "EnglishLearning_Daily_0900"

if (-not (Test-Path $batPath)) {
    Write-Error "找不到批次檔: $batPath"
}

$tr = "cmd.exe /c `"$batPath`""
& schtasks.exe /Create /TN $taskName /TR $tr /SC DAILY /ST 09:00 /F
if ($LASTEXITCODE -ne 0) {
    Write-Error "schtasks 失敗，請以系統管理員執行 PowerShell。"
}

Write-Host "已建立排程: $taskName"
Write-Host "每日 09:00 執行: $batPath"
Write-Host "內容：產生課程 → 驗證 → 複製至 cursor製作 → 寄信 gish1040403@gmail.com"
