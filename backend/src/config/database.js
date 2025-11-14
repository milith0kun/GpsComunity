const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Determinar nombre de la base de datos según el ambiente
const getDatabaseName = () => {
  const env = process.env.NODE_ENV || 'development';

  const dbNames = {
    development: process.env.DATABASE_NAME_DEV || 'gps_community_dev',
    test: process.env.DATABASE_NAME_TEST || 'gps_community_test',
    staging: process.env.DATABASE_NAME_STAGING || 'gps_community_staging',
    production: process.env.DATABASE_NAME_PROD || 'gps_community_prod',
  };

  return dbNames[env] || dbNames.development;
};

// Construir URI de MongoDB
const getMongoURI = () => {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Si la URI no incluye el nombre de la base de datos, agregarlo
  const dbName = getDatabaseName();

  // Detectar si la URI ya tiene un nombre de base de datos
  const uriParts = uri.split('?');
  const hasDbName = uriParts[0].split('/').length > 3;

  if (!hasDbName) {
    // Agregar nombre de base de datos antes de los query params
    if (uriParts.length > 1) {
      uri = `${uriParts[0]}/${dbName}?${uriParts[1]}`;
    } else {
      uri = `${uri}/${dbName}`;
    }
  } else {
    // Reemplazar el nombre de base de datos existente
    const parts = uriParts[0].split('/');
    parts[parts.length - 1] = dbName;
    uriParts[0] = parts.join('/');
    uri = uriParts.join('?');
  }

  return uri;
};

// Opciones de conexión
const options = {
  // Opciones de servidor
  serverSelectionTimeoutMS: 5000, // Timeout para seleccionar servidor
  socketTimeoutMS: 45000, // Timeout para operaciones de socket

  // Opciones de pool
  maxPoolSize: 10, // Máximo de conexiones simultáneas
  minPoolSize: 2, // Mínimo de conexiones

  // Otras opciones
  autoIndex: process.env.NODE_ENV !== 'production', // No crear índices automáticamente en producción
  retryWrites: true,
  w: 'majority',
};

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    const uri = getMongoURI();
    const dbName = getDatabaseName();

    logger.info(`Conectando a MongoDB Atlas...`);
    logger.info(`Base de datos: ${dbName}`);
    logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

    await mongoose.connect(uri, options);

    logger.info('✅ Conectado exitosamente a MongoDB Atlas');
    logger.info(`📊 Base de datos activa: ${mongoose.connection.name}`);

    // Event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('❌ Error de conexión a MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
};

// Función para desconectar (útil para tests)
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Función para limpiar la base de datos (solo para tests)
const clearDB = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDB can only be used in test environment');
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  logger.info('Database cleared');
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDB,
  getDatabaseName,
};
