import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/create_organization_usecase.dart';
import '../../domain/usecases/get_members_usecase.dart';
import '../../domain/usecases/get_my_organizations_usecase.dart';
import '../../domain/usecases/invite_member_usecase.dart';
import 'organization_event.dart';
import 'organization_state.dart';

/// BLoC para gestión de organizaciones
class OrganizationBloc extends Bloc<OrganizationEvent, OrganizationState> {
  final GetMyOrganizationsUseCase getMyOrganizationsUseCase;
  final CreateOrganizationUseCase createOrganizationUseCase;
  final GetMembersUseCase getMembersUseCase;
  final InviteMemberUseCase inviteMemberUseCase;

  OrganizationBloc({
    required this.getMyOrganizationsUseCase,
    required this.createOrganizationUseCase,
    required this.getMembersUseCase,
    required this.inviteMemberUseCase,
  }) : super(const OrganizationInitial()) {
    on<LoadMyOrganizations>(_onLoadMyOrganizations);
    on<SelectOrganization>(_onSelectOrganization);
    on<CreateOrganization>(_onCreateOrganization);
    on<LoadMembers>(_onLoadMembers);
    on<InviteMember>(_onInviteMember);
  }

  Future<void> _onLoadMyOrganizations(
    LoadMyOrganizations event,
    Emitter<OrganizationState> emit,
  ) async {
    emit(const OrganizationLoading());

    final result = await getMyOrganizationsUseCase();

    result.fold(
      (failure) => emit(OrganizationError(failure.message)),
      (organizations) => emit(OrganizationsLoaded(organizations: organizations)),
    );
  }

  Future<void> _onSelectOrganization(
    SelectOrganization event,
    Emitter<OrganizationState> emit,
  ) async {
    if (state is OrganizationsLoaded) {
      final currentState = state as OrganizationsLoaded;
      final selectedOrg = currentState.organizations
          .firstWhere((org) => org.id == event.organizationId);

      emit(OrganizationsLoaded(
        organizations: currentState.organizations,
        selectedOrganization: selectedOrg,
      ));
    }
  }

  Future<void> _onCreateOrganization(
    CreateOrganization event,
    Emitter<OrganizationState> emit,
  ) async {
    emit(const OrganizationLoading());

    final result = await createOrganizationUseCase(
      CreateOrganizationParams(
        name: event.name,
        displayName: event.displayName,
        description: event.description,
      ),
    );

    result.fold(
      (failure) => emit(OrganizationError(failure.message)),
      (organization) => emit(OrganizationCreated(organization)),
    );
  }

  Future<void> _onLoadMembers(
    LoadMembers event,
    Emitter<OrganizationState> emit,
  ) async {
    emit(const OrganizationLoading());

    final result = await getMembersUseCase(event.organizationId);

    result.fold(
      (failure) => emit(OrganizationError(failure.message)),
      (members) => emit(MembersLoaded(
        members: members,
        organizationId: event.organizationId,
      )),
    );
  }

  Future<void> _onInviteMember(
    InviteMember event,
    Emitter<OrganizationState> emit,
  ) async {
    emit(const OrganizationLoading());

    final result = await inviteMemberUseCase(
      InviteMemberParams(
        organizationId: event.organizationId,
        email: event.email,
        role: event.role,
        groupIds: event.groupIds,
      ),
    );

    result.fold(
      (failure) => emit(OrganizationError(failure.message)),
      (_) => emit(const MemberInvited()),
    );
  }
}
