const admin = require('firebase-admin');
const config = require('./environment');
const logger = require('../utils/logger');

let firebaseApp = null;

/**
 * Inicializa Firebase Admin SDK
 * @returns {admin.app.App|null}
 */
const initializeFirebase = () => {
  if (!config.firebase.enabled) {
    logger.warn('⚠️  Firebase no está habilitado (variables de entorno no configuradas)');
    return null;
  }

  try {
    // Si ya está inicializado, retornar la instancia
    if (firebaseApp) {
      return firebaseApp;
    }

    let credential;

    // Opción 1: Usar archivo de credenciales
    if (config.firebase.credentialsPath) {
      logger.info('Inicializando Firebase con archivo de credenciales...');
      credential = admin.credential.cert(require(config.firebase.credentialsPath));
    }
    // Opción 2: Usar variables de entorno
    else if (
      config.firebase.projectId &&
      config.firebase.privateKey &&
      config.firebase.clientEmail
    ) {
      logger.info('Inicializando Firebase con variables de entorno...');
      credential = admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      });
    } else {
      logger.warn(
        '⚠️  Credenciales de Firebase incompletas. Firebase no se inicializará.'
      );
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential,
      storageBucket: config.firebase.storageBucket,
    });

    logger.info('✅ Firebase Admin SDK inicializado correctamente');
    return firebaseApp;
  } catch (error) {
    logger.error('❌ Error inicializando Firebase:', error);
    return null;
  }
};

/**
 * Verifica un token de Firebase ID
 * @param {string} idToken - Token ID de Firebase
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verificando token de Firebase:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario de Firebase por UID
 * @param {string} uid - UID del usuario
 * @returns {Promise<admin.auth.UserRecord>}
 */
const getFirebaseUser = async (uid) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    logger.error('Error obteniendo usuario de Firebase:', error);
    throw error;
  }
};

/**
 * Crea un usuario en Firebase
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<admin.auth.UserRecord>}
 */
const createFirebaseUser = async (userData) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      emailVerified: false,
    });
    return userRecord;
  } catch (error) {
    logger.error('Error creando usuario en Firebase:', error);
    throw error;
  }
};

/**
 * Actualiza un usuario en Firebase
 * @param {string} uid - UID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<admin.auth.UserRecord>}
 */
const updateFirebaseUser = async (uid, updateData) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const userRecord = await admin.auth().updateUser(uid, updateData);
    return userRecord;
  } catch (error) {
    logger.error('Error actualizando usuario en Firebase:', error);
    throw error;
  }
};

/**
 * Elimina un usuario de Firebase
 * @param {string} uid - UID del usuario
 * @returns {Promise<void>}
 */
const deleteFirebaseUser = async (uid) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    logger.error('Error eliminando usuario de Firebase:', error);
    throw error;
  }
};

/**
 * Envía un email de verificación
 * @param {string} email - Email del usuario
 * @returns {Promise<string>} - Link de verificación
 */
const generateEmailVerificationLink = async (email) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const link = await admin.auth().generateEmailVerificationLink(email);
    return link;
  } catch (error) {
    logger.error('Error generando link de verificación:', error);
    throw error;
  }
};

/**
 * Genera un link de reset de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<string>} - Link de reset
 */
const generatePasswordResetLink = async (email) => {
  if (!firebaseApp) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    return link;
  } catch (error) {
    logger.error('Error generando link de reset de contraseña:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  getFirebaseUser,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser,
  generateEmailVerificationLink,
  generatePasswordResetLink,
  firebaseApp: () => firebaseApp,
};
