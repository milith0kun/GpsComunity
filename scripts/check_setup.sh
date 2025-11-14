#!/bin/bash

# Script para verificar que el setup está completo
# Revisa todos los archivos y configuraciones necesarias

echo "🔍 Verificando configuración de GPS Community..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - NO ENCONTRADO"
        ISSUES=$((ISSUES + 1))
        return 1
    fi
}

# Función para verificar contenido
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${RED}✗${NC} $1 - Contiene: $2"
        echo -e "    ${YELLOW}⚠${NC} Necesita configuración"
        ISSUES=$((ISSUES + 1))
        return 1
    else
        echo -e "${GREEN}✓${NC} $1 - Configurado"
        return 0
    fi
}

# Verificar Flutter
echo "📱 Flutter:"
if command -v flutter &> /dev/null; then
    FLUTTER_VERSION=$(flutter --version | head -n 1)
    echo -e "${GREEN}✓${NC} Flutter instalado: $FLUTTER_VERSION"
else
    echo -e "${RED}✗${NC} Flutter no instalado"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Verificar archivos generados
echo "🔧 Archivos generados (.g.dart):"
check_file "lib/features/auth/data/models/user_model.g.dart"
check_file "lib/features/auth/data/models/auth_credentials_model.g.dart"
check_file "lib/features/tracking/data/models/location_model.g.dart"
check_file "lib/features/tracking/data/models/location_settings_model.g.dart"
check_file "lib/features/organization/data/models/organization_model.g.dart"
check_file "lib/features/organization/data/models/member_model.g.dart"
check_file "lib/features/map/data/models/map_marker_model.g.dart"
check_file "lib/core/di/injection.config.dart"
echo ""

# Verificar Firebase
echo "🔥 Firebase:"
check_file "lib/firebase_options.dart"
echo ""

# Verificar Google Maps
echo "🗺️  Google Maps:"
check_content "lib/core/config/env_config.dart" "YOUR_.*_GOOGLE_MAPS_API_KEY"
echo ""

# Verificar configuraciones de plataforma
echo "📱 Configuraciones de plataforma:"
check_file "android/app/src/main/AndroidManifest.xml"
check_file "ios/Runner/Info.plist"
echo ""

# Verificar permisos Android
echo "🔐 Permisos Android:"
if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    if grep -q "ACCESS_FINE_LOCATION" "android/app/src/main/AndroidManifest.xml"; then
        echo -e "${GREEN}✓${NC} Permisos de ubicación configurados"
    else
        echo -e "${YELLOW}⚠${NC} Permisos de ubicación no encontrados"
        echo "    Agrega los permisos en AndroidManifest.xml"
        ISSUES=$((ISSUES + 1))
    fi
fi
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Todo está configurado correctamente${NC}"
    echo ""
    echo "El proyecto está listo para ejecutarse:"
    echo "  flutter run"
else
    echo -e "${YELLOW}⚠ Encontrados $ISSUES problema(s)${NC}"
    echo ""
    echo "Acciones recomendadas:"
    echo "  1. Ejecuta: ./scripts/setup.sh"
    echo "  2. Configura Firebase: flutterfire configure"
    echo "  3. Actualiza Google Maps API Keys en env_config.dart"
    echo "  4. Revisa SETUP_GUIDE.md para más detalles"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ISSUES
