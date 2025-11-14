import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/map/presentation/bloc/map_bloc.dart';
import 'features/organization/presentation/bloc/organization_bloc.dart';
import 'features/tracking/presentation/bloc/tracking_bloc.dart';
import 'injection_container.dart';

/// Aplicación principal
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        // BLoC de autenticación
        BlocProvider(
          create: (context) => sl<AuthBloc>()..add(const CheckAuthStatus()),
        ),

        // BLoC de tracking
        BlocProvider(
          create: (context) => sl<TrackingBloc>()..add(const InitializeTracking()),
        ),

        // BLoC de organización
        BlocProvider(
          create: (context) => sl<OrganizationBloc>(),
        ),

        // BLoC de mapa
        BlocProvider(
          create: (context) => sl<MapBloc>(),
        ),
      ],
      child: MaterialApp.router(
        title: 'GPS Community',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
