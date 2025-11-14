# Configuración de Google Maps API

Esta guía detalla cómo configurar Google Maps para la aplicación GPS Community en Android e iOS.

## 📋 Prerequisitos

- Cuenta de Google Cloud Platform (GCP)
- Proyecto de Firebase creado
- Flutter instalado y configurado

## 🔑 Paso 1: Crear y Configurar Proyecto en Google Cloud

### 1.1 Crear Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en "Select a project" → "New Project"
3. Nombre del proyecto: `GPS Community` (o el que prefieras)
4. Clic en "Create"

### 1.2 Vincular con Firebase (Opcional pero Recomendado)

Si ya tienes un proyecto de Firebase:
1. En Firebase Console, ve a Project Settings
2. Sección "General" → "Your apps"
3. El proyecto de GCP ya debe estar vinculado automáticamente

## 🗺️ Paso 2: Habilitar APIs Necesarias

En Google Cloud Console, ve a "APIs & Services" → "Library" y habilita:

### APIs Requeridas:
- ✅ **Maps SDK for Android**
- ✅ **Maps SDK for iOS**
- ✅ **Geocoding API** (para convertir direcciones a coordenadas)
- ✅ **Places API** (para búsqueda de lugares)
- ✅ **Directions API** (para rutas, opcional)
- ✅ **Geolocation API** (para ubicación por IP, opcional)

### Cómo habilitar cada API:
1. Busca el nombre de la API en la biblioteca
2. Haz clic en la API
3. Clic en "Enable"
4. Espera a que se active (puede tomar unos segundos)

## 🔐 Paso 3: Crear API Keys

Necesitarás diferentes API Keys para Android, iOS y desarrollo.

### 3.1 API Key para Android

1. Ve a "APIs & Services" → "Credentials"
2. Clic en "Create Credentials" → "API Key"
3. Se generará una clave, cópiala temporalmente
4. Clic en "Restrict Key" para configurarla:
   - **Name:** `Android Key - GPS Community`
   - **Application restrictions:**
     - Selecciona "Android apps"
     - Clic en "Add an item"
     - **Package name:** `com.example.gps_community` (cambia según tu package)
     - **SHA-1 certificate fingerprint:** (obtén del paso siguiente)
   - **API restrictions:**
     - Selecciona "Restrict key"
     - Marca: Maps SDK for Android, Geocoding API, Places API
5. Clic en "Save"

#### Obtener SHA-1 Fingerprint:

**Para Debug (desarrollo):**
```bash
# En macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# En Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Para Release (producción):**
```bash
keytool -list -v -keystore /ruta/a/tu/release.keystore -alias tu_alias
```

Copia el valor SHA-1 que aparece en el output.

### 3.2 API Key para iOS

1. En "Credentials", clic en "Create Credentials" → "API Key"
2. Se generará una clave, cópiala
3. Clic en "Restrict Key":
   - **Name:** `iOS Key - GPS Community`
   - **Application restrictions:**
     - Selecciona "iOS apps"
     - Clic en "Add an item"
     - **Bundle ID:** `com.example.gpsCommunity` (debe coincidir con tu iOS bundle ID)
   - **API restrictions:**
     - Selecciona "Restrict key"
     - Marca: Maps SDK for iOS, Geocoding API, Places API
4. Clic en "Save"

### 3.3 API Key para Desarrollo (sin restricciones temporalmente)

1. Crea otra API Key
2. Nombre: `Development Key - GPS Community`
3. **No restringir** (solo para desarrollo local)
4. **IMPORTANTE:** Nunca uses esta key en producción

## 📱 Paso 4: Configurar Android

### 4.1 Actualizar AndroidManifest.xml

Edita `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.gps_community">

    <!-- Permisos de ubicación -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET"/>

    <application
        android:label="GPS Community"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <!-- Google Maps API Key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="TU_ANDROID_API_KEY_AQUI"/>

        <!-- Resto de la configuración... -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <!-- ... -->
        </activity>
    </application>
</manifest>
```

### 4.2 Actualizar build.gradle

Verifica que `android/app/build.gradle` tenga:

```gradle
android {
    defaultConfig {
        minSdkVersion 21  // Mínimo para Google Maps
        targetSdkVersion 34
        // ...
    }
}
```

## 🍎 Paso 5: Configurar iOS

### 5.1 Actualizar AppDelegate.swift

Edita `ios/Runner/AppDelegate.swift`:

```swift
import UIKit
import Flutter
import GoogleMaps  // Importar GoogleMaps

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Configurar Google Maps con tu API Key
    GMSServices.provideAPIKey("TU_IOS_API_KEY_AQUI")

    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

### 5.2 Actualizar Info.plist

Edita `ios/Runner/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Configuración existente... -->

    <!-- Descripciones de permisos de ubicación -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>GPS Community necesita acceso a tu ubicación para rastrear tu posición en tiempo real y compartirla con tu organización.</string>

    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>GPS Community necesita acceso continuo a tu ubicación para mantener el rastreo activo incluso cuando la app está en segundo plano.</string>

    <key>NSLocationAlwaysUsageDescription</key>
    <string>GPS Community necesita acceso continuo a tu ubicación para el rastreo en segundo plano.</string>

    <!-- Background modes para ubicación -->
    <key>UIBackgroundModes</key>
    <array>
        <string>location</string>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>

    <!-- Permitir HTTP en desarrollo (remover en producción) -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>
```

