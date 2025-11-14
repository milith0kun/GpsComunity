const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Auth Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Conectar a base de datos de prueba
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Limpiar base de datos y cerrar conexión
    await User.deleteMany({});
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
  });

  beforeEach(async () => {
    // Limpiar usuarios antes de cada test
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');

      // Verificar que el usuario fue creado en la BD
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.displayName).toBe(userData.displayName);
    });

    it('debería rechazar registro con email duplicado', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123',
        displayName: 'Test User',
      };

      // Primer registro
      await request(app).post('/api/v1/auth/register').send(userData).expect(201);

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('ya está registrado');
    });

    it('debería validar formato de email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        displayName: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('debería validar fortaleza de contraseña', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        displayName: 'Test User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('contraseña');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Crear usuario de prueba
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'login-test@example.com',
          password: 'Password123',
          displayName: 'Login Test User',
        });

      testUser = response.body.data.user;
    });

    it('debería hacer login exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe('login-test@example.com');
    });

    it('debería rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Credenciales inválidas');
    });

    it('debería rechazar login con email inexistente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debería bloquear cuenta después de múltiples intentos fallidos', async () => {
      // Hacer 5 intentos fallidos
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'login-test@example.com',
            password: 'WrongPassword',
          });
      }

      // El sexto intento debería indicar cuenta bloqueada
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Password123',
        })
        .expect(401);

      expect(response.body.error.message).toContain('bloqueada');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken;
    let testUser;

    beforeEach(async () => {
      // Registrar y obtener token
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'me-test@example.com',
          password: 'Password123',
          displayName: 'Me Test User',
        });

      accessToken = response.body.data.tokens.accessToken;
      testUser = response.body.data.user;
    });

    it('debería obtener perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('me-test@example.com');
    });

    it('debería rechazar petición sin token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('token');
    });

    it('debería rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'refresh-test@example.com',
          password: 'Password123',
          displayName: 'Refresh Test User',
        });

      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('debería generar nuevo access token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('debería rechazar refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    let accessToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'change-pass@example.com',
          password: 'OldPassword123',
          displayName: 'Change Pass User',
        });

      accessToken = response.body.data.tokens.accessToken;
    });

    it('debería cambiar contraseña exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar que puede hacer login con nueva contraseña
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'change-pass@example.com',
          password: 'NewPassword123',
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('debería rechazar cambio con contraseña actual incorrecta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('incorrecta');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'logout-test@example.com',
          password: 'Password123',
          displayName: 'Logout Test User',
        });

      accessToken = response.body.data.tokens.accessToken;
    });

    it('debería hacer logout exitosamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
