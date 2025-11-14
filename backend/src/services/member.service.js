const Member = require('../models/Member');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { ROLES, MEMBER_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Servicio de Miembros
 */

/**
 * Invita un usuario a una organización
 * @param {string} organizationId
 * @param {Object} inviteData - { email, role, displayName }
 * @param {string} inviterId - ID del usuario que invita
 * @returns {Promise<Object>} Member creado
 */
const inviteMember = async (organizationId, inviteData, inviterId) => {
  try {
    const { email, role = ROLES.MEMBER, displayName } = inviteData;

    // Buscar usuario por email
    let user = await User.findOne({ email });

    // Si el usuario no existe, crear uno temporal
    if (!user) {
      user = new User({
        email,
        displayName: displayName || email.split('@')[0],
        status: 'inactive', // Se activará cuando acepte la invitación
      });
      await user.save();
    }

    // Verificar si ya es miembro
    const existingMember = await Member.findOne({
      organizationId,
      userId: user._id,
    });

    if (existingMember && existingMember.status === MEMBER_STATUS.ACTIVE) {
      throw {
        statusCode: 409,
        code: 'ALREADY_MEMBER',
        message: 'El usuario ya es miembro de esta organización',
      };
    }

    // Crear o actualizar membership
    let member;

    if (existingMember) {
      // Reactivar membership existente
      existingMember.status = MEMBER_STATUS.PENDING;
      existingMember.role = role;
      existingMember.invitedBy = inviterId;
      existingMember.invitedAt = new Date();
      member = await existingMember.save();
    } else {
      // Crear nuevo member
      member = new Member({
        organizationId,
        userId: user._id,
        role,
        status: MEMBER_STATUS.PENDING,
        invitedBy: inviterId,
        invitedAt: new Date(),
        displayName,
      });
      await member.save();
    }

    // Actualizar stats de la organización
    const organization = await Organization.findById(organizationId);
    if (organization) {
      organization.stats.totalMembers = await Member.countDocuments({
        organizationId,
        status: { $in: [MEMBER_STATUS.ACTIVE, MEMBER_STATUS.PENDING] },
      });
      await organization.save();
    }

    logger.info(`Usuario ${email} invitado a organización ${organizationId}`);

    return member;
  } catch (error) {
    logger.error('Error en inviteMember:', error);
    throw error;
  }
};

/**
 * Obtiene los miembros de una organización
 * @param {string} organizationId
 * @param {Object} filters - { role, status, search }
 * @returns {Promise<Array>} Array de miembros
 */
const getOrganizationMembers = async (organizationId, filters = {}) => {
  try {
    const query = { organizationId };

    // Filtros
    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.status) {
      query.status = filters.status;
    } else {
      // Por defecto, solo activos y pending
      query.status = { $in: [MEMBER_STATUS.ACTIVE, MEMBER_STATUS.PENDING] };
    }

    const members = await Member.find(query)
      .populate('userId', 'displayName email photoURL')
      .populate('invitedBy', 'displayName email')
      .sort({ createdAt: -1 });

    return members;
  } catch (error) {
    logger.error('Error en getOrganizationMembers:', error);
    throw error;
  }
};

/**
 * Obtiene un miembro por ID
 * @param {string} memberId
 * @returns {Promise<Object>} Member
 */
const getMemberById = async (memberId) => {
  try {
    const member = await Member.findById(memberId)
      .populate('userId', 'displayName email photoURL phone')
      .populate('organizationId', 'name slug')
      .populate('groupIds', 'name color');

    if (!member) {
      throw {
        statusCode: 404,
        code: 'MEMBER_NOT_FOUND',
        message: 'Miembro no encontrado',
      };
    }

    return member;
  } catch (error) {
    logger.error('Error en getMemberById:', error);
    throw error;
  }
};

/**
 * Actualiza un miembro
 * @param {string} memberId
 * @param {Object} updateData
 * @returns {Promise<Object>} Member actualizado
 */
const updateMember = async (memberId, updateData) => {
  try {
    const member = await Member.findByIdAndUpdate(
      memberId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'displayName email');

    if (!member) {
      throw {
        statusCode: 404,
        code: 'MEMBER_NOT_FOUND',
        message: 'Miembro no encontrado',
      };
    }

    logger.info(`Miembro actualizado: ${member.userId?.displayName}`);

    return member;
  } catch (error) {
    logger.error('Error en updateMember:', error);
    throw error;
  }
};

