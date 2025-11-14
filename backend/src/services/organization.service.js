const Organization = require('../models/Organization');
const Member = require('../models/Member');
const User = require('../models/User');
const { generateSlug } = require('../utils/validators');
const { ROLES, MEMBER_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Servicio de Organizaciones
 */

/**
 * Crea una nueva organización
 * @param {Object} orgData - Datos de la organización
 * @param {string} userId - ID del creador (owner)
 * @returns {Promise<Object>} { organization, member }
 */
const createOrganization = async (orgData, userId) => {
  try {
    const { name, description } = orgData;

    // Generar slug único
    let slug = generateSlug(name);

    // Verificar si el slug ya existe
    let existingOrg = await Organization.findOne({ slug });
    let counter = 1;

    while (existingOrg) {
      slug = `${generateSlug(name)}-${counter}`;
      existingOrg = await Organization.findOne({ slug });
      counter++;
    }

    // Crear organización
    const organization = new Organization({
      name,
      slug,
      description: description || '',
      ownerId: userId,
    });

    await organization.save();

    // Crear membership para el owner
    const member = new Member({
      organizationId: organization._id,
      userId,
      role: ROLES.OWNER,
      status: MEMBER_STATUS.ACTIVE,
      tracking: {
        enabled: false,
        consentGiven: false,
      },
    });

    await member.save();

    // Actualizar stats de la organización
    organization.stats.totalMembers = 1;
    organization.stats.activeMembers = 1;
    await organization.save();

    logger.info(`Organización creada: ${name} por usuario ${userId}`);

    return {
      organization,
      member,
    };
  } catch (error) {
    logger.error('Error en createOrganization:', error);
    throw error;
  }
};

/**
 * Obtiene las organizaciones de un usuario
 * @param {string} userId
 * @returns {Promise<Array>} Array de organizaciones con memberships
 */
const getUserOrganizations = async (userId) => {
  try {
    const members = await Member.find({
      userId,
      status: MEMBER_STATUS.ACTIVE,
    })
      .populate('organizationId')
      .sort({ createdAt: -1 });

    const organizations = members.map((m) => ({
      organization: m.organizationId,
      member: m,
      role: m.role,
      joinedAt: m.createdAt,
    }));

    return organizations;
  } catch (error) {
    logger.error('Error en getUserOrganizations:', error);
    throw error;
  }
};

/**
 * Obtiene una organización por ID
 * @param {string} orgId
 * @returns {Promise<Object>} Organization
 */
const getOrganizationById = async (orgId) => {
  try {
    const organization = await Organization.findById(orgId).populate('ownerId', 'displayName email');

    if (!organization) {
      throw {
        statusCode: 404,
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organización no encontrada',
      };
    }

    return organization;
  } catch (error) {
    logger.error('Error en getOrganizationById:', error);
    throw error;
  }
};

/**
 * Actualiza una organización
 * @param {string} orgId
 * @param {Object} updateData
 * @returns {Promise<Object>} Organization actualizada
 */
const updateOrganization = async (orgId, updateData) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      orgId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!organization) {
      throw {
        statusCode: 404,
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organización no encontrada',
      };
    }

    logger.info(`Organización actualizada: ${organization.name}`);

    return organization;
  } catch (error) {
    logger.error('Error en updateOrganization:', error);
    throw error;
  }
};

/**
 * Elimina una organización (soft delete)
 * @param {string} orgId
 * @returns {Promise<void>}
 */
const deleteOrganization = async (orgId) => {
  try {
    const organization = await Organization.findById(orgId);

    if (!organization) {
      throw {
        statusCode: 404,
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organización no encontrada',
      };
    }

    // Soft delete
    organization.status = 'deleted';
    organization.deletedAt = new Date();
    await organization.save();

    // Desactivar todos los miembros
    await Member.updateMany(
      { organizationId: orgId },
      { status: MEMBER_STATUS.REMOVED, removedAt: new Date() }
    );

    logger.info(`Organización eliminada: ${organization.name}`);
  } catch (error) {
    logger.error('Error en deleteOrganization:', error);
    throw error;
  }
};

/**
 * Actualiza configuración de la organización
 * @param {string} orgId
 * @param {Object} settings
 * @returns {Promise<Object>} Organization
 */
const updateOrganizationSettings = async (orgId, settings) => {
  try {
    const organization = await Organization.findById(orgId);

    if (!organization) {
      throw {
        statusCode: 404,
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organización no encontrada',
      };
    }

    // Actualizar settings
    organization.settings = {
      ...organization.settings,
      ...settings,
    };

    await organization.save();

    logger.info(`Settings actualizados para organización: ${organization.name}`);

    return organization;
  } catch (error) {
    logger.error('Error en updateOrganizationSettings:', error);
    throw error;
  }
};

/**
 * Actualiza la suscripción de una organización
 * @param {string} orgId
 * @param {Object} subscriptionData
 * @returns {Promise<Object>} Organization
 */
const updateSubscription = async (orgId, subscriptionData) => {
  try {
    const organization = await Organization.findById(orgId);

    if (!organization) {
      throw {
        statusCode: 404,
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organización no encontrada',
      };
    }

    // Actualizar subscription
    organization.subscription = {
      ...organization.subscription,
      ...subscriptionData,
    };

    await organization.save();

    logger.info(`Suscripción actualizada para: ${organization.name}`);

    return organization;
  } catch (error) {
    logger.error('Error en updateSubscription:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de una organización
 * @param {string} orgId
 * @returns {Promise<Object>} Stats
 */
const getOrganizationStats = async (orgId) => {
  try {
    const organization = await Organization.findById(orgId);

    if (!organization) {
      throw {
        statusCode: 404,
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organización no encontrada',
      };
    }

    // Contar miembros activos
    const activeMembers = await Member.countDocuments({
      organizationId: orgId,
      status: MEMBER_STATUS.ACTIVE,
    });

    // Contar miembros con tracking habilitado
    const trackingEnabled = await Member.countDocuments({
      organizationId: orgId,
      status: MEMBER_STATUS.ACTIVE,
      'tracking.enabled': true,
    });

    // Contar miembros online (última ubicación < 5 min)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineMembers = await Member.countDocuments({
      organizationId: orgId,
      status: MEMBER_STATUS.ACTIVE,
      'tracking.enabled': true,
      'tracking.lastLocationAt': { $gte: fiveMinutesAgo },
    });

    return {
      totalMembers: organization.stats.totalMembers,
      activeMembers,
      trackingEnabled,
      onlineMembers,
      totalGroups: organization.stats.totalGroups,
      totalGeofences: organization.stats.totalGeofences,
      subscription: {
        plan: organization.subscription.plan,
        status: organization.subscription.status,
        maxUsers: organization.subscription.maxUsers,
      },
    };
  } catch (error) {
    logger.error('Error en getOrganizationStats:', error);
    throw error;
  }
};

module.exports = {
  createOrganization,
  getUserOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  updateOrganizationSettings,
  updateSubscription,
  getOrganizationStats,
};
