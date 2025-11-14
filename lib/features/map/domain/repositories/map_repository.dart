import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/geofence.dart';
import '../entities/map_marker.dart';

/// Repositorio para gestión del mapa
abstract class MapRepository {
  /// Obtiene los marcadores de usuarios activos en tiempo real
  Future<Either<Failure, List<MapMarker>>> getRealTimeMarkers({
    required String organizationId,
    List<String>? groupIds,
  });

  /// Obtiene las geocercas de una organización
  Future<Either<Failure, List<Geofence>>> getGeofences(String organizationId);

  /// Crea una nueva geocerca
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
  });

  /// Actualiza una geocerca
  Future<Either<Failure, Geofence>> updateGeofence({
    required String organizationId,
    required String geofenceId,
    String? name,
    String? description,
    GeofenceAlerts? alerts,
    bool? isActive,
  });

  /// Elimina una geocerca
  Future<Either<Failure, void>> deleteGeofence({
    required String organizationId,
    required String geofenceId,
  });

  /// Stream de actualizaciones de marcadores en tiempo real
  Stream<List<MapMarker>> get markersStream;
}
