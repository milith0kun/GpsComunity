const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../services/auth.service');
const User = require('../../models/User');
const { AppError } = require('../../middleware/error.middleware');

// Mock de los modelos
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: userData.email,
        displayName: userData.displayName,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      jwt.sign = jest.fn()
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('debería lanzar error si el email ya existe', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      User.findOne = jest.fn().mockResolvedValue({ email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow(AppError);
      await expect(authService.register(userData)).rejects.toThrow(
        'El email ya está registrado'
      );
    });
  });

  describe('login', () => {
    it('debería hacer login exitosamente con credenciales válidas', async () => {
      const email = 'test@example.com';
      const password = 'Password123';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        password: 'hashedPassword',
        status: 'active',
        accountLocked: false,
        loginAttempts: 0,
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          id: '507f1f77bcf86cd799439011',
          email,
        }),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn()
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.login(email, password);

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
    });

    it('debería incrementar intentos de login con contraseña incorrecta', async () => {
      const email = 'test@example.com';
      const password = 'WrongPassword';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        password: 'hashedPassword',
        status: 'active',
        accountLocked: false,
        loginAttempts: 2,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Credenciales inválidas'
      );
      expect(mockUser.loginAttempts).toBe(3);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('debería bloquear la cuenta después de 5 intentos fallidos', async () => {
      const email = 'test@example.com';
      const password = 'WrongPassword';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        password: 'hashedPassword',
        status: 'active',
        accountLocked: false,
        loginAttempts: 4,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow();
      expect(mockUser.accountLocked).toBe(true);
      expect(mockUser.lockUntil).toBeDefined();
    });

    it('debería rechazar login de cuenta bloqueada', async () => {
      const email = 'test@example.com';
      const password = 'Password123';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        accountLocked: true,
        lockUntil: new Date(Date.now() + 30 * 60 * 1000),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Cuenta bloqueada temporalmente'
      );
    });
  });

  describe('changePassword', () => {
    it('debería cambiar la contraseña exitosamente', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'OldPassword123';
      const newPassword = 'NewPassword123';

      const mockUser = {
        _id: userId,
        password: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('hashedNewPassword');

      await authService.changePassword(userId, currentPassword, newPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPassword,
        mockUser.password
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUser.password).toBe('hashedNewPassword');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('debería rechazar cambio con contraseña actual incorrecta', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'WrongPassword';
      const newPassword = 'NewPassword123';

      const mockUser = {
        _id: userId,
        password: 'hashedOldPassword',
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Contraseña actual incorrecta');
    });
  });

  describe('refreshAccessToken', () => {
    it('debería generar un nuevo access token con refresh token válido', async () => {
      const refreshToken = 'validRefreshToken';
      const userId = '507f1f77bcf86cd799439011';

      const mockUser = {
        _id: userId,
        refreshToken,
        status: 'active',
      };

      jwt.verify = jest.fn().mockReturnValue({ userId });
      User.findById = jest.fn().mockResolvedValue(mockUser);
      jwt.sign = jest.fn().mockReturnValue('newAccessToken');

      const result = await authService.refreshAccessToken(refreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(
        refreshToken,
        process.env.JWT_SECRET
      );
      expect(result).toHaveProperty('accessToken', 'newAccessToken');
    });

    it('debería rechazar refresh token inválido', async () => {
      const refreshToken = 'invalidRefreshToken';

      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).rejects.toThrow();
    });
  });
});
