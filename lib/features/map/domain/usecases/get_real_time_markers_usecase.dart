import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../entities/map_marker.dart';
import '../repositories/map_repository.dart';

/// Caso de uso para obtener marcadores en tiempo real
class GetRealTimeMarkersUseCase {
  final MapRepository repository;

  GetRealTimeMarkersUseCase(this.repository);

  Future<Either<Failure, List<MapMarker>>> call(Params params) async {
    return await repository.getRealTimeMarkers(
      organizationId: params.organizationId,
      groupIds: params.groupIds,
    );
  }
}

class Params extends Equatable {
  final String organizationId;
  final List<String>? groupIds;

  const Params({
    required this.organizationId,
    this.groupIds,
  });

  @override
  List<Object?> get props => [organizationId, groupIds];
}
