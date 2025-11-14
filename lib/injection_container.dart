import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/config/env_config.dart';
import 'core/network/network_info.dart';

/// Service Locator global
final sl = GetIt.instance;

/// Inicializa todas las dependencias
Future<void> initializeDependencies() async {
  // ============================================================================
  // Core
  // ============================================================================

  // Dio (HTTP Client)
  sl.registerLazySingleton<Dio>(() {
    final dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Agregar interceptores
    if (EnvConfig.isDebug) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
      ));
    }

    return dio;
  });

  // Network Info
  sl.registerLazySingleton<NetworkInfo>(
    () => NetworkInfoImpl(Connectivity()),
  );

  // Shared Preferences
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => sharedPreferences);

  // ============================================================================
  // Features
  // ============================================================================

  await _initAuth();
  // await _initTracking();
  // await _initMap();
  // await _initOrganization();
}

/// Inicializa dependencias de autenticación
Future<void> _initAuth() async {
  // TODO: Descomentar después de ejecutar build_runner para generar archivos .g.dart

  // // Data sources
  // sl.registerLazySingleton<AuthRemoteDataSource>(
  //   () => AuthRemoteDataSourceImpl(sl()),
  // );

  // sl.registerLazySingleton<AuthLocalDataSource>(
  //   () => AuthLocalDataSourceImpl(sl()),
  // );

  // // Repository
  // sl.registerLazySingleton<AuthRepository>(
  //   () => AuthRepositoryImpl(
  //     remoteDataSource: sl(),
  //     localDataSource: sl(),
  //     networkInfo: sl(),
  //   ),
  // );

  // // Use cases
  // sl.registerLazySingleton(() => LoginUseCase(sl()));
  // sl.registerLazySingleton(() => RegisterUseCase(sl()));
  // sl.registerLazySingleton(() => LogoutUseCase(sl()));
  // sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  // sl.registerLazySingleton(() => LoginWithGoogleUseCase(sl()));

  // // BLoC
  // sl.registerFactory(
  //   () => AuthBloc(
  //     loginUseCase: sl(),
  //     registerUseCase: sl(),
  //     logoutUseCase: sl(),
  //     getCurrentUserUseCase: sl(),
  //     loginWithGoogleUseCase: sl(),
  //   ),
  // );
}

/// Inicializa dependencias de tracking
Future<void> _initTracking() async {
  // TODO: Implementar
}

/// Inicializa dependencias de mapa
Future<void> _initMap() async {
  // TODO: Implementar
}

/// Inicializa dependencias de organización
Future<void> _initOrganization() async {
  // TODO: Implementar
}
