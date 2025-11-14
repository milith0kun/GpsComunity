import 'package:dartz/dartz.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/group.dart';
import '../../domain/entities/member.dart';
import '../../domain/entities/organization.dart';
import '../../domain/repositories/organization_repository.dart';
import '../datasources/organization_remote_datasource.dart';

/// Implementación del repositorio de organizaciones
class OrganizationRepositoryImpl implements OrganizationRepository {
  final OrganizationRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  OrganizationRepositoryImpl({
    required this.remoteDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, Organization>> createOrganization({
    required String name,
    required String displayName,
    String? description,
  }) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final organization = await remoteDataSource.createOrganization(
        name: name,
        displayName: displayName,
        description: description,
      );
      return Right(organization.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    }
  }

  @override
  Future<Either<Failure, List<Organization>>> getMyOrganizations() async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final organizations = await remoteDataSource.getMyOrganizations();
      return Right(organizations.map((o) => o.toEntity()).toList());
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    }
  }

  @override
  Future<Either<Failure, Organization>> getOrganizationById(String id) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final organization = await remoteDataSource.getOrganizationById(id);
      return Right(organization.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    }
  }

  @override
  Future<Either<Failure, List<Member>>> getMembers(String organizationId) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      final members = await remoteDataSource.getMembers(organizationId);
      return Right(members.map((m) => m.toEntity()).toList());
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    }
  }

  @override
  Future<Either<Failure, void>> inviteMember({
    required String organizationId,
    required String email,
    required MemberRole role,
    List<String>? groupIds,
  }) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure());
    }

    try {
      await remoteDataSource.inviteMember(
        organizationId: organizationId,
        email: email,
        role: role,
        groupIds: groupIds,
      );
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(
        message: e.message,
        statusCode: e.statusCode,
      ));
    }
  }

  // Métodos pendientes de implementación completa
  @override
  Future<Either<Failure, Organization>> updateOrganization({
    required String id,
    String? name,
    String? displayName,
    String? description,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, void>> deleteOrganization(String id) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, OrganizationSettings>> updateOrganizationSettings({
    required String organizationId,
    required OrganizationSettings settings,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, List<Group>>> getGroups(String organizationId) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Group>> createGroup({
    required String organizationId,
    required String name,
    String? description,
    required GroupType type,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Group>> updateGroup({
    required String organizationId,
    required String groupId,
    String? name,
    String? description,
    bool? trackingEnabled,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, void>> deleteGroup({
    required String organizationId,
    required String groupId,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Member>> getMemberById({
    required String organizationId,
    required String memberId,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Member>> updateMemberRole({
    required String organizationId,
    required String memberId,
    required MemberRole role,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Member>> assignMemberToGroups({
    required String organizationId,
    required String memberId,
    required List<String> groupIds,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, void>> removeMember({
    required String organizationId,
    required String memberId,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }

  @override
  Future<Either<Failure, Member>> updateMemberTrackingStatus({
    required String organizationId,
    required String memberId,
    required bool isActive,
  }) {
    // TODO: Implementar
    throw UnimplementedError();
  }
}
