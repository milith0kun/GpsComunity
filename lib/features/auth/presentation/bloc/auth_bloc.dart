import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_current_user_usecase.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/login_with_google_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// BLoC de autenticación
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;
  final LoginWithGoogleUseCase loginWithGoogleUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
    required this.getCurrentUserUseCase,
    required this.loginWithGoogleUseCase,
  }) : super(const AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<GetCurrentUserRequested>(_onGetCurrentUserRequested);
    on<LoginWithGoogleRequested>(_onLoginWithGoogleRequested);
  }

  /// Maneja el evento de login
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await loginUseCase(
      email: event.email,
      password: event.password,
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (credentials) async {
        emit(const LoginSuccess());
        // Obtener el usuario actual después del login
        add(const GetCurrentUserRequested());
      },
    );
  }

  /// Maneja el evento de registro
  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await registerUseCase(
      email: event.email,
      password: event.password,
      displayName: event.displayName,
      phone: event.phone,
    );

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (credentials) async {
        emit(const RegisterSuccess('Registro exitoso. Verifica tu email.'));
        // Obtener el usuario actual después del registro
        add(const GetCurrentUserRequested());
      },
    );
  }

  /// Maneja el evento de logout
  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await logoutUseCase();

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (_) => emit(const Unauthenticated()),
    );
  }

  /// Maneja el evento de verificar estado de autenticación
  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    // Intentar obtener el usuario actual
    final result = await getCurrentUserUseCase();

    result.fold(
      (failure) => emit(const Unauthenticated()),
      (user) => emit(Authenticated(user)),
    );
  }

  /// Maneja el evento de obtener usuario actual
  Future<void> _onGetCurrentUserRequested(
    GetCurrentUserRequested event,
    Emitter<AuthState> emit,
  ) async {
    final result = await getCurrentUserUseCase();

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(Authenticated(user)),
    );
  }

  /// Maneja el evento de login con Google
  Future<void> _onLoginWithGoogleRequested(
    LoginWithGoogleRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await loginWithGoogleUseCase();

    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (credentials) async {
        emit(const LoginSuccess());
        add(const GetCurrentUserRequested());
      },
    );
  }
}
