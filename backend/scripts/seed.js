/**
 * Script de Seed - Datos de prueba para desarrollo
 *
 * Uso:
 *   node scripts/seed.js
 *
 * Este script crea:
 * - 3 usuarios de prueba
 * - 2 organizaciones
 * - Miembros en las organizaciones
 * - Geofences de ejemplo
 * - Ubicaciones de prueba
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Member = require('../src/models/Member');
const Geofence = require('../src/models/Geofence');
const Location = require('../src/models/Location');
const LocationSnapshot = require('../src/models/LocationSnapshot');
const Alert = require('../src/models/Alert');
const logger = require('../src/utils/logger');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

/**
 * Conecta a la base de datos
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, '✓ Conectado a MongoDB');
  } catch (error) {
    log(colors.red, `✗ Error de conexión: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Limpia todas las colecciones
 */
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Member.deleteMany({});
    await Geofence.deleteMany({});
    await Location.deleteMany({});
    await LocationSnapshot.deleteMany({});
    await Alert.deleteMany({});
    log(colors.yellow, '✓ Base de datos limpiada');
  } catch (error) {
    log(colors.red, `✗ Error al limpiar: ${error.message}`);
    throw error;
  }
};

/**
 * Crea usuarios de prueba
 */
const createUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Password123', 10);

    const users = [
      {
        email: 'admin@gpscommunity.com',
        password: hashedPassword,
        displayName: 'Admin User',
        role: 'admin',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'manager@gpscommunity.com',
        password: hashedPassword,
        displayName: 'Manager User',
        role: 'user',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'user@gpscommunity.com',
        password: hashedPassword,
        displayName: 'Regular User',
        role: 'user',
        status: 'active',
        emailVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    log(colors.green, `✓ ${createdUsers.length} usuarios creados`);
    return createdUsers;
  } catch (error) {
    log(colors.red, `✗ Error al crear usuarios: ${error.message}`);
    throw error;
  }
};

/**
 * Crea organizaciones de prueba
 */
const createOrganizations = async (users) => {
  try {
    const organizations = [
      {
        name: 'Acme Corporation',
        description: 'Empresa de tecnología y desarrollo',
        logoURL: 'https://via.placeholder.com/200',
        ownerId: users[0]._id,
        subscription: {
          plan: 'enterprise',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          maxMembers: 100,
          maxGeofences: 50,
        },
        settings: {
          timezone: 'America/Mexico_City',
          defaultTrackingInterval: 60,
          allowMemberInvites: true,
        },
      },
      {
        name: 'Tech Startup',
        description: 'Startup innovadora de soluciones móviles',
        logoURL: 'https://via.placeholder.com/200',
        ownerId: users[1]._id,
        subscription: {
          plan: 'professional',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          maxMembers: 20,
          maxGeofences: 10,
        },
      },
    ];

    const createdOrgs = await Organization.insertMany(organizations);
    log(colors.green, `✓ ${createdOrgs.length} organizaciones creadas`);
    return createdOrgs;
  } catch (error) {
    log(colors.red, `✗ Error al crear organizaciones: ${error.message}`);
    throw error;
  }
};

/**
 * Crea miembros de prueba
 */
const createMembers = async (users, organizations) => {
  try {
    const members = [
      // Org 1 - Acme Corporation
      {
        organizationId: organizations[0]._id,
        userId: users[0]._id,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
        trackingSettings: {
          enabled: true,
          interval: 60,
        },
      },
      {
        organizationId: organizations[0]._id,
        userId: users[1]._id,
        role: 'manager',
        status: 'active',
        joinedAt: new Date(),
        trackingSettings: {
          enabled: true,
          interval: 120,
        },
      },
      {
        organizationId: organizations[0]._id,
        userId: users[2]._id,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
        trackingSettings: {
          enabled: true,
          interval: 300,
        },
      },
      // Org 2 - Tech Startup
      {
        organizationId: organizations[1]._id,
        userId: users[1]._id,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
        trackingSettings: {
          enabled: true,
          interval: 60,
        },
      },
      {
        organizationId: organizations[1]._id,
        userId: users[2]._id,
        role: 'member',
        status: 'active',
        joinedAt: new Date(),
        trackingSettings: {
          enabled: true,
          interval: 180,
        },
      },
    ];

    const createdMembers = await Member.insertMany(members);
    log(colors.green, `✓ ${createdMembers.length} miembros creados`);
    return createdMembers;
  } catch (error) {
    log(colors.red, `✗ Error al crear miembros: ${error.message}`);
    throw error;
  }
};

