# Dependency Injection con GetIt e Injectable

Este proyecto usa **GetIt** como service locator e **Injectable** para generación automática de código de registro de dependencias.

## 📋 Conceptos Básicos

### ¿Qué es Dependency Injection?

Dependency Injection (DI) es un patrón de diseño que permite:
- Desacoplar componentes
- Facilitar testing (fácil mockear dependencias)
- Mejorar mantenibilidad
- Gestionar ciclo de vida de objetos

### GetIt + Injectable

- **GetIt**: Service locator que mantiene un registro de dependencias
- **Injectable**: Genera automáticamente el código de registro usando anotaciones

## 🚀 Configuración Inicial

### 1. Inicializar Dependencias

En `lib/main.dart`:

```dart
import 'package:gps_community/core/di/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Configurar dependency injection
  await configureDependencies();

  runApp(const MyApp());
}
```

### 2. Generar Código

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

Esto generará `lib/core/di/injection.config.dart` con todos los registros.

## 🏗️ Arquitectura de Dependencias

### Estructura por Capa

```
Feature/
├── data/
│   ├── datasources/      # @injectable
│   │   ├── remote/       # API clients
│   │   └── local/        # Local storage
│   └── repositories/     # @Injectable(as: Interface)
│
├── domain/
│   ├── repositories/     # Interfaces (abstract)
│   └── usecases/        # @injectable
│
└── presentation/
    └── bloc/            # @injectable
```

## 📝 Anotaciones y Uso

### @injectable - Registro Simple

Registra una clase como inyectable:

```dart
import 'package:injectable/injectable.dart';

@injectable
class MyService {
  void doSomething() {
    print('Doing something');
  }
}

// Uso
final service = getIt<MyService>();
service.doSomething();
```

### @Injectable(as: Interface) - Abstracción

Registra una implementación contra una interfaz:

```dart
// domain/repositories/user_repository.dart
abstract class UserRepository {
  Future<User> getUser(String id);
}

// data/repositories/user_repository_impl.dart
@Injectable(as: UserRepository)
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;

  UserRepositoryImpl(this.remoteDataSource);

  @override
  Future<User> getUser(String id) async {
    return await remoteDataSource.fetchUser(id);
  }
}

// Uso
final repo = getIt<UserRepository>(); // Obtiene UserRepositoryImpl
```

### @singleton - Instancia Única

Una sola instancia para toda la aplicación:

```dart
@singleton
class AuthService {
  String? _token;

  void setToken(String token) {
    _token = token;
  }

  String? get token => _token;
}

// Siempre obtienes la misma instancia
final auth1 = getIt<AuthService>();
final auth2 = getIt<AuthService>();
// auth1 == auth2 (true)
```

### @lazySingleton - Singleton Lazy

Se crea solo cuando se solicita por primera vez:

```dart
@lazySingleton
class DatabaseService {
  DatabaseService() {
    print('DatabaseService created');
  }

  void query() {
    print('Querying database');
  }
}

// No se crea hasta que lo solicites
final db = getIt<DatabaseService>(); // "DatabaseService created"
db.query(); // "Querying database"
```

### @Named - Múltiples Implementaciones

Cuando tienes múltiples implementaciones de la misma interfaz:

```dart
abstract class Storage {
  Future<void> save(String key, String value);
  Future<String?> get(String key);
}

@Named('secure')
@Injectable(as: Storage)
class SecureStorage implements Storage {
  // Implementación segura
}

@Named('local')
@Injectable(as: Storage)
class LocalStorage implements Storage {
  // Implementación local
}

// Uso
final secureStorage = getIt<Storage>(instanceName: 'secure');
final localStorage = getIt<Storage>(instanceName: 'local');
```

### @Environment - Dependencias por Ambiente

Registrar dependencias solo en ciertos ambientes:

```dart
@dev
@Injectable(as: ApiClient)
class MockApiClient implements ApiClient {
  // Mock para desarrollo
}

@prod
@Injectable(as: ApiClient)
class RealApiClient implements ApiClient {
  // Cliente real para producción
}

// Configurar en main.dart
await configureDependencies(environment: Environment.dev);
```

### @factoryMethod - Métodos Factory

Cuando necesitas lógica personalizada de creación:

```dart
@module
abstract class RegisterModule {
  @lazySingleton
  Dio dio() {
    final dio = Dio();
    dio.options.baseUrl = ApiConstants.baseUrl;
    dio.interceptors.add(LogInterceptor());
    return dio;
  }

  @singleton
  SharedPreferences prefs() => SharedPreferences.getInstance();
}
```

### @preResolve - Resolución Asíncrona

Para dependencias que requieren inicialización asíncrona:

```dart
@module
abstract class DatabaseModule {
  @preResolve
  @singleton
  Future<Database> database() async {
    return await openDatabase('app.db');
  }
}
```

## 🎯 Ejemplos Prácticos

### Ejemplo 1: BLoC con Dependencias

```dart
// presentation/bloc/tracking_bloc.dart
import 'package:injectable/injectable.dart';

@injectable
class TrackingBloc extends Bloc<TrackingEvent, TrackingState> {
  final StartTracking startTracking;
  final StopTracking stopTracking;
  final GetLocationSettings getLocationSettings;

  // Injectable automáticamente inyecta estas dependencias
  TrackingBloc(
    this.startTracking,
    this.stopTracking,
    this.getLocationSettings,
  ) : super(TrackingInitial()) {
    on<StartTrackingEvent>(_onStartTracking);
    on<StopTrackingEvent>(_onStopTracking);
  }

  Future<void> _onStartTracking(
    StartTrackingEvent event,
    Emitter<TrackingState> emit,
  ) async {
    emit(TrackingLoading());
    final result = await startTracking(NoParams());
    // ...
  }
}

// Uso en UI
class TrackingPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<TrackingBloc>(),
      child: TrackingView(),
    );
  }
}
```

