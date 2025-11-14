import 'package:equatable/equatable.dart';
import '../../domain/entities/user.dart';

/// Estados de autenticación
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// Estado: Cargando
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// Estado: Autenticado
class Authenticated extends AuthState {
  final User user;

  const Authenticated(this.user);

  @override
  List<Object?> get props => [user];
}

/// Estado: No autenticado
class Unauthenticated extends AuthState {
  const Unauthenticated();
}

/// Estado: Error
class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

/// Estado: Registro exitoso
class RegisterSuccess extends AuthState {
  final String message;

  const RegisterSuccess(this.message);

  @override
  List<Object?> get props => [message];
}

/// Estado: Login exitoso (transición antes de Authenticated)
class LoginSuccess extends AuthState {
  const LoginSuccess();
}
