/**
 * Script de Limpieza - Elimina datos antiguos y optimiza la base de datos
 *
 * Uso:
 *   node scripts/cleanup.js [--dry-run] [--days=90]
 *
 * Opciones:
 *   --dry-run    Muestra lo que se eliminaría sin hacer cambios
 *   --days=N     Días de antigüedad (default: 90)
 *
 * Este script:
 * - Elimina ubicaciones antiguas (respeta TTL pero permite limpieza manual)
 * - Elimina alertas resueltas antiguas
 * - Limpia usuarios marcados como eliminados hace más de 30 días
 * - Elimina organizaciones inactivas
 * - Limpia snapshots huérfanos
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const Member = require('../src/models/Member');
const Location = require('../src/models/Location');
const LocationSnapshot = require('../src/models/LocationSnapshot');
const Alert = require('../src/models/Alert');
const AuditLog = require('../src/models/AuditLog');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

// Parsear argumentos
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const daysArg = args.find((arg) => arg.startsWith('--days='));
const daysToKeep = daysArg ? parseInt(daysArg.split('=')[1]) : 90;

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
 * Limpia ubicaciones antiguas
 */
const cleanupLocations = async () => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const count = await Location.countDocuments({
      timestamp: { $lt: cutoffDate },
    });

    if (count === 0) {
      log(colors.yellow, '  No hay ubicaciones antiguas para eliminar');
      return 0;
    }

    if (!isDryRun) {
      const result = await Location.deleteMany({
        timestamp: { $lt: cutoffDate },
      });
      log(colors.green, `  ✓ ${result.deletedCount} ubicaciones eliminadas`);
      return result.deletedCount;
    } else {
      log(colors.cyan, `  [DRY RUN] Se eliminarían ${count} ubicaciones`);
      return 0;
    }
  } catch (error) {
    log(colors.red, `  ✗ Error: ${error.message}`);
    return 0;
  }
};

/**
 * Limpia alertas resueltas antiguas
 */
const cleanupAlerts = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días

    const count = await Alert.countDocuments({
      status: 'resolved',
      resolvedAt: { $lt: cutoffDate },
    });

    if (count === 0) {
      log(colors.yellow, '  No hay alertas resueltas antiguas para eliminar');
      return 0;
    }

    if (!isDryRun) {
      const result = await Alert.deleteMany({
        status: 'resolved',
        resolvedAt: { $lt: cutoffDate },
      });
      log(colors.green, `  ✓ ${result.deletedCount} alertas eliminadas`);
      return result.deletedCount;
    } else {
      log(colors.cyan, `  [DRY RUN] Se eliminarían ${count} alertas`);
      return 0;
    }
  } catch (error) {
    log(colors.red, `  ✗ Error: ${error.message}`);
    return 0;
  }
};

/**
 * Limpia usuarios eliminados antiguos
 */
const cleanupDeletedUsers = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días

    const count = await User.countDocuments({
      status: 'deleted',
      deletedAt: { $lt: cutoffDate },
    });

    if (count === 0) {
      log(colors.yellow, '  No hay usuarios eliminados antiguos');
      return 0;
    }

    if (!isDryRun) {
      // Obtener IDs de usuarios a eliminar
      const users = await User.find({
        status: 'deleted',
        deletedAt: { $lt: cutoffDate },
      }).select('_id');

      const userIds = users.map((u) => u._id);

      // Eliminar membresías asociadas
      await Member.deleteMany({ userId: { $in: userIds } });

      // Eliminar usuarios
      const result = await User.deleteMany({
        status: 'deleted',
        deletedAt: { $lt: cutoffDate },
      });

      log(colors.green, `  ✓ ${result.deletedCount} usuarios eliminados`);
      return result.deletedCount;
    } else {
      log(colors.cyan, `  [DRY RUN] Se eliminarían ${count} usuarios`);
      return 0;
    }
  } catch (error) {
    log(colors.red, `  ✗ Error: ${error.message}`);
    return 0;
  }
};

/**
 * Limpia organizaciones inactivas
 */
const cleanupInactiveOrganizations = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 días

    const count = await Organization.countDocuments({
      status: 'inactive',
      updatedAt: { $lt: cutoffDate },
    });

    if (count === 0) {
      log(colors.yellow, '  No hay organizaciones inactivas antiguas');
      return 0;
    }

    if (!isDryRun) {
      // Obtener IDs de organizaciones a eliminar
      const orgs = await Organization.find({
        status: 'inactive',
        updatedAt: { $lt: cutoffDate },
      }).select('_id');

      const orgIds = orgs.map((o) => o._id);

      // Eliminar datos relacionados
      await Member.deleteMany({ organizationId: { $in: orgIds } });
      await Location.deleteMany({ organizationId: { $in: orgIds } });
      await LocationSnapshot.deleteMany({ organizationId: { $in: orgIds } });
      await Alert.deleteMany({ organizationId: { $in: orgIds } });

      // Eliminar organizaciones
      const result = await Organization.deleteMany({
        status: 'inactive',
        updatedAt: { $lt: cutoffDate },
      });

      log(colors.green, `  ✓ ${result.deletedCount} organizaciones eliminadas`);
      return result.deletedCount;
    } else {
      log(colors.cyan, `  [DRY RUN] Se eliminarían ${count} organizaciones`);
      return 0;
    }
  } catch (error) {
    log(colors.red, `  ✗ Error: ${error.message}`);
    return 0;
  }
};

