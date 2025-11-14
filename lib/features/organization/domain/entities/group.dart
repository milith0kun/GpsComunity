import 'package:equatable/equatable.dart';

/// Entidad de grupo dentro de una organización
class Group extends Equatable {
  final String id;
  final String organizationId;
  final String name;
  final String? description;
  final GroupType type;
  final bool trackingEnabled;
  final int? customTrackingInterval;
  final GroupStatus status;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Group({
    required this.id,
    required this.organizationId,
    required this.name,
    this.description,
    required this.type,
    required this.trackingEnabled,
    this.customTrackingInterval,
    required this.status,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        organizationId,
        name,
        description,
        type,
        trackingEnabled,
        customTrackingInterval,
        status,
        createdBy,
        createdAt,
        updatedAt,
      ];
}

/// Tipo de grupo
enum GroupType {
  department,
  team,
  project,
  custom,
}

/// Estado del grupo
enum GroupStatus {
  active,
  archived,
}
