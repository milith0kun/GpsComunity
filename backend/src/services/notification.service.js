const nodemailer = require('nodemailer');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Servicio de Notificaciones
 * Maneja envío de emails, SMS, push notifications
 */

// Configurar transportador de email
let emailTransporter = null;

if (config.email.enabled) {
  emailTransporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  // Verificar configuración
  emailTransporter.verify((error, success) => {
    if (error) {
      logger.error('Error en configuración de email:', error);
    } else {
      logger.info('✅ Servicio de email configurado correctamente');
    }
  });
}

/**
 * Envía un email
 * @param {Object} options - Opciones del email
 * @returns {Promise<Object>} Info del envío
 */
const sendEmail = async (options) => {
  try {
    if (!config.email.enabled || !emailTransporter) {
      logger.warn('Email no configurado, simulando envío...');
      return { messageId: 'simulated' };
    }

    const mailOptions = {
      from: `${config.email.fromName} <${config.email.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    logger.info(`Email enviado: ${info.messageId} a ${options.to}`);

    return info;
  } catch (error) {
    logger.error('Error enviando email:', error);
    throw error;
  }
};

/**
 * Envía email de verificación
 * @param {Object} user - Usuario
 * @param {string} verificationUrl - URL de verificación
 * @returns {Promise<Object>}
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  try {
    const html = `
      <h1>Bienvenido a GPS Community</h1>
      <p>Hola ${user.displayName},</p>
      <p>Gracias por registrarte. Por favor verifica tu email haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}">Verificar Email</a>
      <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
      <p>Saludos,<br>El equipo de GPS Community</p>
    `;

    return await sendEmail({
      to: user.email,
      subject: 'Verifica tu email - GPS Community',
      html,
      text: `Verifica tu email: ${verificationUrl}`,
    });
  } catch (error) {
    logger.error('Error enviando email de verificación:', error);
    throw error;
  }
};

/**
 * Envía email de recuperación de contraseña
 * @param {Object} user - Usuario
 * @param {string} resetUrl - URL de reset
 * @returns {Promise<Object>}
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    const html = `
      <h1>Recuperación de Contraseña</h1>
      <p>Hola ${user.displayName},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
      <p>Saludos,<br>El equipo de GPS Community</p>
    `;

    return await sendEmail({
      to: user.email,
      subject: 'Recuperación de Contraseña - GPS Community',
      html,
      text: `Restablecer contraseña: ${resetUrl}`,
    });
  } catch (error) {
    logger.error('Error enviando email de recuperación:', error);
    throw error;
  }
};

/**
 * Envía email de invitación a organización
 * @param {string} email - Email del invitado
 * @param {Object} organization - Organización
 * @param {Object} inviter - Usuario que invita
 * @param {string} inviteUrl - URL de invitación
 * @returns {Promise<Object>}
 */
const sendOrganizationInviteEmail = async (email, organization, inviter, inviteUrl) => {
  try {
    const html = `
      <h1>Invitación a ${organization.name}</h1>
      <p>Hola,</p>
      <p>${inviter.displayName} te ha invitado a unirte a la organización <strong>${organization.name}</strong> en GPS Community.</p>
      <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
      <a href="${inviteUrl}">Aceptar Invitación</a>
      <p>Si no conoces a esta persona o no quieres unirte, puedes ignorar este email.</p>
      <p>Saludos,<br>El equipo de GPS Community</p>
    `;

    return await sendEmail({
      to: email,
      subject: `Invitación a ${organization.name} - GPS Community`,
      html,
      text: `Aceptar invitación: ${inviteUrl}`,
    });
  } catch (error) {
    logger.error('Error enviando email de invitación:', error);
    throw error;
  }
};

/**
 * Envía notificación de alerta
 * @param {Object} alert - Alerta
 * @param {Array} recipients - Array de emails
 * @returns {Promise<Array>} Array de resultados
 */
const sendAlertNotification = async (alert, recipients) => {
  try {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return [];
    }

    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    };

    const html = `
      <h1>${severityEmoji[alert.severity]} ${alert.title}</h1>
      <p><strong>Tipo:</strong> ${alert.type}</p>
      <p><strong>Severidad:</strong> ${alert.severity}</p>
      <p><strong>Mensaje:</strong> ${alert.message}</p>
      <p><strong>Fecha:</strong> ${new Date(alert.createdAt).toLocaleString('es-ES')}</p>
      <p>Puedes ver más detalles en la aplicación GPS Community.</p>
    `;

    const results = [];

    for (const email of recipients) {
      try {
        const result = await sendEmail({
          to: email,
          subject: `${severityEmoji[alert.severity]} ${alert.title}`,
          html,
          text: `${alert.title}\n\n${alert.message}`,
        });
        results.push({ email, success: true, result });
      } catch (error) {
        logger.error(`Error enviando alerta a ${email}:`, error);
        results.push({ email, success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    logger.error('Error enviando notificaciones de alerta:', error);
    throw error;
  }
};

/**
 * Envía push notification (placeholder - requiere Firebase Cloud Messaging)
 * @param {string} userId - ID del usuario
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>}
 */
const sendPushNotification = async (userId, notification) => {
  try {
    // TODO: Implementar con Firebase Cloud Messaging
    logger.warn('Push notifications no implementadas aún');

    return {
      success: false,
      message: 'Push notifications no implementadas',
    };
  } catch (error) {
    logger.error('Error enviando push notification:', error);
    throw error;
  }
};

/**
 * Envía SMS (placeholder - requiere Twilio)
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} message - Mensaje
 * @returns {Promise<Object>}
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // TODO: Implementar con Twilio
    logger.warn('SMS no implementado aún');

    return {
      success: false,
      message: 'SMS no implementado',
    };
  } catch (error) {
    logger.error('Error enviando SMS:', error);
    throw error;
  }
};

/**
 * Envía notificación multi-canal
 * @param {Object} user - Usuario
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object>} Resultados por canal
 */
const sendMultiChannelNotification = async (user, notification) => {
  try {
    const results = {
      email: null,
      push: null,
      sms: null,
    };

    // Email
    if (user.preferences.notifications.email && notification.email) {
      try {
        results.email = await sendEmail({
          to: user.email,
          subject: notification.title,
          html: notification.html,
          text: notification.text,
        });
      } catch (error) {
        logger.error('Error enviando email:', error);
        results.email = { error: error.message };
      }
    }

    // Push
    if (user.preferences.notifications.push && notification.push) {
      try {
        results.push = await sendPushNotification(user._id, notification);
      } catch (error) {
        logger.error('Error enviando push:', error);
        results.push = { error: error.message };
      }
    }

    // SMS
    if (user.preferences.notifications.sms && notification.sms && user.phone) {
      try {
        results.sms = await sendSMS(user.phone, notification.text);
      } catch (error) {
        logger.error('Error enviando SMS:', error);
        results.sms = { error: error.message };
      }
    }

    return results;
  } catch (error) {
    logger.error('Error enviando notificación multi-canal:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrganizationInviteEmail,
  sendAlertNotification,
  sendPushNotification,
  sendSMS,
  sendMultiChannelNotification,
};
