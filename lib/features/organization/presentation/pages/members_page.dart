import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/error_widget.dart';
import '../bloc/organization_bloc.dart';
import '../bloc/organization_event.dart';
import '../bloc/organization_state.dart';
import '../../domain/entities/member.dart';

/// Pantalla de gestión de miembros de una organización
class MembersPage extends StatefulWidget {
  final String organizationId;

  const MembersPage({
    Key? key,
    required this.organizationId,
  }) : super(key: key);

  @override
  State<MembersPage> createState() => _MembersPageState();
}

class _MembersPageState extends State<MembersPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _roleFilter = 'all'; // all, owner, admin, manager, member

  @override
  void initState() {
    super.initState();
    // Cargar miembros
    context.read<OrganizationBloc>().add(
          GetMembers(widget.organizationId),
        );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Miembros'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: () {
              _showInviteMemberDialog(context);
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() {
                _roleFilter = value;
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'all',
                child: Text('Todos los roles'),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'owner',
                child: Row(
                  children: [
                    Icon(Icons.star, size: 18, color: Colors.amber),
                    SizedBox(width: 8),
                    Text('Propietarios'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'admin',
                child: Row(
                  children: [
                    Icon(Icons.admin_panel_settings, size: 18, color: Colors.blue),
                    SizedBox(width: 8),
                    Text('Administradores'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'manager',
                child: Row(
                  children: [
                    Icon(Icons.manage_accounts, size: 18, color: Colors.green),
                    SizedBox(width: 8),
                    Text('Managers'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'member',
                child: Row(
                  children: [
                    Icon(Icons.person, size: 18, color: Colors.grey),
                    SizedBox(width: 8),
                    Text('Miembros'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Buscar miembros...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value.toLowerCase();
                });
              },
            ),
          ),

          // Chip de filtro activo
          if (_roleFilter != 'all')
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Chip(
                    label: Text('Filtro: ${_getRoleName(_roleFilter)}'),
                    onDeleted: () {
                      setState(() {
                        _roleFilter = 'all';
                      });
                    },
                  ),
                ],
              ),
            ),

          // Lista de miembros
          Expanded(
            child: BlocBuilder<OrganizationBloc, OrganizationState>(
              builder: (context, state) {
                if (state is OrganizationLoading) {
                  return const LoadingWidget(message: 'Cargando miembros...');
                } else if (state is OrganizationError) {
                  return ErrorDisplayWidget(
                    message: state.message,
                    onRetry: () {
                      context.read<OrganizationBloc>().add(
                            GetMembers(widget.organizationId),
                          );
                    },
                  );
                } else if (state is MembersLoaded) {
                  // Filtrar miembros
                  var filteredMembers = state.members;

                  if (_roleFilter != 'all') {
                    filteredMembers = filteredMembers
                        .where((m) => m.role.toLowerCase() == _roleFilter)
                        .toList();
                  }

                  if (_searchQuery.isNotEmpty) {
                    filteredMembers = filteredMembers
                        .where((m) =>
                            m.displayName.toLowerCase().contains(_searchQuery) ||
                            (m.email?.toLowerCase().contains(_searchQuery) ?? false))
                        .toList();
                  }

                  if (filteredMembers.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.people_outline, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          Text(
                            _searchQuery.isNotEmpty || _roleFilter != 'all'
                                ? 'No se encontraron miembros'
                                : 'No hay miembros',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<OrganizationBloc>().add(
                            GetMembers(widget.organizationId),
                          );
                    },
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filteredMembers.length,
                      itemBuilder: (context, index) {
                        final member = filteredMembers[index];
                        return _MemberCard(
                          member: member,
                          onTap: () {
                            // TODO: Mostrar detalles del miembro
                          },
                          onChangeRole: () {
                            _showChangeRoleDialog(context, member);
                          },
                          onRemove: () {
                            _showRemoveMemberDialog(context, member);
                          },
                        );
                      },
                    ),
                  );
                }

                return const SizedBox();
              },
            ),
          ),
        ],
      ),
    );
  }

  String _getRoleName(String role) {
    switch (role) {
      case 'owner':
        return 'Propietarios';
      case 'admin':
        return 'Administradores';
      case 'manager':
        return 'Managers';
      case 'member':
        return 'Miembros';
      default:
        return role;
    }
  }

  void _showInviteMemberDialog(BuildContext context) {
    final emailController = TextEditingController();
    String selectedRole = 'member';

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Invitar Miembro'),
        content: StatefulBuilder(
          builder: (context, setState) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  hintText: 'usuario@ejemplo.com',
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedRole,
                decoration: const InputDecoration(
                  labelText: 'Rol',
                  prefixIcon: Icon(Icons.security),
                ),
                items: const [
                  DropdownMenuItem(value: 'admin', child: Text('Administrador')),
                  DropdownMenuItem(value: 'manager', child: Text('Manager')),
                  DropdownMenuItem(value: 'member', child: Text('Miembro')),
                ],
                onChanged: (value) {
                  setState(() {
                    selectedRole = value!;
                  });
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              // TODO: Implementar invitación
              showSuccessSnackBar(
                context,
                'Invitación enviada a ${emailController.text}',
              );
            },
            child: const Text('Enviar Invitación'),
          ),
        ],
      ),
    );
  }

  void _showChangeRoleDialog(BuildContext context, Member member) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cambiar Rol'),
        content: Text('Cambiar el rol de ${member.displayName}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              showSuccessSnackBar(context, 'Rol actualizado');
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }

  void _showRemoveMemberDialog(BuildContext context, Member member) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Eliminar Miembro'),
        content: Text('¿Eliminar a ${member.displayName} de la organización?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              showSuccessSnackBar(context, 'Miembro eliminado');
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }
}

