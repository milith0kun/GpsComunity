# 🚀 Quick Start Guide - GPS Community

Guía rápida para poner en marcha el proyecto en **5 minutos**.

## ⚡ Setup Rápido (Comandos Esenciales)

```bash
# 1. Instalar dependencias
flutter pub get

# 2. Generar código (CRÍTICO - el proyecto NO compilará sin esto)
flutter pub run build_runner build --delete-conflicting-outputs

# 3. Configurar Firebase
dart pub global activate flutterfire_cli
flutterfire configure

# 4. Ejecutar la app
flutter run
```

## 📋 Prerequisitos

- ✅ Flutter SDK 3.9.2 o superior
- ✅ Cuenta de Firebase (gratuita)
- ✅ Cuenta de Google Cloud Platform (para Maps)

## 🔧 Pasos Detallados

### 1️⃣ Generar Archivos .g.dart (OBLIGATORIO)

El proyecto usa generación de código para:
- Serialización JSON
- Dependency Injection
- Modelos de datos

**Ejecuta:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**Archivos que se generarán:**
- `lib/features/*/data/models/*.g.dart` (7 archivos)
- Código de serialización JSON
- Conversores de tipos

**Modo watch (desarrollo continuo):**
```bash
# Auto-regenera cuando cambias archivos
flutter pub run build_runner watch --delete-conflicting-outputs
```

### 2️⃣ Configurar Firebase

**Instalar FlutterFire CLI:**
```bash
dart pub global activate flutterfire_cli
```

**Configurar proyecto:**
```bash
flutterfire configure
```

Esto:
1. Te pedirá seleccionar/crear un proyecto de Firebase
2. Generará `lib/firebase_options.dart`
3. Configurará Android e iOS automáticamente

**Habilitar servicios en Firebase Console:**
- Authentication → Google Sign-In
- Cloud Firestore
- Cloud Messaging

### 3️⃣ Configurar Google Maps

**Obtener API Keys:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita: Maps SDK for Android/iOS, Geocoding API, Places API
3. Crea API Keys con restricciones

**Configurar Android:**

Edita `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="TU_ANDROID_API_KEY"/>
</application>
```

**Configurar iOS:**

Edita `ios/Runner/AppDelegate.swift`:
```swift
import GoogleMaps

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(...) -> Bool {
    GMSServices.provideAPIKey("TU_IOS_API_KEY")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(...)
  }
}
```

**Actualizar código:**

Edita `lib/core/config/env_config.dart`:
```dart
static String get googleMapsApiKey {
  switch (_currentEnv) {
    case Environment.development:
      return 'TU_DEV_API_KEY';  // ← Cambiar aquí
    // ...
  }
}
```

### 4️⃣ Verificar y Ejecutar

**Verificar que todo esté bien:**
```bash
./scripts/check_setup.sh
```

**Ejecutar análisis:**
```bash
flutter analyze
```

**Ejecutar app:**
```bash
flutter run
```

## 🐛 Problemas Comunes

### ❌ Error: "Missing .g.dart files"

**Solución:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### ❌ Error: "MissingPluginException"

**Solución:**
```bash
flutter clean
flutter pub get
# Reiniciar IDE
flutter run
```

### ❌ Error: "Firebase not configured"

**Solución:**
```bash
flutterfire configure
```

### ❌ Mapa se muestra gris/vacío

**Causas:**
- API Key no configurada
- API Key inválida
- APIs no habilitadas en Google Cloud

**Solución:**
- Revisa logs de la consola
- Verifica que las APIs estén habilitadas
- Asegúrate de que las restricciones del API key sean correctas

## 📚 Documentación Completa

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Guía completa de configuración
- **[docs/GOOGLE_MAPS_SETUP.md](docs/GOOGLE_MAPS_SETUP.md)** - Configuración detallada de Google Maps
- **[docs/DEPENDENCY_INJECTION.md](docs/DEPENDENCY_INJECTION.md)** - Cómo funciona la DI

## 🛠️ Scripts Útiles

```bash
# Setup completo (limpia, instala, genera)
./scripts/setup.sh

# Solo generar código
./scripts/generate_code.sh

# Limpiar y regenerar todo
./scripts/clean_build.sh

# Verificar configuración
./scripts/check_setup.sh
```

## ✅ Checklist

- [ ] `flutter pub get` ejecutado
- [ ] `build_runner build` ejecutado (archivos .g.dart generados)
- [ ] Firebase configurado (`firebase_options.dart` existe)
- [ ] Google Maps API Keys configuradas
- [ ] `flutter analyze` sin errores críticos
- [ ] App compila y ejecuta

## 🎯 Próximos Pasos

Una vez que el proyecto compile:

1. **Implementar UI real** - Las páginas actuales son placeholders
2. **Integrar Google Maps** en `MapPage`
3. **Configurar permisos** de ubicación en runtime
4. **Implementar tracking** en tiempo real
5. **Agregar tests** unitarios e integración

## 📞 Ayuda

¿Problemas? Revisa:
1. Los logs de error completos
2. Que Flutter esté actualizado: `flutter doctor`
3. SETUP_GUIDE.md para configuración detallada
4. Documentación específica en `docs/`

---

**Tiempo estimado de setup inicial:** 10-15 minutos
**Tiempo con configuración completa de Firebase y Maps:** 30-45 minutos
