#!/bin/bash

# Script para generar código con build_runner
# Útil cuando se agregan nuevos modelos o se modifican anotaciones

set -e

echo "🔧 Generando código con build_runner..."
echo ""

# Verificar que Flutter está instalado
if ! command -v flutter &> /dev/null; then
    echo "❌ Error: Flutter no está instalado"
    exit 1
fi

# Opción de watch o build
MODE="${1:-build}"

if [ "$MODE" = "watch" ]; then
    echo "👀 Modo watch activado (observará cambios automáticamente)"
    echo "   Presiona Ctrl+C para detener"
    echo ""
    flutter pub run build_runner watch --delete-conflicting-outputs
elif [ "$MODE" = "build" ]; then
    echo "🔨 Generando archivos..."
    echo ""
    flutter pub run build_runner build --delete-conflicting-outputs
    echo ""
    echo "✅ Código generado exitosamente"
else
    echo "❌ Modo desconocido: $MODE"
    echo ""
    echo "Uso:"
    echo "  ./generate_code.sh         # Generar una vez"
    echo "  ./generate_code.sh watch   # Observar cambios"
    exit 1
fi
