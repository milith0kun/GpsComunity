import 'package:equatable/equatable.dart';

import '../../domain/entities/member.dart';
import '../../domain/entities/organization.dart';

/// Estados del BLoC de organización
abstract class OrganizationState extends Equatable {
  const OrganizationState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial
class OrganizationInitial extends OrganizationState {
  const OrganizationInitial();
}

/// Cargando
class OrganizationLoading extends OrganizationState {
  const OrganizationLoading();
}

/// Organizaciones cargadas
class OrganizationsLoaded extends OrganizationState {
  final List<Organization> organizations;
  final Organization? selectedOrganization;

  const OrganizationsLoaded({
    required this.organizations,
    this.selectedOrganization,
  });

  @override
  List<Object?> get props => [organizations, selectedOrganization];
}

/// Organización creada
class OrganizationCreated extends OrganizationState {
  final Organization organization;

  const OrganizationCreated(this.organization);

  @override
  List<Object?> get props => [organization];
}

/// Miembros cargados
class MembersLoaded extends OrganizationState {
  final List<Member> members;
  final String organizationId;

  const MembersLoaded({
    required this.members,
    required this.organizationId,
  });

  @override
  List<Object?> get props => [members, organizationId];
}

/// Miembro invitado
class MemberInvited extends OrganizationState {
  const MemberInvited();
}

/// Error
class OrganizationError extends OrganizationState {
  final String message;

  const OrganizationError(this.message);

  @override
  List<Object?> get props => [message];
}
