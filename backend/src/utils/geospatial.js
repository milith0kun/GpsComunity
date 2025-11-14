/**
 * Utilidades para operaciones geoespaciales
 */

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param {Number} lat1 - Latitud del punto 1
 * @param {Number} lon1 - Longitud del punto 1
 * @param {Number} lat2 - Latitud del punto 2
 * @param {Number} lon2 - Longitud del punto 2
 * @returns {Number} Distancia en metros
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};

/**
 * Verifica si un punto está dentro de un círculo
 * @param {Number} pointLat - Latitud del punto
 * @param {Number} pointLon - Longitud del punto
 * @param {Number} centerLat - Latitud del centro del círculo
 * @param {Number} centerLon - Longitud del centro del círculo
 * @param {Number} radius - Radio del círculo en metros
 * @returns {Boolean}
 */
const isPointInCircle = (pointLat, pointLon, centerLat, centerLon, radius) => {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radius;
};

/**
 * Verifica si un punto está dentro de un polígono (Ray Casting Algorithm)
 * @param {Number} lat - Latitud del punto
 * @param {Number} lon - Longitud del punto
 * @param {Array} polygon - Array de coordenadas [[lon, lat], [lon, lat], ...]
 * @returns {Boolean}
 */
const isPointInPolygon = (lat, lon, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Verifica si un punto está dentro de un geofence
 * @param {Number} lat - Latitud del punto
 * @param {Number} lon - Longitud del punto
 * @param {Object} geofence - Objeto geofence con geometry
 * @returns {Boolean}
 */
const isPointInGeofence = (lat, lon, geofence) => {
  const { geometry } = geofence;

  if (geometry.type === 'Circle') {
    const [centerLon, centerLat] = geometry.center;
    return isPointInCircle(lat, lon, centerLat, centerLon, geometry.radius);
  }

  if (geometry.type === 'Polygon') {
    const coordinates = geometry.coordinates[0]; // Primer anillo del polígono
    return isPointInPolygon(lat, lon, coordinates);
  }

  return false;
};

/**
 * Calcula el rumbo (bearing) entre dos puntos
 * @param {Number} lat1
 * @param {Number} lon1
 * @param {Number} lat2
 * @param {Number} lon2
 * @returns {Number} Rumbo en grados (0-360)
 */
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  const bearing = ((θ * 180) / Math.PI + 360) % 360;
  return bearing;
};

/**
 * Obtiene bounds (límites) de un conjunto de coordenadas
 * @param {Array} coordinates - Array de [lon, lat]
 * @returns {Object} { minLat, maxLat, minLon, maxLon }
 */
const getBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;

  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];
  let minLon = coordinates[0][0];
  let maxLon = coordinates[0][0];

  coordinates.forEach(([lon, lat]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  });

  return { minLat, maxLat, minLon, maxLon };
};

/**
 * Calcula el centro de un conjunto de coordenadas
 * @param {Array} coordinates - Array de [lon, lat]
 * @returns {Array} [lon, lat] del centro
 */
const getCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return null;

  let sumLat = 0;
  let sumLon = 0;

  coordinates.forEach(([lon, lat]) => {
    sumLat += lat;
    sumLon += lon;
  });

  return [sumLon / coordinates.length, sumLat / coordinates.length];
};

/**
 * Convierte metros a grados aproximadamente (para búsquedas)
 * @param {Number} meters
 * @returns {Number} Grados
 */
const metersToDegrees = (meters) => {
  return meters / 111320; // Aproximación: 1 grado ≈ 111.32 km
};

/**
 * Crea un query de MongoDB para búsqueda geoespacial circular
 * @param {Number} lat - Latitud del centro
 * @param {Number} lon - Longitud del centro
 * @param {Number} radiusInMeters - Radio en metros
 * @returns {Object} Query de MongoDB
 */
const createCircleQuery = (lat, lon, radiusInMeters) => {
  return {
    location: {
      $geoWithin: {
        $centerSphere: [[lon, lat], radiusInMeters / 6378100], // Radio de la Tierra
      },
    },
  };
};

/**
 * Crea un query de MongoDB para búsqueda geoespacial por proximidad
 * @param {Number} lat - Latitud del punto
 * @param {Number} lon - Longitud del punto
 * @param {Number} maxDistanceInMeters - Distancia máxima en metros
 * @returns {Object} Query de MongoDB
 */
const createNearQuery = (lat, lon, maxDistanceInMeters) => {
  return {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        $maxDistance: maxDistanceInMeters,
      },
    },
  };
};

module.exports = {
  calculateDistance,
  isPointInCircle,
  isPointInPolygon,
  isPointInGeofence,
  calculateBearing,
  getBounds,
  getCenter,
  metersToDegrees,
  createCircleQuery,
  createNearQuery,
};
