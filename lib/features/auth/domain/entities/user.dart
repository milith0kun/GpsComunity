import 'package:equatable/equatable.dart';

/// Entidad de Usuario
class User extends Equatable {
  final String id;
  final String email;
  final String? phone;
  final String displayName;
  final String? photoURL;
  final String authProvider;
  final String? authProviderId;
  final String status;
  final bool emailVerified;
  final bool phoneVerified;
  final UserPreferences? preferences;
  final List<DeviceInfo>? deviceInfo;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastLoginAt;

  const User({
    required this.id,
    required this.email,
    this.phone,
    required this.displayName,
    this.photoURL,
    required this.authProvider,
    this.authProviderId,
    required this.status,
    required this.emailVerified,
    required this.phoneVerified,
    this.preferences,
    this.deviceInfo,
    required this.createdAt,
    required this.updatedAt,
    this.lastLoginAt,
  });

  @override
  List<Object?> get props => [
        id,
        email,
        phone,
        displayName,
        photoURL,
        authProvider,
        authProviderId,
        status,
        emailVerified,
        phoneVerified,
        preferences,
        deviceInfo,
        createdAt,
        updatedAt,
        lastLoginAt,
      ];
}

/// Preferencias de usuario
class UserPreferences extends Equatable {
  final String language;
  final NotificationPreferences notifications;
  final PrivacyPreferences privacy;

  const UserPreferences({
    required this.language,
    required this.notifications,
    required this.privacy,
  });

  @override
  List<Object?> get props => [language, notifications, privacy];
}

/// Preferencias de notificaciones
class NotificationPreferences extends Equatable {
  final bool push;
  final bool email;
  final bool locationAlerts;

  const NotificationPreferences({
    required this.push,
    required this.email,
    required this.locationAlerts,
  });

  @override
  List<Object?> get props => [push, email, locationAlerts];
}

/// Preferencias de privacidad
class PrivacyPreferences extends Equatable {
  final bool shareLocationHistory;
  final bool visibleToOthers;

  const PrivacyPreferences({
    required this.shareLocationHistory,
    required this.visibleToOthers,
  });

  @override
  List<Object?> get props => [shareLocationHistory, visibleToOthers];
}

/// Información del dispositivo
class DeviceInfo extends Equatable {
  final String deviceId;
  final String deviceName;
  final String platform;
  final String osVersion;
  final String appVersion;
  final DateTime lastActive;
  final String? pushToken;
  final bool isActive;

  const DeviceInfo({
    required this.deviceId,
    required this.deviceName,
    required this.platform,
    required this.osVersion,
    required this.appVersion,
    required this.lastActive,
    this.pushToken,
    required this.isActive,
  });

  @override
  List<Object?> get props => [
        deviceId,
        deviceName,
        platform,
        osVersion,
        appVersion,
        lastActive,
        pushToken,
        isActive,
      ];
}