/**
 * Crea geofences de prueba
 */
const createGeofences = async (users, organizations) => {
  try {
    const geofences = [
      // Geofence circular - Oficina Central
      {
        organizationId: organizations[0]._id,
        name: 'Oficina Central',
        description: 'Oficinas principales de Acme Corporation',
        type: 'circle',
        geometry: {
          type: 'Point',
          coordinates: [-99.1332, 19.4326], // Ciudad de México
        },
        radius: 100, // 100 metros
        isActive: true,
        alertSettings: {
          onEnter: {
            enabled: true,
            severity: 'low',
          },
          onExit: {
            enabled: true,
            severity: 'medium',
          },
        },
        createdBy: users[0]._id,
      },
      // Geofence polígono - Zona de trabajo
      {
        organizationId: organizations[0]._id,
        name: 'Zona de Trabajo',
        description: 'Área de operaciones',
        type: 'polygon',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-99.14, 19.43],
            [-99.14, 19.44],
            [-99.13, 19.44],
            [-99.13, 19.43],
            [-99.14, 19.43],
          ]],
        },
        isActive: true,
        alertSettings: {
          onEnter: {
            enabled: false,
          },
          onExit: {
            enabled: true,
            severity: 'high',
          },
        },
        schedule: {
          enabled: true,
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
        },
        createdBy: users[0]._id,
      },
      // Geofence para segunda organización
      {
        organizationId: organizations[1]._id,
        name: 'Startup Office',
        description: 'Oficina de Tech Startup',
        type: 'circle',
        geometry: {
          type: 'Point',
          coordinates: [-99.17, 19.42],
        },
        radius: 50,
        isActive: true,
        createdBy: users[1]._id,
      },
    ];

    const createdGeofences = await Geofence.insertMany(geofences);
    log(colors.green, `✓ ${createdGeofences.length} geofences creados`);
    return createdGeofences;
  } catch (error) {
    log(colors.red, `✗ Error al crear geofences: ${error.message}`);
    throw error;
  }
};

/**
 * Crea ubicaciones de prueba
 */
