import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/auth_credentials_model.dart';

/// Fuente de datos local para autenticación
abstract class AuthLocalDataSource {
  /// Guarda las credenciales
  Future<void> saveCredentials(AuthCredentialsModel credentials);

  /// Obtiene las credenciales guardadas
  Future<AuthCredentialsModel?> getCredentials();

  /// Limpia las credenciales
  Future<void> clearCredentials();

  /// Obtiene el token de acceso
  Future<String?> getAccessToken();

  /// Verifica si hay credenciales guardadas
  Future<bool> hasCredentials();
}

/// Implementación de la fuente de datos local
class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SharedPreferences sharedPreferences;

  AuthLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<void> saveCredentials(AuthCredentialsModel credentials) async {
    try {
      await sharedPreferences.setString(
        AppConstants.prefKeyToken,
        credentials.accessToken,
      );
      await sharedPreferences.setString(
        AppConstants.prefKeyRefreshToken,
        credentials.refreshToken,
      );
      await sharedPreferences.setString(
        AppConstants.prefKeyUserId,
        credentials.userId,
      );
    } catch (e) {
      throw CacheException('Error al guardar credenciales');
    }
  }

  @override
  Future<AuthCredentialsModel?> getCredentials() async {
    try {
      final accessToken = sharedPreferences.getString(AppConstants.prefKeyToken);
      final refreshToken =
          sharedPreferences.getString(AppConstants.prefKeyRefreshToken);
      final userId = sharedPreferences.getString(AppConstants.prefKeyUserId);

      if (accessToken == null || refreshToken == null || userId == null) {
        return null;
      }

      // Calcular fecha de expiración (por defecto 7 días desde ahora)
      final expiresAt = DateTime.now().add(
        Duration(days: AppConstants.tokenExpirationDays),
      );

      return AuthCredentialsModel(
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: userId,
        expiresAt: expiresAt,
      );
    } catch (e) {
      throw CacheException('Error al obtener credenciales');
    }
  }

  @override
  Future<void> clearCredentials() async {
    try {
      await sharedPreferences.remove(AppConstants.prefKeyToken);
      await sharedPreferences.remove(AppConstants.prefKeyRefreshToken);
      await sharedPreferences.remove(AppConstants.prefKeyUserId);
    } catch (e) {
      throw CacheException('Error al limpiar credenciales');
    }
  }

  @override
  Future<String?> getAccessToken() async {
    try {
      return sharedPreferences.getString(AppConstants.prefKeyToken);
    } catch (e) {
      throw CacheException('Error al obtener token de acceso');
    }
  }

  @override
  Future<bool> hasCredentials() async {
    try {
      final accessToken = sharedPreferences.getString(AppConstants.prefKeyToken);
      return accessToken != null;
    } catch (e) {
      return false;
    }
  }
}
