import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../entities/member.dart';
import '../repositories/organization_repository.dart';

/// Caso de uso para invitar miembro a organización
class InviteMemberUseCase {
  final OrganizationRepository repository;

  InviteMemberUseCase(this.repository);

  Future<Either<Failure, void>> call(Params params) async {
    return await repository.inviteMember(
      organizationId: params.organizationId,
      email: params.email,
      role: params.role,
      groupIds: params.groupIds,
    );
  }
}

class Params extends Equatable {
  final String organizationId;
  final String email;
  final MemberRole role;
  final List<String>? groupIds;

  const Params({
    required this.organizationId,
    required this.email,
    required this.role,
    this.groupIds,
  });

  @override
  List<Object?> get props => [organizationId, email, role, groupIds];
}
