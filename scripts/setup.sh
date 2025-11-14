#!/bin/bash

# Script de configuración completa para GPS Community
# Ejecuta todos los pasos necesarios para preparar el proyecto

set -e  # Detener en caso de error

echo "🚀 Iniciando configuración de GPS Community..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que Flutter está instalado
print_step "Verificando instalación de Flutter..."
if ! command -v flutter &> /dev/null; then
    print_error "Flutter no está instalado. Por favor instala Flutter primero:"
    echo "  https://flutter.dev/docs/get-started/install"
    exit 1
fi
print_success "Flutter está instalado"

# Verificar versión de Flutter
FLUTTER_VERSION=$(flutter --version | head -n 1)
print_success "Versión: $FLUTTER_VERSION"
echo ""

# Paso 1: Limpiar proyecto
print_step "Limpiando proyecto anterior..."
flutter clean
print_success "Proyecto limpio"
echo ""

# Paso 2: Obtener dependencias
print_step "Obteniendo dependencias..."
flutter pub get
print_success "Dependencias obtenidas"
echo ""

# Paso 3: Generar código
print_step "Generando código con build_runner..."
print_warning "Esto puede tomar varios minutos..."
flutter pub run build_runner build --delete-conflicting-outputs
print_success "Código generado exitosamente"
echo ""

# Paso 4: Verificar Firebase
print_step "Verificando configuración de Firebase..."
if [ ! -f "lib/firebase_options.dart" ]; then
    print_warning "firebase_options.dart no encontrado"
    echo ""
    echo "Para configurar Firebase, ejecuta:"
    echo "  dart pub global activate flutterfire_cli"
    echo "  flutterfire configure"
    echo ""
else
    print_success "Firebase configurado"
fi
echo ""

# Paso 5: Verificar Google Maps
print_step "Verificando configuración de Google Maps..."
if grep -q "YOUR_.*_GOOGLE_MAPS_API_KEY" lib/core/config/env_config.dart; then
    print_warning "Google Maps API Keys no configuradas"
    echo ""
    echo "Por favor actualiza lib/core/config/env_config.dart con tus API Keys"
    echo ""
else
    print_success "Google Maps API Keys configuradas"
fi
echo ""

# Paso 6: Análisis estático
print_step "Ejecutando análisis estático..."
flutter analyze
echo ""

# Paso 7: Verificar archivos generados
print_step "Verificando archivos generados..."
GENERATED_FILES=(
    "lib/features/auth/data/models/user_model.g.dart"
    "lib/features/auth/data/models/auth_credentials_model.g.dart"
    "lib/features/tracking/data/models/location_model.g.dart"
    "lib/features/tracking/data/models/location_settings_model.g.dart"
    "lib/features/organization/data/models/organization_model.g.dart"
    "lib/features/organization/data/models/member_model.g.dart"
    "lib/features/map/data/models/map_marker_model.g.dart"
    "lib/core/di/injection.config.dart"
)

ALL_GENERATED=true
for file in "${GENERATED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file"
    else
        print_error "$file - NO ENCONTRADO"
        ALL_GENERATED=false
    fi
done
echo ""

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_GENERATED" = true ]; then
    print_success "Setup completado exitosamente!"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Configurar Firebase (si no está configurado)"
    echo "  2. Configurar Google Maps API Keys"
    echo "  3. Ejecutar: flutter run"
else
    print_warning "Setup completado con advertencias"
    echo ""
    echo "Algunos archivos no fueron generados correctamente."
    echo "Revisa los errores arriba y ejecuta nuevamente."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