### 5.3 Actualizar Podfile

Verifica que `ios/Podfile` tenga:

```ruby
# Versión mínima de iOS
platform :ios, '12.0'

# ...

target 'Runner' do
  use_frameworks!
  use_modular_headers!

  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))

  # Agregar si no existe
  pod 'GoogleMaps'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)

    # Configuración para Google Maps
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
    end
  end
end
```

Luego ejecuta:
```bash
cd ios
pod install
cd ..
```

## 🔧 Paso 6: Configurar en la App

### 6.1 Actualizar env_config.dart

Edita `lib/core/config/env_config.dart`:

```dart
static String get googleMapsApiKey {
  switch (_currentEnv) {
    case Environment.development:
      return 'TU_DEVELOPMENT_KEY';  // Key sin restricciones para desarrollo
    case Environment.staging:
      return 'TU_STAGING_KEY';      // Key con restricciones para staging
    case Environment.production:
      return 'TU_PRODUCTION_KEY';   // Key con restricciones para producción
  }
}
```

## ✅ Paso 7: Verificar la Configuración

### 7.1 Test Rápido en Flutter

Crea un archivo de test `lib/test_map.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class TestMapPage extends StatelessWidget {
  const TestMapPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Test Google Maps')),
      body: GoogleMap(
        initialCameraPosition: const CameraPosition(
          target: LatLng(-12.0464, -77.0428), // Lima, Perú
          zoom: 14,
        ),
        markers: {
          const Marker(
            markerId: MarkerId('test'),
            position: LatLng(-12.0464, -77.0428),
          ),
        },
      ),
    );
  }
}
```

Ejecuta:
```bash
flutter run
```

### 7.2 Checklist de Verificación

- [ ] APIs habilitadas en Google Cloud Console
- [ ] API Keys creadas con restricciones apropiadas
- [ ] SHA-1 fingerprint agregado a Android key
- [ ] Bundle ID agregado a iOS key
- [ ] API Key en AndroidManifest.xml
- [ ] API Key en AppDelegate.swift
- [ ] API Keys en env_config.dart
- [ ] Permisos de ubicación en AndroidManifest.xml
- [ ] Permisos de ubicación en Info.plist
- [ ] pod install ejecutado en iOS
- [ ] La app compila sin errores
- [ ] El mapa se muestra correctamente

## 🐛 Solución de Problemas Comunes

### Error: "API key not found"
- Verifica que el API key esté correctamente configurado en AndroidManifest.xml o AppDelegate.swift
- Asegúrate de que no haya espacios extra en el key

### Error: "This API project is not authorized to use this API"
- Verifica que las APIs estén habilitadas en Google Cloud Console
- Espera 5-10 minutos después de habilitar las APIs

### Error: "The provided API key is invalid"
- Verifica las restricciones del API key
- Asegúrate de que el SHA-1 (Android) o Bundle ID (iOS) sean correctos
- Verifica que el package name coincida

### El mapa se muestra gris
- Problema común: API key no configurada o inválida
- Revisa los logs de la consola para ver el error específico

### iOS: "Signing for Runner requires a development team"
- Abre el proyecto en Xcode: `open ios/Runner.xcworkspace`
- Selecciona tu equipo de desarrollo en Signing & Capabilities

### Android: Error de certificado
- Regenera el debug keystore si es necesario
- Verifica que el SHA-1 fingerprint sea correcto

## 💡 Mejores Prácticas

1. **Seguridad de API Keys:**
   - Nunca commits API keys al repositorio
   - Usa variables de entorno para producción
   - Configura restricciones en todas las keys de producción

2. **Cuotas y Facturación:**
   - Configura alertas de facturación en Google Cloud
   - Monitorea el uso de la API regularmente
   - La mayoría de apps tienen uso dentro del tier gratuito

3. **Testing:**
   - Usa keys separadas para dev/staging/production
   - Las keys de desarrollo pueden no tener restricciones
   - Las keys de producción DEBEN tener restricciones

4. **Permisos:**
   - Solicita permisos de ubicación en runtime
   - Explica claramente por qué necesitas cada permiso
   - Implementa degradación graceful si el usuario niega permisos

## 📊 Límites del Tier Gratuito

Google Maps Platform ofrece $200 de crédito mensual gratis:
- **Maps SDK:** ~28,000 cargas de mapa/mes
- **Geocoding API:** ~40,000 requests/mes
- **Places API:** varía según el tipo de request

Para más información: https://mapsplatform.google.com/pricing/

## 🔗 Recursos Útiles

- [Google Maps Platform Documentation](https://developers.google.com/maps)
- [Flutter Google Maps Plugin](https://pub.dev/packages/google_maps_flutter)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Places API](https://developers.google.com/maps/documentation/places)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**¿Necesitas ayuda?** Revisa SETUP_GUIDE.md para configuración general del proyecto.
