const Redis = require('ioredis');
const config = require('./environment');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Inicializa conexión a Redis
 * @returns {Redis|null}
 */
const initializeRedis = () => {
  if (!config.redis.enabled) {
    logger.warn('⚠️  Redis no está habilitado');
    return null;
  }

  try {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('✅ Conectado a Redis');
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Error de Redis:', err);
    });

    redisClient.on('close', () => {
      logger.warn('⚠️  Conexión a Redis cerrada');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Reconectando a Redis...');
    });

    return redisClient;
  } catch (error) {
    logger.error('❌ Error inicializando Redis:', error);
    return null;
  }
};

/**
 * Obtiene el cliente de Redis
 * @returns {Redis|null}
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Guarda un valor en Redis con TTL
 * @param {string} key
 * @param {*} value
 * @param {number} ttl - Time to live en segundos
 */
const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient) return;

  try {
    const stringValue = JSON.stringify(value);
    await redisClient.setex(key, ttl, stringValue);
  } catch (error) {
    logger.error('Error guardando en cache:', error);
  }
};

/**
 * Obtiene un valor de Redis
 * @param {string} key
 * @returns {Promise<*|null>}
 */
const getCache = async (key) => {
  if (!redisClient) return null;

  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    logger.error('Error obteniendo de cache:', error);
    return null;
  }
};

/**
 * Elimina un valor de Redis
 * @param {string} key
 */
const deleteCache = async (key) => {
  if (!redisClient) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Error eliminando de cache:', error);
  }
};

/**
 * Elimina múltiples valores que coincidan con un patrón
 * @param {string} pattern - Patrón (ej: "user:*")
 */
const deleteCachePattern = async (pattern) => {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    logger.error('Error eliminando patrón de cache:', error);
  }
};

/**
 * Verifica si una key existe
 * @param {string} key
 * @returns {Promise<boolean>}
 */
const existsCache = async (key) => {
  if (!redisClient) return false;

  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Error verificando existencia en cache:', error);
    return false;
  }
};

/**
 * Incrementa un contador
 * @param {string} key
 * @returns {Promise<number>}
 */
const incrementCache = async (key) => {
  if (!redisClient) return 0;

  try {
    return await redisClient.incr(key);
  } catch (error) {
    logger.error('Error incrementando contador:', error);
    return 0;
  }
};

/**
 * Establece TTL para una key existente
 * @param {string} key
 * @param {number} ttl - Segundos
 */
const expireCache = async (key, ttl) => {
  if (!redisClient) return;

  try {
    await redisClient.expire(key, ttl);
  } catch (error) {
    logger.error('Error estableciendo TTL:', error);
  }
};

/**
 * Cierra la conexión a Redis
 */
const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Conexión a Redis cerrada');
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  existsCache,
  incrementCache,
  expireCache,
  closeRedis,
};
