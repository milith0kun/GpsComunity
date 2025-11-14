# Guía de Configuración - GPS Community

## 📋 Prerequisitos

- Flutter SDK 3.9.2 o superior
- Dart SDK
- Android Studio / Xcode
- Cuenta de Firebase
- Cuenta de Google Cloud Platform (para Google Maps)

## 🚀 Pasos de Configuración

### 1. Instalación de Dependencias

```bash
# Obtener todas las dependencias del proyecto
flutter pub get
```

### 2. Generación de Código (CRÍTICO)

El proyecto usa generación de código para:
- Serialización JSON (`json_serializable`)
- Dependency Injection (`injectable`)
- Almacenamiento local (`hive`)
- API Clients (`retrofit`)

```bash
# Generar todos los archivos .g.dart necesarios
flutter pub run build_runner build --delete-conflicting-outputs

# Para desarrollo continuo (observa cambios automáticamente)
flutter pub run build_runner watch --delete-conflicting-outputs
```

**Archivos que se generarán:**
- `lib/features/auth/data/models/*.g.dart` (2 archivos)
- `lib/features/tracking/data/models/*.g.dart` (2 archivos)
- `lib/features/organization/data/models/*.g.dart` (2 archivos)
- `lib/features/map/data/models/*.g.dart` (1 archivo)
- `lib/core/di/injection.config.dart` (dependency injection)

### 3. Configuración de Firebase

#### 3.1 Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "GPS Community"
3. Habilita los siguientes servicios:
   - Authentication (Google Sign-In)
   - Cloud Firestore
   - Cloud Messaging

#### 3.2 Instalar FlutterFire CLI

```bash
# Instalar FlutterFire CLI globalmente
dart pub global activate flutterfire_cli
```

#### 3.3 Configurar Firebase en el proyecto

```bash
# Ejecutar configuración automática
flutterfire configure

# Selecciona el proyecto que creaste
# Selecciona las plataformas: Android, iOS
```

Esto generará automáticamente:
- `lib/firebase_options.dart`
- Actualizará `android/app/google-services.json`
- Actualizará `ios/Runner/GoogleService-Info.plist`

#### 3.4 Configurar Authentication

En Firebase Console:
1. Ve a Authentication > Sign-in method
2. Habilita "Google"
3. Configura el email de soporte

### 4. Configuración de Google Maps

#### 4.1 Obtener API Keys

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona el existente
3. Habilita las siguientes APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API

4. Crea credenciales (API Keys):
   - Una para Android
   - Una para iOS
   - Una para desarrollo

#### 4.2 Configurar API Keys en el proyecto

Actualiza `lib/core/config/env_config.dart`:

```dart
static String get googleMapsApiKey {
  switch (_currentEnv) {
    case Environment.development:
      return 'TU_API_KEY_DE_DESARROLLO';
    case Environment.staging:
      return 'TU_API_KEY_DE_STAGING';
    case Environment.production:
      return 'TU_API_KEY_DE_PRODUCCION';
  }
}
```

#### 4.3 Configurar Android

Edita `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <!-- Agrega dentro de <application> -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="TU_API_KEY_DE_ANDROID"/>
    </application>
</manifest>
```

#### 4.4 Configurar iOS

Edita `ios/Runner/AppDelegate.swift`:

```swift
import GoogleMaps

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("TU_API_KEY_DE_IOS")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

### 5. Configuración de Permisos

#### 5.1 Android - `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Permisos de ubicación -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- Permisos de internet -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <!-- Permisos de notificaciones -->
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
</manifest>
```

#### 5.2 iOS - `ios/Runner/Info.plist`

```xml
<dict>
    <!-- Descripción para ubicación -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Esta app necesita acceso a tu ubicación para rastrear tu posición en tiempo real.</string>

    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>Esta app necesita acceso continuo a tu ubicación para rastreo en segundo plano.</string>

    <key>NSLocationAlwaysUsageDescription</key>
    <string>Esta app necesita acceso continuo a tu ubicación para rastreo en segundo plano.</string>

    <!-- Permitir ubicación en background -->
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
        <string>fetch</string>
    </array>
</dict>
```

### 6. Verificación de la Compilación

```bash
# Verificar que no hay errores de análisis
flutter analyze

# Compilar para Android
flutter build apk --debug

# Compilar para iOS (solo en macOS)
flutter build ios --debug

# Ejecutar en emulador/dispositivo
flutter run
```

## 🔧 Scripts de Ayuda

He creado scripts en la carpeta `scripts/` para facilitar el setup:

```bash
# Ejecutar setup completo
./scripts/setup.sh

# Solo generar código
./scripts/generate_code.sh

# Limpiar y regenerar
./scripts/clean_build.sh
```

## ✅ Checklist de Verificación

- [ ] `flutter pub get` ejecutado sin errores
- [ ] `build_runner` generó todos los archivos `.g.dart`
- [ ] `firebase_options.dart` existe
- [ ] Google Maps API Keys configuradas en `env_config.dart`
- [ ] Google Maps API Key en `AndroidManifest.xml`
- [ ] Google Maps API Key en `AppDelegate.swift` (iOS)
- [ ] Permisos configurados en `AndroidManifest.xml`
- [ ] Permisos configurados en `Info.plist` (iOS)
- [ ] `flutter analyze` sin errores críticos
- [ ] La app compila y ejecuta

## 🐛 Solución de Problemas

### Error: "Missing generated files"

```bash
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

### Error: "MissingPluginException"

```bash
flutter clean
flutter pub get
# Reiniciar el IDE
# Ejecutar: flutter run
```

### Error de permisos en Android

Verifica que los permisos estén dentro de `<manifest>` y antes de `<application>`

### Error de Firebase

```bash
# Volver a configurar Firebase
flutterfire configure
```

## 📚 Recursos Adicionales

- [Documentación de Flutter](https://flutter.dev/docs)
- [Firebase para Flutter](https://firebase.flutter.dev/)
- [Google Maps Flutter Plugin](https://pub.dev/packages/google_maps_flutter)
- [Build Runner](https://pub.dev/packages/build_runner)

## 🎯 Próximos Pasos Después del Setup

1. Implementar UI real de las páginas (actualmente son placeholders)
2. Integrar Google Maps en `MapPage`
3. Implementar lógica de tracking en tiempo real
4. Configurar notificaciones push
5. Implementar tests unitarios y de integración
6. Configurar CI/CD

---

**Nota:** Guarda las API Keys de forma segura y nunca las commits al repositorio. Considera usar variables de entorno o archivos de configuración git-ignored para producción.
