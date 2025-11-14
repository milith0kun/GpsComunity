import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/member.dart';

part 'member_model.g.dart';

/// Modelo de datos para miembro
@JsonSerializable()
class MemberModel extends Member {
  const MemberModel({
    required super.id,
    required super.userId,
    required super.organizationId,
    required super.groupIds,
    required super.role,
    required super.permissions,
    required super.trackingConsentGiven,
    super.trackingConsentDate,
    required super.isTrackingActive,
    required super.status,
    super.invitedBy,
    super.invitedAt,
    super.joinedAt,
    super.lastActiveAt,
  });

  factory MemberModel.fromJson(Map<String, dynamic> json) =>
      _$MemberModelFromJson(json);

  Map<String, dynamic> toJson() => _$MemberModelToJson(this);

  factory MemberModel.fromEntity(Member member) {
    return MemberModel(
      id: member.id,
      userId: member.userId,
      organizationId: member.organizationId,
      groupIds: member.groupIds,
      role: member.role,
      permissions: member.permissions,
      trackingConsentGiven: member.trackingConsentGiven,
      trackingConsentDate: member.trackingConsentDate,
      isTrackingActive: member.isTrackingActive,
      status: member.status,
      invitedBy: member.invitedBy,
      invitedAt: member.invitedAt,
      joinedAt: member.joinedAt,
      lastActiveAt: member.lastActiveAt,
    );
  }

  Member toEntity() => this;
}
