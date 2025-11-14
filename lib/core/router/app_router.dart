import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Auth pages
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';

// Home pages
import '../../features/home/presentation/pages/home_page.dart';

// Tracking pages
import '../../features/tracking/presentation/pages/tracking_page.dart';

/// Configuración de rutas de la aplicación
class AppRouter {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String map = '/map';
  static const String profile = '/profile';
  static const String organizations = '/organizations';
  static const String organizationDetail = '/organizations/:id';
  static const String createOrganization = '/organizations/create';
  static const String members = '/organizations/:id/members';
  static const String tracking = '/tracking';
  static const String settings = '/settings';

  /// Configuración del router
  static final GoRouter router = GoRouter(
    initialLocation: splash,
    debugLogDiagnostics: true,
    routes: [
      // Splash / Inicio
      GoRoute(
        path: splash,
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),

      // Autenticación
      GoRoute(
        path: login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),

      // Home
      GoRoute(
        path: home,
        name: 'home',
        builder: (context, state) => const HomePage(),
        routes: [
          // Mapa
          GoRoute(
            path: 'map',
            name: 'map',
            builder: (context, state) => const MapPage(),
          ),
        ],
      ),

      // Organizaciones
      GoRoute(
        path: organizations,
        name: 'organizations',
        builder: (context, state) => const OrganizationsPage(),
        routes: [
          // Crear organización
          GoRoute(
            path: 'create',
            name: 'createOrganization',
            builder: (context, state) => const CreateOrganizationPage(),
          ),
          // Detalle de organización
          GoRoute(
            path: ':id',
            name: 'organizationDetail',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return OrganizationDetailPage(organizationId: id);
            },
            routes: [
              // Miembros
              GoRoute(
                path: 'members',
                name: 'members',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return MembersPage(organizationId: id);
                },
              ),
            ],
          ),
        ],
      ),

      // Tracking
      GoRoute(
        path: tracking,
        name: 'tracking',
        builder: (context, state) => const TrackingPage(),
      ),

      // Perfil
      GoRoute(
        path: profile,
        name: 'profile',
        builder: (context, state) => const ProfilePage(),
      ),

      // Configuración
      GoRoute(
        path: settings,
        name: 'settings',
        builder: (context, state) => const SettingsPage(),
      ),
    ],

    // Manejo de errores
    errorBuilder: (context, state) => _ErrorPage(error: state.error),

    // Redirección basada en autenticación
    redirect: (context, state) {
      // TODO: Implementar lógica de redirección basada en estado de auth
      // Por ahora, permite acceso a todas las rutas
      return null;
    },
  );
}

// ============================================================================
// Páginas temporales (placeholders para páginas no implementadas)
// ============================================================================

class MapPage extends StatelessWidget {
  const MapPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mapa')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.map, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Mapa - Pendiente de implementar'),
          ],
        ),
      ),
    );
  }
}

class OrganizationsPage extends StatelessWidget {
  const OrganizationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Organizaciones')),
      body: const Center(
        child: Text('Lista de Organizaciones - Pendiente'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('${AppRouter.organizations}/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class CreateOrganizationPage extends StatelessWidget {
  const CreateOrganizationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear Organización')),
      body: const Center(
        child: Text('Formulario de Creación - Pendiente'),
      ),
    );
  }
}

class OrganizationDetailPage extends StatelessWidget {
  final String organizationId;

  const OrganizationDetailPage({super.key, required this.organizationId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle de Organización')),
      body: Center(
        child: Text('Organización ID: $organizationId - Pendiente'),
      ),
    );
  }
}

class MembersPage extends StatelessWidget {
  final String organizationId;

  const MembersPage({super.key, required this.organizationId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Miembros')),
      body: Center(
        child: Text('Miembros de organización: $organizationId - Pendiente'),
      ),
    );
  }
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Mi Perfil - Pendiente'),
          ],
        ),
      ),
    );
  }
}

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Configuración')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.settings, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Configuración de la App - Pendiente'),
          ],
        ),
      ),
    );
  }
}

class _ErrorPage extends StatelessWidget {
  final Exception? error;

  const _ErrorPage({this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 100, color: Colors.red),
            const SizedBox(height: 20),
            const Text(
              'Página no encontrada',
              style: TextStyle(fontSize: 24),
            ),
            const SizedBox(height: 20),
            Text(error?.toString() ?? 'Error desconocido'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => context.go(AppRouter.splash),
              child: const Text('Ir al inicio'),
            ),
          ],
        ),
      ),
    );
  }
}
