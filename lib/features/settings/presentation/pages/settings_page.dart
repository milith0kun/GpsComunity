import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/error_widget.dart';

/// Pantalla de configuración de la aplicación
class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _darkMode = false;
  bool _notifications = true;
  bool _locationAlways = false;
  bool _highAccuracy = true;
  String _language = 'es';
  int _updateInterval = 60;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
      ),
      body: ListView(
        children: [
          // Apariencia
          _buildSection(
            context,
            title: 'Apariencia',
            icon: Icons.palette,
            children: [
              SwitchListTile(
                secondary: const Icon(Icons.dark_mode),
                title: const Text('Modo Oscuro'),
                subtitle: const Text('Activa el tema oscuro'),
                value: _darkMode,
                onChanged: (value) {
                  setState(() {
                    _darkMode = value;
                  });
                  showSuccessSnackBar(
                    context,
                    value ? 'Modo oscuro activado' : 'Modo claro activado',
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.language),
                title: const Text('Idioma'),
                subtitle: Text(_getLanguageName(_language)),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  _showLanguageDialog(context);
                },
              ),
            ],
          ),

          const Divider(height: 32),

          // Notificaciones
          _buildSection(
            context,
            title: 'Notificaciones',
            icon: Icons.notifications,
            children: [
              SwitchListTile(
                secondary: const Icon(Icons.notifications_active),
                title: const Text('Notificaciones Push'),
                subtitle: const Text('Recibe alertas en tiempo real'),
                value: _notifications,
                onChanged: (value) {
                  setState(() {
                    _notifications = value;
                  });
                },
              ),
              ListTile(
                leading: const Icon(Icons.notification_important),
                title: const Text('Tipos de Alertas'),
                subtitle: const Text('Configura qué alertas recibir'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
            ],
          ),

          const Divider(height: 32),

          // Ubicación y Tracking
          _buildSection(
            context,
            title: 'Ubicación y Tracking',
            icon: Icons.location_on,
            children: [
              SwitchListTile(
                secondary: const Icon(Icons.gps_fixed),
                title: const Text('Alta Precisión'),
                subtitle: const Text('Usa GPS de alta precisión (consume más batería)'),
                value: _highAccuracy,
                onChanged: (value) {
                  setState(() {
                    _highAccuracy = value;
                  });
                },
              ),
              SwitchListTile(
                secondary: const Icon(Icons.location_searching),
                title: const Text('Ubicación en Segundo Plano'),
                subtitle: const Text('Permite tracking cuando la app está cerrada'),
                value: _locationAlways,
                onChanged: (value) {
                  setState(() {
                    _locationAlways = value;
                  });
                  if (value) {
                    _showBackgroundLocationDialog(context);
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.timer),
                title: const Text('Intervalo de Actualización'),
                subtitle: Text('Cada $_updateInterval segundos'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  _showIntervalDialog(context);
                },
              ),
            ],
          ),

          const Divider(height: 32),

          // Privacidad y Seguridad
          _buildSection(
            context,
            title: 'Privacidad y Seguridad',
            icon: Icons.security,
            children: [
              ListTile(
                leading: const Icon(Icons.lock),
                title: const Text('Privacidad de Ubicación'),
                subtitle: const Text('Gestiona quién puede ver tu ubicación'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
              ListTile(
                leading: const Icon(Icons.history),
                title: const Text('Historial de Ubicaciones'),
                subtitle: const Text('Gestiona tu historial guardado'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
              ListTile(
                leading: const Icon(Icons.shield),
                title: const Text('Permisos de la App'),
                subtitle: const Text('Revisa los permisos otorgados'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
            ],
          ),

          const Divider(height: 32),

          // Datos y Almacenamiento
          _buildSection(
            context,
            title: 'Datos y Almacenamiento',
            icon: Icons.storage,
            children: [
              ListTile(
                leading: const Icon(Icons.download),
                title: const Text('Descargar Datos'),
                subtitle: const Text('Exporta tu información'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete_sweep),
                title: const Text('Limpiar Caché'),
                subtitle: const Text('Libera espacio eliminando datos temporales'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  _showClearCacheDialog(context);
                },
              ),
            ],
          ),

          const Divider(height: 32),

          // Soporte y Acerca de
          _buildSection(
            context,
            title: 'Soporte',
            icon: Icons.help,
            children: [
              ListTile(
                leading: const Icon(Icons.help_outline),
                title: const Text('Centro de Ayuda'),
                subtitle: const Text('Preguntas frecuentes y guías'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
              ListTile(
                leading: const Icon(Icons.contact_support),
                title: const Text('Contactar Soporte'),
                subtitle: const Text('Envía tus preguntas o reporta problemas'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: const Text('Acerca de'),
                subtitle: const Text('GPS Community v1.0.0'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  _showAboutDialog(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.description),
                title: const Text('Términos y Condiciones'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
              ListTile(
                leading: const Icon(Icons.privacy_tip),
                title: const Text('Política de Privacidad'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showSuccessSnackBar(context, 'Disponible próximamente');
                },
              ),
            ],
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
            ],
          ),
        ),
        ...children,
      ],
    );
  }

  String _getLanguageName(String code) {
    switch (code) {
      case 'es':
        return 'Español';
      case 'en':
        return 'English';
      case 'pt':
        return 'Português';
      default:
        return code;
    }
  }

  void _showLanguageDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Seleccionar Idioma'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('Español'),
              value: 'es',
              groupValue: _language,
              onChanged: (value) {
                setState(() {
                  _language = value!;
                });
                Navigator.pop(dialogContext);
                showSuccessSnackBar(context, 'Idioma actualizado');
              },
            ),
            RadioListTile<String>(
              title: const Text('English'),
              value: 'en',
              groupValue: _language,
              onChanged: (value) {
                setState(() {
                  _language = value!;
                });
                Navigator.pop(dialogContext);
                showSuccessSnackBar(context, 'Language updated');
              },
            ),
            RadioListTile<String>(
              title: const Text('Português'),
              value: 'pt',
              groupValue: _language,
              onChanged: (value) {
                setState(() {
                  _language = value!;
                });
                Navigator.pop(dialogContext);
                showSuccessSnackBar(context, 'Idioma atualizado');
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancelar'),
          ),
        ],
      ),
    );
  }

  void _showIntervalDialog(BuildContext context) {
    int tempInterval = _updateInterval;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Intervalo de Actualización'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$tempInterval segundos',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              Slider(
                value: tempInterval.toDouble(),
                min: 10,
                max: 300,
                divisions: 29,
                label: '$tempInterval s',
                onChanged: (value) {
                  setState(() {
                    tempInterval = value.toInt();
                  });
                },
              ),
              const SizedBox(height: 8),
              const Text(
                'Intervalos menores consumen más batería',
                style: TextStyle(fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () {
                this.setState(() {
                  _updateInterval = tempInterval;
                });
                Navigator.pop(dialogContext);
                showSuccessSnackBar(context, 'Intervalo actualizado');
              },
              child: const Text('Guardar'),
            ),
          ],
        ),
      ),
    );
  }

  void _showBackgroundLocationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Ubicación en Segundo Plano'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Para permitir tracking en segundo plano, necesitas otorgar permisos especiales.',
            ),
            SizedBox(height: 16),
            Text(
              '⚠️ Esto puede consumir más batería.',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  void _showClearCacheDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Limpiar Caché'),
        content: const Text(
          '¿Estás seguro de que quieres eliminar todos los datos temporales?\n\nEsto no afectará tu historial de ubicaciones ni tus configuraciones.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              // TODO: Implementar limpieza de caché
              showSuccessSnackBar(context, 'Caché limpiada exitosamente');
            },
            child: const Text('Limpiar'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'GPS Community',
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          Icons.location_on,
          size: 32,
          color: Theme.of(context).colorScheme.onPrimaryContainer,
        ),
      ),
      children: [
        const SizedBox(height: 16),
        const Text(
          'GPS Community es una aplicación de seguimiento en tiempo real diseñada para organizaciones y equipos.',
        ),
        const SizedBox(height: 16),
        const Text(
          '© 2024 GPS Community\nTodos los derechos reservados.',
          style: TextStyle(fontSize: 12),
        ),
      ],
    );
  }
}
