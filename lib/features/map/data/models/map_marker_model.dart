import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/map_marker.dart';

part 'map_marker_model.g.dart';

/// Modelo de datos para marcador del mapa
@JsonSerializable()
class MapMarkerModel extends MapMarker {
  const MapMarkerModel({
    required super.id,
    required super.userId,
    required super.userName,
    required super.latitude,
    required super.longitude,
    super.photoUrl,
    required super.type,
    required super.lastUpdate,
    required super.isOnline,
    super.heading,
    super.speed,
    super.batteryLevel,
  });

  factory MapMarkerModel.fromJson(Map<String, dynamic> json) =>
      _$MapMarkerModelFromJson(json);

  Map<String, dynamic> toJson() => _$MapMarkerModelToJson(this);

  factory MapMarkerModel.fromEntity(MapMarker marker) {
    return MapMarkerModel(
      id: marker.id,
      userId: marker.userId,
      userName: marker.userName,
      latitude: marker.latitude,
      longitude: marker.longitude,
      photoUrl: marker.photoUrl,
      type: marker.type,
      lastUpdate: marker.lastUpdate,
      isOnline: marker.isOnline,
      heading: marker.heading,
      speed: marker.speed,
      batteryLevel: marker.batteryLevel,
    );
  }

  MapMarker toEntity() => this;
}
