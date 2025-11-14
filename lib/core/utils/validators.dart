import '../constants/app_constants.dart';

/// Clase de utilidades para validaciones
class Validators {
  /// Valida email
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'El email es requerido';
    }

    final emailRegex = RegExp(AppConstants.emailPattern);
    if (!emailRegex.hasMatch(value)) {
      return 'Ingresa un email válido';
    }

    return null;
  }

  /// Valida contraseña
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'La contraseña es requerida';
    }

    if (value.length < AppConstants.minPasswordLength) {
      return 'La contraseña debe tener al menos ${AppConstants.minPasswordLength} caracteres';
    }

    if (value.length > AppConstants.maxPasswordLength) {
      return 'La contraseña no puede tener más de ${AppConstants.maxPasswordLength} caracteres';
    }

    // Verificar que tenga al menos una letra mayúscula
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'La contraseña debe tener al menos una letra mayúscula';
    }

    // Verificar que tenga al menos una letra minúscula
    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'La contraseña debe tener al menos una letra minúscula';
    }

    // Verificar que tenga al menos un número
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'La contraseña debe tener al menos un número';
    }

    return null;
  }

  /// Valida confirmación de contraseña
  static String? validateConfirmPassword(String? value, String? password) {
    if (value == null || value.isEmpty) {
      return 'La confirmación de contraseña es requerida';
    }

    if (value != password) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  /// Valida nombre
  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'El nombre es requerido';
    }

    if (value.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }

    return null;
  }

  /// Valida teléfono
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return null; // El teléfono es opcional
    }

    final phoneRegex = RegExp(AppConstants.phonePattern);
    if (!phoneRegex.hasMatch(value)) {
      return 'Ingresa un teléfono válido';
    }

    return null;
  }

  /// Valida campo requerido
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName es requerido';
    }
    return null;
  }

  /// Valida número entero
  static String? validateInteger(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName es requerido';
    }

    final number = int.tryParse(value);
    if (number == null) {
      return '$fieldName debe ser un número entero válido';
    }

    return null;
  }

  /// Valida número decimal
  static String? validateDouble(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName es requerido';
    }

    final number = double.tryParse(value);
    if (number == null) {
      return '$fieldName debe ser un número válido';
    }

    return null;
  }

  /// Valida rango de números
  static String? validateRange(
    String? value,
    String fieldName,
    double min,
    double max,
  ) {
    if (value == null || value.isEmpty) {
      return '$fieldName es requerido';
    }

    final number = double.tryParse(value);
    if (number == null) {
      return '$fieldName debe ser un número válido';
    }

    if (number < min || number > max) {
      return '$fieldName debe estar entre $min y $max';
    }

    return null;
  }
}
