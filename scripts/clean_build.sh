#!/bin/bash

# Script para limpiar completamente el proyecto y regenerar todo
# Útil cuando hay problemas con dependencias o código generado

set -e

echo "🧹 Limpiando proyecto GPS Community..."
echo ""

# Verificar que Flutter está instalado
if ! command -v flutter &> /dev/null; then
    echo "❌ Error: Flutter no está instalado"
    exit 1
fi

# Paso 1: Flutter clean
echo "1️⃣ Ejecutando flutter clean..."
flutter clean
echo "✅ Flutter clean completado"
echo ""

# Paso 2: Eliminar archivos generados
echo "2️⃣ Eliminando archivos generados antiguos..."
find . -name "*.g.dart" -type f -delete
find . -name "*.freezed.dart" -type f -delete
find . -name "*.config.dart" -type f -delete
echo "✅ Archivos generados eliminados"
echo ""

# Paso 3: Eliminar carpetas de build
echo "3️⃣ Eliminando carpetas de build..."
rm -rf build/
rm -rf .dart_tool/
echo "✅ Carpetas de build eliminadas"
echo ""

# Paso 4: Obtener dependencias
echo "4️⃣ Obteniendo dependencias frescas..."
flutter pub get
echo "✅ Dependencias obtenidas"
echo ""

# Paso 5: Regenerar código
echo "5️⃣ Regenerando código con build_runner..."
flutter pub run build_runner build --delete-conflicting-outputs
echo "✅ Código regenerado"
echo ""

# Paso 6: Verificar
echo "6️⃣ Ejecutando análisis..."
flutter analyze
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Limpieza y regeneración completada"
echo ""
echo "El proyecto está listo para ejecutarse:"
echo "  flutter run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