/**
 * Limpia snapshots huérfanos (sin usuario o organización)
 */
const cleanupOrphanSnapshots = async () => {
  try {
    // Obtener todos los IDs de usuarios y organizaciones
    const userIds = (await User.find({}).select('_id')).map((u) => u._id.toString());
    const orgIds = (await Organization.find({}).select('_id')).map((o) => o._id.toString());

    // Buscar snapshots huérfanos
    const orphanSnapshots = await LocationSnapshot.find({
      $or: [
        { userId: { $nin: userIds.map((id) => mongoose.Types.ObjectId(id)) } },
        { organizationId: { $nin: orgIds.map((id) => mongoose.Types.ObjectId(id)) } },
      ],
    });

    const count = orphanSnapshots.length;

    if (count === 0) {
      log(colors.yellow, '  No hay snapshots huérfanos');
      return 0;
    }

    if (!isDryRun) {
      const result = await LocationSnapshot.deleteMany({
        _id: { $in: orphanSnapshots.map((s) => s._id) },
      });

      log(colors.green, `  ✓ ${result.deletedCount} snapshots huérfanos eliminados`);
      return result.deletedCount;
    } else {
      log(colors.cyan, `  [DRY RUN] Se eliminarían ${count} snapshots huérfanos`);
      return 0;
    }
  } catch (error) {
    log(colors.red, `  ✗ Error: ${error.message}`);
    return 0;
  }
};

/**
 * Limpia logs de auditoría antiguos
 */
const cleanupAuditLogs = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000); // 180 días

    const count = await AuditLog.countDocuments({
      timestamp: { $lt: cutoffDate },
    });

    if (count === 0) {
      log(colors.yellow, '  No hay logs de auditoría antiguos');
      return 0;
    }

    if (!isDryRun) {
      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      log(colors.green, `  ✓ ${result.deletedCount} logs eliminados`);
      return result.deletedCount;
    } else {
      log(colors.cyan, `  [DRY RUN] Se eliminarían ${count} logs`);
      return 0;
    }
  } catch (error) {
    log(colors.red, `  ✗ Error: ${error.message}`);
    return 0;
  }
};

/**
 * Muestra estadísticas de la base de datos
 */
const showStats = async () => {
  try {
    log(colors.blue, '\nEstadísticas de la base de datos:');

    const stats = {
      users: await User.countDocuments(),
      organizations: await Organization.countDocuments(),
      members: await Member.countDocuments(),
      locations: await Location.countDocuments(),
      snapshots: await LocationSnapshot.countDocuments(),
      alerts: await Alert.countDocuments(),
      auditLogs: await AuditLog.countDocuments(),
    };

    Object.entries(stats).forEach(([key, value]) => {
      log(colors.reset, `  ${key}: ${value.toLocaleString()}`);
    });

    log(colors.reset, '');
  } catch (error) {
    log(colors.red, `✗ Error al obtener estadísticas: ${error.message}`);
  }
};

/**
 * Función principal
 */
const cleanup = async () => {
  try {
    log(colors.blue, '\n========================================');
    log(colors.blue, ' Cleanup Script - GPS Community Backend');
    log(colors.blue, '========================================\n');

    if (isDryRun) {
      log(colors.yellow, '⚠ MODO DRY RUN - No se realizarán cambios\n');
    }

    log(colors.cyan, `Configuración:`);
    log(colors.reset, `  Días de antigüedad: ${daysToKeep}`);
    log(colors.reset, `  Modo: ${isDryRun ? 'Dry Run' : 'Producción'}\n`);

    await connectDB();
    await showStats();

    log(colors.blue, 'Ejecutando limpieza...\n');

    let totalDeleted = 0;

    log(colors.cyan, '1. Limpiando ubicaciones antiguas...');
    totalDeleted += await cleanupLocations();

    log(colors.cyan, '\n2. Limpiando alertas resueltas...');
    totalDeleted += await cleanupAlerts();

    log(colors.cyan, '\n3. Limpiando usuarios eliminados...');
    totalDeleted += await cleanupDeletedUsers();

    log(colors.cyan, '\n4. Limpiando organizaciones inactivas...');
    totalDeleted += await cleanupInactiveOrganizations();

    log(colors.cyan, '\n5. Limpiando snapshots huérfanos...');
    totalDeleted += await cleanupOrphanSnapshots();

    log(colors.cyan, '\n6. Limpiando logs de auditoría...');
    totalDeleted += await cleanupAuditLogs();

    await showStats();

    log(colors.blue, '\n========================================');
    if (isDryRun) {
      log(colors.yellow, '✓ Dry run completado - No se hicieron cambios');
    } else {
      log(colors.green, `✓ Limpieza completada - ${totalDeleted} registros eliminados`);
    }
    log(colors.blue, '========================================\n');

    process.exit(0);
  } catch (error) {
    log(colors.red, `\n✗ Error en cleanup: ${error.message}`);
    process.exit(1);
  }
};

// Ejecutar cleanup
cleanup();
