@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ================================================
echo    提示词库网站 - 一键更新发布
echo ================================================
echo.

rem ---- 检查 git 是否可用 ----
where git >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 git，请先安装 Git for Windows
    pause
    exit /b 1
)

echo [1/3] 自动更新版本号，绕过浏览器缓存...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f='index.html';$p=(Resolve-Path $f).Path;$s=[IO.File]::ReadAllText($p,[Text.Encoding]::UTF8);$ts=Get-Date -Format 'yyyyMMddHHmm';$s=[regex]::Replace($s,'\?v=[0-9a-z]+','?v='+$ts);[IO.File]::WriteAllText($p,$s,(New-Object Text.UTF8Encoding $false));Write-Host '   版本号已更新'"

echo.
echo [2/3] 提交改动...
git add -A
git commit -m "网站更新 %date% %time%"

echo.
echo [3/3] 推送到 GitHub...
git push

echo.
echo ============ 完成！============
echo 网站 1-3 分钟后自动更新：
echo https://huanglihui123456789-web.github.io/prompt-hub-site/
echo.
pause
