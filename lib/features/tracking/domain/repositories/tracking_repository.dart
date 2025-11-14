import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/location.dart';
import '../entities/location_settings.dart';

/// Repositorio para gestión de tracking de ubicación
abstract class TrackingRepository {
  /// Obtiene la ubicación actual del dispositivo
  Future<Either<Failure, Location>> getCurrentLocation();

  /// Envía una ubicación al servidor
  Future<Either<Failure, void>> sendLocation(Location location);

  /// Envía múltiples ubicaciones al servidor (batch)
  Future<Either<Failure, void>> sendLocations(List<Location> locations);

  /// Obtiene el historial de ubicaciones de un usuario
  Future<Either<Failure, List<Location>>> getLocationHistory({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
  });

  /// Obtiene la última ubicación conocida de un usuario
  Future<Either<Failure, Location?>> getLastKnownLocation(String userId);

  /// Obtiene la configuración de rastreo actual
  Future<Either<Failure, LocationSettings>> getSettings();

  /// Actualiza la configuración de rastreo
  Future<Either<Failure, void>> updateSettings(LocationSettings settings);

  /// Inicia el rastreo de ubicación
  Future<Either<Failure, void>> startTracking();

  /// Detiene el rastreo de ubicación
  Future<Either<Failure, void>> stopTracking();

  /// Verifica si el rastreo está activo
  Future<Either<Failure, bool>> isTrackingActive();

  /// Stream de ubicaciones en tiempo real
  Stream<Location> get locationStream;
}
