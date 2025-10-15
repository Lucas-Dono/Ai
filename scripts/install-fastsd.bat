@echo off
REM Instalación automática de FastSD CPU para Windows
REM Este script descarga e instala FastSD CPU en el directorio del usuario

echo ========================================
echo    INSTALACION DE FASTSD CPU
echo ========================================
echo.
echo Este asistente instalara FastSD CPU en tu sistema.
echo Requisitos:
echo - Python 3.10 o superior
echo - Git
echo - Espacio en disco: ~5GB
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no encontrado. Por favor instala Python 3.10 o superior.
    echo Descarga desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Verificar Git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git no encontrado. Por favor instala Git.
    echo Descarga desde: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Verificar uv
uv --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando uv (gestor de paquetes rapido)...
    pip install uv
)

echo.
echo [1/5] Creando directorio de instalacion...
set INSTALL_DIR=%USERPROFILE%\fastsdcpu
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
echo Directorio: %INSTALL_DIR%

echo.
echo [2/5] Clonando repositorio FastSD CPU...
git clone https://github.com/rupeshs/fastsdcpu.git "%INSTALL_DIR%"
if errorlevel 1 (
    echo [ERROR] Fallo la clonacion del repositorio
    pause
    exit /b 1
)

echo.
echo [3/5] Instalando dependencias...
cd /d "%INSTALL_DIR%"
call install.bat
if errorlevel 1 (
    echo [ADVERTENCIA] La instalacion tuvo algunos errores, pero puede funcionar
)

echo.
echo [4/5] Descargando modelos base (opcional)...
echo Por defecto FastSD descargara los modelos al primer uso.
echo Si quieres usar modelos NSFW de Civitai, puedes descargarlos manualmente.

echo.
echo [5/5] Configuracion completada!
echo.
echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo FastSD CPU esta instalado en:
echo %INSTALL_DIR%
echo.
echo Para iniciar el servidor ejecuta:
echo cd %INSTALL_DIR%
echo start-webserver.bat
echo.
echo El servidor estara disponible en:
echo http://localhost:8000
echo.

pause
