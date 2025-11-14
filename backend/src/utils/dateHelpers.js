/**
 * Utilidades para manejo de fechas
 */

/**
 * Obtiene la fecha actual en ISO string
 * @returns {String}
 */
const now = () => {
  return new Date().toISOString();
};

/**
 * Agrega días a una fecha
 * @param {Date} date - Fecha base
 * @param {Number} days - Días a agregar
 * @returns {Date}
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Agrega horas a una fecha
 * @param {Date} date - Fecha base
 * @param {Number} hours - Horas a agregar
 * @returns {Date}
 */
const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

/**
 * Agrega minutos a una fecha
 * @param {Date} date - Fecha base
 * @param {Number} minutes - Minutos a agregar
 * @returns {Date}
 */
const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

/**
 * Obtiene el inicio del día
 * @param {Date} date
 * @returns {Date}
 */
const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Obtiene el fin del día
 * @param {Date} date
 * @returns {Date}
 */
const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Obtiene el inicio de la semana
 * @param {Date} date
 * @returns {Date}
 */
const startOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Lunes
  result.setDate(diff);
  return startOfDay(result);
};

/**
 * Obtiene el fin de la semana
 * @param {Date} date
 * @returns {Date}
 */
const endOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() + (day === 0 ? 0 : 7 - day); // Domingo
  result.setDate(diff);
  return endOfDay(result);
};

/**
 * Obtiene el inicio del mes
 * @param {Date} date
 * @returns {Date}
 */
const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  return startOfDay(result);
};

/**
 * Obtiene el fin del mes
 * @param {Date} date
 * @returns {Date}
 */
const endOfMonth = (date) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  return endOfDay(result);
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date} date1
 * @param {Date} date2
 * @returns {Number}
 */
const diffInDays = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Calcula la diferencia en horas entre dos fechas
 * @param {Date} date1
 * @param {Date} date2
 * @returns {Number}
 */
const diffInHours = (date1, date2) => {
  const oneHour = 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneHour));
};

/**
 * Calcula la diferencia en minutos entre dos fechas
 * @param {Date} date1
 * @param {Date} date2
 * @returns {Number}
 */
const diffInMinutes = (date1, date2) => {
  const oneMinute = 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneMinute));
};

/**
 * Verifica si una fecha está en el pasado
 * @param {Date} date
 * @returns {Boolean}
 */
const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Verifica si una fecha está en el futuro
 * @param {Date} date
 * @returns {Boolean}
 */
const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Verifica si una fecha es hoy
 * @param {Date} date
 * @returns {Boolean}
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Formatea una fecha en formato legible
 * @param {Date} date
 * @param {String} locale - Locale (default: 'es-ES')
 * @returns {String}
 */
const formatDate = (date, locale = 'es-ES') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatea una fecha y hora
 * @param {Date} date
 * @param {String} locale - Locale (default: 'es-ES')
 * @returns {String}
 */
const formatDateTime = (date, locale = 'es-ES') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea tiempo relativo (hace X minutos/horas/días)
 * @param {Date} date
 * @returns {String}
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'hace un momento';
};

/**
 * Parsea una fecha de string
 * @param {String} dateString
 * @returns {Date|null}
 */
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

module.exports = {
  now,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  diffInDays,
  diffInHours,
  diffInMinutes,
  isPast,
  isFuture,
  isToday,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  parseDate,
};
