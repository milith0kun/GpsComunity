import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../tracking/presentation/bloc/tracking_bloc.dart';
import '../../../tracking/presentation/bloc/tracking_state.dart';
import '../../../organization/presentation/bloc/organization_bloc.dart';
import '../../../organization/presentation/bloc/organization_state.dart';
import '../../../organization/presentation/bloc/organization_event.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/error_widget.dart';

/// Pantalla principal de la aplicación
/// Dashboard con resumen de actividad y acceso rápido a funciones
class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    // Cargar organizaciones del usuario
    context.read<OrganizationBloc>().add(GetMyOrganizations());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GPS Community'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: Navegar a notificaciones
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              // TODO: Navegar a configuración
            },
          ),
        ],
      ),
      drawer: _buildDrawer(context),
      body: _buildBody(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map),
            label: 'Mapa',
          ),
          NavigationDestination(
            icon: Icon(Icons.business_outlined),
            selectedIcon: Icon(Icons.business),
            label: 'Organizaciones',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildDashboard();
      case 1:
        return _buildMapView();
      case 2:
        return _buildOrganizationsView();
      case 3:
        return _buildProfileView();
      default:
        return _buildDashboard();
    }
  }

  Widget _buildDashboard() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        if (authState is! Authenticated) {
          return const Center(child: Text('No autenticado'));
        }

        return RefreshIndicator(
          onRefresh: () async {
            context.read<OrganizationBloc>().add(GetMyOrganizations());
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Saludo
                Text(
                  '¡Hola, ${authState.user.displayName}!',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),

                Text(
                  'Bienvenido de vuelta',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                const SizedBox(height: 24),

                // Cards de acciones rápidas
                Row(
                  children: [
                    Expanded(
                      child: _QuickActionCard(
                        title: 'Ver Mapa',
                        icon: Icons.map,
                        color: Colors.blue,
                        onTap: () {
                          setState(() {
                            _selectedIndex = 1;
                          });
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _QuickActionCard(
                        title: 'Tracking',
                        icon: Icons.my_location,
                        color: Colors.green,
                        onTap: () {
                          context.push('/tracking');
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Mis organizaciones
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Mis Organizaciones',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _selectedIndex = 2;
                        });
                      },
                      child: const Text('Ver todas'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                BlocBuilder<OrganizationBloc, OrganizationState>(
                  builder: (context, state) {
                    if (state is OrganizationLoading) {
                      return const LoadingWidget();
                    } else if (state is OrganizationError) {
                      return CompactErrorWidget(
                        message: state.message,
                        onRetry: () {
                          context.read<OrganizationBloc>().add(GetMyOrganizations());
                        },
                      );
                    } else if (state is OrganizationsLoaded) {
                      if (state.organizations.isEmpty) {
                        return _EmptyOrganizationsCard(
                          onCreateOrganization: () {
                            context.push('/organizations/create');
                          },
                        );
                      }

                      return Column(
                        children: state.organizations
                            .take(3)
                            .map((org) => _OrganizationCard(
                                  name: org.name,
                                  memberCount: org.membersCount ?? 0,
                                  onTap: () {
                                    context.push('/organizations/${org.id}');
                                  },
                                ))
                            .toList(),
                      );
                    }

                    return const SizedBox();
                  },
                ),
                const SizedBox(height: 24),

                // Estado de tracking
                _TrackingStatusCard(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMapView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.map, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            'Vista de mapa',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          const Text('Funcionalidad en desarrollo'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              // TODO: Navegar a vista de mapa completa
            },
            child: const Text('Abrir mapa completo'),
          ),
        ],
      ),
    );
  }

  Widget _buildOrganizationsView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.business, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            'Organizaciones',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          const Text('Lista completa en desarrollo'),
        ],
      ),
    );
  }

  Widget _buildProfileView() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is! Authenticated) {
          return const Center(child: Text('No autenticado'));
        }

        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text(
                  state.user.displayName[0].toUpperCase(),
                  style: TextStyle(
                    fontSize: 36,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                state.user.displayName,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                state.user.email,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  // TODO: Navegar a perfil completo
                },
                child: const Text('Ver perfil'),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is! Authenticated) {
            return const SizedBox();
          }

          return ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    CircleAvatar(
                      radius: 30,
                      child: Text(
                        state.user.displayName[0].toUpperCase(),
                        style: const TextStyle(fontSize: 24),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      state.user.displayName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      state.user.email,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Mi perfil'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Navegar a perfil
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Configuración'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Navegar a configuración
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.help_outline),
                title: const Text('Ayuda'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: const Text('Acerca de'),
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: const Text('Cerrar sesión', style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Mostrar diálogo de confirmación y cerrar sesión
                },
              ),
            ],
          );
        },
      ),
    );
  }
}

// Widget de tarjeta de acción rápida
class _QuickActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: color.withOpacity(0.1),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Icon(icon, size: 32, color: color),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Widget de tarjeta de organización
class _OrganizationCard extends StatelessWidget {
  final String name;
  final int memberCount;
  final VoidCallback onTap;

  const _OrganizationCard({
    required this.name,
    required this.memberCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          child: Icon(Icons.business),
        ),
        title: Text(name),
        subtitle: Text('$memberCount miembros'),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

// Widget de organizaciones vacías
class _EmptyOrganizationsCard extends StatelessWidget {
  final VoidCallback onCreateOrganization;

  const _EmptyOrganizationsCard({
    required this.onCreateOrganization,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(
              Icons.business_outlined,
              size: 48,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              'No tienes organizaciones',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Crea una organización para empezar a rastrear ubicaciones',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onCreateOrganization,
              icon: const Icon(Icons.add),
              label: const Text('Crear organización'),
            ),
          ],
        ),
      ),
    );
  }
}

// Widget de estado de tracking
class _TrackingStatusCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TrackingBloc, TrackingState>(
      builder: (context, state) {
        final bool isTracking = state is TrackingActive;

        return Card(
          color: isTracking
              ? Colors.green.withOpacity(0.1)
              : Theme.of(context).colorScheme.surfaceVariant,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  isTracking ? Icons.location_on : Icons.location_off,
                  color: isTracking ? Colors.green : Colors.grey,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isTracking ? 'Tracking activo' : 'Tracking inactivo',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isTracking
                            ? 'Tu ubicación se está compartiendo'
                            : 'Inicia tracking para compartir tu ubicación',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () {
                    context.push('/tracking');
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
