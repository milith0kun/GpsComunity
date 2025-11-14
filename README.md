# 📍 GPS Community

Sistema de rastreo de ubicación en tiempo real para organizaciones, desarrollado con Flutter y Clean Architecture.

[![Flutter](https://img.shields.io/badge/Flutter-3.9.2-blue)](https://flutter.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Quick Start

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd GpsComunity

# 2. Instalar dependencias
flutter pub get

# 3. Generar código (IMPORTANTE)
flutter pub run build_runner build --delete-conflicting-outputs

# 4. Configurar Firebase
flutterfire configure

# 5. Ejecutar
flutter run
```

📖 **Para setup completo:** Ver [QUICKSTART.md](QUICKSTART.md)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Prerequisitos](#-prerequisitos)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)

## ✨ Características

### ✅ Implementado

- 🏗️ **Clean Architecture** con separación en capas (data, domain, presentation)
- 🎯 **BLoC Pattern** para gestión de estado reactiva
- 💉 **Dependency Injection** con GetIt
- 🔄 **Repository Pattern** con abstracción de datasources
- ⚠️ **Error Handling** robusto con Either (dartz)
- 🧭 **Routing** declarativo con go_router
- 📴 **Offline-first** en tracking
- 🔐 **Autenticación** con Firebase Auth
- 👥 **Gestión de organizaciones** y miembros
- 📍 **Tracking** de ubicación en tiempo real
- 🗺️ **Mapas** con Google Maps integration

### 🚧 En Desarrollo

- 🎨 UI/UX completa (actualmente placeholders)
- 📊 Dashboard de métricas
- 📈 Sistema de reportes
- 🔔 Notificaciones push
- 🧪 Tests unitarios e integración

## 🏛️ Arquitectura

El proyecto sigue los principios de **Clean Architecture** con 4 features principales:

```
lib/
├── core/                    # Código compartido
│   ├── config/             # Configuración (env, theme)
│   ├── constants/          # Constantes de la app
│   ├── errors/             # Manejo de errores
│   ├── network/            # Cliente HTTP
│   ├── router/             # Configuración de rutas
│   └── di/                 # Dependency Injection
│
├── features/
│   ├── auth/               # Autenticación
│   │   ├── data/          #   - Modelos, datasources, repositories
│   │   ├── domain/        #   - Entities, repositories, use cases
│   │   └── presentation/  #   - BLoC, páginas, widgets
│   │
│   ├── tracking/           # Rastreo de ubicación
│   ├── organization/       # Gestión de organizaciones
│   └── map/               # Visualización en mapa
│
└── app.dart               # Widget raíz de la app
```

### Flujo de Datos

```
UI (Widget)
    ↕️ Events/States
BLoC
    ↕️ Params/Either<Failure, Data>
Use Case
    ↕️ Either<Failure, Entity>
Repository (Interface)
    ↕️ Either<Failure, Model>
Repository Implementation
    ↕️ Model/Exception
DataSource (Remote/Local)
```

## 📦 Prerequisitos

- **Flutter SDK** 3.9.2 o superior
- **Dart SDK** 3.0+
- **Android Studio** / **Xcode** (para desarrollo móvil)
- **Node.js** (para Firebase CLI)
- Cuenta de **Firebase**
- Cuenta de **Google Cloud Platform** (para Google Maps)

Verifica tu instalación:
```bash
flutter doctor
```

## ⚙️ Configuración

### 1. Dependencias

```bash
flutter pub get
```

### 2. Generación de Código

El proyecto utiliza generación de código para serialización JSON y otros:

```bash
# Generar una vez
flutter pub run build_runner build --delete-conflicting-outputs

# Modo watch (regenera automáticamente)
flutter pub run build_runner watch --delete-conflicting-outputs
```

### 3. Firebase

```bash
# Instalar FlutterFire CLI
dart pub global activate flutterfire_cli

# Configurar Firebase
flutterfire configure
```

Esto generará `lib/firebase_options.dart` automáticamente.

### 4. Google Maps

1. Obtén API Keys de [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita: Maps SDK for Android/iOS, Geocoding API, Places API
3. Configura las keys:

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<application>
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="YOUR_ANDROID_API_KEY"/>
</application>
```

**iOS** (`ios/Runner/AppDelegate.swift`):
```swift
import GoogleMaps
GMSServices.provideAPIKey("YOUR_IOS_API_KEY")
```

**Código** (`lib/core/config/env_config.dart`):
```dart
static String get googleMapsApiKey {
  return 'YOUR_DEV_API_KEY';
}
```

### 5. Verificar Setup

```bash
./scripts/check_setup.sh
```

## 🗂️ Estructura del Proyecto

```
GpsComunity/
├── lib/                        # Código fuente Flutter
├── android/                    # Proyecto Android nativo
├── ios/                        # Proyecto iOS nativo
├── test/                       # Tests unitarios
├── integration_test/           # Tests de integración
├── assets/                     # Assets (imágenes, fonts)
├── scripts/                    # Scripts de utilidad
│   ├── setup.sh               # Setup completo
│   ├── generate_code.sh       # Generar código
│   ├── clean_build.sh         # Limpiar y rebuild
│   └── check_setup.sh         # Verificar configuración
├── docs/                       # Documentación
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── GOOGLE_MAPS_SETUP.md
│   └── DEPENDENCY_INJECTION.md
├── QUICKSTART.md              # Guía de inicio rápido
├── SETUP_GUIDE.md             # Guía de configuración completa
└── pubspec.yaml               # Dependencias del proyecto
```

## 📚 Documentación

### Guías de Inicio
- [**QUICKSTART.md**](QUICKSTART.md) - Inicio rápido en 5 minutos
- [**SETUP_GUIDE.md**](SETUP_GUIDE.md) - Guía completa de configuración

### Documentación Técnica
- [**TECHNICAL_SPECIFICATION.md**](docs/TECHNICAL_SPECIFICATION.md) - Especificación técnica completa
- [**GOOGLE_MAPS_SETUP.md**](docs/GOOGLE_MAPS_SETUP.md) - Configuración de Google Maps
- [**DEPENDENCY_INJECTION.md**](docs/DEPENDENCY_INJECTION.md) - Sistema de DI

### Scripts Útiles

```bash
# Setup completo (limpia, instala, genera)
./scripts/setup.sh

# Solo generar código
./scripts/generate_code.sh

# Limpiar y regenerar todo
./scripts/clean_build.sh

# Verificar que todo esté configurado
./scripts/check_setup.sh
```

## 🧪 Testing

```bash
# Tests unitarios
flutter test

# Tests de integración
flutter test integration_test

# Análisis estático
flutter analyze

# Coverage
flutter test --coverage
```

## 🛠️ Tecnologías

### Frontend (Flutter)
- **flutter_bloc** - Estado con BLoC pattern
- **go_router** - Routing declarativo
- **get_it** - Dependency injection
- **dartz** - Functional programming (Either)
- **google_maps_flutter** - Mapas
- **geolocator** - Ubicación GPS

### Backend Integration
- **firebase_auth** - Autenticación
- **firebase_messaging** - Notificaciones push
- **dio** - Cliente HTTP
- **hive** - Almacenamiento local

### Desarrollo
- **build_runner** - Generación de código
- **json_serializable** - Serialización JSON
- **injectable** - DI code generation
- **mockito** - Testing con mocks

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **Dart**: Seguir [Effective Dart](https://dart.dev/guides/language/effective-dart)
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`

## 📝 Roadmap

### ✅ Completado (v0.1)
- [x] Arquitectura base con Clean Architecture
- [x] Sistema de autenticación
- [x] Gestión de organizaciones
- [x] Tracking básico de ubicación
- [x] Routing completo
- [x] Dependency injection

### 🚧 En Progreso (v0.2)
- [ ] UI completa y pulida
- [ ] Integración de Google Maps
- [ ] Permisos nativos configurados
- [ ] Tests unitarios (>70% coverage)

### 📅 Próximos (v0.3+)
- [ ] Geofencing
- [ ] Sistema de reportes
- [ ] Notificaciones push
- [ ] Dashboard de métricas
- [ ] Modo offline completo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Desarrollado por [Tu Nombre/Organización]

## 📧 Contacto

- **Issues**: [GitHub Issues](link)
- **Discussions**: [GitHub Discussions](link)
- **Email**: contact@gpscommunity.com

---

**Estado del Proyecto:** 🚧 En Desarrollo Activo

Última actualización: Noviembre 2024
