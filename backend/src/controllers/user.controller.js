const User = require('../models/User');
const { successResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Usuarios
 */

/**
 * Obtiene todos los usuarios (admin only)
 * GET /api/v1/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, status, limit = 20, page = 1 } = req.query;

  const query = {};

  // Filtro de búsqueda
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ];
  }

  // Filtro de estado
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password')
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return paginatedResponse(
    res,
    users.map((u) => u.toPublicJSON()),
    parseInt(page),
    parseInt(limit),
    total,
    'Lista de usuarios'
  );
});

/**
 * Obtiene un usuario por ID
 * GET /api/v1/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      },
    });
  }

  return successResponse(res, user.toPublicJSON(), 'Usuario encontrado');
});

/**
 * Actualiza un usuario
 * PATCH /api/v1/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Solo el propio usuario puede actualizarse
  if (req.user._id.toString() !== id) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No puedes actualizar otros usuarios',
      },
    });
  }

  // Campos permitidos para actualizar
  const allowedUpdates = ['displayName', 'photoURL', 'phone', 'preferences'];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      },
    });
  }

  logger.info(`Usuario actualizado: ${user.email}`);

  return successResponse(res, user.toPublicJSON(), 'Usuario actualizado');
});

/**
 * Elimina un usuario (soft delete)
 * DELETE /api/v1/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Solo el propio usuario puede eliminarse
  if (req.user._id.toString() !== id) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No puedes eliminar otros usuarios',
      },
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      },
    });
  }

  // Soft delete
  user.status = 'deleted';
  user.deletedAt = new Date();
  await user.save();

  logger.info(`Usuario eliminado: ${user.email}`);

  return successResponse(res, null, 'Usuario eliminado exitosamente');
});

/**
 * Actualiza las preferencias del usuario
 * PATCH /api/v1/users/:id/preferences
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const preferences = req.body;

  // Solo el propio usuario puede actualizar sus preferencias
  if (req.user._id.toString() !== id) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No puedes actualizar preferencias de otros usuarios',
      },
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      },
    });
  }

  // Actualizar preferencias
  user.preferences = {
    ...user.preferences,
    ...preferences,
  };

  await user.save();

  logger.info(`Preferencias actualizadas para usuario: ${user.email}`);

  return successResponse(res, user.preferences, 'Preferencias actualizadas');
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePreferences,
};
