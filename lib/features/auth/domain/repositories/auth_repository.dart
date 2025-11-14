import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/auth_credentials.dart';
import '../entities/user.dart';

/// Repositorio de autenticación (contrato)
abstract class AuthRepository {
  /// Registra un nuevo usuario con email y contraseña
  Future<Either<Failure, AuthCredentials>> register({
    required String email,
    required String password,
    required String displayName,
    String? phone,
  });

  /// Inicia sesión con email y contraseña
  Future<Either<Failure, AuthCredentials>> login({
    required String email,
    required String password,
  });

  /// Inicia sesión con Google
  Future<Either<Failure, AuthCredentials>> loginWithGoogle();

  /// Inicia sesión con Apple
  Future<Either<Failure, AuthCredentials>> loginWithApple();

  /// Cierra sesión
  Future<Either<Failure, void>> logout();

  /// Refresca el token de acceso
  Future<Either<Failure, AuthCredentials>> refreshToken(String refreshToken);

  /// Envía correo de recuperación de contraseña
  Future<Either<Failure, void>> forgotPassword(String email);

  /// Resetea la contraseña
  Future<Either<Failure, void>> resetPassword({
    required String token,
    required String newPassword,
  });

  /// Verifica el email
  Future<Either<Failure, void>> verifyEmail(String token);

  /// Obtiene el usuario actual
  Future<Either<Failure, User>> getCurrentUser();

  /// Verifica si hay un usuario autenticado
  Future<bool> isAuthenticated();

  /// Obtiene el token de acceso almacenado
  Future<String?> getAccessToken();

  /// Guarda las credenciales de autenticación
  Future<void> saveCredentials(AuthCredentials credentials);

  /// Limpia las credenciales almacenadas
  Future<void> clearCredentials();
}
