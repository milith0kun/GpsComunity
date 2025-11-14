import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/auth_credentials.dart';
import '../repositories/auth_repository.dart';

/// Caso de uso para registrar usuario
class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<Either<Failure, AuthCredentials>> call({
    required String email,
    required String password,
    required String displayName,
    String? phone,
  }) async {
    return await repository.register(
      email: email,
      password: password,
      displayName: displayName,
      phone: phone,
    );
  }
}
