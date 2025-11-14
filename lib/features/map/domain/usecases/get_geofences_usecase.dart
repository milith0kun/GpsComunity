import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/geofence.dart';
import '../repositories/map_repository.dart';

/// Caso de uso para obtener geocercas
class GetGeofencesUseCase {
  final MapRepository repository;

  GetGeofencesUseCase(this.repository);

  Future<Either<Failure, List<Geofence>>> call(String organizationId) async {
    return await repository.getGeofences(organizationId);
  }
}
