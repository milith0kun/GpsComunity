import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_current_location_usecase.dart';
import '../../domain/usecases/get_location_history_usecase.dart';
import '../../domain/usecases/send_location_usecase.dart';
import '../../domain/usecases/start_tracking_usecase.dart';
import '../../domain/usecases/stop_tracking_usecase.dart';
import 'tracking_event.dart';
import 'tracking_state.dart';

/// BLoC para gestión de tracking de ubicación
class TrackingBloc extends Bloc<TrackingEvent, TrackingState> {
  final GetCurrentLocationUseCase getCurrentLocationUseCase;
  final SendLocationUseCase sendLocationUseCase;
  final GetLocationHistoryUseCase getLocationHistoryUseCase;
  final StartTrackingUseCase startTrackingUseCase;
  final StopTrackingUseCase stopTrackingUseCase;

  TrackingBloc({
    required this.getCurrentLocationUseCase,
    required this.sendLocationUseCase,
    required this.getLocationHistoryUseCase,
    required this.startTrackingUseCase,
    required this.stopTrackingUseCase,
  }) : super(const TrackingInitial()) {
    on<InitializeTracking>(_onInitializeTracking);
    on<StartTracking>(_onStartTracking);
    on<StopTracking>(_onStopTracking);
    on<GetCurrentLocation>(_onGetCurrentLocation);
    on<SendLocation>(_onSendLocation);
    on<GetLocationHistory>(_onGetLocationHistory);
    on<LocationReceived>(_onLocationReceived);
  }

  Future<void> _onInitializeTracking(
    InitializeTracking event,
    Emitter<TrackingState> emit,
  ) async {
    emit(const TrackingLoading());
    // Aquí podrías cargar la configuración guardada
    // Por ahora, simplemente iniciamos en estado inactivo
    emit(const TrackingInactive(
      settings: LocationSettings(
        isEnabled: false,
        intervalSeconds: 60,
        distanceFilterMeters: 50,
        accuracy: LocationAccuracy.balanced,
        trackInBackground: true,
      ),
    ));
  }

  Future<void> _onStartTracking(
    StartTracking event,
    Emitter<TrackingState> emit,
  ) async {
    emit(const TrackingLoading());

    final result = await startTrackingUseCase();

    result.fold(
      (failure) {
        if (failure.message.contains('permisos') ||
            failure.message.contains('denegados')) {
          emit(const LocationPermissionDenied());
        } else {
          emit(TrackingError(failure.message));
        }
      },
      (_) {
        emit(const TrackingActive(
          settings: LocationSettings(
            isEnabled: true,
            intervalSeconds: 60,
            distanceFilterMeters: 50,
            accuracy: LocationAccuracy.balanced,
            trackInBackground: true,
          ),
        ));
      },
    );
  }

  Future<void> _onStopTracking(
    StopTracking event,
    Emitter<TrackingState> emit,
  ) async {
    final result = await stopTrackingUseCase();

    result.fold(
      (failure) => emit(TrackingError(failure.message)),
      (_) {
        emit(const TrackingInactive(
          settings: LocationSettings(
            isEnabled: false,
            intervalSeconds: 60,
            distanceFilterMeters: 50,
            accuracy: LocationAccuracy.balanced,
            trackInBackground: true,
          ),
        ));
      },
    );
  }

  Future<void> _onGetCurrentLocation(
    GetCurrentLocation event,
    Emitter<TrackingState> emit,
  ) async {
    emit(const TrackingLoading());

    final result = await getCurrentLocationUseCase();

    result.fold(
      (failure) => emit(TrackingError(failure.message)),
      (location) => emit(LocationObtained(location)),
    );
  }

  Future<void> _onSendLocation(
    SendLocation event,
    Emitter<TrackingState> emit,
  ) async {
    final result = await sendLocationUseCase(event.location);

    result.fold(
      (failure) {
        // No emitimos error aquí, ya que puede ser por falta de conexión
        // y las ubicaciones se guardan localmente
      },
      (_) {
        // Ubicación enviada exitosamente
      },
    );
  }

  Future<void> _onGetLocationHistory(
    GetLocationHistory event,
    Emitter<TrackingState> emit,
  ) async {
    emit(const TrackingLoading());

    final result = await getLocationHistoryUseCase(
      Params(
        userId: event.userId,
        startDate: event.startDate,
        endDate: event.endDate,
      ),
    );

    result.fold(
      (failure) => emit(TrackingError(failure.message)),
      (locations) => emit(LocationHistoryLoaded(locations)),
    );
  }

  Future<void> _onLocationReceived(
    LocationReceived event,
    Emitter<TrackingState> emit,
  ) async {
    // Actualizar el estado con la nueva ubicación
    if (state is TrackingActive) {
      final currentState = state as TrackingActive;
      emit(currentState.copyWith(currentLocation: event.location));

      // Enviar ubicación al servidor
      add(SendLocation(event.location));
    }
  }
}
