import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/error_widget.dart';
import '../../../../features/auth/presentation/widgets/auth_text_field.dart';
import '../../../../features/auth/presentation/widgets/auth_button.dart';
import '../bloc/organization_bloc.dart';
import '../bloc/organization_event.dart';
import '../bloc/organization_state.dart';

/// Pantalla para crear una nueva organización
class CreateOrganizationPage extends StatefulWidget {
  const CreateOrganizationPage({Key? key}) : super(key: key);

  @override
  State<CreateOrganizationPage> createState() => _CreateOrganizationPageState();
}

class _CreateOrganizationPageState extends State<CreateOrganizationPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _handleCreate() {
    if (_formKey.currentState!.validate()) {
      context.read<OrganizationBloc>().add(
            CreateOrganization(
              name: _nameController.text.trim(),
              description: _descriptionController.text.trim(),
            ),
          );
    }
  }

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'El nombre es requerido';
    }
    if (value.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (value.trim().length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    return null;
  }

  String? _validateDescription(String? value) {
    if (value != null && value.trim().length > 500) {
      return 'La descripción no puede exceder 500 caracteres';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva Organización'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: BlocListener<OrganizationBloc, OrganizationState>(
        listener: (context, state) {
          if (state is OrganizationCreated) {
            showSuccessSnackBar(
              context,
              'Organización creada exitosamente',
            );
            context.pop();
            // Navegar a la página de detalles de la nueva organización
            context.push('/organizations/${state.organization.id}');
          } else if (state is OrganizationError) {
            showErrorSnackBar(context, state.message);
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Ícono ilustrativo
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.business,
                    size: 50,
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(height: 32),

                // Título y descripción
                Text(
                  'Crear Organización',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Las organizaciones te permiten gestionar equipos y compartir ubicaciones',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Nombre
                AuthTextField(
                  controller: _nameController,
                  label: 'Nombre de la organización',
                  hint: 'Ej: Mi Empresa S.A.',
                  prefixIcon: Icons.business,
                  textInputAction: TextInputAction.next,
                  validator: _validateName,
                ),
                const SizedBox(height: 16),

                // Descripción
                AuthTextField(
                  controller: _descriptionController,
                  label: 'Descripción (opcional)',
                  hint: 'Describe tu organización...',
                  prefixIcon: Icons.description,
                  maxLines: 4,
                  textInputAction: TextInputAction.done,
                  validator: _validateDescription,
                  onSubmitted: (_) => _handleCreate(),
                ),
                const SizedBox(height: 32),

                // Información sobre permisos
                Card(
                  color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 20,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Como propietario podrás:',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _InfoBullet(text: 'Invitar y gestionar miembros'),
                        _InfoBullet(text: 'Configurar geofences y alertas'),
                        _InfoBullet(text: 'Ver ubicaciones en tiempo real'),
                        _InfoBullet(text: 'Acceder al historial completo'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Botón de crear
                BlocBuilder<OrganizationBloc, OrganizationState>(
                  builder: (context, state) {
                    return AuthButton(
                      text: 'Crear Organización',
                      onPressed: _handleCreate,
                      isLoading: state is OrganizationLoading,
                      icon: Icons.add,
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Widget de bullet point informativo
class _InfoBullet extends StatelessWidget {
  final String text;

  const _InfoBullet({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.check_circle,
            size: 18,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}
