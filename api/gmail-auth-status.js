const { json, ensureAllowedOrigin, cleanText } = require('./_gmail-utils');

module.exports = function handler(req, res) {
  const origin = ensureAllowedOrigin(req, res);
  if (!origin) return;
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true }, origin);
  return json(res, 200, {
    ok: true,
    configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_LOCKED_SENDER),
    sender: cleanText(process.env.GMAIL_LOCKED_SENDER),
    hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    hasRefreshToken: Boolean(process.env.GMAIL_REFRESH_TOKEN),
    passcodeRequired: Boolean(process.env.EMAIL_SEND_PASSCODE),
  }, origin);
};
