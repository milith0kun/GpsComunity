import 'dart:async';

import 'package:dartz/dartz.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/geofence.dart';
import '../../domain/entities/map_marker.dart';
import '../../domain/repositories/map_repository.dart';
import '../datasources/map_remote_datasource.dart';

/// Implementación del repositorio del mapa
class MapRepositoryImpl implements MapRepository {
  final MapRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  final _markersController = StreamController<List<MapMarker>>.broadcast();

  MapRepositoryImpl({
    required this.remoteDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<MapMarker>>> getRealTimeMarkers({
    required String organizationId,
    List<String>? groupIds,
  }) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final markers = await remoteDataSource.getRealTimeMarkers(
        organizationId: organizationId,
        groupIds: groupIds,
      );
      final entities = markers.map((m) => m.toEntity()).toList();

      // Emitir al stream
      _markersController.add(entities);

      return Right(entities);
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    }
  }

  @override
  Future<Either<Failure, List<Geofence>>> getGeofences(String organizationId) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Geofence>> createGeofence({
    required String organizationId,
    required String name,
    String? description,
    required GeofenceType type,
    required GeofenceShape shape,
    required double latitude,
    required double longitude,
    double? radius,
    List<GeoPoint>? polygon,
    required GeofenceAlerts alerts,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Geofence>> updateGeofence({
    required String organizationId,
    required String geofenceId,
    String? name,
    String? description,
    GeofenceAlerts? alerts,
    bool? isActive,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, void>> deleteGeofence({
    required String organizationId,
    required String geofenceId,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Stream<List<MapMarker>> get markersStream => _markersController.stream;

  void dispose() {
    _markersController.close();
  }
}
