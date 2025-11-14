import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/auth_credentials.dart';

part 'auth_credentials_model.g.dart';

/// Modelo de credenciales de autenticación para serialización JSON
@JsonSerializable()
class AuthCredentialsModel extends AuthCredentials {
  const AuthCredentialsModel({
    required super.accessToken,
    required super.refreshToken,
    required super.userId,
    required super.expiresAt,
  });

  factory AuthCredentialsModel.fromJson(Map<String, dynamic> json) =>
      _$AuthCredentialsModelFromJson(json);

  Map<String, dynamic> toJson() => _$AuthCredentialsModelToJson(this);

  /// Convierte la entidad a modelo
  factory AuthCredentialsModel.fromEntity(AuthCredentials credentials) {
    return AuthCredentialsModel(
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      userId: credentials.userId,
      expiresAt: credentials.expiresAt,
    );
  }
}
