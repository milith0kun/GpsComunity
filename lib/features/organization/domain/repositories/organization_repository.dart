import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/group.dart';
import '../entities/member.dart';
import '../entities/organization.dart';

/// Repositorio para gestión de organizaciones
abstract class OrganizationRepository {
  // ========== Organizaciones ==========

  /// Crea una nueva organización
  Future<Either<Failure, Organization>> createOrganization({
    required String name,
    required String displayName,
    String? description,
  });

  /// Obtiene las organizaciones del usuario actual
  Future<Either<Failure, List<Organization>>> getMyOrganizations();

  /// Obtiene una organización por ID
  Future<Either<Failure, Organization>> getOrganizationById(String id);

  /// Actualiza una organización
  Future<Either<Failure, Organization>> updateOrganization({
    required String id,
    String? name,
    String? displayName,
    String? description,
  });

  /// Elimina una organización
  Future<Either<Failure, void>> deleteOrganization(String id);

  /// Actualiza la configuración de una organización
  Future<Either<Failure, OrganizationSettings>> updateOrganizationSettings({
    required String organizationId,
    required OrganizationSettings settings,
  });

  // ========== Grupos ==========

  /// Obtiene los grupos de una organización
  Future<Either<Failure, List<Group>>> getGroups(String organizationId);

  /// Crea un nuevo grupo
  Future<Either<Failure, Group>> createGroup({
    required String organizationId,
    required String name,
    String? description,
    required GroupType type,
  });

  /// Actualiza un grupo
  Future<Either<Failure, Group>> updateGroup({
    required String organizationId,
    required String groupId,
    String? name,
    String? description,
    bool? trackingEnabled,
  });

  /// Elimina un grupo
  Future<Either<Failure, void>> deleteGroup({
    required String organizationId,
    required String groupId,
  });

  // ========== Miembros ==========

  /// Obtiene los miembros de una organización
  Future<Either<Failure, List<Member>>> getMembers(String organizationId);

  /// Invita un usuario a la organización
  Future<Either<Failure, void>> inviteMember({
    required String organizationId,
    required String email,
    required MemberRole role,
    List<String>? groupIds,
  });

  /// Obtiene un miembro por ID
  Future<Either<Failure, Member>> getMemberById({
    required String organizationId,
    required String memberId,
  });

  /// Actualiza el rol de un miembro
  Future<Either<Failure, Member>> updateMemberRole({
    required String organizationId,
    required String memberId,
    required MemberRole role,
  });

  /// Asigna un miembro a grupos
  Future<Either<Failure, Member>> assignMemberToGroups({
    required String organizationId,
    required String memberId,
    required List<String> groupIds,
  });

  /// Remueve un miembro de la organización
  Future<Either<Failure, void>> removeMember({
    required String organizationId,
    required String memberId,
  });

  /// Actualiza el estado de tracking de un miembro
  Future<Either<Failure, Member>> updateMemberTrackingStatus({
    required String organizationId,
    required String memberId,
    required bool isActive,
  });
}