/// Widget de card de miembro
class _MemberCard extends StatelessWidget {
  final Member member;
  final VoidCallback onTap;
  final VoidCallback? onChangeRole;
  final VoidCallback? onRemove;

  const _MemberCard({
    required this.member,
    required this.onTap,
    this.onChangeRole,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getRoleColor(member.role),
          child: Text(
            member.displayName[0].toUpperCase(),
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                member.displayName,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
            _RoleBadge(role: member.role),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (member.email != null) Text(member.email!),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  member.trackingEnabled == true
                      ? Icons.location_on
                      : Icons.location_off,
                  size: 14,
                  color: member.trackingEnabled == true ? Colors.green : Colors.grey,
                ),
                const SizedBox(width: 4),
                Text(
                  member.trackingEnabled == true ? 'Tracking activo' : 'Tracking inactivo',
                  style: TextStyle(
                    fontSize: 12,
                    color: member.trackingEnabled == true ? Colors.green : Colors.grey,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'role' && onChangeRole != null) {
              onChangeRole!();
            } else if (value == 'remove' && onRemove != null) {
              onRemove!();
            }
          },
          itemBuilder: (context) => [
            if (onChangeRole != null)
              const PopupMenuItem(
                value: 'role',
                child: Row(
                  children: [
                    Icon(Icons.security, size: 18),
                    SizedBox(width: 12),
                    Text('Cambiar rol'),
                  ],
                ),
              ),
            if (onRemove != null)
              const PopupMenuItem(
                value: 'remove',
                child: Row(
                  children: [
                    Icon(Icons.person_remove, size: 18, color: Colors.red),
                    SizedBox(width: 12),
                    Text('Eliminar', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
          ],
        ),
        onTap: onTap,
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'owner':
        return Colors.amber;
      case 'admin':
        return Colors.blue;
      case 'manager':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}

/// Widget de badge de rol
class _RoleBadge extends StatelessWidget {
  final String role;

  const _RoleBadge({required this.role});

  @override
  Widget build(BuildContext context) {
    final color = _getRoleColor(role);
    final icon = _getRoleIcon(role);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            _getRoleName(role),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'owner':
        return Colors.amber;
      case 'admin':
        return Colors.blue;
      case 'manager':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  IconData _getRoleIcon(String role) {
    switch (role.toLowerCase()) {
      case 'owner':
        return Icons.star;
      case 'admin':
        return Icons.admin_panel_settings;
      case 'manager':
        return Icons.manage_accounts;
      default:
        return Icons.person;
    }
  }

  String _getRoleName(String role) {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      default:
        return 'Miembro';
    }
  }
}
