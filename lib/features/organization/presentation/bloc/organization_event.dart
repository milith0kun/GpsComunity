import 'package:equatable/equatable.dart';

import '../../domain/entities/member.dart';

/// Eventos del BLoC de organización
abstract class OrganizationEvent extends Equatable {
  const OrganizationEvent();

  @override
  List<Object?> get props => [];
}

/// Cargar organizaciones del usuario
class LoadMyOrganizations extends OrganizationEvent {
  const LoadMyOrganizations();
}

/// Seleccionar organización
class SelectOrganization extends OrganizationEvent {
  final String organizationId;

  const SelectOrganization(this.organizationId);

  @override
  List<Object?> get props => [organizationId];
}

/// Crear organización
class CreateOrganization extends OrganizationEvent {
  final String name;
  final String displayName;
  final String? description;

  const CreateOrganization({
    required this.name,
    required this.displayName,
    this.description,
  });

  @override
  List<Object?> get props => [name, displayName, description];
}

/// Cargar miembros
class LoadMembers extends OrganizationEvent {
  final String organizationId;

  const LoadMembers(this.organizationId);

  @override
  List<Object?> get props => [organizationId];
}

/// Invitar miembro
class InviteMember extends OrganizationEvent {
  final String organizationId;
  final String email;
  final MemberRole role;
  final List<String>? groupIds;

  const InviteMember({
    required this.organizationId,
    required this.email,
    required this.role,
    this.groupIds,
  });

  @override
  List<Object?> get props => [organizationId, email, role, groupIds];
}
