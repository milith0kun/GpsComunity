import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/config/env_config.dart';
import 'core/network/network_info.dart';
import 'features/auth/data/datasources/auth_local_datasource.dart';
import 'features/auth/data/datasources/auth_remote_datasource.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/domain/usecases/get_current_user_usecase.dart';
import 'features/auth/domain/usecases/login_usecase.dart';
import 'features/auth/domain/usecases/login_with_google_usecase.dart';
import 'features/auth/domain/usecases/logout_usecase.dart';
import 'features/auth/domain/usecases/register_usecase.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/tracking/data/datasources/tracking_local_datasource.dart';
import 'features/tracking/data/datasources/tracking_remote_datasource.dart';
import 'features/tracking/data/repositories/tracking_repository_impl.dart';
import 'features/tracking/domain/repositories/tracking_repository.dart';
import 'features/tracking/domain/usecases/get_current_location_usecase.dart';
import 'features/tracking/domain/usecases/get_location_history_usecase.dart';
import 'features/tracking/domain/usecases/send_location_usecase.dart';
import 'features/tracking/domain/usecases/start_tracking_usecase.dart';
import 'features/tracking/domain/usecases/stop_tracking_usecase.dart';
import 'features/tracking/presentation/bloc/tracking_bloc.dart';
import 'features/organization/data/datasources/organization_remote_datasource.dart';
import 'features/organization/data/repositories/organization_repository_impl.dart';
import 'features/organization/domain/repositories/organization_repository.dart';
import 'features/organization/domain/usecases/create_organization_usecase.dart';
import 'features/organization/domain/usecases/get_members_usecase.dart';
import 'features/organization/domain/usecases/get_my_organizations_usecase.dart';
import 'features/organization/domain/usecases/invite_member_usecase.dart';
import 'features/organization/presentation/bloc/organization_bloc.dart';
import 'features/map/data/datasources/map_remote_datasource.dart';
import 'features/map/data/repositories/map_repository_impl.dart';
import 'features/map/domain/repositories/map_repository.dart';
import 'features/map/domain/usecases/get_real_time_markers_usecase.dart';
import 'features/map/presentation/bloc/map_bloc.dart';

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
  await _initTracking();
  await _initOrganization();
  await _initMap();
}

/// Inicializa dependencias de autenticación
Future<void> _initAuth() async {
  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl()),
  );

  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(sl()),
  );

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  sl.registerLazySingleton(() => LoginWithGoogleUseCase(sl()));

  // BLoC
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl(),
      registerUseCase: sl(),
      logoutUseCase: sl(),
      getCurrentUserUseCase: sl(),
      loginWithGoogleUseCase: sl(),
    ),
  );
}

/// Inicializa dependencias de tracking
Future<void> _initTracking() async {
  // Data sources
  sl.registerLazySingleton<TrackingRemoteDataSource>(
    () => TrackingRemoteDataSourceImpl(sl()),
  );

  sl.registerLazySingleton<TrackingLocalDataSource>(
    () => TrackingLocalDataSourceImpl(sl()),
  );

  // Repository
  sl.registerLazySingleton<TrackingRepository>(
    () => TrackingRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetCurrentLocationUseCase(sl()));
  sl.registerLazySingleton(() => SendLocationUseCase(sl()));
  sl.registerLazySingleton(() => GetLocationHistoryUseCase(sl()));
  sl.registerLazySingleton(() => StartTrackingUseCase(sl()));
  sl.registerLazySingleton(() => StopTrackingUseCase(sl()));

  // BLoC
  sl.registerFactory(
    () => TrackingBloc(
      getCurrentLocationUseCase: sl(),
      sendLocationUseCase: sl(),
      getLocationHistoryUseCase: sl(),
      startTrackingUseCase: sl(),
      stopTrackingUseCase: sl(),
    ),
  );
}

/// Inicializa dependencias de mapa
Future<void> _initMap() async {
  // Data sources
  sl.registerLazySingleton<MapRemoteDataSource>(
    () => MapRemoteDataSourceImpl(sl()),
  );

  // Repository
  sl.registerLazySingleton<MapRepository>(
    () => MapRepositoryImpl(
      remoteDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetRealTimeMarkersUseCase(sl()));

  // BLoC
  sl.registerFactory(
    () => MapBloc(
      getRealTimeMarkersUseCase: sl(),
    ),
  );
}

/// Inicializa dependencias de organización
Future<void> _initOrganization() async {
  // Data sources
  sl.registerLazySingleton<OrganizationRemoteDataSource>(
    () => OrganizationRemoteDataSourceImpl(sl()),
  );

  // Repository
  sl.registerLazySingleton<OrganizationRepository>(
    () => OrganizationRepositoryImpl(
      remoteDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => GetMyOrganizationsUseCase(sl()));
  sl.registerLazySingleton(() => CreateOrganizationUseCase(sl()));
  sl.registerLazySingleton(() => GetMembersUseCase(sl()));
  sl.registerLazySingleton(() => InviteMemberUseCase(sl()));

  // BLoC
  sl.registerFactory(
    () => OrganizationBloc(
      getMyOrganizationsUseCase: sl(),
      createOrganizationUseCase: sl(),
      getMembersUseCase: sl(),
      inviteMemberUseCase: sl(),
    ),
  );
}
