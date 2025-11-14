import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../entities/organization.dart';
import '../repositories/organization_repository.dart';

/// Caso de uso para crear organización
class CreateOrganizationUseCase {
  final OrganizationRepository repository;

  CreateOrganizationUseCase(this.repository);

  Future<Either<Failure, Organization>> call(Params params) async {
    return await repository.createOrganization(
      name: params.name,
      displayName: params.displayName,
      description: params.description,
    );
  }
}

class Params extends Equatable {
  final String name;
  final String displayName;
  final String? description;

  const Params({
    required this.name,
    required this.displayName,
    this.description,
  });

  @override
  List<Object?> get props => [name, displayName, description];
}
