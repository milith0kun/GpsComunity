import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/auth_credentials_model.dart';
import '../models/user_model.dart';

/// Fuente de datos remota para autenticación
abstract class AuthRemoteDataSource {
  /// Registra un nuevo usuario
  Future<AuthCredentialsModel> register({
    required String email,
    required String password,
    required String displayName,
    String? phone,
  });

  /// Inicia sesión
  Future<AuthCredentialsModel> login({
    required String email,
    required String password,
  });

  /// Cierra sesión
  Future<void> logout();

  /// Refresca el token
  Future<AuthCredentialsModel> refreshToken(String refreshToken);

  /// Envía correo de recuperación de contraseña
  Future<void> forgotPassword(String email);

  /// Resetea la contraseña
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  });

  /// Verifica el email
  Future<void> verifyEmail(String token);

  /// Obtiene el usuario actual
  Future<UserModel> getCurrentUser();
}

/// Implementación de la fuente de datos remota
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl(this.dio);

  @override
  Future<AuthCredentialsModel> register({
    required String email,
    required String password,
    required String displayName,
    String? phone,
  }) async {
    try {
      final response = await dio.post(
        ApiConstants.authRegister,
        data: {
          'email': email,
          'password': password,
          'displayName': displayName,
          if (phone != null) 'phone': phone,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AuthCredentialsModel.fromJson(response.data['data']);
      } else {
        throw ServerException(
          'Error al registrar usuario',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<AuthCredentialsModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dio.post(
        ApiConstants.authLogin,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        return AuthCredentialsModel.fromJson(response.data['data']);
      } else {
        throw ServerException(
          'Error al iniciar sesión',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<void> logout() async {
    try {
      final response = await dio.post(ApiConstants.authLogout);

      if (response.statusCode != 200) {
        throw ServerException(
          'Error al cerrar sesión',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<AuthCredentialsModel> refreshToken(String refreshToken) async {
    try {
      final response = await dio.post(
        ApiConstants.authRefreshToken,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        return AuthCredentialsModel.fromJson(response.data['data']);
      } else {
        throw ServerException(
          'Error al refrescar token',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<void> forgotPassword(String email) async {
    try {
      final response = await dio.post(
        ApiConstants.authForgotPassword,
        data: {'email': email},
      );

      if (response.statusCode != 200) {
        throw ServerException(
          'Error al enviar correo de recuperación',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await dio.post(
        ApiConstants.authResetPassword,
        data: {
          'token': token,
          'newPassword': newPassword,
        },
      );

      if (response.statusCode != 200) {
        throw ServerException(
          'Error al resetear contraseña',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<void> verifyEmail(String token) async {
    try {
      final response = await dio.post(
        ApiConstants.authVerifyEmail,
        data: {'token': token},
      );

      if (response.statusCode != 200) {
        throw ServerException(
          'Error al verificar email',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await dio.get(ApiConstants.authMe);

      if (response.statusCode == 200) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw ServerException(
          'Error al obtener usuario actual',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Maneja los errores de Dio y los convierte en excepciones personalizadas
  Exception _handleDioError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return TimeoutException('Tiempo de espera agotado');
    }

    if (error.type == DioExceptionType.connectionError) {
      return NetworkException('Error de conexión. Verifica tu internet.');
    }

    if (error.response != null) {
      final statusCode = error.response?.statusCode;
      final message = error.response?.data?['error']?['message'] ??
          error.response?.data?['message'] ??
          'Error del servidor';

      if (statusCode == 401) {
        return AuthException(message, code: 'UNAUTHORIZED');
      } else if (statusCode == 403) {
        return PermissionException(message, 'FORBIDDEN');
      } else if (statusCode == 404) {
        return ServerException('Recurso no encontrado', statusCode: 404);
      } else if (statusCode == 422) {
        return ValidationException(
          message,
          errors: error.response?.data?['error']?['details'],
        );
      } else {
        return ServerException(message, statusCode: statusCode);
      }
    }

    return ServerException('Error desconocido');
  }
}
