import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_real_time_markers_usecase.dart';
import 'map_event.dart';
import 'map_state.dart';

/// BLoC para gestión del mapa
class MapBloc extends Bloc<MapEvent, MapState> {
  final GetRealTimeMarkersUseCase getRealTimeMarkersUseCase;

  Timer? _refreshTimer;

  MapBloc({
    required this.getRealTimeMarkersUseCase,
  }) : super(const MapInitial()) {
    on<InitializeMap>(_onInitializeMap);
    on<RefreshMarkers>(_onRefreshMarkers);
    on<CenterOnUser>(_onCenterOnUser);
    on<ToggleGeofences>(_onToggleGeofences);
    on<SelectMarker>(_onSelectMarker);
  }

  Future<void> _onInitializeMap(
    InitializeMap event,
    Emitter<MapState> emit,
  ) async {
    emit(const MapLoading());

    final result = await getRealTimeMarkersUseCase(
      Params(
        organizationId: event.organizationId,
        groupIds: event.groupIds,
      ),
    );

    result.fold(
      (failure) => emit(MapError(failure.message)),
      (markers) {
        emit(MapLoaded(markers: markers));

        // Iniciar actualización automática cada 30 segundos
        _startAutoRefresh(event.organizationId, event.groupIds);
      },
    );
  }

  Future<void> _onRefreshMarkers(
    RefreshMarkers event,
    Emitter<MapState> emit,
  ) async {
    if (state is! MapLoaded) return;

    final result = await getRealTimeMarkersUseCase(
      Params(
        organizationId: event.organizationId,
        groupIds: event.groupIds,
      ),
    );

    result.fold(
      (failure) {
        // Mantener estado actual si falla la actualización
      },
      (markers) {
        if (state is MapLoaded) {
          final currentState = state as MapLoaded;
          emit(currentState.copyWith(markers: markers));
        }
      },
    );
  }

  Future<void> _onCenterOnUser(
    CenterOnUser event,
    Emitter<MapState> emit,
  ) async {
    if (state is MapLoaded) {
      final currentState = state as MapLoaded;
      final marker = currentState.markers.firstWhere(
        (m) => m.userId == event.userId,
        orElse: () => currentState.markers.first,
      );

      emit(currentState.copyWith(selectedMarker: marker));
    }
  }

  Future<void> _onToggleGeofences(
    ToggleGeofences event,
    Emitter<MapState> emit,
  ) async {
    if (state is MapLoaded) {
      final currentState = state as MapLoaded;
      emit(currentState.copyWith(showGeofences: !currentState.showGeofences));
    }
  }

  Future<void> _onSelectMarker(
    SelectMarker event,
    Emitter<MapState> emit,
  ) async {
    if (state is MapLoaded) {
      final currentState = state as MapLoaded;
      final marker = currentState.markers.firstWhere(
        (m) => m.id == event.markerId,
        orElse: () => currentState.markers.first,
      );

      emit(currentState.copyWith(selectedMarker: marker));
    }
  }

  void _startAutoRefresh(String organizationId, List<String>? groupIds) {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => add(RefreshMarkers(
        organizationId: organizationId,
        groupIds: groupIds,
      )),
    );
  }

  @override
  Future<void> close() {
    _refreshTimer?.cancel();
    return super.close();
  }
}
