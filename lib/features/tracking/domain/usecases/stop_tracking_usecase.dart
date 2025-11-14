import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../repositories/tracking_repository.dart';

/// Caso de uso para detener el rastreo
class StopTrackingUseCase {
  final TrackingRepository repository;

  StopTrackingUseCase(this.repository);

  Future<Either<Failure, void>> call() async {
    return await repository.stopTracking();
  }
}
