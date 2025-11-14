import 'dart:async';

import 'package:dartz/dartz.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/location.dart';
import '../../domain/entities/location_settings.dart';
import '../../domain/repositories/tracking_repository.dart';
import '../datasources/tracking_local_datasource.dart';
import '../datasources/tracking_remote_datasource.dart';
import '../models/location_model.dart';
import '../models/location_settings_model.dart';

/// Implementación del repositorio de tracking
class TrackingRepositoryImpl implements TrackingRepository {
  final TrackingRemoteDataSource remoteDataSource;
  final TrackingLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  final _locationController = StreamController<Location>.broadcast();

  TrackingRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, Location>> getCurrentLocation() async {
    try {
      final location = await localDataSource.getCurrentLocation();
      return Right(location.toEntity());
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> sendLocation(Location location) async {
    if (!await networkInfo.isConnected) {
      // Sin conexión, guardar para sincronizar después
      try {
        await localDataSource.savePendingLocations([
          LocationModel.fromEntity(location),
        ]);
        return const Right(null);
      } on CacheException catch (e) {
        return Left(CacheFailure(message: e.message));
      }
    }

    try {
      await remoteDataSource.sendLocation(LocationModel.fromEntity(location));
      return const Right(null);
    } on ServerException catch (e) {
      // Guardar localmente si falla el envío
      try {
        await localDataSource.savePendingLocations([
          LocationModel.fromEntity(location),
        ]);
      } catch (_) {}

      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> sendLocations(List<Location> locations) async {
    if (!await networkInfo.isConnected) {
      // Sin conexión, guardar para sincronizar después
      try {
        await localDataSource.savePendingLocations(
          locations.map((l) => LocationModel.fromEntity(l)).toList(),
        );
        return const Right(null);
      } on CacheException catch (e) {
        return Left(CacheFailure(message: e.message));
      }
    }

    try {
      await remoteDataSource.sendLocations(
        locations.map((l) => LocationModel.fromEntity(l)).toList(),
      );
      return const Right(null);
    } on ServerException catch (e) {
      // Guardar localmente si falla el envío
      try {
        await localDataSource.savePendingLocations(
          locations.map((l) => LocationModel.fromEntity(l)).toList(),
        );
      } catch (_) {}

      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Location>>> getLocationHistory({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final locations = await remoteDataSource.getLocationHistory(
        userId: userId,
        startDate: startDate,
        endDate: endDate,
      );
      return Right(locations.map((l) => l.toEntity()).toList());
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Location?>> getLastKnownLocation(String userId) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final location = await remoteDataSource.getLastKnownLocation(userId);
      return Right(location?.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, LocationSettings>> getSettings() async {
    try {
      final settings = await localDataSource.getSettings();
      return Right(settings?.toEntity() ?? LocationSettings.defaults());
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> updateSettings(LocationSettings settings) async {
    try {
      await localDataSource.saveSettings(
        LocationSettingsModel.fromEntity(settings),
      );
      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> startTracking() async {
    try {
      // Verificar y solicitar permisos si es necesario
      final hasPermission = await localDataSource.checkLocationPermissions();
      if (!hasPermission) {
        final granted = await localDataSource.requestLocationPermissions();
        if (!granted) {
          return Left(CacheFailure(message: 'Permisos de ubicación denegados'));
        }
      }

      // Actualizar configuración para habilitar tracking
      final settings = await localDataSource.getSettings() ??
          LocationSettingsModel.fromEntity(LocationSettings.defaults());

      await localDataSource.saveSettings(
        settings.copyWith(isEnabled: true),
      );

      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> stopTracking() async {
    try {
      final settings = await localDataSource.getSettings() ??
          LocationSettingsModel.fromEntity(LocationSettings.defaults());

      await localDataSource.saveSettings(
        settings.copyWith(isEnabled: false),
      );

      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, bool>> isTrackingActive() async {
    try {
      final settings = await localDataSource.getSettings();
      return Right(settings?.isEnabled ?? false);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    } catch (e) {
      return Left(CacheFailure(message: e.toString()));
    }
  }

  @override
  Stream<Location> get locationStream => _locationController.stream;

  void dispose() {
    _locationController.close();
  }
}