### Ejemplo 2: Repository con DataSources

```dart
// data/datasources/tracking_remote_datasource.dart
@injectable
class TrackingRemoteDataSource {
  final Dio dio;

  TrackingRemoteDataSource(this.dio);

  Future<LocationModel> sendLocation(LocationModel location) async {
    final response = await dio.post('/locations', data: location.toJson());
    return LocationModel.fromJson(response.data);
  }
}

// data/datasources/tracking_local_datasource.dart
@injectable
class TrackingLocalDataSource {
  final Database db;

  TrackingLocalDataSource(this.db);

  Future<void> cacheLocation(LocationModel location) async {
    await db.insert('locations', location.toJson());
  }
}

// data/repositories/tracking_repository_impl.dart
@Injectable(as: TrackingRepository)
class TrackingRepositoryImpl implements TrackingRepository {
  final TrackingRemoteDataSource remoteDataSource;
  final TrackingLocalDataSource localDataSource;

  TrackingRepositoryImpl(
    this.remoteDataSource,
    this.localDataSource,
  );

  @override
  Future<Either<Failure, Location>> sendLocation(Location location) async {
    try {
      final model = LocationModel.fromEntity(location);

      // Guardar localmente primero
      await localDataSource.cacheLocation(model);

      // Intentar enviar al servidor
      final result = await remoteDataSource.sendLocation(model);

      return Right(result.toEntity());
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
```

### Ejemplo 3: Use Case

```dart
// domain/usecases/start_tracking.dart
@injectable
class StartTracking implements UseCase<void, NoParams> {
  final TrackingRepository repository;

  StartTracking(this.repository);

  @override
  Future<Either<Failure, void>> call(NoParams params) async {
    return await repository.startTracking();
  }
}
```

### Ejemplo 4: Módulo de Servicios Externos

```dart
// core/di/modules/network_module.dart
import 'package:injectable/injectable.dart';
import 'package:dio/dio.dart';

@module
abstract class NetworkModule {
  @lazySingleton
  Dio get dio {
    final dio = Dio();

    // Configuración base
    dio.options = BaseOptions(
      baseUrl: EnvConfig.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    );

    // Interceptores
    dio.interceptors.addAll([
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
      AuthInterceptor(),
      ErrorInterceptor(),
    ]);

    return dio;
  }
}
```

## 🧪 Testing con Mocks

```dart
// test/features/tracking/bloc/tracking_bloc_test.dart
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

@GenerateMocks([StartTracking, StopTracking, GetLocationSettings])
void main() {
  late TrackingBloc bloc;
  late MockStartTracking mockStartTracking;
  late MockStopTracking mockStopTracking;
  late MockGetLocationSettings mockGetLocationSettings;

  setUp(() {
    mockStartTracking = MockStartTracking();
    mockStopTracking = MockStopTracking();
    mockGetLocationSettings = MockGetLocationSettings();

    // Crear BLoC con mocks (sin GetIt)
    bloc = TrackingBloc(
      mockStartTracking,
      mockStopTracking,
      mockGetLocationSettings,
    );
  });

  test('should emit [Loading, Success] when tracking starts', () {
    // Arrange
    when(mockStartTracking(any))
        .thenAnswer((_) async => const Right(null));

    // Act & Assert
    expect(
      bloc.stream,
      emitsInOrder([
        TrackingLoading(),
        TrackingSuccess(),
      ]),
    );

    bloc.add(StartTrackingEvent());
  });
}
```

## 📊 Resumen de Anotaciones

| Anotación | Uso | Ciclo de Vida |
|-----------|-----|---------------|
| `@injectable` | Registro básico | Nueva instancia cada vez |
| `@singleton` | Instancia única | Creada al inicio |
| `@lazySingleton` | Instancia única lazy | Creada al primer uso |
| `@Injectable(as: Interface)` | Implementación de interfaz | Según tipo base |
| `@Named('name')` | Múltiples implementaciones | Según tipo base |
| `@Environment(['dev'])` | Ambiente específico | Según tipo base |
| `@module` | Módulo de registros | N/A |
| `@factoryMethod` | Factory personalizado | Según tipo base |
| `@preResolve` | Resolución asíncrona | Antes del init |

## 🔄 Workflow de Desarrollo

1. **Crear nueva clase** que necesite inyección
2. **Agregar anotación** apropiada (`@injectable`, `@singleton`, etc.)
3. **Declarar dependencias** en el constructor
4. **Regenerar código**: `flutter pub run build_runner build --delete-conflicting-outputs`
5. **Usar GetIt** para obtener instancia: `getIt<MyClass>()`

## ⚠️ Errores Comunes

### Error: "No registration found for Type X"

**Causa:** La clase no está registrada o falta regenerar código.

**Solución:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Error: "Circular dependency detected"

**Causa:** Dos clases se dependen mutuamente.

**Solución:** Revisar arquitectura, usar interfaces, o lazy injection.

### Error: "Type is not a subtype"

**Causa:** Registraste implementación incorrecta para una interfaz.

**Solución:** Verifica que `@Injectable(as: Interface)` apunte a la interfaz correcta.

## 🔗 Recursos

- [GetIt Documentation](https://pub.dev/packages/get_it)
- [Injectable Documentation](https://pub.dev/packages/injectable)
- [Dependency Injection Patterns](https://pub.dev/packages/injectable#patterns)

---

**Próximos pasos:** Revisa SETUP_GUIDE.md para configuración del proyecto.
