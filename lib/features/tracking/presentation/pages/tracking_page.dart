import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../bloc/tracking_bloc.dart';
import '../bloc/tracking_event.dart';
import '../bloc/tracking_state.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/error_widget.dart';

/// Pantalla de control de tracking de ubicación
class TrackingPage extends StatefulWidget {
  const TrackingPage({Key? key}) : super(key: key);

  @override
  State<TrackingPage> createState() => _TrackingPageState();
}

class _TrackingPageState extends State<TrackingPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Control de Tracking'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocConsumer<TrackingBloc, TrackingState>(
        listener: (context, state) {
          if (state is TrackingError) {
            showErrorSnackBar(context, state.message);
          } else if (state is TrackingActive) {
            showSuccessSnackBar(context, 'Tracking iniciado');
          } else if (state is TrackingInactive) {
            showSuccessSnackBar(context, 'Tracking detenido');
          }
        },
        builder: (context, state) {
          if (state is TrackingLoading) {
            return const LoadingWidget(
              message: 'Configurando tracking...',
            );
          }

          final bool isTracking = state is TrackingActive;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Estado visual
                _TrackingStatusVisual(isTracking: isTracking),
                const SizedBox(height: 32),

                // Información del estado
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              isTracking ? Icons.check_circle : Icons.info_outline,
                              color: isTracking ? Colors.green : Colors.grey,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                isTracking
                                    ? 'Tu ubicación se está compartiendo'
                                    : 'Tracking desactivado',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          isTracking
                              ? 'Los miembros de tus organizaciones pueden ver tu ubicación en tiempo real.'
                              : 'Tu ubicación no se está compartiendo. Activa el tracking para que otros puedan verte en el mapa.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Botón de control
                ElevatedButton(
                  onPressed: () {
                    if (isTracking) {
                      context.read<TrackingBloc>().add(TrackingStopRequested());
                    } else {
                      context.read<TrackingBloc>().add(TrackingStartRequested());
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    backgroundColor: isTracking ? Colors.red : Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(isTracking ? Icons.stop : Icons.play_arrow),
                      const SizedBox(width: 8),
                      Text(
                        isTracking ? 'Detener Tracking' : 'Iniciar Tracking',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Configuración de tracking
                if (isTracking) ...[
                  Text(
                    'Configuración',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),

                  _TrackingSettingsCard(state: state as TrackingActive),
                  const SizedBox(height: 24),
                ],

                // Estadísticas
                if (isTracking) ...[
                  Text(
                    'Estadísticas',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),

                  _TrackingStatsCard(state: state as TrackingActive),
                ],

                // Información adicional
                const SizedBox(height: 32),
                _TrackingInfoSection(),
              ],
            ),
          );
        },
      ),
    );
  }
}

// Widget visual del estado de tracking
class _TrackingStatusVisual extends StatelessWidget {
  final bool isTracking;

  const _TrackingStatusVisual({required this.isTracking});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isTracking
              ? [Colors.green.shade400, Colors.green.shade700]
              : [Colors.grey.shade300, Colors.grey.shade500],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Icon(
              isTracking ? Icons.location_on : Icons.location_off,
              size: 64,
              color: isTracking ? Colors.green : Colors.grey,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            isTracking ? 'ACTIVO' : 'INACTIVO',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
            ),
          ),
        ],
      ),
    );
  }
}

// Widget de configuración de tracking
class _TrackingSettingsCard extends StatelessWidget {
  final TrackingActive state;

  const _TrackingSettingsCard({required this.state});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            ListTile(
              leading: const Icon(Icons.timer_outlined),
              title: const Text('Intervalo de actualización'),
              subtitle: Text('${state.settings?.updateInterval ?? 60} segundos'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // TODO: Mostrar diálogo para cambiar intervalo
              },
            ),
            const Divider(),
            SwitchListTile(
              secondary: const Icon(Icons.gps_fixed),
              title: const Text('Alta precisión'),
              subtitle: const Text('Consume más batería'),
              value: state.settings?.highAccuracy ?? true,
              onChanged: (value) {
                // TODO: Cambiar configuración
              },
            ),
            const Divider(),
            SwitchListTile(
              secondary: const Icon(Icons.notifications_outlined),
              title: const Text('Notificaciones'),
              subtitle: const Text('Alertas de geofence y eventos'),
              value: true,
              onChanged: (value) {
                // TODO: Cambiar configuración
              },
            ),
          ],
        ),
      ),
    );
  }
}

// Widget de estadísticas de tracking
class _TrackingStatsCard extends StatelessWidget {
  final TrackingActive state;

  const _TrackingStatsCard({required this.state});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: _StatItem(
                    icon: Icons.location_on,
                    label: 'Ubicaciones',
                    value: '${state.locationCount ?? 0}',
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatItem(
                    icon: Icons.schedule,
                    label: 'Tiempo activo',
                    value: _formatDuration(state.trackingDuration),
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _StatItem(
                    icon: Icons.route,
                    label: 'Distancia',
                    value: '${(state.totalDistance ?? 0).toStringAsFixed(1)} km',
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _StatItem(
                    icon: Icons.battery_charging_full,
                    label: 'Batería',
                    value: '${state.batteryLevel ?? 100}%',
                    color: Colors.purple,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration? duration) {
    if (duration == null) return '0m';
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }
}

// Widget de item de estadística
class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// Widget de información sobre tracking
class _TrackingInfoSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Text(
                  'Sobre el tracking',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _InfoItem(
              icon: Icons.privacy_tip_outlined,
              text: 'Tu ubicación solo es visible para miembros de tus organizaciones',
            ),
            const SizedBox(height: 12),
            _InfoItem(
              icon: Icons.battery_alert_outlined,
              text: 'El tracking en segundo plano puede consumir batería',
            ),
            const SizedBox(height: 12),
            _InfoItem(
              icon: Icons.wifi_outlined,
              text: 'Las ubicaciones se sincronizan cuando hay conexión',
            ),
          ],
        ),
      ),
    );
  }
}

// Widget de item de información
class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoItem({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
        ),
      ],
    );
  }
}
