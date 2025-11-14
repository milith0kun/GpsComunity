const mongoose = require('mongoose');
const { ROLES, MEMBER_STATUS, ROLE_PERMISSIONS } = require('../utils/constants');

const memberSchema = new mongoose.Schema(
  {
    // Relaciones
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    // Rol y permisos
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
      index: true,
    },

    // Permisos específicos (override del rol, null = usar default del rol)
    permissions: {
      canViewAllLocations: { type: Boolean, default: null },
      canViewLocationHistory: { type: Boolean, default: null },
      canManageMembers: { type: Boolean, default: null },
      canManageGroups: { type: Boolean, default: null },
      canManageGeofences: { type: Boolean, default: null },
      canManageSettings: { type: Boolean, default: null },
      canViewReports: { type: Boolean, default: null },
      canGenerateReports: { type: Boolean, default: null },
      canManageSubscription: { type: Boolean, default: null },
    },

    // Tracking
    tracking: {
      enabled: {
        type: Boolean,
        default: false,
      },
      consentGiven: {
        type: Boolean,
        default: false,
      },
      consentDate: {
        type: Date,
        default: null,
      },
      lastLocationAt: {
        type: Date,
        default: null,
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
    },

    // Información adicional
    displayName: {
      type: String,
      default: null, // Si null, usar el del User
    },
    position: {
      type: String,
      default: null, // Cargo/puesto
    },
    department: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },

    // Grupos a los que pertenece
    groupIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],

    // Invitación
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    invitedAt: {
      type: Date,
      default: null,
    },
    inviteToken: {
      type: String,
      default: null,
      select: false,
    },
    inviteAcceptedAt: {
      type: Date,
      default: null,
    },

    // Estado
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUS),
      default: MEMBER_STATUS.PENDING,
      index: true,
    },

    // Timestamps de soft delete
    removedAt: {
      type: Date,
      default: null,
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices
memberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
memberSchema.index({ organizationId: 1, status: 1 });
memberSchema.index({ userId: 1, status: 1 });
memberSchema.index({ role: 1 });
memberSchema.index({ 'tracking.isOnline': 1 });
memberSchema.index({ 'tracking.lastLocationAt': -1 });

// Virtual: user
memberSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual: organization
memberSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'organizationId',
  foreignField: '_id',
  justOne: true,
});

// Método: Verificar permisos
memberSchema.methods.hasPermission = function (permission) {
  // Si el permiso está explícitamente configurado, usar ese valor
  if (this.permissions[permission] !== null && this.permissions[permission] !== undefined) {
    return this.permissions[permission];
  }

  // Si no, usar los defaults del rol
  return ROLE_PERMISSIONS[this.role]?.[permission] || false;
};

// Método: Verificar si es owner
memberSchema.methods.isOwner = function () {
  return this.role === ROLES.OWNER;
};

// Método: Verificar si es admin o owner
memberSchema.methods.isAdminOrOwner = function () {
  return this.role === ROLES.OWNER || this.role === ROLES.ADMIN;
};

// Método: Verificar si puede gestionar a otro miembro
memberSchema.methods.canManageMember = function (targetMember) {
  // Owners pueden gestionar a todos
  if (this.isOwner()) return true;

  // Admins pueden gestionar a managers y members
  if (this.role === ROLES.ADMIN) {
    return [ROLES.MANAGER, ROLES.MEMBER].includes(targetMember.role);
  }

  // Managers no pueden gestionar a nadie (a menos que tenga permiso custom)
  return this.hasPermission('canManageMembers');
};

// Método: Activar tracking
memberSchema.methods.enableTracking = async function (consentGiven = false) {
  this.tracking.enabled = true;
  if (consentGiven) {
    this.tracking.consentGiven = true;
    this.tracking.consentDate = new Date();
  }
  await this.save();
};

// Método: Desactivar tracking
memberSchema.methods.disableTracking = async function () {
  this.tracking.enabled = false;
  this.tracking.isOnline = false;
  await this.save();
};

// Método: Actualizar estado online
memberSchema.methods.updateOnlineStatus = async function (isOnline) {
  this.tracking.isOnline = isOnline;
  if (isOnline) {
    this.tracking.lastLocationAt = new Date();
  }
  await this.save();
};

module.exports = mongoose.model('Member', memberSchema);
