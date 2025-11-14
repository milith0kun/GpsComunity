import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../entities/location.dart';
import '../repositories/tracking_repository.dart';

/// Caso de uso para obtener historial de ubicaciones
class GetLocationHistoryUseCase {
  final TrackingRepository repository;

  GetLocationHistoryUseCase(this.repository);

  Future<Either<Failure, List<Location>>> call(Params params) async {
    return await repository.getLocationHistory(
      userId: params.userId,
      startDate: params.startDate,
      endDate: params.endDate,
    );
  }
}

class Params extends Equatable {
  final String userId;
  final DateTime startDate;
  final DateTime endDate;

  const Params({
    required this.userId,
    required this.startDate,
    required this.endDate,
  });

  @override
  List<Object?> get props => [userId, startDate, endDate];
}
