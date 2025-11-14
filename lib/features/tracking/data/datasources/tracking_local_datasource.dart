import 'dart:convert';

import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/errors/exceptions.dart';
import '../models/location_model.dart';
import '../models/location_settings_model.dart';

/// Fuente de datos local para tracking
abstract class TrackingLocalDataSource {
  /// Obtiene la ubicación actual del dispositivo
  Future<LocationModel> getCurrentLocation();

  /// Guarda ubicaciones pendientes de sincronizar
  Future<void> savePendingLocations(List<LocationModel> locations);

  /// Obtiene ubicaciones pendientes de sincronizar
  Future<List<LocationModel>> getPendingLocations();

  /// Limpia ubicaciones pendientes
  Future<void> clearPendingLocations();

  /// Guarda la configuración de tracking
  Future<void> saveSettings(LocationSettingsModel settings);

  /// Obtiene la configuración de tracking
  Future<LocationSettingsModel?> getSettings();

  /// Verifica permisos de ubicación
  Future<bool> checkLocationPermissions();

  /// Solicita permisos de ubicación
  Future<bool> requestLocationPermissions();
}

class TrackingLocalDataSourceImpl implements TrackingLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const String _pendingLocationsKey = 'pending_locations';
  static const String _settingsKey = 'tracking_settings';

  TrackingLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<LocationModel> getCurrentLocation() async {
    try {
      // Verificar permisos
      final hasPermission = await checkLocationPermissions();
      if (!hasPermission) {
        throw CacheException(message: 'No hay permisos de ubicación');
      }

      // Verificar si el servicio está habilitado
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw CacheException(message: 'El servicio de ubicación está deshabilitado');
      }

      // Obtener ubicación
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Obtener información de batería (simulado - requiere plugin adicional)
      final batteryLevel = 100; // TODO: Implementar con battery_plus
      final isCharging = false; // TODO: Implementar con battery_plus

      // Crear modelo de ubicación
      return LocationModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        userId: '', // Se asignará en el repository
        organizationId: '', // Se asignará en el repository
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        altitude: position.altitude,
        altitudeAccuracy: position.altitudeAccuracy,
        heading: position.heading,
        speed: position.speed,
        speedAccuracy: position.speedAccuracy,
        batteryLevel: batteryLevel,
        isCharging: isCharging,
        timestamp: position.timestamp ?? DateTime.now(),
        serverTimestamp: DateTime.now(),
      );
    } catch (e) {
      throw CacheException(message: 'Error al obtener ubicación: $e');
    }
  }

  @override
  Future<void> savePendingLocations(List<LocationModel> locations) async {
    try {
      final existing = await getPendingLocations();
      final all = [...existing, ...locations];

      // Limitar a 1000 ubicaciones máximo
      final toSave = all.length > 1000 ? all.sublist(all.length - 1000) : all;

      final jsonList = toSave.map((l) => l.toJson()).toList();
      await sharedPreferences.setString(
        _pendingLocationsKey,
        jsonEncode(jsonList),
      );
    } catch (e) {
      throw CacheException(message: 'Error al guardar ubicaciones: $e');
    }
  }

  @override
  Future<List<LocationModel>> getPendingLocations() async {
    try {
      final jsonString = sharedPreferences.getString(_pendingLocationsKey);
      if (jsonString == null) {
        return [];
      }

      final List<dynamic> jsonList = jsonDecode(jsonString);
      return jsonList.map((json) => LocationModel.fromJson(json)).toList();
    } catch (e) {
      throw CacheException(message: 'Error al obtener ubicaciones: $e');
    }
  }

  @override
  Future<void> clearPendingLocations() async {
    try {
      await sharedPreferences.remove(_pendingLocationsKey);
    } catch (e) {
      throw CacheException(message: 'Error al limpiar ubicaciones: $e');
    }
  }

  @override
  Future<void> saveSettings(LocationSettingsModel settings) async {
    try {
      await sharedPreferences.setString(
        _settingsKey,
        jsonEncode(settings.toJson()),
      );
    } catch (e) {
      throw CacheException(message: 'Error al guardar configuración: $e');
    }
  }

  @override
  Future<LocationSettingsModel?> getSettings() async {
    try {
      final jsonString = sharedPreferences.getString(_settingsKey);
      if (jsonString == null) {
        return null;
      }

      return LocationSettingsModel.fromJson(jsonDecode(jsonString));
    } catch (e) {
      throw CacheException(message: 'Error al obtener configuración: $e');
    }
  }

  @override
  Future<bool> checkLocationPermissions() async {
    try {
      final permission = await Geolocator.checkPermission();
      return permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    } catch (e) {
      return false;
    }
  }

  @override
  Future<bool> requestLocationPermissions() async {
    try {
      final permission = await Geolocator.requestPermission();
      return permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    } catch (e) {
      return false;
    }
  }
}
