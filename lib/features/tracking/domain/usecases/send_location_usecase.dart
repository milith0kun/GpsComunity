import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/location.dart';
import '../repositories/tracking_repository.dart';

/// Caso de uso para enviar ubicación al servidor
class SendLocationUseCase {
  final TrackingRepository repository;

  SendLocationUseCase(this.repository);

  Future<Either<Failure, void>> call(Location location) async {
    return await repository.sendLocation(location);
  }
}
