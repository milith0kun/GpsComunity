require('dotenv').config();

/**
 * Configuración centralizada de variables de entorno
 * con validación y valores por defecto
 */

const env = process.env.NODE_ENV || 'development';

const config = {
  // Entorno
  env,
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  isTest: env === 'test',

  // Servidor
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Base de datos
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: {
      dev: process.env.DATABASE_NAME_DEV || 'gps_community_dev',
      test: process.env.DATABASE_NAME_TEST || 'gps_community_test',
      staging: process.env.DATABASE_NAME_STAGING || 'gps_community_staging',
      prod: process.env.DATABASE_NAME_PROD || 'gps_community_prod',
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  },

  // Firebase
  firebase: {
    enabled: process.env.FIREBASE_PROJECT_ID ? true : false,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    credentialsPath: process.env.FIREBASE_CREDENTIALS_PATH,
  },

  // Redis
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // Email
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@gpscommunity.com',
    fromName: process.env.EMAIL_FROM_NAME || 'GPS Community',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 10,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    uploadUrl: process.env.UPLOAD_URL || 'http://localhost:3000/uploads',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || 'logs',
  },

  // WebSocket
  websocket: {
    path: process.env.WEBSOCKET_PATH || '/socket.io',
  },

  // Geofencing
  geofencing: {
    defaultRadius: parseInt(process.env.DEFAULT_GEOFENCE_RADIUS, 10) || 100,
  },

  // Location Tracking
  tracking: {
    historyTTL: parseInt(process.env.LOCATION_HISTORY_TTL, 10) || 7776000, // 90 días
    minInterval: parseInt(process.env.MIN_LOCATION_INTERVAL, 10) || 10,
    maxBatchSize: parseInt(process.env.MAX_BATCH_LOCATIONS, 10) || 100,
  },

  // Alertas
  alerts: {
    batteryThreshold: parseInt(process.env.BATTERY_LOW_THRESHOLD, 10) || 15,
    inactivityMinutes: parseInt(process.env.INACTIVITY_ALERT_MINUTES, 10) || 60,
  },

  // Suscripciones
  subscription: {
    trialDays: parseInt(process.env.TRIAL_DAYS, 10) || 14,
  },

  // Stripe (pagos)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    accountLockTime: parseInt(process.env.ACCOUNT_LOCK_TIME, 10) || 30, // minutos
  },

  // API Keys externas
  apiKeys: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY,
    sendgrid: process.env.SENDGRID_API_KEY,
    twilioSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuth: process.env.TWILIO_AUTH_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE_NUMBER,
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    gaTrackingId: process.env.GA_TRACKING_ID,
  },

  // Otros
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'America/Lima',
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'es',
  enableSwaggerInProd: process.env.ENABLE_SWAGGER_IN_PROD === 'true',
};

// Validación de variables críticas
const validateConfig = () => {
  const errors = [];

  // Validar MongoDB URI
  if (!config.mongodb.uri) {
    errors.push('MONGODB_URI is required');
  }

  // Validar JWT secret en producción
  if (config.isProduction && config.jwt.secret === 'default-secret-change-in-production') {
    errors.push('JWT_SECRET must be changed in production');
  }

  // Warnings (no bloquean la ejecución)
  if (!config.firebase.enabled && config.isDevelopment) {
    console.warn('⚠️  Firebase no está configurado');
  }

  if (!config.redis.enabled && config.isProduction) {
    console.warn('⚠️  Redis no está habilitado (recomendado para producción)');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
};

// Ejecutar validación
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

module.exports = config;
