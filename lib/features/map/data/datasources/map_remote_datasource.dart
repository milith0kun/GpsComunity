import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../models/map_marker_model.dart';

/// Fuente de datos remota para el mapa
abstract class MapRemoteDataSource {
  Future<List<MapMarkerModel>> getRealTimeMarkers({
    required String organizationId,
    List<String>? groupIds,
  });
}

class MapRemoteDataSourceImpl implements MapRemoteDataSource {
  final Dio dio;

  MapRemoteDataSourceImpl(this.dio);

  @override
  Future<List<MapMarkerModel>> getRealTimeMarkers({
    required String organizationId,
    List<String>? groupIds,
  }) async {
    try {
      final response = await dio.get(
        ApiConstants.organizationLocationsLive(organizationId),
        queryParameters: {
          if (groupIds != null && groupIds.isNotEmpty)
            'groups': groupIds.join(','),
        },
      );

      final List<dynamic> data = response.data['data']['items'];
      return data.map((json) => MapMarkerModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data['message'] ?? 'Error al obtener marcadores',
        statusCode: e.response?.statusCode,
      );
    } catch (e) {
      throw ServerException(message: e.toString());
    }
  }
}
