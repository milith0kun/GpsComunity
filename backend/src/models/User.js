const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_STATUS, LANGUAGES, TIMEZONES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    // Identificación
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Información personal
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    photoURL: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },

    // Autenticación local (si no usa Firebase)
    password: {
      type: String,
      select: false, // No incluir en queries por defecto
    },

    // Verificación
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },

    // Recuperación de contraseña
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },

    // Seguridad
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastPasswordChange: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },

    // Preferencias
    preferences: {
      language: {
        type: String,
        enum: Object.values(LANGUAGES),
        default: LANGUAGES.ES,
      },
      timezone: {
        type: String,
        default: TIMEZONES.LIMA,
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
    },

    // Estado
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
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
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.resetPasswordToken;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Índices
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1 });

// Virtual: memberships
userSchema.virtual('memberships', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'userId',
});

// Pre-save hook: Hash password si es modificado
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.lastPasswordChange = new Date();
  }

  next();
});

// Método: Comparar contraseña
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método: Verificar si la cuenta está bloqueada
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Método: Incrementar intentos fallidos de login
userSchema.methods.incrementFailedAttempts = async function () {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.ACCOUNT_LOCK_TIME) || 30; // minutos

  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= maxAttempts) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + lockTime);
    this.accountLockedUntil = lockUntil;
  }

  await this.save();
};

// Método: Resetear intentos fallidos
userSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = null;
  await this.save();
};

// Método: Obtener objeto público (sin datos sensibles)
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName,
    photoURL: this.photoURL,
    phone: this.phone,
    emailVerified: this.emailVerified,
    preferences: this.preferences,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
