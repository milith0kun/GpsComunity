/**
 * Validadores personalizados
 */

/**
 * Valida si una cadena es un email válido
 * @param {String} email
 * @returns {Boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una cadena es un teléfono válido (formato internacional)
 * @param {String} phone
 * @returns {Boolean}
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 * Min 8 caracteres, al menos una mayúscula, una minúscula y un número
 * @param {String} password
 * @returns {Boolean}
 */
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valida coordenadas de latitud y longitud
 * @param {Number} lat - Latitud
 * @param {Number} lng - Longitud
 * @returns {Boolean}
 */
const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Valida si un slug es válido (lowercase, alphanumeric, guiones)
 * @param {String} slug
 * @returns {Boolean}
 */
const isValidSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Valida si un ObjectId de MongoDB es válido
 * @param {String} id
 * @returns {Boolean}
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Valida si una URL es válida
 * @param {String} url
 * @returns {Boolean}
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida rango de fechas (startDate debe ser antes que endDate)
 * @param {Date|String} startDate
 * @param {Date|String} endDate
 * @returns {Boolean}
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && !isNaN(start) && !isNaN(end);
};

/**
 * Valida nivel de batería (0-100)
 * @param {Number} level
 * @returns {Boolean}
 */
const isValidBatteryLevel = (level) => {
  return typeof level === 'number' && level >= 0 && level <= 100;
};

/**
 * Valida precisión de GPS (en metros, debe ser positiva)
 * @param {Number} accuracy
 * @returns {Boolean}
 */
const isValidAccuracy = (accuracy) => {
  return typeof accuracy === 'number' && accuracy >= 0;
};

/**
 * Valida velocidad (en m/s, debe ser positiva o cero)
 * @param {Number} speed
 * @returns {Boolean}
 */
const isValidSpeed = (speed) => {
  return typeof speed === 'number' && speed >= 0;
};

/**
 * Valida rumbo/heading (0-360 grados)
 * @param {Number} heading
 * @returns {Boolean}
 */
const isValidHeading = (heading) => {
  return typeof heading === 'number' && heading >= 0 && heading <= 360;
};

/**
 * Valida confianza de actividad (0-100%)
 * @param {Number} confidence
 * @returns {Boolean}
 */
const isValidActivityConfidence = (confidence) => {
  return typeof confidence === 'number' && confidence >= 0 && confidence <= 100;
};

/**
 * Valida geometría de geofence (Polygon o Circle)
 * @param {Object} geometry
 * @returns {Boolean}
 */
const isValidGeofenceGeometry = (geometry) => {
  if (!geometry || !geometry.type) return false;

  if (geometry.type === 'Circle') {
    return (
      Array.isArray(geometry.center) &&
      geometry.center.length === 2 &&
      isValidCoordinates(geometry.center[1], geometry.center[0]) &&
      typeof geometry.radius === 'number' &&
      geometry.radius > 0
    );
  }

  if (geometry.type === 'Polygon') {
    return (
      Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length > 0 &&
      Array.isArray(geometry.coordinates[0]) &&
      geometry.coordinates[0].length >= 4 // Mínimo 4 puntos para cerrar el polígono
    );
  }

  return false;
};

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {String} str
 * @returns {String}
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Genera un slug desde un string
 * @param {String} text
 * @returns {String}
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con -
    .replace(/[^\w\-]+/g, '') // Remover caracteres no-word
    .replace(/\-\-+/g, '-') // Reemplazar múltiples - con uno solo
    .replace(/^-+/, '') // Trim - del inicio
    .replace(/-+$/, ''); // Trim - del final
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidCoordinates,
  isValidSlug,
  isValidObjectId,
  isValidUrl,
  isValidDateRange,
  isValidBatteryLevel,
  isValidAccuracy,
  isValidSpeed,
  isValidHeading,
  isValidActivityConfidence,
  isValidGeofenceGeometry,
  sanitizeString,
  generateSlug,
};
