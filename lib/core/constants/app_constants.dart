/// Constantes generales de la aplicación
class AppConstants {
  // Información de la app
  static const String appName = 'GPS Community';
  static const String appVersion = '1.0.0';

  // Configuración de rastreo
  static const int defaultTrackingIntervalSeconds = 60;
  static const int minTrackingIntervalSeconds = 30;
  static const int maxTrackingIntervalSeconds = 600;

  // Configuración de ubicación
  static const double maxAccuracyMeters = 100.0;
  static const double minMovementMeters = 10.0;
  static const double maxSpeedKmh = 150.0;

  // Configuración de batería
  static const int batteryLowThreshold = 20;
  static const int batteryCriticalThreshold = 10;
  static const int batteryHighThreshold = 80;

  // Configuración de sincronización
  static const int maxBatchSize = 50;
  static const int maxOfflineLocations = 1000;
  static const int syncIntervalSeconds = 300; // 5 minutos

  // Configuración de WebSocket
  static const int websocketHeartbeatSeconds = 30;
  static const int websocketReconnectDelaySeconds = 5;

  // Timeouts
  static const int connectionTimeoutSeconds = 30;
  static const int receiveTimeoutSeconds = 30;
  static const int sendTimeoutSeconds = 30;

  // Paginación
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Caché
  static const int cacheExpirationDays = 7;

  // Idiomas soportados
  static const List<String> supportedLanguages = ['es', 'en', 'pt'];
  static const String defaultLanguage = 'es';

  // Formatos
  static const String dateFormat = 'dd/MM/yyyy';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';

  // Regex patterns
  static const String emailPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const String phonePattern = r'^\+?[\d\s\-\(\)]+$';

  // Validaciones de contraseña
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 50;

  // Tokens
  static const int tokenExpirationDays = 7;
  static const String tokenPrefix = 'Bearer ';

  // Roles
  static const String roleOwner = 'owner';
  static const String roleAdmin = 'admin';
  static const String roleManager = 'manager';
  static const String roleMember = 'member';

  // Estados de rastreo
  static const String trackingModeAlways = 'always';
  static const String trackingModeWorkingHours = 'working_hours';
  static const String trackingModeManual = 'manual';

  // Tipos de actividad
  static const String activityStill = 'still';
  static const String activityWalking = 'walking';
  static const String activityRunning = 'running';
  static const String activityDriving = 'driving';
  static const String activityCycling = 'cycling';

  // Configuración de geofencing
  static const double minGeofenceRadiusMeters = 50.0;
  static const double maxGeofenceRadiusMeters = 5000.0;

  // Notificaciones
  static const String notificationChannelId = 'gps_community_channel';
  static const String notificationChannelName = 'GPS Community';
  static const String notificationChannelDescription = 'Notificaciones del sistema de rastreo';

  // SharedPreferences keys
  static const String prefKeyToken = 'auth_token';
  static const String prefKeyRefreshToken = 'refresh_token';
  static const String prefKeyUserId = 'user_id';
  static const String prefKeyUserEmail = 'user_email';
  static const String prefKeySelectedOrganization = 'selected_organization';
  static const String prefKeyLanguage = 'language';
  static const String prefKeyThemeMode = 'theme_mode';
  static const String prefKeyTrackingEnabled = 'tracking_enabled';

  // Error messages
  static const String errorGeneric = 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  static const String errorNoInternet = 'No hay conexión a internet';
  static const String errorTimeout = 'Tiempo de espera agotado';
  static const String errorUnauthorized = 'No autorizado. Por favor, inicia sesión nuevamente.';
  static const String errorForbidden = 'No tienes permisos para realizar esta acción';
  static const String errorNotFound = 'Recurso no encontrado';
  static const String errorServerError = 'Error del servidor. Por favor, intenta más tarde.';
}
