import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/organization.dart';
import '../repositories/organization_repository.dart';

/// Caso de uso para obtener organizaciones del usuario
class GetMyOrganizationsUseCase {
  final OrganizationRepository repository;

  GetMyOrganizationsUseCase(this.repository);

  Future<Either<Failure, List<Organization>>> call() async {
    return await repository.getMyOrganizations();
  }
}
