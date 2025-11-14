import 'package:equatable/equatable.dart';

/// Eventos del BLoC del mapa
abstract class MapEvent extends Equatable {
  const MapEvent();

  @override
  List<Object?> get props => [];
}

/// Inicializar mapa
class InitializeMap extends MapEvent {
  final String organizationId;
  final List<String>? groupIds;

  const InitializeMap({
    required this.organizationId,
    this.groupIds,
  });

  @override
  List<Object?> get props => [organizationId, groupIds];
}

/// Actualizar marcadores
class RefreshMarkers extends MapEvent {
  final String organizationId;
  final List<String>? groupIds;

  const RefreshMarkers({
    required this.organizationId,
    this.groupIds,
  });

  @override
  List<Object?> get props => [organizationId, groupIds];
}

/// Centrar mapa en usuario
class CenterOnUser extends MapEvent {
  final String userId;

  const CenterOnUser(this.userId);

  @override
  List<Object?> get props => [userId];
}

/// Mostrar/ocultar geocercas
class ToggleGeofences extends MapEvent {
  const ToggleGeofences();
}

/// Seleccionar marcador
class SelectMarker extends MapEvent {
  final String markerId;

  const SelectMarker(this.markerId);

  @override
  List<Object?> get props => [markerId];
}
