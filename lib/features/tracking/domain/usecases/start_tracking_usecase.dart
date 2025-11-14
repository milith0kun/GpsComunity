import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../repositories/tracking_repository.dart';

/// Caso de uso para iniciar el rastreo
class StartTrackingUseCase {
  final TrackingRepository repository;

  StartTrackingUseCase(this.repository);

  Future<Either<Failure, void>> call() async {
    return await repository.startTracking();
  }
}
