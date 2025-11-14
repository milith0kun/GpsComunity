import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';

import 'injection.config.dart';

/// Instancia global de GetIt para dependency injection
final getIt = GetIt.instance;

/// Configura e inicializa todas las dependencias de la aplicación
@InjectableInit(
  initializerName: 'init', // Nombre del método generado
  preferRelativeImports: true, // Usar imports relativos
  asExtension: true, // Generar como extensión
)
Future<void> configureDependencies() async => getIt.init();

/// Resetea todas las dependencias (útil para testing)
Future<void> resetDependencies() async {
  await getIt.reset();
}