const createLocations = async (users, organizations) => {
  try {
    const now = new Date();
    const locations = [];

    // Crear ubicaciones para los últimos 7 días
    for (let day = 0; day < 7; day++) {
      const date = new Date(now - day * 24 * 60 * 60 * 1000);

      // 10 ubicaciones por usuario por día
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(date.getTime() + i * 60 * 60 * 1000);

        // Usuario 1
        locations.push({
          userId: users[0]._id,
          organizationId: organizations[0]._id,
          location: {
            type: 'Point',
            coordinates: [
              -99.1332 + (Math.random() - 0.5) * 0.01,
              19.4326 + (Math.random() - 0.5) * 0.01,
            ],
          },
          accuracy: 10 + Math.random() * 20,
          speed: Math.random() * 5,
          heading: Math.random() * 360,
          timestamp,
          batteryLevel: 50 + Math.random() * 50,
          isMoving: Math.random() > 0.5,
        });

        // Usuario 2
        locations.push({
          userId: users[1]._id,
          organizationId: organizations[0]._id,
          location: {
            type: 'Point',
            coordinates: [
              -99.17 + (Math.random() - 0.5) * 0.01,
              19.42 + (Math.random() - 0.5) * 0.01,
            ],
          },
          accuracy: 10 + Math.random() * 20,
          speed: Math.random() * 5,
          heading: Math.random() * 360,
          timestamp,
          batteryLevel: 50 + Math.random() * 50,
          isMoving: Math.random() > 0.5,
        });
      }
    }

    const createdLocations = await Location.insertMany(locations);
    log(colors.green, `✓ ${createdLocations.length} ubicaciones creadas`);

    // Crear snapshots de última ubicación
    const snapshots = [
      {
        userId: users[0]._id,
        organizationId: organizations[0]._id,
        location: {
          type: 'Point',
          coordinates: [-99.1332, 19.4326],
        },
        accuracy: 15,
        timestamp: now,
        batteryLevel: 75,
      },
      {
        userId: users[1]._id,
        organizationId: organizations[0]._id,
        location: {
          type: 'Point',
          coordinates: [-99.17, 19.42],
        },
        accuracy: 12,
        timestamp: now,
        batteryLevel: 60,
      },
    ];

    const createdSnapshots = await LocationSnapshot.insertMany(snapshots);
    log(colors.green, `✓ ${createdSnapshots.length} snapshots creados`);

    return createdLocations;
  } catch (error) {
    log(colors.red, `✗ Error al crear ubicaciones: ${error.message}`);
    throw error;
  }
};

/**
 * Crea alertas de prueba
 */
const createAlerts = async (users, organizations, geofences) => {
  try {
    const alerts = [
      {
        type: 'geofence',
        severity: 'medium',
        userId: users[0]._id,
        organizationId: organizations[0]._id,
        geofenceId: geofences[0]._id,
        title: 'Salida de Geofence',
        message: 'Usuario salió de Oficina Central',
        location: {
          type: 'Point',
          coordinates: [-99.1332, 19.4326],
        },
        status: 'active',
        metadata: {
          geofenceName: 'Oficina Central',
          eventType: 'exit',
        },
      },
      {
        type: 'low_battery',
        severity: 'medium',
        userId: users[1]._id,
        organizationId: organizations[0]._id,
        title: 'Batería Baja',
        message: 'El dispositivo tiene 15% de batería',
        location: {
          type: 'Point',
          coordinates: [-99.17, 19.42],
        },
        status: 'active',
        metadata: {
          batteryLevel: 15,
        },
      },
    ];

    const createdAlerts = await Alert.insertMany(alerts);
    log(colors.green, `✓ ${createdAlerts.length} alertas creadas`);
    return createdAlerts;
  } catch (error) {
    log(colors.red, `✗ Error al crear alertas: ${error.message}`);
    throw error;
  }
};

/**
 * Función principal
 */
const seed = async () => {
  try {
    log(colors.blue, '\n========================================');
    log(colors.blue, '  Seed Script - GPS Community Backend  ');
    log(colors.blue, '========================================\n');

    await connectDB();
    await clearDatabase();

    log(colors.yellow, '\nCreando datos de prueba...\n');

    const users = await createUsers();
    const organizations = await createOrganizations(users);
    const members = await createMembers(users, organizations);
    const geofences = await createGeofences(users, organizations);
    const locations = await createLocations(users, organizations);
    const alerts = await createAlerts(users, organizations, geofences);

    log(colors.blue, '\n========================================');
    log(colors.green, '✓ Seed completado exitosamente');
    log(colors.blue, '========================================\n');

    log(colors.yellow, 'Credenciales de prueba:');
    log(colors.reset, '  Admin:   admin@gpscommunity.com / Password123');
    log(colors.reset, '  Manager: manager@gpscommunity.com / Password123');
    log(colors.reset, '  User:    user@gpscommunity.com / Password123\n');

    process.exit(0);
  } catch (error) {
    log(colors.red, `\n✗ Error en seed: ${error.message}`);
    process.exit(1);
  }
};

// Ejecutar seed
seed();
