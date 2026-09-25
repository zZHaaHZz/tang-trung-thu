// Tele-logger fallback module
export function sendTelegramLog(msg) {
  console.log('[TeleLogger]', msg);
}

export function logVisit(details) {
  console.log('[TeleLogger Visit]', details);
}

export default {
  sendTelegramLog,
  logVisit
};
