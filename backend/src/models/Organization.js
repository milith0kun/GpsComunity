const mongoose = require('mongoose');
const {
  ORGANIZATION_STATUS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  ACCURACY_LEVELS,
} = require('../utils/constants');

const organizationSchema = new mongoose.Schema(
  {
    // Información básica
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    logoURL: {
      type: String,
      default: null,
    },

    // Propietario
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },

    // Suscripción
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SUBSCRIPTION_PLANS),
        default: SUBSCRIPTION_PLANS.FREE,
        index: true,
      },
      status: {
        type: String,
        enum: Object.values(SUBSCRIPTION_STATUS),
        default: SUBSCRIPTION_STATUS.TRIAL,
        index: true,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: null,
      },
      trialEndsAt: {
        type: Date,
        default: () => {
          const trialDays = parseInt(process.env.TRIAL_DAYS) || 14;
          const date = new Date();
          date.setDate(date.getDate() + trialDays);
          return date;
        },
      },
      maxUsers: {
        type: Number,
        default: 5, // Plan free
      },
      // Stripe
      stripeCustomerId: {
        type: String,
        default: null,
      },
      stripeSubscriptionId: {
        type: String,
        default: null,
      },
    },

    // Configuración de tracking
    settings: {
      tracking: {
        defaultInterval: {
          type: Number,
          default: 60, // segundos
          min: 10,
          max: 3600,
        },
        defaultAccuracy: {
          type: String,
          enum: Object.values(ACCURACY_LEVELS),
          default: ACCURACY_LEVELS.HIGH,
        },
        enableBackgroundTracking: {
          type: Boolean,
          default: true,
        },
        dataRetentionDays: {
          type: Number,
          default: 90,
          min: 7,
          max: 365,
        },
      },
      geofencing: {
        enabled: {
          type: Boolean,
          default: true,
        },
        alertOnEnter: {
          type: Boolean,
          default: true,
        },
        alertOnExit: {
          type: Boolean,
          default: true,
        },
        maxGeofences: {
          type: Number,
          default: 10,
        },
      },
      alerts: {
        sosEnabled: {
          type: Boolean,
          default: true,
        },
        batteryLowThreshold: {
          type: Number,
          default: 15,
          min: 5,
          max: 30,
        },
        inactivityAlertMinutes: {
          type: Number,
          default: 60,
          min: 15,
        },
        speedLimitEnabled: {
          type: Boolean,
          default: false,
        },
        speedLimitKmh: {
          type: Number,
          default: 80,
        },
      },
      privacy: {
        allowHistoryAccess: {
          type: Boolean,
          default: true,
        },
        requireLocationConsent: {
          type: Boolean,
          default: true,
        },
        showRealNames: {
          type: Boolean,
          default: true,
        },
        allowDataExport: {
          type: Boolean,
          default: true,
        },
      },
    },

    // Estadísticas (actualizado por triggers o jobs)
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeMembers: {
        type: Number,
        default: 0,
      },
      totalGroups: {
        type: Number,
        default: 0,
      },
      totalGeofences: {
        type: Number,
        default: 0,
      },
      lastActivityAt: {
        type: Date,
        default: null,
      },
    },

    // Estado
    status: {
      type: String,
      enum: Object.values(ORGANIZATION_STATUS),
      default: ORGANIZATION_STATUS.ACTIVE,
      index: true,
    },

    // Timestamps de soft delete
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
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ createdAt: -1 });

// Virtuals
organizationSchema.virtual('members', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'organizationId',
});

organizationSchema.virtual('groups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'organizationId',
});

organizationSchema.virtual('geofences', {
  ref: 'Geofence',
  localField: '_id',
  foreignField: 'organizationId',
});

// Método: Verificar si está en trial
organizationSchema.methods.isInTrial = function () {
  return (
    this.subscription.status === SUBSCRIPTION_STATUS.TRIAL &&
    this.subscription.trialEndsAt > new Date()
  );
};

// Método: Verificar si el trial ha expirado
organizationSchema.methods.hasTrialExpired = function () {
  return (
    this.subscription.status === SUBSCRIPTION_STATUS.TRIAL &&
    this.subscription.trialEndsAt <= new Date()
  );
};

// Método: Verificar si la suscripción está activa
organizationSchema.methods.hasActiveSubscription = function () {
  return (
    this.subscription.status === SUBSCRIPTION_STATUS.ACTIVE ||
    this.isInTrial()
  );
};

// Método: Verificar si puede agregar más usuarios
organizationSchema.methods.canAddUser = function () {
  if (this.subscription.maxUsers === -1) return true; // Ilimitado
  return this.stats.totalMembers < this.subscription.maxUsers;
};

// Método: Verificar si puede agregar más geofences
organizationSchema.methods.canAddGeofence = function () {
  const max = this.settings.geofencing.maxGeofences;
  if (max === -1) return true; // Ilimitado
  return this.stats.totalGeofences < max;
};

module.exports = mongoose.model('Organization', organizationSchema);
