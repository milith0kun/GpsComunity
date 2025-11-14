import 'package:equatable/equatable.dart';

import '../../domain/entities/location.dart';
import '../../domain/entities/location_settings.dart';

/// Estados del BLoC de tracking
abstract class TrackingState extends Equatable {
  const TrackingState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial
class TrackingInitial extends TrackingState {
  const TrackingInitial();
}

/// Cargando
class TrackingLoading extends TrackingState {
  const TrackingLoading();
}

/// Rastreo activo
class TrackingActive extends TrackingState {
  final Location? currentLocation;
  final LocationSettings settings;
  final bool isSyncing;

  const TrackingActive({
    this.currentLocation,
    required this.settings,
    this.isSyncing = false,
  });

  TrackingActive copyWith({
    Location? currentLocation,
    LocationSettings? settings,
    bool? isSyncing,
  }) {
    return TrackingActive(
      currentLocation: currentLocation ?? this.currentLocation,
      settings: settings ?? this.settings,
      isSyncing: isSyncing ?? this.isSyncing,
    );
  }

  @override
  List<Object?> get props => [currentLocation, settings, isSyncing];
}

/// Rastreo inactivo
class TrackingInactive extends TrackingState {
  final LocationSettings settings;

  const TrackingInactive({required this.settings});

  @override
  List<Object?> get props => [settings];
}

/// Ubicación obtenida
class LocationObtained extends TrackingState {
  final Location location;

  const LocationObtained(this.location);

  @override
  List<Object?> get props => [location];
}

/// Historial cargado
class LocationHistoryLoaded extends TrackingState {
  final List<Location> locations;

  const LocationHistoryLoaded(this.locations);

  @override
  List<Object?> get props => [locations];
}

/// Configuración actualizada
class SettingsUpdated extends TrackingState {
  final LocationSettings settings;

  const SettingsUpdated(this.settings);

  @override
  List<Object?> get props => [settings];
}

/// Error
class TrackingError extends TrackingState {
  final String message;

  const TrackingError(this.message);

  @override
  List<Object?> get props => [message];
}

/// Permisos denegados
class LocationPermissionDenied extends TrackingState {
  const LocationPermissionDenied();
}
