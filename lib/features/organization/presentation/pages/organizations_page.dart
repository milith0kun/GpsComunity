import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/loading_widget.dart';
import '../../../../core/widgets/error_widget.dart';
import '../bloc/organization_bloc.dart';
import '../bloc/organization_event.dart';
import '../bloc/organization_state.dart';
import '../widgets/organization_card.dart';

/// Pantalla de lista de organizaciones del usuario
class OrganizationsPage extends StatefulWidget {
  const OrganizationsPage({Key? key}) : super(key: key);

  @override
  State<OrganizationsPage> createState() => _OrganizationsPageState();
}

class _OrganizationsPageState extends State<OrganizationsPage> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    // Cargar organizaciones
    context.read<OrganizationBloc>().add(GetMyOrganizations());
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
        title: const Text('Mis Organizaciones'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<OrganizationBloc>().add(GetMyOrganizations());
            },
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
                hintText: 'Buscar organizaciones...',
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

          // Lista de organizaciones
          Expanded(
            child: BlocBuilder<OrganizationBloc, OrganizationState>(
              builder: (context, state) {
                if (state is OrganizationLoading) {
                  return const LoadingWidget(
                    message: 'Cargando organizaciones...',
                  );
                } else if (state is OrganizationError) {
                  return ErrorDisplayWidget(
                    message: state.message,
                    onRetry: () {
                      context.read<OrganizationBloc>().add(GetMyOrganizations());
                    },
                  );
                } else if (state is OrganizationsLoaded) {
                  // Filtrar organizaciones por búsqueda
                  final filteredOrgs = _searchQuery.isEmpty
                      ? state.organizations
                      : state.organizations
                          .where((org) =>
                              org.name.toLowerCase().contains(_searchQuery) ||
                              (org.description?.toLowerCase().contains(_searchQuery) ??
                                  false))
                          .toList();

                  if (filteredOrgs.isEmpty) {
                    return _EmptyOrganizationsView(
                      isSearching: _searchQuery.isNotEmpty,
                      onCreateOrganization: () {
                        context.push('/organizations/create');
                      },
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<OrganizationBloc>().add(GetMyOrganizations());
                    },
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filteredOrgs.length,
                      itemBuilder: (context, index) {
                        final org = filteredOrgs[index];
                        return OrganizationCard(
                          organization: org,
                          onTap: () {
                            context.push('/organizations/${org.id}');
                          },
                          onEdit: () {
                            // TODO: Navegar a edición
                            showSuccessSnackBar(
                              context,
                              'Edición disponible próximamente',
                            );
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push('/organizations/create');
        },
        icon: const Icon(Icons.add),
        label: const Text('Nueva Organización'),
      ),
    );
  }
}

/// Vista cuando no hay organizaciones
class _EmptyOrganizationsView extends StatelessWidget {
  final bool isSearching;
  final VoidCallback onCreateOrganization;

  const _EmptyOrganizationsView({
    required this.isSearching,
    required this.onCreateOrganization,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSearching ? Icons.search_off : Icons.business_outlined,
              size: 80,
              color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
            ),
            const SizedBox(height: 24),
            Text(
              isSearching
                  ? 'No se encontraron organizaciones'
                  : 'No tienes organizaciones',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              isSearching
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Crea una organización para empezar a gestionar tu equipo',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              textAlign: TextAlign.center,
            ),
            if (!isSearching) ...[
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: onCreateOrganization,
                icon: const Icon(Icons.add),
                label: const Text('Crear Organización'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
