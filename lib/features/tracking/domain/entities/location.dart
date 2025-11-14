import 'package:equatable/equatable.dart';

/// Entidad que representa una ubicación en el dominio
class Location extends Equatable {
  final String id;
  final String userId;
  final String organizationId;
  final double latitude;
  final double longitude;
  final double accuracy;
  final double? altitude;
  final double? altitudeAccuracy;
  final double? heading;
  final double? speed;
  final double? speedAccuracy;
  final String? activityType;
  final int? activityConfidence;
  final int? batteryLevel;
  final bool? isCharging;
  final String? networkType;
  final DateTime timestamp;
  final DateTime serverTimestamp;

  const Location({
    required this.id,
    required this.userId,
    required this.organizationId,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    this.altitude,
    this.altitudeAccuracy,
    this.heading,
    this.speed,
    this.speedAccuracy,
    this.activityType,
    this.activityConfidence,
    this.batteryLevel,
    this.isCharging,
    this.networkType,
    required this.timestamp,
    required this.serverTimestamp,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        organizationId,
        latitude,
        longitude,
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        speed,
        speedAccuracy,
        activityType,
        activityConfidence,
        batteryLevel,
        isCharging,
        networkType,
        timestamp,
        serverTimestamp,
      ];
}
