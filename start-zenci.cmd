@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Pasta: %CD%
echo  Se der "porta ocupada", o Node sobe sozinho na proxima porta (3848, 3849...).
echo  Olhe o numero que aparecer no banner e abra o checkout NESSE link.
echo.
node server.mjs
echo.
pause
