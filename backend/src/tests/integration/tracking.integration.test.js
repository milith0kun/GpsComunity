const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const Member = require('../../models/Member');
const Location = require('../../models/Location');

describe('Tracking Integration Tests', () => {
  let server;
  let accessToken;
  let testUser;
  let testOrganization;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Member.deleteMany({});
    await Location.deleteMany({});
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Limpiar datos
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Member.deleteMany({});
    await Location.deleteMany({});

    // Crear usuario de prueba
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tracking-test@example.com',
        password: 'Password123',
        displayName: 'Tracking Test User',
      });

    accessToken = registerResponse.body.data.tokens.accessToken;
    testUser = registerResponse.body.data.user;

    // Crear organización de prueba
    const orgResponse = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Organization',
        description: 'Organization for tracking tests',
      });

    testOrganization = orgResponse.body.data.organization;
  });

  describe('POST /api/v1/locations', () => {
    it('debería crear una nueva ubicación', async () => {
      const locationData = {
        organizationId: testOrganization.id,
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date().toISOString(),
        speed: 0,
        heading: 0,
        batteryLevel: 85,
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(locationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('location');
      expect(response.body.data.location).toHaveProperty('id');

      // Verificar que la ubicación fue guardada
      const savedLocation = await Location.findById(response.body.data.location.id);
      expect(savedLocation).toBeTruthy();
      expect(savedLocation.location.coordinates[1]).toBeCloseTo(19.4326);
      expect(savedLocation.location.coordinates[0]).toBeCloseTo(-99.1332);
    });

    it('debería validar latitud y longitud', async () => {
      const invalidLocationData = {
        organizationId: testOrganization.id,
        latitude: 200, // inválido
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidLocationData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('debería requerir autenticación', async () => {
      const locationData = {
        organizationId: testOrganization.id,
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(locationData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/locations/batch', () => {
    it('debería crear múltiples ubicaciones', async () => {
      const locationsData = {
        locations: [
          {
            organizationId: testOrganization.id,
            latitude: 19.4326,
            longitude: -99.1332,
            accuracy: 15,
            timestamp: new Date(Date.now() - 60000).toISOString(),
          },
          {
            organizationId: testOrganization.id,
            latitude: 19.4330,
            longitude: -99.1340,
            accuracy: 20,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/locations/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(locationsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.saved).toBe(2);
      expect(response.body.data.locations).toHaveLength(2);

      // Verificar que las ubicaciones fueron guardadas
      const count = await Location.countDocuments({ userId: testUser.id });
      expect(count).toBe(2);
    });

    it('debería validar array de ubicaciones', async () => {
      const invalidData = {
        locations: [], // vacío
      };

      const response = await request(app)
        .post('/api/v1/locations/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/locations/current/:userId', () => {
    beforeEach(async () => {
      // Crear una ubicación para el usuario
      await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          organizationId: testOrganization.id,
          latitude: 19.4326,
          longitude: -99.1332,
          accuracy: 15,
          timestamp: new Date().toISOString(),
        });
    });

    it('debería obtener la ubicación actual del usuario', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/current/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('location');
      expect(response.body.data.location.coordinates).toHaveLength(2);
    });

    it('debería rechazar acceso sin autenticación', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/current/${testUser.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/locations/history/:userId', () => {
    beforeEach(async () => {
      // Crear varias ubicaciones históricas
      const locations = [];
      for (let i = 0; i < 5; i++) {
        locations.push({
          organizationId: testOrganization.id,
          latitude: 19.4326 + i * 0.001,
          longitude: -99.1332 + i * 0.001,
          accuracy: 15,
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
        });
      }

      await request(app)
        .post('/api/v1/locations/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ locations });
    });

    it('debería obtener historial de ubicaciones', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/history/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debería filtrar por rango de fechas', async () => {
      const startDate = new Date(Date.now() - 2 * 60000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/locations/history/${testUser.id}`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('debería paginar resultados', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/history/${testUser.id}`)
        .query({ limit: 2 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/v1/locations/stats/:userId', () => {
    beforeEach(async () => {
      // Crear ubicaciones con diferentes estadísticas
      const locations = [
        {
          organizationId: testOrganization.id,
          latitude: 19.4326,
          longitude: -99.1332,
          accuracy: 10,
          speed: 20,
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
        {
          organizationId: testOrganization.id,
          latitude: 19.4330,
          longitude: -99.1340,
          accuracy: 15,
          speed: 30,
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
        {
          organizationId: testOrganization.id,
          latitude: 19.4335,
          longitude: -99.1345,
          accuracy: 20,
          speed: 25,
          timestamp: new Date().toISOString(),
        },
      ];

      await request(app)
        .post('/api/v1/locations/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ locations });
    });

    it('debería obtener estadísticas de ubicaciones', async () => {
      const response = await request(app)
        .get(`/api/v1/locations/stats/${testUser.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalLocations');
      expect(response.body.data).toHaveProperty('averageAccuracy');
      expect(response.body.data.totalLocations).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/locations/nearby', () => {
    beforeEach(async () => {
      // Crear ubicaciones en diferentes posiciones
      await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          organizationId: testOrganization.id,
          latitude: 19.4326,
          longitude: -99.1332,
          accuracy: 15,
          timestamp: new Date().toISOString(),
        });
    });

    it('debería encontrar ubicaciones cercanas', async () => {
      const response = await request(app)
        .get('/api/v1/locations/nearby')
        .query({
          lat: 19.4326,
          lon: -99.1332,
          radius: 1000, // 1km
          organizationId: testOrganization.id,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('debería validar parámetros de búsqueda', async () => {
      const response = await request(app)
        .get('/api/v1/locations/nearby')
        .query({
          lat: 200, // inválido
          lon: -99.1332,
          radius: 1000,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('debería aplicar rate limiting a endpoints de ubicación', async () => {
      const locationData = {
        organizationId: testOrganization.id,
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
        timestamp: new Date().toISOString(),
      };

      // Hacer muchas peticiones rápidamente
      const requests = [];
      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app)
            .post('/api/v1/locations')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(locationData)
        );
      }

      const responses = await Promise.all(requests);

      // Algunas deberían ser rechazadas por rate limiting
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
