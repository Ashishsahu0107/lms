import { SecurityLog } from "../models/SecurityLog.js";

/**
 * Log a security event to the database.
 *
 * @param {Object} params
 * @param {string} [params.userId] - The ID of the user triggering the event
 * @param {string} params.action - The security action (e.g. USER_LOGIN, FAILED_LOGIN, PASSWORD_CHANGE, API_UNAUTHORIZED)
 * @param {string} [params.details] - Detailed context or explanation of the event
 * @param {string} [params.ip] - IP address of the request source
 * @param {string} [params.device] - Device/user-agent info of the request source
 * @param {'low'|'medium'|'high'} [params.severity] - Severity rating of the event (default: 'low')
 */
export async function logSecurityEvent({
  userId = null,
  action,
  details = "",
  ip = "",
  device = "",
  severity = "low",
}) {
  try {
    const log = await SecurityLog.create({
      userId,
      action,
      details,
      ip,
      device,
      severity,
    });
    console.log(
      `[SecurityLog] Event registered: ${action} (${severity}) - ${details}`,
    );
    return log;
  } catch (err) {
    console.error(
      "[SecurityLog] Failed to write security log to database:",
      err.message,
    );
  }
}
