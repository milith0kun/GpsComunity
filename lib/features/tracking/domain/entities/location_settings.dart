import 'package:equatable/equatable.dart';

/// Configuración de rastreo de ubicación
class LocationSettings extends Equatable {
  final bool isEnabled;
  final int intervalSeconds;
  final double distanceFilterMeters;
  final LocationAccuracy accuracy;
  final bool trackInBackground;

  const LocationSettings({
    required this.isEnabled,
    required this.intervalSeconds,
    required this.distanceFilterMeters,
    required this.accuracy,
    required this.trackInBackground,
  });

  /// Configuración por defecto
  factory LocationSettings.defaults() {
    return const LocationSettings(
      isEnabled: false,
      intervalSeconds: 60,
      distanceFilterMeters: 50,
      accuracy: LocationAccuracy.balanced,
      trackInBackground: true,
    );
  }

  LocationSettings copyWith({
    bool? isEnabled,
    int? intervalSeconds,
    double? distanceFilterMeters,
    LocationAccuracy? accuracy,
    bool? trackInBackground,
  }) {
    return LocationSettings(
      isEnabled: isEnabled ?? this.isEnabled,
      intervalSeconds: intervalSeconds ?? this.intervalSeconds,
      distanceFilterMeters: distanceFilterMeters ?? this.distanceFilterMeters,
      accuracy: accuracy ?? this.accuracy,
      trackInBackground: trackInBackground ?? this.trackInBackground,
    );
  }

  @override
  List<Object?> get props => [
        isEnabled,
        intervalSeconds,
        distanceFilterMeters,
        accuracy,
        trackInBackground,
      ];
}

/// Nivel de precisión del rastreo
enum LocationAccuracy {
  /// Máxima precisión (GPS)
  high,

  /// Precisión balanceada
  balanced,

  /// Baja precisión (ahorro de batería)
  low,
}
