#!/bin/bash
# Instalación automática de FastSD CPU para Linux/Mac
# Este script descarga e instala FastSD CPU en el directorio del usuario

set -e  # Salir si hay error

echo "========================================"
echo "   INSTALACION DE FASTSD CPU"
echo "========================================"
echo ""
echo "Este asistente instalara FastSD CPU en tu sistema."
echo "Requisitos:"
echo "- Python 3.10 o superior"
echo "- Git"
echo "- Espacio en disco: ~5GB"
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python no encontrado. Por favor instala Python 3.10 o superior."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Instala con: brew install python@3.10"
    else
        echo "Instala con: sudo apt install python3 python3-pip"
    fi
    exit 1
fi

# Verificar Git
if ! command -v git &> /dev/null; then
    echo "[ERROR] Git no encontrado. Por favor instala Git."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Instala con: brew install git"
    else
        echo "Instala con: sudo apt install git"
    fi
    exit 1
fi

# Verificar uv
if ! command -v uv &> /dev/null; then
    echo "[INFO] Instalando uv (gestor de paquetes rapido)..."
    pip3 install uv
fi

# Determinar directorio de instalación
INSTALL_DIR="$HOME/fastsdcpu"

echo ""
echo "[1/5] Creando directorio de instalacion..."
mkdir -p "$INSTALL_DIR"
echo "Directorio: $INSTALL_DIR"

echo ""
echo "[2/5] Clonando repositorio FastSD CPU..."
git clone https://github.com/rupeshs/fastsdcpu.git "$INSTALL_DIR"

echo ""
echo "[3/5] Instalando dependencias..."
cd "$INSTALL_DIR"

# Detectar sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detectado: macOS"
    chmod +x install-mac.sh
    ./install-mac.sh
else
    echo "Detectado: Linux"
    chmod +x install.sh
    ./install.sh
fi

echo ""
echo "[4/5] Descargando modelos base (opcional)..."
echo "Por defecto FastSD descargara los modelos al primer uso."
echo "Si quieres usar modelos NSFW de Civitai, puedes descargarlos manualmente."

echo ""
echo "[5/5] Configuracion completada!"
echo ""
echo "========================================"
echo "  INSTALACION COMPLETADA"
echo "========================================"
echo ""
echo "FastSD CPU esta instalado en:"
echo "$INSTALL_DIR"
echo ""
echo "Para iniciar el servidor ejecuta:"
echo "cd $INSTALL_DIR"
echo "./start-webserver.sh"
echo ""
echo "El servidor estara disponible en:"
echo "http://localhost:8000"
echo ""
