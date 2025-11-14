import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/location_settings.dart';

part 'location_settings_model.g.dart';

/// Modelo de datos para configuración de tracking
@JsonSerializable()
class LocationSettingsModel extends LocationSettings {
  const LocationSettingsModel({
    required super.isEnabled,
    required super.intervalSeconds,
    required super.distanceFilterMeters,
    required super.accuracy,
    required super.trackInBackground,
  });

  factory LocationSettingsModel.fromJson(Map<String, dynamic> json) =>
      _$LocationSettingsModelFromJson(json);

  Map<String, dynamic> toJson() => _$LocationSettingsModelToJson(this);

  /// Convierte desde entidad del dominio
  factory LocationSettingsModel.fromEntity(LocationSettings settings) {
    return LocationSettingsModel(
      isEnabled: settings.isEnabled,
      intervalSeconds: settings.intervalSeconds,
      distanceFilterMeters: settings.distanceFilterMeters,
      accuracy: settings.accuracy,
      trackInBackground: settings.trackInBackground,
    );
  }

  /// Convierte a entidad del dominio
  LocationSettings toEntity() {
    return LocationSettings(
      isEnabled: isEnabled,
      intervalSeconds: intervalSeconds,
      distanceFilterMeters: distanceFilterMeters,
      accuracy: accuracy,
      trackInBackground: trackInBackground,
    );
  }

  @override
  LocationSettingsModel copyWith({
    bool? isEnabled,
    int? intervalSeconds,
    double? distanceFilterMeters,
    LocationAccuracy? accuracy,
    bool? trackInBackground,
  }) {
    return LocationSettingsModel(
      isEnabled: isEnabled ?? this.isEnabled,
      intervalSeconds: intervalSeconds ?? this.intervalSeconds,
      distanceFilterMeters: distanceFilterMeters ?? this.distanceFilterMeters,
      accuracy: accuracy ?? this.accuracy,
      trackInBackground: trackInBackground ?? this.trackInBackground,
    );
  }
}
