# Guía de Desarrollo - GPS Community

## Estado Actual del Proyecto

El proyecto ha sido estructurado siguiendo **Clean Architecture** con la siguiente organización:

### Estructura Implementada

```
lib/
├── core/
│   ├── config/          # Configuración de ambientes
│   ├── constants/       # Constantes de la app y API
│   ├── errors/          # Manejo de errores y excepciones
│   ├── network/         # Utilidades de red
│   ├── theme/           # Tema y colores de la app
│   └── utils/           # Utilidades (validadores, formateo de fechas)
├── features/
│   └── auth/            # Feature de autenticación (implementado)
│       ├── data/
│       │   ├── datasources/   # Fuentes de datos (remote y local)
│       │   ├── models/        # Modelos con serialización JSON
│       │   └── repositories/  # Implementación de repositorios
│       ├── domain/
│       │   ├── entities/      # Entidades del dominio
│       │   ├── repositories/  # Contratos de repositorios
│       │   └── usecases/      # Casos de uso
│       └── presentation/
│           ├── bloc/          # BLoC para gestión de estado
│           ├── pages/         # Páginas de UI (LoginPage)
│           └── widgets/       # Widgets reutilizables
├── injection_container.dart   # Inyección de dependencias
├── app.dart                   # App principal
└── main.dart                  # Punto de entrada

```

## Próximos Pasos

### 1. Generar Código con build_runner

Los modelos de datos requieren código generado para serialización JSON:

```bash
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

Esto generará los archivos `.g.dart` necesarios para los modelos.

### 2. Descomentar Inyección de Dependencias

Después de generar el código, descomentar la inicialización en `injection_container.dart`:

```dart
Future<void> _initAuth() async {
  // Descomentar todas las líneas en este método
}
```

También descomentar los imports necesarios en el archivo.

### 3. Configurar Firebase

1. Crear proyecto en Firebase Console
2. Agregar apps Android e iOS
3. Descargar archivos de configuración:
   - `google-services.json` para Android
   - `GoogleService-Info.plist` para iOS
4. Ejecutar FlutterFire CLI:

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

5. Descomentar inicialización de Firebase en `main.dart`

### 4. Configurar Google Maps

1. Obtener API Keys de Google Cloud Console
2. Actualizar las claves en `core/config/env_config.dart`
3. Configurar en archivos nativos:

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY"/>
```

**iOS** (`ios/Runner/AppDelegate.swift`):
```swift
GMSServices.provideAPIKey("YOUR_API_KEY")
```

### 5. Implementar Features Pendientes

#### a. Feature de Tracking (Ubicación)
- Entities: Location, LocationSettings
- UseCases: SendLocation, GetLocationHistory
- DataSources: LocationService (Geolocator)
- BLoC: TrackingBloc

#### b. Feature de Mapa
- Entities: MapMarker, Route
- UseCases: GetRealTimeLocations
- UI: MapPage con Google Maps

#### c. Feature de Organization
- Entities: Organization, Group, Member
- UseCases: CreateOrganization, InviteMember, etc.
- BLoC: OrganizationBloc

### 6. Configurar Routing

Implementar navegación con go_router:

```dart
final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => SplashPage()),
    GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    GoRoute(path: '/home', builder: (context, state) => HomePage()),
    // ... más rutas
  ],
);
```

### 7. Configurar Permisos

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos acceso a tu ubicación para el rastreo</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Necesitamos acceso a tu ubicación en segundo plano</string>
```

## Comandos Útiles

### Desarrollo
```bash
# Obtener dependencias
flutter pub get

# Generar código
flutter pub run build_runner build --delete-conflicting-outputs

# Watch mode (regenera automáticamente)
flutter pub run build_runner watch --delete-conflicting-outputs

# Ejecutar app
flutter run

# Ejecutar en dispositivo específico
flutter run -d <device_id>

# Hot reload
r

# Hot restart
R
```

### Testing
```bash
# Ejecutar todos los tests
flutter test

# Ejecutar tests con coverage
flutter test --coverage

# Ver coverage
genhtml coverage/lcov.info -o coverage/html
```

### Build
```bash
# Android
flutter build apk
flutter build appbundle

# iOS
flutter build ios
```

## Arquitectura y Patrones

### Clean Architecture
- **Domain**: Lógica de negocio pura, sin dependencias externas
- **Data**: Implementaciones de repositorios, fuentes de datos
- **Presentation**: UI y gestión de estado con BLoC

### Principios SOLID
- **S**ingle Responsibility: Cada clase tiene una única responsabilidad
- **O**pen/Closed: Abierto para extensión, cerrado para modificación
- **L**iskov Substitution: Las abstracciones son intercambiables
- **I**nterface Segregation: Interfaces específicas por cliente
- **D**ependency Inversion: Depender de abstracciones, no de implementaciones

### Gestión de Estado
- **BLoC Pattern**: Separación clara entre UI y lógica de negocio
- **Events**: Eventos que disparan cambios de estado
- **States**: Estados inmutables que representan el estado de la UI

## Convenciones de Código

### Naming
- Clases: PascalCase (`UserModel`)
- Variables/Funciones: camelCase (`getCurrentUser`)
- Constantes: camelCase con const (`const maxRetries`)
- Archivos: snake_case (`user_model.dart`)

### Imports
Orden de imports:
1. Dart core
2. Flutter
3. Packages externos
4. Imports relativos del proyecto

```dart
import 'dart:async';

import 'package:flutter/material.dart';

import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';

import '../domain/entities/user.dart';
import 'models/user_model.dart';
```

## Recursos

- [README Principal](README.md) - Especificaciones completas del sistema
- [Flutter Docs](https://docs.flutter.dev/)
- [BLoC Library](https://bloclibrary.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
