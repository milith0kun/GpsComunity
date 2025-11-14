import 'package:intl/intl.dart';
import '../constants/app_constants.dart';

/// Clase de utilidades para formateo de fechas
class DateFormatter {
  /// Formatea fecha a dd/MM/yyyy
  static String formatDate(DateTime date) {
    return DateFormat(AppConstants.dateFormat).format(date);
  }

  /// Formatea hora a HH:mm
  static String formatTime(DateTime date) {
    return DateFormat(AppConstants.timeFormat).format(date);
  }

  /// Formatea fecha y hora a dd/MM/yyyy HH:mm
  static String formatDateTime(DateTime date) {
    return DateFormat(AppConstants.dateTimeFormat).format(date);
  }

  /// Formatea a fecha relativa (Hace 5 minutos, Hace 2 horas, etc.)
  static String formatRelative(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inSeconds < 60) {
      return 'Hace ${difference.inSeconds} segundos';
    } else if (difference.inMinutes < 60) {
      return 'Hace ${difference.inMinutes} minutos';
    } else if (difference.inHours < 24) {
      return 'Hace ${difference.inHours} horas';
    } else if (difference.inDays < 30) {
      return 'Hace ${difference.inDays} días';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'Hace $months meses';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'Hace $years años';
    }
  }

  /// Formatea a tiempo restante (Faltan 5 minutos, Faltan 2 horas, etc.)
  static String formatTimeRemaining(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now);

    if (difference.isNegative) {
      return 'Expirado';
    }

    if (difference.inSeconds < 60) {
      return 'Faltan ${difference.inSeconds} segundos';
    } else if (difference.inMinutes < 60) {
      return 'Faltan ${difference.inMinutes} minutos';
    } else if (difference.inHours < 24) {
      return 'Faltan ${difference.inHours} horas';
    } else {
      return 'Faltan ${difference.inDays} días';
    }
  }

  /// Parsea fecha desde string ISO
  static DateTime? parseIsoDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) {
      return null;
    }

    try {
      return DateTime.parse(dateString);
    } catch (e) {
      return null;
    }
  }

  /// Convierte a ISO string
  static String toIsoString(DateTime date) {
    return date.toIso8601String();
  }

  /// Obtiene inicio del día
  static DateTime startOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  /// Obtiene fin del día
  static DateTime endOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59, 999);
  }

  /// Verifica si es hoy
  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  /// Verifica si es ayer
  static bool isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year &&
        date.month == yesterday.month &&
        date.day == yesterday.day;
  }
}
