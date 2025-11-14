import 'package:equatable/equatable.dart';

/// Entidad de organización
class Organization extends Equatable {
  final String id;
  final String name;
  final String displayName;
  final String? description;
  final String ownerId;
  final SubscriptionPlan plan;
  final SubscriptionStatus status;
  final DateTime? subscriptionEndDate;
  final int maxUsers;
  final List<String> features;
  final OrganizationSettings? settings;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Organization({
    required this.id,
    required this.name,
    required this.displayName,
    this.description,
    required this.ownerId,
    required this.plan,
    required this.status,
    this.subscriptionEndDate,
    required this.maxUsers,
    required this.features,
    this.settings,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        displayName,
        description,
        ownerId,
        plan,
        status,
        subscriptionEndDate,
        maxUsers,
        features,
        settings,
        createdAt,
        updatedAt,
      ];
}

/// Plan de suscripción
enum SubscriptionPlan {
  free,
  basic,
  pro,
  enterprise,
}

/// Estado de la suscripción
enum SubscriptionStatus {
  active,
  trial,
  expired,
  cancelled,
}

/// Configuración de la organización
class OrganizationSettings extends Equatable {
  final int trackingIntervalSeconds;
  final LocationAccuracy trackingAccuracy;
  final bool geofencingEnabled;
  final int dataRetentionDays;
  final bool allowHistoryExport;

  const OrganizationSettings({
    required this.trackingIntervalSeconds,
    required this.trackingAccuracy,
    required this.geofencingEnabled,
    required this.dataRetentionDays,
    required this.allowHistoryExport,
  });

  factory OrganizationSettings.defaults() {
    return const OrganizationSettings(
      trackingIntervalSeconds: 60,
      trackingAccuracy: LocationAccuracy.balanced,
      geofencingEnabled: false,
      dataRetentionDays: 30,
      allowHistoryExport: true,
    );
  }

  @override
  List<Object?> get props => [
        trackingIntervalSeconds,
        trackingAccuracy,
        geofencingEnabled,
        dataRetentionDays,
        allowHistoryExport,
      ];
}

enum LocationAccuracy {
  high,
  balanced,
  low,
}
