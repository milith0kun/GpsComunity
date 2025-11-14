import 'package:equatable/equatable.dart';

import '../../domain/entities/geofence.dart';
import '../../domain/entities/map_marker.dart';

/// Estados del BLoC del mapa
abstract class MapState extends Equatable {
  const MapState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial
class MapInitial extends MapState {
  const MapInitial();
}

/// Cargando
class MapLoading extends MapState {
  const MapLoading();
}

/// Mapa cargado con marcadores
class MapLoaded extends MapState {
  final List<MapMarker> markers;
  final List<Geofence> geofences;
  final bool showGeofences;
  final MapMarker? selectedMarker;

  const MapLoaded({
    required this.markers,
    this.geofences = const [],
    this.showGeofences = true,
    this.selectedMarker,
  });

  MapLoaded copyWith({
    List<MapMarker>? markers,
    List<Geofence>? geofences,
    bool? showGeofences,
    MapMarker? selectedMarker,
  }) {
    return MapLoaded(
      markers: markers ?? this.markers,
      geofences: geofences ?? this.geofences,
      showGeofences: showGeofences ?? this.showGeofences,
      selectedMarker: selectedMarker ?? this.selectedMarker,
    );
  }

  @override
  List<Object?> get props => [markers, geofences, showGeofences, selectedMarker];
}

/// Error
class MapError extends MapState {
  final String message;

  const MapError(this.message);

  @override
  List<Object?> get props => [message];
}
