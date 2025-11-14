import '../constants/api_constants.dart';

/// Configuración de ambiente
enum Environment {
  development,
  staging,
  production,
}

/// Configuración de variables de entorno
class EnvConfig {
  static Environment _currentEnv = Environment.development;

  /// Establece el ambiente actual
  static void setEnvironment(Environment env) {
    _currentEnv = env;
  }

  /// Obtiene el ambiente actual
  static Environment get currentEnvironment => _currentEnv;

  /// Obtiene la URL base de la API según el ambiente
  static String get baseUrl {
    switch (_currentEnv) {
      case Environment.development:
        return ApiConstants.baseUrlDev;
      case Environment.staging:
        return ApiConstants.baseUrlStaging;
      case Environment.production:
        return ApiConstants.baseUrlProduction;
    }
  }

  /// Obtiene la URL base del WebSocket según el ambiente
  static String get wsUrl {
    switch (_currentEnv) {
      case Environment.development:
        return ApiConstants.wsUrlDev;
      case Environment.staging:
        return ApiConstants.wsUrlStaging;
      case Environment.production:
        return ApiConstants.wsUrlProduction;
    }
  }

  /// Indica si está en modo debug
  static bool get isDebug => _currentEnv == Environment.development;

  /// Indica si está en producción
  static bool get isProduction => _currentEnv == Environment.production;

  /// Google Maps API Key
  static String get googleMapsApiKey {
    // TODO: Cambiar por las claves reales según el ambiente
    switch (_currentEnv) {
      case Environment.development:
        return 'YOUR_DEV_GOOGLE_MAPS_API_KEY';
      case Environment.staging:
        return 'YOUR_STAGING_GOOGLE_MAPS_API_KEY';
      case Environment.production:
        return 'YOUR_PRODUCTION_GOOGLE_MAPS_API_KEY';
    }
  }

  /// Firebase Options se configuran en el main según la plataforma
}
