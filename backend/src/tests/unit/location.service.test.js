const locationService = require('../../services/location.service');
const Location = require('../../models/Location');
const LocationSnapshot = require('../../models/LocationSnapshot');
const geofenceService = require('../../services/geofence.service');
const { AppError } = require('../../middleware/error.middleware');

jest.mock('../../models/Location');
jest.mock('../../models/LocationSnapshot');
jest.mock('../../services/geofence.service');

describe('Location Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveLocation', () => {
    it('debería guardar una ubicación exitosamente', async () => {
      const locationData = {
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date(),
        organizationId: '507f1f77bcf86cd799439011',
      };

      const userId = '507f1f77bcf86cd799439012';

      const mockLocation = {
        _id: '507f1f77bcf86cd799439013',
        ...locationData,
        userId,
        save: jest.fn().mockResolvedValue(true),
      };

      Location.mockImplementation(() => mockLocation);
      geofenceService.processLocationForGeofences = jest
        .fn()
        .mockResolvedValue([]);
      LocationSnapshot.findOneAndUpdate = jest.fn().mockResolvedValue({});

      const result = await locationService.saveLocation(locationData, userId);

      expect(result).toHaveProperty('_id');
      expect(mockLocation.save).toHaveBeenCalled();
      expect(geofenceService.processLocationForGeofences).toHaveBeenCalled();
      expect(LocationSnapshot.findOneAndUpdate).toHaveBeenCalled();
    });

    it('debería procesar geofences al guardar ubicación', async () => {
      const locationData = {
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date(),
        organizationId: '507f1f77bcf86cd799439011',
      };

      const userId = '507f1f77bcf86cd799439012';

      const mockLocation = {
        _id: '507f1f77bcf86cd799439013',
        ...locationData,
        userId,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockGeofenceEvents = [
        { type: 'enter', geofenceId: 'geofence1' },
      ];

      Location.mockImplementation(() => mockLocation);
      geofenceService.processLocationForGeofences = jest
        .fn()
        .mockResolvedValue(mockGeofenceEvents);
      LocationSnapshot.findOneAndUpdate = jest.fn().mockResolvedValue({});

      const result = await locationService.saveLocation(locationData, userId);

      expect(geofenceService.processLocationForGeofences).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        }),
        userId,
        locationData.organizationId
      );
    });

    it('debería actualizar snapshot de última ubicación', async () => {
      const locationData = {
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date(),
        organizationId: '507f1f77bcf86cd799439011',
      };

      const userId = '507f1f77bcf86cd799439012';

      const mockLocation = {
        _id: '507f1f77bcf86cd799439013',
        ...locationData,
        userId,
        save: jest.fn().mockResolvedValue(true),
      };

      Location.mockImplementation(() => mockLocation);
      geofenceService.processLocationForGeofences = jest
        .fn()
        .mockResolvedValue([]);

      const findOneAndUpdateMock = jest.fn().mockResolvedValue({});
      LocationSnapshot.findOneAndUpdate = findOneAndUpdateMock;

      await locationService.saveLocation(locationData, userId);

      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { userId, organizationId: locationData.organizationId },
        expect.objectContaining({
          location: expect.any(Object),
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp,
        }),
        { upsert: true, new: true }
      );
    });
  });

  describe('saveBatchLocations', () => {
    it('debería guardar múltiples ubicaciones', async () => {
      const locationsData = [
        {
          latitude: 19.4326,
          longitude: -99.1332,
          accuracy: 15,
          timestamp: new Date(),
          organizationId: '507f1f77bcf86cd799439011',
        },
        {
          latitude: 19.4330,
          longitude: -99.1340,
          accuracy: 20,
          timestamp: new Date(),
          organizationId: '507f1f77bcf86cd799439011',
        },
      ];

      const userId = '507f1f77bcf86cd799439012';

      Location.insertMany = jest.fn().mockResolvedValue([
        { _id: '1', ...locationsData[0] },
        { _id: '2', ...locationsData[1] },
      ]);

      geofenceService.processLocationForGeofences = jest
        .fn()
        .mockResolvedValue([]);
      LocationSnapshot.findOneAndUpdate = jest.fn().mockResolvedValue({});

      const result = await locationService.saveBatchLocations(
        locationsData,
        userId
      );

      expect(Location.insertMany).toHaveBeenCalled();
      expect(result).toHaveProperty('saved', 2);
      expect(result).toHaveProperty('locations');
      expect(result.locations).toHaveLength(2);
    });
  });

  describe('getCurrentLocation', () => {
    it('debería obtener la ubicación actual del usuario', async () => {
      const userId = '507f1f77bcf86cd799439012';

      const mockSnapshot = {
        userId,
        location: {
          type: 'Point',
          coordinates: [-99.1332, 19.4326],
        },
        accuracy: 15,
        timestamp: new Date(),
      };

      LocationSnapshot.findOne = jest.fn().mockResolvedValue(mockSnapshot);

      const result = await locationService.getCurrentLocation(userId);

      expect(LocationSnapshot.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockSnapshot);
    });

    it('debería lanzar error si no hay ubicación actual', async () => {
      const userId = '507f1f77bcf86cd799439012';

      LocationSnapshot.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        locationService.getCurrentLocation(userId)
      ).rejects.toThrow('No se encontró ubicación actual');
    });
  });

  describe('getLocationHistory', () => {
    it('debería obtener historial de ubicaciones con filtros', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        limit: 100,
      };

      const mockLocations = [
        {
          userId,
          location: { type: 'Point', coordinates: [-99.1332, 19.4326] },
          timestamp: new Date('2024-01-15'),
        },
        {
          userId,
          location: { type: 'Point', coordinates: [-99.1340, 19.4330] },
          timestamp: new Date('2024-01-16'),
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockLocations),
      };

      Location.find = jest.fn().mockReturnValue(mockQuery);

      const result = await locationService.getLocationHistory(userId, filters);

      expect(Location.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          timestamp: {
            $gte: filters.startDate,
            $lte: filters.endDate,
          },
        })
      );
      expect(mockQuery.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(100);
      expect(result).toEqual(mockLocations);
    });
  });

  describe('getNearbyLocations', () => {
    it('debería encontrar ubicaciones cercanas', async () => {
      const lat = 19.4326;
      const lon = -99.1332;
      const radius = 1000; // 1km
      const organizationId = '507f1f77bcf86cd799439011';

      const mockSnapshots = [
        {
          userId: 'user1',
          location: {
            type: 'Point',
            coordinates: [-99.1340, 19.4330],
          },
          distance: 500,
        },
        {
          userId: 'user2',
          location: {
            type: 'Point',
            coordinates: [-99.1350, 19.4335],
          },
          distance: 800,
        },
      ];

      LocationSnapshot.aggregate = jest.fn().mockResolvedValue(mockSnapshots);

      const result = await locationService.getNearbyLocations(
        lat,
        lon,
        radius,
        organizationId
      );

      expect(LocationSnapshot.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockSnapshots);
    });
  });

  describe('getUserLocationStats', () => {
    it('debería calcular estadísticas de ubicaciones', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockStats = [
        {
          totalLocations: 1000,
          averageAccuracy: 15.5,
          maxSpeed: 120,
          totalDistance: 5000,
        },
      ];

      Location.aggregate = jest.fn().mockResolvedValue(mockStats);

      const result = await locationService.getUserLocationStats(
        userId,
        startDate,
        endDate
      );

      expect(Location.aggregate).toHaveBeenCalled();
      expect(result).toHaveProperty('totalLocations');
      expect(result).toHaveProperty('averageAccuracy');
    });
  });
});
