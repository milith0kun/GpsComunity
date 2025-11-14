import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/pages/login_page.dart';
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
        // TODO: Agregar más BLoCs aquí
      ],
      child: MaterialApp(
        title: 'GPS Community',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const LoginPage(),
        // TODO: Configurar routing con go_router
      ),
    );
  }
}
