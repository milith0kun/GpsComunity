/// Constantes relacionadas con la API
class ApiConstants {
  // Base URLs - Cambiar según el ambiente
  static const String baseUrlDev = 'http://localhost:3000/api/v1';
  static const String baseUrlStaging = 'https://staging-api.gpscommunity.com/api/v1';
  static const String baseUrlProduction = 'https://api.gpscommunity.com/api/v1';

  // WebSocket URLs
  static const String wsUrlDev = 'ws://localhost:3000';
  static const String wsUrlStaging = 'wss://staging-api.gpscommunity.com';
  static const String wsUrlProduction = 'wss://api.gpscommunity.com';

  // Endpoints - Autenticación
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authLogout = '/auth/logout';
  static const String authRefreshToken = '/auth/refresh-token';
  static const String authForgotPassword = '/auth/forgot-password';
  static const String authResetPassword = '/auth/reset-password';
  static const String authVerifyEmail = '/auth/verify-email';
  static const String authMe = '/auth/me';

  // Endpoints - Usuarios
  static const String users = '/users';
  static String userById(String id) => '/users/$id';
  static String userUploadPhoto(String id) => '/users/$id/upload-photo';
  static String userPreferences(String id) => '/users/$id/preferences';

  // Endpoints - Organizaciones
  static const String organizations = '/organizations';
  static String organizationById(String id) => '/organizations/$id';
  static String organizationSettings(String id) => '/organizations/$id/settings';
  static String organizationInvite(String id) => '/organizations/$id/invite';
  static String organizationSubscription(String id) => '/organizations/$id/subscription';

  // Endpoints - Miembros
  static String organizationMembers(String orgId) => '/organizations/$orgId/members';
  static String organizationMemberById(String orgId, String memberId) =>
      '/organizations/$orgId/members/$memberId';
  static String organizationMemberRole(String orgId, String memberId) =>
      '/organizations/$orgId/members/$memberId/role';
  static String organizationMemberTrackingStatus(String orgId, String memberId) =>
      '/organizations/$orgId/members/$memberId/tracking-status';

  // Endpoints - Grupos
  static String organizationGroups(String orgId) => '/organizations/$orgId/groups';
  static String organizationGroupById(String orgId, String groupId) =>
      '/organizations/$orgId/groups/$groupId';
  static String groupMembers(String orgId, String groupId) =>
      '/organizations/$orgId/groups/$groupId/members';
  static String groupMemberById(String orgId, String groupId, String memberId) =>
      '/organizations/$orgId/groups/$groupId/members/$memberId';

  // Endpoints - Ubicaciones (Tracking)
  static const String sendLocation = '/locations';
  static const String sendLocationBatch = '/locations/batch';
  static String getCurrentLocation(String userId) => '/locations/current/$userId';
  static String getLocationHistory(String userId) => '/locations/history/$userId';
  static String organizationLocationsLive(String orgId) =>
      '/organizations/$orgId/locations/live';
  static String organizationLocationsHistory(String orgId) =>
      '/organizations/$orgId/locations/history';

  // Endpoints - Geofences
  static String organizationGeofences(String orgId) => '/organizations/$orgId/geofences';
  static String organizationGeofenceById(String orgId, String geofenceId) =>
      '/organizations/$orgId/geofences/$geofenceId';
  static String geofenceEvents(String orgId, String geofenceId) =>
      '/organizations/$orgId/geofences/$geofenceId/events';

  // Endpoints - Alertas
  static String organizationAlerts(String orgId) => '/organizations/$orgId/alerts';
  static String alertById(String alertId) => '/alerts/$alertId';
  static String alertAcknowledge(String alertId) => '/alerts/$alertId/acknowledge';
  static const String alertSos = '/alerts/sos';

  // Endpoints - Reportes
  static String organizationReports(String orgId) => '/organizations/$orgId/reports';
  static String organizationReportsGenerate(String orgId) =>
      '/organizations/$orgId/reports/generate';
  static String reportById(String reportId) => '/reports/$reportId';
  static String reportDownload(String reportId) => '/reports/$reportId/download';

  // Endpoints - Métricas y Dashboard
  static String organizationDashboard(String orgId) => '/organizations/$orgId/dashboard';
  static String organizationMetricsSummary(String orgId) =>
      '/organizations/$orgId/metrics/summary';
  static String organizationMetricsActivity(String orgId) =>
      '/organizations/$orgId/metrics/activity';
  static String userMetrics(String userId) => '/users/$userId/metrics';

  // Headers
  static const String headerContentType = 'Content-Type';
  static const String headerAuthorization = 'Authorization';
  static const String headerAccept = 'Accept';
  static const String headerAcceptLanguage = 'Accept-Language';
  static const String headerDeviceId = 'X-Device-Id';
  static const String headerPlatform = 'X-Platform';
  static const String headerAppVersion = 'X-App-Version';

  // Content Types
  static const String contentTypeJson = 'application/json';
  static const String contentTypeFormData = 'multipart/form-data';

  // Query Parameters comunes
  static const String paramPage = 'page';
  static const String paramLimit = 'limit';
  static const String paramSort = 'sort';
  static const String paramFilter = 'filter';
  static const String paramSearch = 'search';
  static const String paramStartDate = 'startDate';
  static const String paramEndDate = 'endDate';
}
