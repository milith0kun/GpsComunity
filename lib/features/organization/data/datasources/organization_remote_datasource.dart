import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../../domain/entities/member.dart';
import '../models/member_model.dart';
import '../models/organization_model.dart';

/// Fuente de datos remota para organizaciones
abstract class OrganizationRemoteDataSource {
  Future<OrganizationModel> createOrganization({
    required String name,
    required String displayName,
    String? description,
  });

  Future<List<OrganizationModel>> getMyOrganizations();

  Future<OrganizationModel> getOrganizationById(String id);

  Future<List<MemberModel>> getMembers(String organizationId);

  Future<void> inviteMember({
    required String organizationId,
    required String email,
    required MemberRole role,
    List<String>? groupIds,
  });
}

class OrganizationRemoteDataSourceImpl
    implements OrganizationRemoteDataSource {
  final Dio dio;

  OrganizationRemoteDataSourceImpl(this.dio);

  @override
  Future<OrganizationModel> createOrganization({
    required String name,
    required String displayName,
    String? description,
  }) async {
    try {
      final response = await dio.post(
        ApiConstants.organizations,
        data: {
          'name': name,
          'displayName': displayName,
          if (description != null) 'description': description,
        },
      );

      return OrganizationModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al crear organización',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<List<OrganizationModel>> getMyOrganizations() async {
    try {
      final response = await dio.get(ApiConstants.organizations);

      final List<dynamic> data = response.data['data']['items'];
      return data.map((json) => OrganizationModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message:
            e.response?.data['message'] ?? 'Error al obtener organizaciones',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<OrganizationModel> getOrganizationById(String id) async {
    try {
      final response = await dio.get(ApiConstants.organizationById(id));

      return OrganizationModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al obtener organización',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<List<MemberModel>> getMembers(String organizationId) async {
    try {
      final response = await dio.get(
        ApiConstants.organizationMembers(organizationId),
      );

      final List<dynamic> data = response.data['data']['items'];
      return data.map((json) => MemberModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al obtener miembros',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<void> inviteMember({
    required String organizationId,
    required String email,
    required MemberRole role,
    List<String>? groupIds,
  }) async {
    try {
      await dio.post(
        ApiConstants.organizationInvite(organizationId),
        data: {
          'email': email,
          'role': role.name,
          if (groupIds != null && groupIds.isNotEmpty) 'groupIds': groupIds,
        },
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al invitar miembro',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }
}
