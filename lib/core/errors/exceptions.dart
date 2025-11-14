/// Excepción del servidor
class ServerException implements Exception {
  final String message;
  final int? statusCode;

  ServerException(this.message, {this.statusCode});

  @override
  String toString() => 'ServerException: $message (Status: $statusCode)';
}

/// Excepción de caché
class CacheException implements Exception {
  final String message;

  CacheException(this.message);

  @override
  String toString() => 'CacheException: $message';
}

/// Excepción de red
class NetworkException implements Exception {
  final String message;

  NetworkException(this.message);

  @override
  String toString() => 'NetworkException: $message';
}

/// Excepción de autenticación
class AuthException implements Exception {
  final String message;
  final String? code;

  AuthException(this.message, {this.code});

  @override
  String toString() => 'AuthException: $message (Code: $code)';
}

/// Excepción de validación
class ValidationException implements Exception {
  final String message;
  final Map<String, dynamic>? errors;

  ValidationException(this.message, {this.errors});

  @override
  String toString() => 'ValidationException: $message';
}

/// Excepción de permisos
class PermissionException implements Exception {
  final String message;
  final String permission;

  PermissionException(this.message, this.permission);

  @override
  String toString() => 'PermissionException: $message (Permission: $permission)';
}

/// Excepción de ubicación
class LocationException implements Exception {
  final String message;
  final String? code;

  LocationException(this.message, {this.code});

  @override
  String toString() => 'LocationException: $message';
}

/// Excepción de límites del plan
class PlanLimitException implements Exception {
  final String message;
  final String limit;

  PlanLimitException(this.message, this.limit);

  @override
  String toString() => 'PlanLimitException: $message (Limit: $limit)';
}

/// Excepción de timeout
class TimeoutException implements Exception {
  final String message;

  TimeoutException(this.message);

  @override
  String toString() => 'TimeoutException: $message';
}
