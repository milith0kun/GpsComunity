import 'package:equatable/equatable.dart';

/// Entidad de geocerca
class Geofence extends Equatable {
  final String id;
  final String organizationId;
  final String name;
  final String? description;
  final GeofenceType type;
  final GeofenceShape shape;
  final double latitude;
  final double longitude;
  final double? radius; // Para círculos
  final List<GeoPoint>? polygon; // Para polígonos
  final GeofenceAlerts alerts;
  final bool isActive;
  final DateTime createdAt;

  const Geofence({
    required this.id,
    required this.organizationId,
    required this.name,
    this.description,
    required this.type,
    required this.shape,
    required this.latitude,
    required this.longitude,
    this.radius,
    this.polygon,
    required this.alerts,
    required this.isActive,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        organizationId,
        name,
        description,
        type,
        shape,
        latitude,
        longitude,
        radius,
        polygon,
        alerts,
        isActive,
        createdAt,
      ];
}

/// Tipo de geocerca
enum GeofenceType {
  office,
  warehouse,
  clientLocation,
  custom,
}

/// Forma de la geocerca
enum GeofenceShape {
  circle,
  polygon,
}

/// Punto geográfico
class GeoPoint extends Equatable {
  final double latitude;
  final double longitude;

  const GeoPoint({
    required this.latitude,
    required this.longitude,
  });

  @override
  List<Object?> get props => [latitude, longitude];
}

/// Alertas de geocerca
class GeofenceAlerts extends Equatable {
  final bool onEnter;
  final bool onExit;
  final bool onStay;
  final int? stayDurationMinutes;

  const GeofenceAlerts({
    required this.onEnter,
    required this.onExit,
    required this.onStay,
    this.stayDurationMinutes,
  });

  @override
  List<Object?> get props => [onEnter, onExit, onStay, stayDurationMinutes];
}
