import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app.dart';
import 'core/config/env_config.dart';
import 'injection_container.dart' as di;

void main() async {
  // Asegurar que Flutter esté inicializado
  WidgetsFlutterBinding.ensureInitialized();

  // Configurar orientación de la pantalla
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Configurar el ambiente (development, staging, production)
  EnvConfig.setEnvironment(Environment.development);

  // Inicializar dependencias
  await di.initializeDependencies();

  // TODO: Inicializar Firebase
  // await Firebase.initializeApp(
  //   options: DefaultFirebaseOptions.currentPlatform,
  // );

  // Ejecutar la aplicación
  runApp(const App());
}
