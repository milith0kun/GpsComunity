import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/auth_credentials.dart';
import '../repositories/auth_repository.dart';

/// Caso de uso para iniciar sesión con Google
class LoginWithGoogleUseCase {
  final AuthRepository repository;

  LoginWithGoogleUseCase(this.repository);

  Future<Either<Failure, AuthCredentials>> call() async {
    return await repository.loginWithGoogle();
  }
}
