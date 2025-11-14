import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/location.dart';
import '../repositories/tracking_repository.dart';

/// Caso de uso para obtener la ubicación actual
class GetCurrentLocationUseCase {
  final TrackingRepository repository;

  GetCurrentLocationUseCase(this.repository);

  Future<Either<Failure, Location>> call() async {
    return await repository.getCurrentLocation();
  }
}
