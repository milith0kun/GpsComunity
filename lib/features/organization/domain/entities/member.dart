import 'package:equatable/equatable.dart';

/// Entidad de miembro de una organización
class Member extends Equatable {
  final String id;
  final String userId;
  final String organizationId;
  final List<String> groupIds;
  final MemberRole role;
  final MemberPermissions permissions;
  final bool trackingConsentGiven;
  final DateTime? trackingConsentDate;
  final bool isTrackingActive;
  final MemberStatus status;
  final String? invitedBy;
  final DateTime? invitedAt;
  final DateTime? joinedAt;
  final DateTime? lastActiveAt;

  const Member({
    required this.id,
    required this.userId,
    required this.organizationId,
    required this.groupIds,
    required this.role,
    required this.permissions,
    required this.trackingConsentGiven,
    this.trackingConsentDate,
    required this.isTrackingActive,
    required this.status,
    this.invitedBy,
    this.invitedAt,
    this.joinedAt,
    this.lastActiveAt,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        organizationId,
        groupIds,
        role,
        permissions,
        trackingConsentGiven,
        trackingConsentDate,
        isTrackingActive,
        status,
        invitedBy,
        invitedAt,
        joinedAt,
        lastActiveAt,
      ];
}

/// Rol del miembro
enum MemberRole {
  owner,
  admin,
  manager,
  member,
}

/// Permisos del miembro
class MemberPermissions extends Equatable {
  final bool canViewAll;
  final bool canViewHistory;
  final bool canExportData;
  final bool canManageMembers;
  final bool canManageGroups;
  final bool canManageSettings;
  final bool canCreateGeofences;

  const MemberPermissions({
    required this.canViewAll,
    required this.canViewHistory,
    required this.canExportData,
    required this.canManageMembers,
    required this.canManageGroups,
    required this.canManageSettings,
    required this.canCreateGeofences,
  });

  /// Permisos según rol
  factory MemberPermissions.fromRole(MemberRole role) {
    switch (role) {
      case MemberRole.owner:
        return const MemberPermissions(
          canViewAll: true,
          canViewHistory: true,
          canExportData: true,
          canManageMembers: true,
          canManageGroups: true,
          canManageSettings: true,
          canCreateGeofences: true,
        );
      case MemberRole.admin:
        return const MemberPermissions(
          canViewAll: true,
          canViewHistory: true,
          canExportData: true,
          canManageMembers: true,
          canManageGroups: true,
          canManageSettings: true,
          canCreateGeofences: true,
        );
      case MemberRole.manager:
        return const MemberPermissions(
          canViewAll: false,
          canViewHistory: true,
          canExportData: false,
          canManageMembers: false,
          canManageGroups: false,
          canManageSettings: false,
          canCreateGeofences: false,
        );
      case MemberRole.member:
        return const MemberPermissions(
          canViewAll: false,
          canViewHistory: false,
          canExportData: false,
          canManageMembers: false,
          canManageGroups: false,
          canManageSettings: false,
          canCreateGeofences: false,
        );
    }
  }

  @override
  List<Object?> get props => [
        canViewAll,
        canViewHistory,
        canExportData,
        canManageMembers,
        canManageGroups,
        canManageSettings,
        canCreateGeofences,
      ];
}

/// Estado del miembro
enum MemberStatus {
  active,
  inactive,
  pending,
  removed,
}