/**
 * Actualiza el rol de un miembro
 * @param {string} memberId
 * @param {string} newRole
 * @returns {Promise<Object>} Member actualizado
 */
const updateMemberRole = async (memberId, newRole) => {
  try {
    const member = await Member.findById(memberId);

    if (!member) {
      throw {
        statusCode: 404,
        code: 'MEMBER_NOT_FOUND',
        message: 'Miembro no encontrado',
      };
    }

    // No se puede cambiar el rol del owner
    if (member.role === ROLES.OWNER) {
      throw {
        statusCode: 403,
        code: 'CANNOT_CHANGE_OWNER',
        message: 'No se puede cambiar el rol del propietario',
      };
    }

    member.role = newRole;
    await member.save();

    logger.info(`Rol actualizado para miembro ${memberId} a ${newRole}`);

    return member;
  } catch (error) {
    logger.error('Error en updateMemberRole:', error);
    throw error;
  }
};

/**
 * Elimina un miembro de una organización
 * @param {string} memberId
 * @param {string} removedBy - ID del usuario que elimina
 * @returns {Promise<void>}
 */
const removeMember = async (memberId, removedBy) => {
  try {
    const member = await Member.findById(memberId);

    if (!member) {
      throw {
        statusCode: 404,
        code: 'MEMBER_NOT_FOUND',
        message: 'Miembro no encontrado',
      };
    }

    // No se puede eliminar al owner
    if (member.role === ROLES.OWNER) {
      throw {
        statusCode: 403,
        code: 'CANNOT_REMOVE_OWNER',
        message: 'No se puede eliminar al propietario',
      };
    }

    // Soft delete
    member.status = MEMBER_STATUS.REMOVED;
    member.removedAt = new Date();
    member.removedBy = removedBy;
    await member.save();

    // Actualizar stats de la organización
    const organization = await Organization.findById(member.organizationId);
    if (organization) {
      organization.stats.totalMembers = await Member.countDocuments({
        organizationId: member.organizationId,
        status: { $in: [MEMBER_STATUS.ACTIVE, MEMBER_STATUS.PENDING] },
      });
      await organization.save();
    }

    logger.info(`Miembro ${memberId} eliminado de organización ${member.organizationId}`);
  } catch (error) {
    logger.error('Error en removeMember:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de tracking de un miembro
 * @param {string} memberId
 * @param {Object} trackingData - { enabled, consentGiven }
 * @returns {Promise<Object>} Member actualizado
 */
const updateMemberTracking = async (memberId, trackingData) => {
  try {
    const member = await Member.findById(memberId);

    if (!member) {
      throw {
        statusCode: 404,
        code: 'MEMBER_NOT_FOUND',
        message: 'Miembro no encontrado',
      };
    }

    // Actualizar tracking
    member.tracking = {
      ...member.tracking,
      ...trackingData,
    };

    if (trackingData.consentGiven) {
      member.tracking.consentDate = new Date();
    }

    await member.save();

    logger.info(`Tracking actualizado para miembro ${memberId}`);

    return member;
  } catch (error) {
    logger.error('Error en updateMemberTracking:', error);
    throw error;
  }
};

/**
 * Acepta una invitación
 * @param {string} memberId
 * @param {string} userId - ID del usuario que acepta
 * @returns {Promise<Object>} Member actualizado
 */
const acceptInvitation = async (memberId, userId) => {
  try {
    const member = await Member.findById(memberId);

    if (!member) {
      throw {
        statusCode: 404,
        code: 'MEMBER_NOT_FOUND',
        message: 'Invitación no encontrada',
      };
    }

    if (member.userId.toString() !== userId.toString()) {
      throw {
        statusCode: 403,
        code: 'UNAUTHORIZED',
        message: 'No autorizado para aceptar esta invitación',
      };
    }

    if (member.status !== MEMBER_STATUS.PENDING) {
      throw {
        statusCode: 400,
        code: 'INVALID_STATUS',
        message: 'La invitación no está pendiente',
      };
    }

    member.status = MEMBER_STATUS.ACTIVE;
    member.inviteAcceptedAt = new Date();
    await member.save();

    logger.info(`Invitación aceptada por usuario ${userId}`);

    return member;
  } catch (error) {
    logger.error('Error en acceptInvitation:', error);
    throw error;
  }
};

module.exports = {
  inviteMember,
  getOrganizationMembers,
  getMemberById,
  updateMember,
  updateMemberRole,
  removeMember,
  updateMemberTracking,
  acceptInvitation,
};
