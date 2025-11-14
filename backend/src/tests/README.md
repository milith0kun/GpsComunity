# Tests Backend - GPS Community

## Estructura de Tests

```
tests/
├── unit/                    # Tests unitarios
│   ├── auth.service.test.js
│   └── location.service.test.js
├── integration/             # Tests de integración
│   ├── auth.integration.test.js
│   └── tracking.integration.test.js
└── README.md
```

## Tipos de Tests

### Tests Unitarios (Unit Tests)
Pruebas aisladas de funciones y servicios individuales.

**Ubicación:** `src/tests/unit/`

**Cobertura:**
- `auth.service.test.js` - Servicio de autenticación
  - Registro de usuarios
  - Login y logout
  - Cambio de contraseña
  - Refresh tokens
  - Bloqueo de cuentas

- `location.service.test.js` - Servicio de ubicaciones
  - Guardar ubicaciones
  - Batch de ubicaciones
  - Historial de ubicaciones
  - Ubicaciones cercanas
  - Estadísticas

### Tests de Integración (Integration Tests)
Pruebas de endpoints completos con base de datos real.

**Ubicación:** `src/tests/integration/`

**Cobertura:**
- `auth.integration.test.js` - API de autenticación
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - GET /api/v1/auth/me
  - POST /api/v1/auth/refresh-token
  - POST /api/v1/auth/change-password
  - POST /api/v1/auth/logout

- `tracking.integration.test.js` - API de tracking
  - POST /api/v1/locations
  - POST /api/v1/locations/batch
  - GET /api/v1/locations/current/:userId
  - GET /api/v1/locations/history/:userId
  - GET /api/v1/locations/stats/:userId
  - GET /api/v1/locations/nearby

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Solo tests unitarios
```bash
npm test -- src/tests/unit
```

### Solo tests de integración
```bash
npm test -- src/tests/integration
```

### Con cobertura
```bash
npm test -- --coverage
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

### Test específico
```bash
npm test -- auth.service.test.js
```

## Configuración

### Variables de Entorno
Los tests usan `.env.test` para configuración:
- Base de datos de prueba separada
- JWT secrets de prueba
- Servicios externos deshabilitados
- Rate limiting más permisivo

### Base de Datos
**Importante:** Los tests usan una base de datos separada (`gpscommunity_test`) para no afectar datos de desarrollo.

### Limpieza Automática
Los tests limpian automáticamente:
- Datos de usuario antes/después de cada test
- Conexiones de base de datos al finalizar
- Mocks y spies entre tests

## Cobertura de Código

### Objetivos (definidos en jest.config.js)
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Ver reporte de cobertura
```bash
npm test -- --coverage
# El reporte HTML estará en: coverage/lcov-report/index.html
```

## Buenas Prácticas

### 1. Tests Independientes
Cada test debe poder ejecutarse de forma independiente sin depender de otros.

### 2. Limpieza de Datos
Siempre limpiar datos en `beforeEach` y `afterAll`:
```javascript
beforeEach(async () => {
  await User.deleteMany({});
});
```

### 3. Mocks Apropiados
- Tests unitarios: Mock de dependencias externas
- Tests de integración: Base de datos real, mock de servicios externos

### 4. Nombres Descriptivos
```javascript
it('debería rechazar login con contraseña incorrecta', async () => {
  // Test code
});
```

### 5. Assertions Claras
```javascript
expect(response.body.success).toBe(true);
expect(response.body.data).toHaveProperty('user');
```

## Añadir Nuevos Tests

### Test Unitario
1. Crear archivo en `src/tests/unit/`
2. Nombrar: `[nombre].service.test.js`
3. Mock de dependencias externas
4. Test de funciones individuales

### Test de Integración
1. Crear archivo en `src/tests/integration/`
2. Nombrar: `[nombre].integration.test.js`
3. Setup de datos de prueba en `beforeEach`
4. Test de endpoints completos
5. Verificar base de datos después de operaciones

## CI/CD

Los tests se ejecutan automáticamente en:
- Pre-commit hooks (tests unitarios rápidos)
- Pull requests (todos los tests)
- Merge a main (tests + coverage)

## Debugging Tests

### Ver output detallado
```bash
npm test -- --verbose
```

### Debugging con Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Solo ejecutar test que falló
```bash
npm test -- --onlyFailures
```

## Troubleshooting

### Error: "Jest did not exit one second after the test run has completed"
- Solución: Verificar que todas las conexiones de BD se cierren en `afterAll`

### Error: "MongoError: E11000 duplicate key error"
- Solución: Asegurar limpieza de datos en `beforeEach`

### Tests lentos
- Reducir número de registros en datos de prueba
- Usar `jest --maxWorkers=4` para paralelizar
- Verificar que BCRYPT_ROUNDS sea bajo en .env.test (4)

## Próximos Tests a Implementar

### Alta Prioridad
- [ ] Organization service tests
- [ ] Member service tests
- [ ] Geofence service tests
- [ ] Alert service tests

### Media Prioridad
- [ ] WebSocket tests
- [ ] RBAC middleware tests
- [ ] Rate limiting tests

### Baja Prioridad
- [ ] E2E tests con Cypress/Playwright
- [ ] Performance tests
- [ ] Load tests

## Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) (futuro)

## Contacto

Para preguntas sobre tests:
- Revisar este README
- Consultar ejemplos en archivos existentes
- Abrir issue en el repositorio
