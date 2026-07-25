const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function json(res, status, payload, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-RBV-Email-Passcode',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

function getAllowedOrigin(req) {
  const allowed = String(process.env.EMAIL_ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  if (!allowed.length) return origin || '*';
  if (!origin) return allowed[0] || '*';
  return allowed.includes(origin) ? origin : '';
}

function ensureAllowedOrigin(req, res) {
  const origin = getAllowedOrigin(req);
  if (!origin) {
    json(res, 403, { ok: false, error: 'Origin tidak diizinkan. Set EMAIL_ALLOWED_ORIGINS di Vercel.' }, 'null');
    return '';
  }
  return origin;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function cleanText(value, fallback = '') {
  const text = value === undefined || value === null ? '' : String(value).trim();
  return text || fallback;
}

function splitRecipients(value) {
  return String(value || '').split(/[;,\n]+/).map((item) => item.trim()).filter(Boolean);
}

function encodeHeader(value) {
  const text = cleanText(value);
  return /^[\x00-\x7F]*$/.test(text) ? text : `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
}

function base64Url(input) {
  return Buffer.from(input, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function wrapBase64(value) {
  return String(value || '').replace(/\s+/g, '').match(/.{1,76}/g)?.join('\r\n') || '';
}

function safeFilename(value, fallback = 'attachment.bin') {
  return cleanText(value, fallback).replace(/[\r\n"\\]/g, '_');
}

function buildMimeMessage({ from, to, cc, subject, body, attachments }) {
  const toList = splitRecipients(to);
  const ccList = splitRecipients(cc);
  if (!toList.length) throw new Error('To email wajib diisi.');
  const boundary = `rbv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const lines = [];
  lines.push(`From: ${from}`);
  lines.push(`To: ${toList.join(', ')}`);
  if (ccList.length) lines.push(`Cc: ${ccList.join(', ')}`);
  lines.push(`Subject: ${encodeHeader(subject || 'Visit Report')}`);
  lines.push('MIME-Version: 1.0');
  lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  lines.push('');
  lines.push(`--${boundary}`);
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: 8bit');
  lines.push('');
  lines.push(cleanText(body, '-'));
  (Array.isArray(attachments) ? attachments : []).forEach((attachment) => {
    const filename = safeFilename(attachment.filename);
    const mimeType = cleanText(attachment.mimeType, 'application/octet-stream');
    const base64 = cleanText(attachment.dataBase64);
    if (!base64) return;
    lines.push('');
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: ${mimeType}; name="${filename}"`);
    lines.push('Content-Transfer-Encoding: base64');
    lines.push(`Content-Disposition: attachment; filename="${filename}"`);
    lines.push('');
    lines.push(wrapBase64(base64));
  });
  lines.push('');
  lines.push(`--${boundary}--`);
  return base64Url(lines.join('\r\n'));
}

async function getAccessToken() {
  const clientId = cleanText(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanText(process.env.GOOGLE_CLIENT_SECRET);
  const refreshToken = cleanText(process.env.GMAIL_REFRESH_TOKEN);
  if (!clientId || !clientSecret || !refreshToken) throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan GMAIL_REFRESH_TOKEN wajib diset di Vercel.');
  const response = await fetch(GMAIL_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(data.error_description || data.error || 'Gagal mengambil access token Gmail.');
  return data.access_token;
}

function getRedirectUri(req) {
  const configured = cleanText(process.env.GOOGLE_REDIRECT_URI);
  if (configured) return configured;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/api/gmail-oauth-callback`;
}

module.exports = {
  json,
  ensureAllowedOrigin,
  readBody,
  cleanText,
  buildMimeMessage,
  getAccessToken,
  getRedirectUri,
};
