import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/organization.dart';

part 'organization_model.g.dart';

/// Modelo de datos para organización
@JsonSerializable()
class OrganizationModel extends Organization {
  const OrganizationModel({
    required super.id,
    required super.name,
    required super.displayName,
    super.description,
    required super.ownerId,
    required super.plan,
    required super.status,
    super.subscriptionEndDate,
    required super.maxUsers,
    required super.features,
    super.settings,
    required super.createdAt,
    required super.updatedAt,
  });

  factory OrganizationModel.fromJson(Map<String, dynamic> json) =>
      _$OrganizationModelFromJson(json);

  Map<String, dynamic> toJson() => _$OrganizationModelToJson(this);

  factory OrganizationModel.fromEntity(Organization organization) {
    return OrganizationModel(
      id: organization.id,
      name: organization.name,
      displayName: organization.displayName,
      description: organization.description,
      ownerId: organization.ownerId,
      plan: organization.plan,
      status: organization.status,
      subscriptionEndDate: organization.subscriptionEndDate,
      maxUsers: organization.maxUsers,
      features: organization.features,
      settings: organization.settings,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    );
  }

  Organization toEntity() => this;
}
