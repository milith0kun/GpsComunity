const mongoose = require('mongoose');
const { GROUP_TYPES, ACCURACY_LEVELS } = require('../utils/constants');

const groupSchema = new mongoose.Schema(
  {
    // Relaciones
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },

    // Información básica
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#10B981', // Hex color
    },
    icon: {
      type: String,
      default: null, // Icono (emoji o nombre de icon)
    },

    // Tipo de grupo
    type: {
      type: String,
      enum: Object.values(GROUP_TYPES),
      default: GROUP_TYPES.CUSTOM,
    },

    // Miembros del grupo
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],

    // Configuración personalizada de tracking (opcional)
    customSettings: {
      enabled: {
        type: Boolean,
        default: false, // Si false, usar settings de la organización
      },
      tracking: {
        interval: {
          type: Number,
          default: 60,
          min: 10,
        },
        accuracy: {
          type: String,
          enum: Object.values(ACCURACY_LEVELS),
          default: ACCURACY_LEVELS.HIGH,
        },
      },
    },

    // Geofences asociados al grupo
    geofenceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Geofence',
      },
    ],

    // Supervisor del grupo (opcional)
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },

    // Estadísticas
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeMembers: {
        type: Number,
        default: 0,
      },
      lastActivityAt: {
        type: Date,
        default: null,
      },
    },

    // Estado
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Timestamps
    deletedAt: {
      type: Date,
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
groupSchema.index({ organizationId: 1, active: 1 });
groupSchema.index({ type: 1 });
groupSchema.index({ createdAt: -1 });

// Virtuals
groupSchema.virtual('members', {
  ref: 'Member',
  localField: 'memberIds',
  foreignField: '_id',
});

groupSchema.virtual('geofences', {
  ref: 'Geofence',
  localField: 'geofenceIds',
  foreignField: '_id',
});

// Método: Agregar miembro
groupSchema.methods.addMember = async function (memberId) {
  if (!this.memberIds.includes(memberId)) {
    this.memberIds.push(memberId);
    this.stats.totalMembers += 1;
    await this.save();

    // Actualizar el miembro para agregar este grupo
    const Member = mongoose.model('Member');
    await Member.findByIdAndUpdate(memberId, {
      $addToSet: { groupIds: this._id },
    });
  }
};

// Método: Remover miembro
groupSchema.methods.removeMember = async function (memberId) {
  const index = this.memberIds.indexOf(memberId);
  if (index > -1) {
    this.memberIds.splice(index, 1);
    this.stats.totalMembers -= 1;
    await this.save();

    // Actualizar el miembro para remover este grupo
    const Member = mongoose.model('Member');
    await Member.findByIdAndUpdate(memberId, {
      $pull: { groupIds: this._id },
    });
  }
};

// Método: Verificar si un miembro pertenece al grupo
groupSchema.methods.hasMember = function (memberId) {
  return this.memberIds.some((id) => id.toString() === memberId.toString());
};

// Método: Agregar geofence
groupSchema.methods.addGeofence = async function (geofenceId) {
  if (!this.geofenceIds.includes(geofenceId)) {
    this.geofenceIds.push(geofenceId);
    await this.save();
  }
};

// Método: Remover geofence
groupSchema.methods.removeGeofence = async function (geofenceId) {
  const index = this.geofenceIds.indexOf(geofenceId);
  if (index > -1) {
    this.geofenceIds.splice(index, 1);
    await this.save();
  }
};

// Método: Actualizar estadísticas
groupSchema.methods.updateStats = async function () {
  const Member = mongoose.model('Member');

  const activeMembers = await Member.countDocuments({
    _id: { $in: this.memberIds },
    status: 'active',
    'tracking.enabled': true,
  });

  this.stats.activeMembers = activeMembers;
  this.stats.lastActivityAt = new Date();
  await this.save();
};

// Pre-save: Actualizar contador de miembros
groupSchema.pre('save', function (next) {
  this.stats.totalMembers = this.memberIds.length;
  next();
});

module.exports = mongoose.model('Group', groupSchema);
