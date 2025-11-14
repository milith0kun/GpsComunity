import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/location_model.dart';

/// Fuente de datos remota para tracking
abstract class TrackingRemoteDataSource {
  /// Envía una ubicación al servidor
  Future<void> sendLocation(LocationModel location);

  /// Envía múltiples ubicaciones al servidor
  Future<void> sendLocations(List<LocationModel> locations);

  /// Obtiene el historial de ubicaciones
  Future<List<LocationModel>> getLocationHistory({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
  });

  /// Obtiene la última ubicación conocida de un usuario
  Future<LocationModel?> getLastKnownLocation(String userId);
}

class TrackingRemoteDataSourceImpl implements TrackingRemoteDataSource {
  final Dio dio;

  TrackingRemoteDataSourceImpl(this.dio);

  @override
  Future<void> sendLocation(LocationModel location) async {
    try {
      await dio.post(
        ApiConstants.sendLocation,
        data: location.toJson(),
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al enviar ubicación',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<void> sendLocations(List<LocationModel> locations) async {
    try {
      await dio.post(
        ApiConstants.sendLocationBatch,
        data: {
          'locations': locations.map((l) => l.toJson()).toList(),
        },
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al enviar ubicaciones',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<List<LocationModel>> getLocationHistory({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      final response = await dio.get(
        ApiConstants.getLocationHistory(userId),
        queryParameters: {
          'startDate': startDate.toIso8601String(),
          'endDate': endDate.toIso8601String(),
        },
      );

      final List<dynamic> data = response.data['data']['items'];
      return data.map((json) => LocationModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al obtener historial',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }

  @override
  Future<LocationModel?> getLastKnownLocation(String userId) async {
    try {
      final response = await dio.get(
        ApiConstants.getCurrentLocation(userId),
      );

      if (response.data['data'] == null) {
        return null;
      }

      return LocationModel.fromJson(response.data['data']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      throw ServerException(
        message:
            e.response?.data['message'] ?? 'Error al obtener última ubicación',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }
}
