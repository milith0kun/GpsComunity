import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/user.dart';

part 'user_model.g.dart';

/// Modelo de Usuario para serialización JSON
@JsonSerializable()
class UserModel extends User {
  const UserModel({
    required super.id,
    required super.email,
    super.phone,
    required super.displayName,
    super.photoURL,
    required super.authProvider,
    super.authProviderId,
    required super.status,
    required super.emailVerified,
    required super.phoneVerified,
    super.preferences,
    super.deviceInfo,
    required super.createdAt,
    required super.updatedAt,
    super.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  /// Convierte la entidad a modelo
  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      photoURL: user.photoURL,
      authProvider: user.authProvider,
      authProviderId: user.authProviderId,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      preferences: user.preferences,
      deviceInfo: user.deviceInfo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    );
  }
}

@JsonSerializable()
class UserPreferencesModel extends UserPreferences {
  const UserPreferencesModel({
    required super.language,
    required super.notifications,
    required super.privacy,
  });

  factory UserPreferencesModel.fromJson(Map<String, dynamic> json) =>
      _$UserPreferencesModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserPreferencesModelToJson(this);
}

@JsonSerializable()
class NotificationPreferencesModel extends NotificationPreferences {
  const NotificationPreferencesModel({
    required super.push,
    required super.email,
    required super.locationAlerts,
  });

  factory NotificationPreferencesModel.fromJson(Map<String, dynamic> json) =>
      _$NotificationPreferencesModelFromJson(json);

  Map<String, dynamic> toJson() => _$NotificationPreferencesModelToJson(this);
}

@JsonSerializable()
class PrivacyPreferencesModel extends PrivacyPreferences {
  const PrivacyPreferencesModel({
    required super.shareLocationHistory,
    required super.visibleToOthers,
  });

  factory PrivacyPreferencesModel.fromJson(Map<String, dynamic> json) =>
      _$PrivacyPreferencesModelFromJson(json);

  Map<String, dynamic> toJson() => _$PrivacyPreferencesModelToJson(this);
}

@JsonSerializable()
class DeviceInfoModel extends DeviceInfo {
  const DeviceInfoModel({
    required super.deviceId,
    required super.deviceName,
    required super.platform,
    required super.osVersion,
    required super.appVersion,
    required super.lastActive,
    super.pushToken,
    required super.isActive,
  });

  factory DeviceInfoModel.fromJson(Map<String, dynamic> json) =>
      _$DeviceInfoModelFromJson(json);

  Map<String, dynamic> toJson() => _$DeviceInfoModelToJson(this);
}
