import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/location.dart';

part 'location_model.g.dart';

/// Modelo de datos para ubicación con serialización JSON
@JsonSerializable()
class LocationModel extends Location {
  const LocationModel({
    required super.id,
    required super.userId,
    required super.organizationId,
    required super.latitude,
    required super.longitude,
    required super.accuracy,
    super.altitude,
    super.altitudeAccuracy,
    super.heading,
    super.speed,
    super.speedAccuracy,
    super.activityType,
    super.activityConfidence,
    super.batteryLevel,
    super.isCharging,
    super.networkType,
    required super.timestamp,
    required super.serverTimestamp,
  });

  factory LocationModel.fromJson(Map<String, dynamic> json) =>
      _$LocationModelFromJson(json);

  Map<String, dynamic> toJson() => _$LocationModelToJson(this);

  /// Convierte desde entidad del dominio
  factory LocationModel.fromEntity(Location location) {
    return LocationModel(
      id: location.id,
      userId: location.userId,
      organizationId: location.organizationId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      altitude: location.altitude,
      altitudeAccuracy: location.altitudeAccuracy,
      heading: location.heading,
      speed: location.speed,
      speedAccuracy: location.speedAccuracy,
      activityType: location.activityType,
      activityConfidence: location.activityConfidence,
      batteryLevel: location.batteryLevel,
      isCharging: location.isCharging,
      networkType: location.networkType,
      timestamp: location.timestamp,
      serverTimestamp: location.serverTimestamp,
    );
  }

  /// Convierte a entidad del dominio
  Location toEntity() {
    return Location(
      id: id,
      userId: userId,
      organizationId: organizationId,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      altitude: altitude,
      altitudeAccuracy: altitudeAccuracy,
      heading: heading,
      speed: speed,
      speedAccuracy: speedAccuracy,
      activityType: activityType,
      activityConfidence: activityConfidence,
      batteryLevel: batteryLevel,
      isCharging: isCharging,
      networkType: networkType,
      timestamp: timestamp,
      serverTimestamp: serverTimestamp,
    );
  }
}
