import 'package:equatable/equatable.dart';

/// Eventos de autenticación
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// Evento: Iniciar sesión con email y contraseña
class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [email, password];
}

/// Evento: Registrarse
class RegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String displayName;
  final String? phone;

  const RegisterRequested({
    required this.email,
    required this.password,
    required this.displayName,
    this.phone,
  });

  @override
  List<Object?> get props => [email, password, displayName, phone];
}

/// Evento: Iniciar sesión con Google
class LoginWithGoogleRequested extends AuthEvent {
  const LoginWithGoogleRequested();
}

/// Evento: Iniciar sesión con Apple
class LoginWithAppleRequested extends AuthEvent {
  const LoginWithAppleRequested();
}

/// Evento: Cerrar sesión
class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}

/// Evento: Verificar autenticación
class CheckAuthStatus extends AuthEvent {
  const CheckAuthStatus();
}

/// Evento: Obtener usuario actual
class GetCurrentUserRequested extends AuthEvent {
  const GetCurrentUserRequested();
}
