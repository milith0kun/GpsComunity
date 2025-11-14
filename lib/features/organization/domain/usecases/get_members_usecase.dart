import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/member.dart';
import '../repositories/organization_repository.dart';

/// Caso de uso para obtener miembros de una organización
class GetMembersUseCase {
  final OrganizationRepository repository;

  GetMembersUseCase(this.repository);

  Future<Either<Failure, List<Member>>> call(String organizationId) async {
    return await repository.getMembers(organizationId);
  }
}
