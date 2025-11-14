import 'package:equatable/equatable.dart';

import '../../domain/entities/location.dart';
import '../../domain/entities/location_settings.dart';

/// Eventos del BLoC de tracking
abstract class TrackingEvent extends Equatable {
  const TrackingEvent();

  @override
  List<Object?> get props => [];
}

/// Inicializar tracking
class InitializeTracking extends TrackingEvent {
  const InitializeTracking();
}

/// Iniciar rastreo
class StartTracking extends TrackingEvent {
  const StartTracking();
}

/// Detener rastreo
class StopTracking extends TrackingEvent {
  const StopTracking();
}

/// Obtener ubicación actual
class GetCurrentLocation extends TrackingEvent {
  const GetCurrentLocation();
}

/// Enviar ubicación al servidor
class SendLocation extends TrackingEvent {
  final Location location;

  const SendLocation(this.location);

  @override
  List<Object?> get props => [location];
}

/// Obtener historial de ubicaciones
class GetLocationHistory extends TrackingEvent {
  final String userId;
  final DateTime startDate;
  final DateTime endDate;

  const GetLocationHistory({
    required this.userId,
    required this.startDate,
    required this.endDate,
  });

  @override
  List<Object?> get props => [userId, startDate, endDate];
}

/// Actualizar configuración
class UpdateSettings extends TrackingEvent {
  final LocationSettings settings;

  const UpdateSettings(this.settings);

  @override
  List<Object?> get props => [settings];
}

/// Sincronizar ubicaciones pendientes
class SyncPendingLocations extends TrackingEvent {
  const SyncPendingLocations();
}

/// Nueva ubicación recibida (desde servicio de background)
class LocationReceived extends TrackingEvent {
  final Location location;

  const LocationReceived(this.location);

  @override
  List<Object?> get props => [location];
}
