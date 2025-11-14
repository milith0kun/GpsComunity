import 'package:equatable/equatable.dart';

/// Clase base abstracta para todos los fallos
abstract class Failure extends Equatable {
  final String message;
  final int? code;

  const Failure(this.message, {this.code});

  @override
  List<Object?> get props => [message, code];
}

/// Fallo del servidor
class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.code});
}

/// Fallo de caché
class CacheFailure extends Failure {
  const CacheFailure(super.message, {super.code});
}

/// Fallo de red
class NetworkFailure extends Failure {
  const NetworkFailure(super.message, {super.code});
}

/// Fallo de autenticación
class AuthFailure extends Failure {
  const AuthFailure(super.message, {super.code});
}

/// Fallo de validación
class ValidationFailure extends Failure {
  const ValidationFailure(super.message, {super.code});
}

/// Fallo de permisos
class PermissionFailure extends Failure {
  const PermissionFailure(super.message, {super.code});
}

/// Fallo de ubicación
class LocationFailure extends Failure {
  const LocationFailure(super.message, {super.code});
}

/// Fallo de límites del plan
class PlanLimitFailure extends Failure {
  const PlanLimitFailure(super.message, {super.code});
}

/// Fallo no encontrado (404)
class NotFoundFailure extends Failure {
  const NotFoundFailure(super.message, {super.code});
}

/// Fallo de timeout
class TimeoutFailure extends Failure {
  const TimeoutFailure(super.message, {super.code});
}

/// Fallo desconocido
class UnknownFailure extends Failure {
  const UnknownFailure(super.message, {super.code});
}
