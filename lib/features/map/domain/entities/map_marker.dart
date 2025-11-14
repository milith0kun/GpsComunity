import 'package:equatable/equatable.dart';

/// Entidad de marcador en el mapa
class MapMarker extends Equatable {
  final String id;
  final String userId;
  final String userName;
  final double latitude;
  final double longitude;
  final String? photoUrl;
  final MarkerType type;
  final DateTime lastUpdate;
  final bool isOnline;
  final double? heading;
  final double? speed;
  final int? batteryLevel;

  const MapMarker({
    required this.id,
    required this.userId,
    required this.userName,
    required this.latitude,
    required this.longitude,
    this.photoUrl,
    required this.type,
    required this.lastUpdate,
    required this.isOnline,
    this.heading,
    this.speed,
    this.batteryLevel,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        userName,
        latitude,
        longitude,
        photoUrl,
        type,
        lastUpdate,
        isOnline,
        heading,
        speed,
        batteryLevel,
      ];
}

/// Tipo de marcador
enum MarkerType {
  user,
  geofence,
  poi, // Point of Interest
}
