import 'package:equatable/equatable.dart';

/// Credenciales de autenticación
class AuthCredentials extends Equatable {
  final String accessToken;
  final String refreshToken;
  final String userId;
  final DateTime expiresAt;

  const AuthCredentials({
    required this.accessToken,
    required this.refreshToken,
    required this.userId,
    required this.expiresAt,
  });

  /// Verifica si el token ha expirado
  bool get isExpired => DateTime.now().isAfter(expiresAt);

  @override
  List<Object?> get props => [accessToken, refreshToken, userId, expiresAt];
}
